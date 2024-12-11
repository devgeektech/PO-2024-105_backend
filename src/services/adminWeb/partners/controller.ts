import config from "config";
import { HTTP400Error, HTTP404Error } from "../../../utils/httpErrors";
import { Utilities } from "../../../utils/Utilities";
import { MESSAGES } from "../../../constants/messages";
import mongoose from "mongoose";
import { PartnerModel } from "../../../db/partner";
import { PartnerLocationModel } from "../../../db/partnerLocations";
import { MailerUtilities } from "../../../utils/MailerUtilities";
import ejs from "ejs";

export const addPartnerWithLocation = async (bodyData: any, next: any) => {
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
      password: bodyData.password,
      phone: bodyData.phone,
      gender: bodyData.gender,
      image: bodyData.image,
      businessWebsite: bodyData.businessWebsite,
      wellnessTypeId: bodyData.wellnessTypeId,
      otp: bodyData.otp,
      approved: false
    };
    const partner = await PartnerModel.create(partnerData);
    // Create partner location(s)
    const locationPromises = bodyData.locations.map((location: any) => {
      return PartnerLocationModel.create({
        partnerId: new mongoose.Types.ObjectId(partner._id),
        address: location.address,
        city: location.city,
        state: location.state,
        phone: location.phone,
        images: location.images,
        services: location.services,
        date: new Date(location.date),
        startTime: location.startTime, // 09:00
        endTime: location.endTime, // 03:00
        googleBussinessPageLink: location.googleBussinessPageLink,
      });
    });

    let locations = await Promise.all(locationPromises);

    let loc = []
    loc = locations.map((item) => {
      return item._id
    })

    partner.locations = loc;
    partner.save()
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

export const editPartnerWithLocation = async (partnerId: string, bodyData: any, next: any) => {
  try {
    // Validate if partner exists
    const partner = await PartnerModel.findOne({ _id: new mongoose.Types.ObjectId(partnerId), isDeleted: false });
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
      image: bodyData.image || partner.image,
      businessWebsite: bodyData.businessWebsite || partner.businessWebsite,
      wellnessTypeId: bodyData.wellnessTypeId || partner.wellnessTypeId,
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
          services: location.services,
          date: new Date(location.date),
          startTime: location.startTime, // 09:00
          endTime: location.endTime, // 03:00
          googleBussinessPageLink: location.googleBussinessPageLink,
        });
      });

      let locationResponse = await Promise.all(locationPromises);

      let loc = []
      loc = locationResponse.map((item) => {
        return item._id
      })

      partner.locations = loc;
      partner.save()
    }

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
    let skip = parseInt(query.skip) || 0;
    let limit = parseInt(query.limit) || 10;
    let sortOrder: any = query.sortOrder === 'desc' ? -1 : 1;
    const filters: any = [{ isDeleted: false }];

    const partners = await PartnerModel.aggregate([
      {
        $match: { $and: filters }
      },
      {
        $lookup: {
          from: 'wellnesstypes',
          localField: 'wellnessTypeId',
          foreignField: '_id',
          as: 'businessType'
        }
      },
      {
        $unwind: {
          path: '$businessType',
          preserveNullAndEmptyArrays: false
        },
      },
      {
        "$sort": {
          "createdAt": sortOrder
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
    ])
    let totalCounts = await PartnerModel.countDocuments({ isDeleted: false });

    // Fetch locations for each partner
    const partnerDetails = await Promise.all(
      partners.map(async (partner: any) => {
        // const locations = await PartnerLocationModel.find({ partnerId: partner._id }).lean();
        const locations = await PartnerLocationModel.aggregate([
          {
            $match: {partnerId: partner._id, isDeleted: false }
          },
          {
            $lookup: {
              from: 'services',
              localField: 'services',
              foreignField: '_id',
              as: 'services'
            }
          },
          {
            $addFields: {
              serviceNames: {
                $map: {
                  input: '$services',
                  as: 'service',
                  in: '$$service.name',
                },
              },
            },
          },
        ]);
        const allServiceNames = [...new Set(locations.flatMap(item => item.serviceNames))];
        return { ...partner, locations, allServiceNames };
      })
    );

    // Return success response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNERS_FETCHED,
      totalRecord: totalCounts,
      data: partnerDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const getPartnerById = async (partnerId: string, next: any) => {
  try {
    // Validate Partner ID
    if (!partnerId) {
      throw new Error("Partner ID is required");
    }

    // Fetch Partner by ID with optional filters
    const partner = await PartnerModel.findOne({ _id: partnerId, isDeleted: false })
      .populate("locations") // Populate related locations
      .lean();

    if (!partner) {
      return Utilities.sendResponsData({
        code: 404,
        message: MESSAGES.ADMIN.PARTNER_NOT_FOUND,
        data: null,
      });
    }

    // Fetch additional location data for the partner
    const locations = await PartnerLocationModel.find({ partnerId: partner._id }).lean();

    // Merge partner details with additional data
    const partnerDetails = { ...partner, locations };

    // Return success response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNER_FETCHED,
      data: partnerDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Service Function to Delete Partner by ID
export const deletePartnerById = async (partnerId: string, next: any) => {
  try {
    // Validate Partner ID
    if (!partnerId) {
      throw new Error("Partner ID is required");
    }

    // Find and Soft Delete Partner
    const partner = await PartnerModel.findOneAndUpdate(
      { _id: partnerId, isDeleted: false }, // Ensure partner exists and is not already deleted
      { isDeleted: true }, // Soft delete by setting `isDeleted` to true
      { new: true } // Return the updated document
    ).lean();

    if (!partner) {
      return Utilities.sendResponsData({
        code: 404,
        message: MESSAGES.ADMIN.PARTNER_NOT_FOUND,
        data: null,
      });
    }

    // Return Success Response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNER_DELETED,
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

//  update Partner Status  //
export const updatePartnerStatus = async (partnerId: string, bodyData:any, next: any) => {
  try {
    if (!partnerId) {
      throw new Error("Partner ID is required");
    }
    console.log('bodyData ------------ ',bodyData);
    const partner = await PartnerModel.findOne({ _id: partnerId, isDeleted: false });
    if (!partner) {
      return Utilities.sendResponsData({
        code: 404,
        message: MESSAGES.ADMIN.PARTNER_NOT_FOUND,
        data: null,
      });
    }

    partner.checkinRate = bodyData.checkinRate;
    partner.status = bodyData.status.toLowerCase();
    partner.rejectionReason = bodyData.rejectionReason || '';
    console.log('partner ------------ ',partner);
    await partner.save();

    // Get welcome email template to send email
    let messageHtml = await ejs.renderFile(
      process.cwd() + "/src/views/welcome.ejs",
      { name: partner.name },
      { async: true }
    );
    let mailResponse = MailerUtilities.sendSendgridMail({
      recipient_email: [bodyData.email],
      subject: "Registration Success",
      text: messageHtml,
    });

    // Return Success Response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNER_DELETED,
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};