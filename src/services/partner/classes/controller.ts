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
    if(file) {
      // aws code 
      video = file.filename
    }

    const classData = {
      ...bodyData,
      video: video,
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

export const getAllClasses = async (token: any, query: any, next: any) => {
  try {
    let skip = parseInt(query.skip) || 0;
    let limit = parseInt(query.limit) || 10;
    let sortOrder: any = query.sortOrder === 'desc' ? -1 : 1;
    const filters: any = [{ isDeleted: false }];

    const classes = await classModel.aggregate([
      {
        $match: { $and: filters }
      },
      {
        $lookup: {
          from: 'partnerlocation', 
          localField: 'partnerLocation',
          foreignField: '_id',
          as: 'partnerLocation'
        }
      },
      {
        $lookup: {
          from: 'partners', 
          localField: 'partnerId',
          foreignField: '_id',
          as: 'partnerDetails'
        }
      },
      {
        $unwind: {
          path: '$partnerDetails',
          preserveNullAndEmptyArrays: false
        }
      },
      // {
      //   $unwind: {
      //     path: '$partnerLocation',
      //     preserveNullAndEmptyArrays: false
      //   }
      // },
      {
        $sort: {
          createdAt: sortOrder
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    let totalCounts = await classModel.countDocuments({ isDeleted: false });

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.PARTNER.CLASSES_FETCHED,
      totalRecord: totalCounts,
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