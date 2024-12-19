import config from "config";
import { HTTP400Error, HTTP404Error } from "../../../utils/httpErrors";
import { Utilities } from "../../../utils/Utilities";
import { MESSAGES } from "../../../constants/messages";
import mongoose from "mongoose";
import { PartnerModel } from "../../../db/partner";
import { PartnerLocationModel } from "../../../db/partnerLocations";

export const editPartnerProfile = async (partnerId: string, bodyData: any, files: any, next: any) => {
  try {
    // Validate if partner exists
    let locationId = bodyData.locationId;

    const partner = await PartnerModel.findOne({ _id: new mongoose.Types.ObjectId(partnerId), isDeleted: false });
    if (!partner) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.PARTNER_NOT_FOUND,
        })
      );
    }

    let images:any = [];
    let profile: any = '';
    if (files && files.length) {
      files.forEach((file:any, index:any) => {
        if (index === 0) {
          profile = file.filename;
        } else {
          images.push(file.filename);
        }
      });
    }

    // Update partner data
    const updatedPartnerData = {
      businessName: bodyData.businessName || partner.businessName,
      description : bodyData.description ||  partner.description,
      image: profile || partner.image,
    };
    await PartnerModel.findByIdAndUpdate(partnerId, updatedPartnerData, { new: true });

    let locationObject:any = {
      partnerId,
      address: bodyData.address,
      city: bodyData.city,
      state: bodyData.state,
      zipCode: bodyData.zipCode,
      location: bodyData.location,
      weekDays: bodyData.weekDays,
      images: images,
      services: bodyData.services,
      startTime: bodyData.startTime, 
      endTime: bodyData.endTime, 
    }

    if (!locationId) {
      const locationPromise = await PartnerLocationModel.create(locationObject);
      partner.locations.push(locationPromise._id);
    }
    else {
      delete locationObject.partnerId;
      await PartnerLocationModel.findByIdAndUpdate(new mongoose.Types.ObjectId(locationId), locationObject, { new: true });
      partner.locations.push(locationId);
    }

    partner.save()

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNER_PROFILE_UPDATED,
    });
  } catch (error) {
    next(error);
  }
};

export const getPartnerByLocation = async (locationId: string, next: any) => {
  try {

    if (!locationId) {
      throw new Error("Location ID is required");
    }

    let aggregateQuery = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(locationId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "partners",
          localField: "partnerId",
          foreignField: "_id",
          as: "partnerDetails",
        },
      },
      {
        $unwind: {
          path: "$partnerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "services", // The collection name for services
          localField: "services", // The field in locations referencing `services`
          foreignField: "_id", // The field in the `services` collection to match
          as: "services" // The name of the array to store the populated services
        }
      },
    ]

    const location = await PartnerLocationModel.aggregate(aggregateQuery);

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNER_FETCHED,
      data: location[0]? location[0]: {},
    });
  } catch (error) {
    next(error);
  }
};


export const getPartnerAllLocations = async (partnerId: string, next: any) => {
  try{
    if (!partnerId) {
      throw new Error("Location ID is required");
    }
    const locations = await PartnerModel.aggregate([
      {
        $match: { _id:new mongoose.Types.ObjectId(partnerId) } // Match the partner by ID
      },
      {
        $project: { locations: 1, _id: 0 } // Include only the `locations` field
      },
      {
        $lookup: {
          from: "partnerlocations", // The collection name for locations
          localField: "locations", // The field in PartnerModel referencing `locations`
          foreignField: "_id", // The field in the `partnerlocations` collection to match
          as: "locations" // The name of the array to store the populated data
        }
      },
      {
        $unwind: { path: "$locations", preserveNullAndEmptyArrays: true } // Unwind the locations array
      },
      {
        $lookup: {
          from: "services", // The collection name for services
          localField: "locations.services", // The field in locations referencing `services`
          foreignField: "_id", // The field in the `services` collection to match
          as: "locations.services" // The name of the array to store the populated services
        }
      },
      {
        $group: {
          _id: null,
          locations: { $push: "$locations" } // Re-group the locations into an array
        }
      },
      {
        $project: { _id: 0, locations: 1 } // Final projection
      }
    ]);

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.PARTNER.LOCATIONS_FETCHED,
      data: locations[0]?locations[0]:[],
    });
  }catch (error) {
    next(error);
  }
  
}