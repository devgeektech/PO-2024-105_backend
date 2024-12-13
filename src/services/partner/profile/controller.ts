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
