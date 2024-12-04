import jwt from "jsonwebtoken";
import config from "config";
import * as bcrypt from "bcrypt";
import * as nodemailer from "nodemailer";
import { UserModel } from "../db/User";
import { HTTP400Error, HTTP404Error, HTTP403Error } from "./httpErrors";
import { invalidTokenError } from "./ErrorHandler";
import mongoose from "mongoose";
import { defaultSlotsModel } from "../db/defaultSlots";
import moment from "moment";
const axios = require('axios'); 
export class Utilities {
  /**
   * Return response in custom format
   * @param response
   */
  public static sendResponsData(response: any) {
    let result: any = {
      responseCode: response.code,
      responseMessage: response.message,
    };
    if (response.data) {
      result.data = response.data;
    }
    if (response.totalRecord) {
      result.totalRecord = response.totalRecord;
    }
    return result;
  }

  /**
   * Generate encrypted password
   * @param {string} password
   */
  public static cryptPassword = async (password: string) => {
    return new Promise(function (resolve, reject) {
      return bcrypt.hash(
        password,
        config.get("SALT"),
        (err: any, hash: any) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(hash);
          }
        }
      );
    });
  };

  /**
   * Verify password
   * @param {string} password
   */
  public static VerifyPassword = async (password: string, hash: string) => {
    return new Promise(function (resolve, reject) {
      return bcrypt.compare(password, hash, (error: any, result: any) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(result);
        }
      });
    });
  };

  /**
   * Create jwt token
   * @param {object} payload
   * @param {string} token - return token
   */
  public static createJWTToken = async (payload: any, expire = "24h") => {
    const secretKey = config.get<string>("JWT_SECRET_KEY");
    return jwt.sign(payload, secretKey, { expiresIn: expire });
  };

  /**
   * Verify token is valid or not
   * @param {string} token
   */
  public static verifyToken = async (token: any) => {
    return new Promise(function (resolve, reject) {
      jwt.verify(
        token,
        config.get("JWT_SECRET_KEY"),
        async function (error: any, result: any) {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        }
      );
    });
  };

  /**
   * decoded jwt token
   * @param token string
   */
  public static getDecoded = async (token: any) => {
    return jwt.decode(token);
  };

  /**
   * check Super admin or sub admin
   * @param token string
   */
  public static isAdmin = async (token: any) => {
    const decoded: any = await Utilities.getDecoded(token);
    if (decoded.role === "admin") return true;
    return false;
  };
  public static isSubAdmin = async (token: any) => {
    const decoded: any = await Utilities.getDecoded(token);
    if (decoded.role === "subAdmin") return true;
    return false;
  };

  /**
   * Generate alphanumer random string of given length
   * @param length
   */
  public static genAlphaNumericCode(length: number) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   *
   * @param length of otp we want to generate
   * @returns numeric code for specified length
   */
  public static genNumericCode(length: number) {
    let min = Math.pow(10, length - 1);
    let max = Math.pow(10, length) - Math.pow(10, length - 1) - 1;
    return Math.floor(min + Math.random() * max);
  }

  public static getUserToken(user: any) {
    var claims = {
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      role: user.role,
    };
    const secretKey = config.get<string>("JWT_SECRET_KEY");
    return jwt.sign(claims, secretKey, {
      expiresIn: parseInt(config.get("SOCIAL_TOKEN_PERIOD")),
    });
  }

  public static async createDefaultSlotsIfNotExists() {
    // Function to generate time slots based on start and end times and slot duration in minutes
    function generateTimeSlots(
      startTime: Date,
      endTime: Date,
      slotDuration: number
    ) {
      const slots = [];
      let currentTime = new Date(startTime);

      while (currentTime < endTime) {
        const endSlotTime = new Date(
          currentTime.getTime() + slotDuration * 60000
        );
        if (endSlotTime > endTime) break;

        slots.push({
          start: formatTime(currentTime),
          end: formatTime(endSlotTime),
          status: "available",
        });

        currentTime = endSlotTime;
      }

      return slots;
    }

    // Helper function to format time as HH:mm
    function formatTime(date: Date) {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    function formatHourMinute(hours: any, minutes: any) {
      const formattedHours = String(hours).padStart(2, "0");
      const formattedMinutes = String(minutes).padStart(2, "0");
      return `${formattedHours}:${formattedMinutes}`;
    }

    // Function to convert duration string (e.g., "01:30") to minutes
    function convertToMinutes(duration: string) {
      const [hours, minutes] = duration.split(":").map(Number);
      return hours * 60 + minutes;
    }

    //start and end times
    const startTime = new Date();
    startTime.setHours(0, 0, 0); // 0:0 AM
    const endTime = new Date();
    endTime.setHours(23, 59, 0); // 11:59 PM

    // Array to store all slots
    let slotsArray: any = [];

    let time = formatHourMinute(0, 30);

    const durationInMinutes = convertToMinutes(time);

    const slots = generateTimeSlots(startTime, endTime, durationInMinutes);

    slotsArray.push({
      slots: slots,
    });

    const defaultSlots = await defaultSlotsModel.find();
    if (defaultSlots.length == 0) {
      await defaultSlotsModel.create(slotsArray);
      console.log("Default Slots Created:");
    }

    return slotsArray;
  }

  public static parseDateWithMoment(dateString: any) {
    const startTime = moment(dateString, "YYYY-MM-DD").startOf("day").toDate();
    const endTime = moment(dateString, "YYYY-MM-DD").endOf("day").toDate();
    return { startTime, endTime };
  }

  public static getAvailableStartingSlots(slots: any, duration: any) {
    let array: any = [...slots];

    const consecutiveSlotsNeeded = Math.ceil(duration / 30); // Calculate how many consecutive slots are needed

    const availableSlots = [];

    // Iterate through the slots array
    for (let i = 0; i <= array.length - consecutiveSlotsNeeded; i++) {
      let allAvailable = true;

      // Check if all consecutive slots are available
      for (let j = 0; j < consecutiveSlotsNeeded; j++) {
        if (array[i + j].status != "available") {
          allAvailable = false;
          break;
        } else if (!(i + consecutiveSlotsNeeded <= array.length)) {
          allAvailable = false;
          break;
        }
      }

      // If all consecutive slots are available, add the starting time
      if (allAvailable) {
        availableSlots.push(array[i]);
      }
    }
    return availableSlots;
  }

  public static getValidSlotsAvailable(
    array: any,
    consecutiveSlotsNeeded: any,
    index: any
  ) {
    console.log(array.length,">>>> array.length")
    console.log(index,">>>> index")
    if (!(index + consecutiveSlotsNeeded <= array.length)) {
      return false;
    }
    let allAvailable = true;
    let isBooked = false
    for (let j = 0; j < consecutiveSlotsNeeded; j++) {
      console.log(array[j + index].staffCount,"array[j + index].staffCount >>>>>")
      if (array[j + index].status != "available") {
        allAvailable = false;
      }
    }
    console.log(allAvailable,">>>> allAvailable Value::::")
    console.log(isBooked,">>> isBooked")
    return {allAvailable, isBooked};
  }
}
