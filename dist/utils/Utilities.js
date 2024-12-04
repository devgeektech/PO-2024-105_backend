"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("config"));
const bcrypt = __importStar(require("bcrypt"));
const defaultSlots_1 = require("../db/defaultSlots");
const moment_1 = __importDefault(require("moment"));
const axios = require('axios');
class Utilities {
    /**
     * Return response in custom format
     * @param response
     */
    static sendResponsData(response) {
        let result = {
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
     * Generate alphanumer random string of given length
     * @param length
     */
    static genAlphaNumericCode(length) {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
    static genNumericCode(length) {
        let min = Math.pow(10, length - 1);
        let max = Math.pow(10, length) - Math.pow(10, length - 1) - 1;
        return Math.floor(min + Math.random() * max);
    }
    static getUserToken(user) {
        var claims = {
            _id: user._id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            role: user.role,
        };
        const secretKey = config_1.default.get("JWT_SECRET_KEY");
        return jsonwebtoken_1.default.sign(claims, secretKey, {
            expiresIn: parseInt(config_1.default.get("SOCIAL_TOKEN_PERIOD")),
        });
    }
    static createDefaultSlotsIfNotExists() {
        return __awaiter(this, void 0, void 0, function* () {
            // Function to generate time slots based on start and end times and slot duration in minutes
            function generateTimeSlots(startTime, endTime, slotDuration) {
                const slots = [];
                let currentTime = new Date(startTime);
                while (currentTime < endTime) {
                    const endSlotTime = new Date(currentTime.getTime() + slotDuration * 60000);
                    if (endSlotTime > endTime)
                        break;
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
            function formatTime(date) {
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");
                return `${hours}:${minutes}`;
            }
            function formatHourMinute(hours, minutes) {
                const formattedHours = String(hours).padStart(2, "0");
                const formattedMinutes = String(minutes).padStart(2, "0");
                return `${formattedHours}:${formattedMinutes}`;
            }
            // Function to convert duration string (e.g., "01:30") to minutes
            function convertToMinutes(duration) {
                const [hours, minutes] = duration.split(":").map(Number);
                return hours * 60 + minutes;
            }
            //start and end times
            const startTime = new Date();
            startTime.setHours(0, 0, 0); // 0:0 AM
            const endTime = new Date();
            endTime.setHours(23, 59, 0); // 11:59 PM
            // Array to store all slots
            let slotsArray = [];
            let time = formatHourMinute(0, 30);
            const durationInMinutes = convertToMinutes(time);
            const slots = generateTimeSlots(startTime, endTime, durationInMinutes);
            slotsArray.push({
                slots: slots,
            });
            const defaultSlots = yield defaultSlots_1.defaultSlotsModel.find();
            if (defaultSlots.length == 0) {
                yield defaultSlots_1.defaultSlotsModel.create(slotsArray);
                console.log("Default Slots Created:");
            }
            return slotsArray;
        });
    }
    static parseDateWithMoment(dateString) {
        const startTime = (0, moment_1.default)(dateString, "YYYY-MM-DD").startOf("day").toDate();
        const endTime = (0, moment_1.default)(dateString, "YYYY-MM-DD").endOf("day").toDate();
        return { startTime, endTime };
    }
    static getAvailableStartingSlots(slots, duration) {
        let array = [...slots];
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
                }
                else if (!(i + consecutiveSlotsNeeded <= array.length)) {
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
    static getValidSlotsAvailable(array, consecutiveSlotsNeeded, index) {
        console.log(array.length, ">>>> array.length");
        console.log(index, ">>>> index");
        if (!(index + consecutiveSlotsNeeded <= array.length)) {
            return false;
        }
        let allAvailable = true;
        let isBooked = false;
        for (let j = 0; j < consecutiveSlotsNeeded; j++) {
            console.log(array[j + index].staffCount, "array[j + index].staffCount >>>>>");
            if (array[j + index].status != "available") {
                allAvailable = false;
            }
        }
        console.log(allAvailable, ">>>> allAvailable Value::::");
        console.log(isBooked, ">>> isBooked");
        return { allAvailable, isBooked };
    }
}
exports.Utilities = Utilities;
_a = Utilities;
/**
 * Generate encrypted password
 * @param {string} password
 */
Utilities.cryptPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve, reject) {
        return bcrypt.hash(password, config_1.default.get("SALT"), (err, hash) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(hash);
            }
        });
    });
});
/**
 * Verify password
 * @param {string} password
 */
Utilities.VerifyPassword = (password, hash) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve, reject) {
        return bcrypt.compare(password, hash, (error, result) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(result);
            }
        });
    });
});
/**
 * Create jwt token
 * @param {object} payload
 * @param {string} token - return token
 */
Utilities.createJWTToken = (payload_1, ...args_1) => __awaiter(void 0, [payload_1, ...args_1], void 0, function* (payload, expire = "24h") {
    const secretKey = config_1.default.get("JWT_SECRET_KEY");
    return jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: expire });
});
/**
 * Verify token is valid or not
 * @param {string} token
 */
Utilities.verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve, reject) {
        jsonwebtoken_1.default.verify(token, config_1.default.get("JWT_SECRET_KEY"), function (error, result) {
            return __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    });
});
/**
 * decoded jwt token
 * @param token string
 */
Utilities.getDecoded = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return jsonwebtoken_1.default.decode(token);
});
/**
 * check Super admin or sub admin
 * @param token string
 */
Utilities.isAdmin = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = yield _a.getDecoded(token);
    if (decoded.role === "admin")
        return true;
    return false;
});
Utilities.isSubAdmin = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = yield _a.getDecoded(token);
    if (decoded.role === "subAdmin")
        return true;
    return false;
});
//# sourceMappingURL=Utilities.js.map