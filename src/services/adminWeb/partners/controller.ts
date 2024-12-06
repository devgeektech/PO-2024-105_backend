import config from "config";
import { HTTP400Error, HTTP404Error } from "../../../utils/httpErrors";
import { Utilities } from "../../../utils/Utilities";
import { MESSAGES } from "../../../constants/messages";
import mongoose from "mongoose";
import { PartnerModel } from "../../../db/partner";
import { PartnerLocationModel } from "../../../db/partnerLocations";

export const addPartnerWithLocation = async (token: any, bodyData: any, next: any) => {
  try {
    // Validate if email is already in use
    const isEmailExist = await PartnerModel.findOne({
      email: bodyData.email,
      isDeleted: false,
    });

    if (isEmailExist) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.EMAIL_EXISTS,
        })
      );
    }

    // Create partner
    const partnerData = {
      name: bodyData.name,
      businessName: bodyData.businessName,
      email: bodyData.email,
      password: bodyData.password, // Hash the password if required
      phone: bodyData.phone,
      gender: bodyData.gender
    };
    const partner = await PartnerModel.create(partnerData);

    // Create partner location(s)
    const locationPromises = bodyData.locations.map((location: any) => {
      return PartnerLocationModel.create({
        partnerId: partner._id,
        address: location.address,
        city: location.city,
        state: location.state,
        phone: location.phone,
        images: location.images
      });
    });

    const locations = await Promise.all(locationPromises);

    // Return success response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNER_CREATED,
      data: { partner, locations },
    });
  } catch (error) {
    next(error);
  }
};

export const editPartnerWithLocation = async (token: any, partnerId: string, bodyData: any, next: any) => {
  try {
    // Decode token to validate the user
    const decoded: any = await Utilities.getDecoded(token);

    // Validate if partner exists
    const partner = await PartnerModel.findOne({ _id: partnerId, isDeleted: false });
    if (!partner) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.PARTNER_NOT_FOUND,
        })
      );
    }

    // Update partner data
    const updatedPartnerData = {
      name: bodyData.name || partner.name,
      businessName: bodyData.businessName || partner.businessName,
      email: bodyData.email || partner.email,
      phone: bodyData.phone || partner.phone,
      gender: bodyData.gender || partner.gender,
    };
    await PartnerModel.findByIdAndUpdate(partnerId, updatedPartnerData, { new: true });

    // Update partner locations
    if (bodyData.locations) {
      // First, delete all existing locations for the partner
      await PartnerLocationModel.deleteMany({ partnerId });

      // Then, create new locations
      const locationPromises = bodyData.locations.map((location: any) => {
        return PartnerLocationModel.create({
          partnerId,
          address: location.address,
          city: location.city,
          state: location.state,
          phone: location.phone,
          images: location.images,
          createdBy: new mongoose.Types.ObjectId(decoded.id),
        });
      });

      await Promise.all(locationPromises);
    }

    // Return success response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNER_UPDATED,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPartners = async (token: any, query: any, next: any) => {
  try {
    // Decode token for validation
    await Utilities.getDecoded(token);

    // Fetch partners with optional filtering
    const filters: any = { isDeleted: false };
    if (query.name) filters.name = { $regex: query.name, $options: "i" };
    if (query.email) filters.email = query.email;

    const partners = await PartnerModel.find(filters).lean();

    // Fetch locations for each partner
    const partnerDetails = await Promise.all(
      partners.map(async (partner: any) => {
        const locations = await PartnerLocationModel.find({ partnerId: partner._id }).lean();
        return { ...partner, locations };
      })
    );

    // Return success response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNERS_FETCHED,
      data: partnerDetails,
    });
  } catch (error) {
    next(error);
  }
};