import config from "config";
import { HTTP400Error, HTTP404Error } from "../../../utils/httpErrors";
import { Utilities } from "../../../utils/Utilities";
import { MESSAGES } from "../../../constants/messages";
import mongoose from "mongoose";
import { classModel } from "../../../db/classes";
import { PartnerLocationModel } from "../../../db/partnerLocations";

export const createClass = async (token: any, bodyData: any, file: any, next: any) => {
  try {
    const decoded: any = await Utilities.getDecoded(token);

    let video = '';
    if (file) {
      video = file.filename
    }

    const classData = {
      ...bodyData,
      video: video,
      partnerLocation: new mongoose.Types.ObjectId(bodyData.partnerLocation),
      className: bodyData.className.toLowerCase(),
      createdBy: new mongoose.Types.ObjectId(decoded.id),
    };

    const result = await classModel.create(classData);

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.PARTNER.CLASS_CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// Function to edit a class
export const editClass = async (token: any, classId: string, bodyData: any, file: any, next: any) => {
  try {
    const decoded: any = await Utilities.getDecoded(token);

    const existingClass = await classModel.findOne({
      _id: new mongoose.Types.ObjectId(classId),
      isDeleted: false,
    });

    if (!existingClass) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.PARTNER.CLASS_NOT_FOUND,
        })
      );
    }

    let video = existingClass.video;
    if (file) {
      // AWS upload code
      video = file.filename;
    }

    const updatedClassData = {
      ...bodyData,
      video: video,
      className: bodyData.className?.toLowerCase(),
      updatedBy: new mongoose.Types.ObjectId(decoded.id),
    };

    const updatedClass = await classModel.findByIdAndUpdate(
      classId,
      updatedClassData,
      { new: true }
    );

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.PARTNER.CLASS_UPDATED,
      data: updatedClass,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllClasses = async (token: any, queryData: any, next: any) => {
  try {
    const decoded: any = await Utilities.getDecoded(token);
    let skip = parseInt(queryData.skip) || 0;
    let limit = parseInt(queryData.limit) || 10;
    let sortOrder: any = queryData.sortOrder?.toLowerCase() === 'dateasc' ? { createdAt: 1 } : queryData.sortOrder?.toLowerCase() === 'namedesc' ? { className: 1 } : queryData.sortOrder?.toLowerCase() === 'nameasc' ? { className: -1 } : { createdAt: -1 }

    console.log("sortOrder >>>>>> ", sortOrder);


    const matchQuery: any = [
      { partnerId: new mongoose.Types.ObjectId(decoded.id) },
      { isDeleted: false },
      { partnerLocation: new mongoose.Types.ObjectId(queryData.locationId) },
    ];
    if (queryData.status) {
      matchQuery.push({ status: queryData.status.toLowerCase() });
    }

    const result = await classModel.aggregate([
      // Match initial conditions
      {
        $match: { $and: matchQuery },
      },
      // Lookup services collection
      {
        $lookup: {
          from: 'services', // Name of the services collection
          localField: 'serviceId',
          foreignField: '_id',
          as: 'services',
        },
      },
      // Unwind services array to flatten it
      {
        $unwind: {
          path: '$services',
          preserveNullAndEmptyArrays: true, // Keeps documents without matching services
        },
      },
      // Match based on search in services
      ...(queryData.search
        ? [
          {
            $match: {
              $or: [
                { className: new RegExp(queryData.search, 'i') },
                { classType: new RegExp(queryData.search, 'i') },
                { 'services.name': new RegExp(queryData.search, 'i') },
                { 'services.description': new RegExp(queryData.search, 'i') },
              ],
            },
          },
        ]
        : []),
      // Project the desired fields
      {
        $project: {
          _id: 1,
          className: 1,
          classStatus: 1,
          description: 1,
          classType: 1,
          startTime: 1,
          endTime: 1,
          days: 1,
          maxBooking: 1,
          allowCancel: 1,
          cancellationUpto: 1,
          status: 1,
          images: 1,
          video: 1,
          partnerId: 1,
          partnerLocation: 1,
          createdAt: 1,
          updatedAt: 1,
          'services.name': 1, // Include relevant fields from services
          'services.description': 1,
        },
      },
      {
        $sort: sortOrder
      },
      {
        $facet: {
          totalRecords: [{ $count: "count" }],
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
          ],
        }
      }
    ]);

    const totalRecord = result[0]?.totalRecords?.[0]?.count || 0;
    const classes = result[0]?.paginatedResults || [];

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.PARTNER.CLASSES_FETCHED,
      totalRecord: totalRecord,
      data: classes,
    });
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (token: any, classId: string, next: any) => {
  try {
    if (!classId) {
      throw new Error(MESSAGES.PARTNER.INVALID_ID);
    }

    const classDetails = await classModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(classId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $lookup: {
          from: 'partnerlocation',
          localField: 'partnerLocation',
          foreignField: '_id',
          as: 'partnerLocation',
        },
      },
      {
        $lookup: {
          from: 'partners',
          localField: 'partnerId',
          foreignField: '_id',
          as: 'partnerDetails',
        },
      },
      {
        $unwind: {
          path: '$service',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$partnerDetails',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$partnerLocation',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (!classDetails.length) {
      return Utilities.sendResponsData({
        code: 404,
        message: MESSAGES.PARTNER.CLASS_NOT_FOUND,
        data: null,
      });
    }

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.PARTNER.CLASS_FETCHED,
      data: classDetails[0],
    });
  } catch (error) {
    next(error);
  }
};