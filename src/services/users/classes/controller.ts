import config from "config";
import { HTTP400Error, HTTP404Error } from "../../../utils/httpErrors";
import { Utilities } from "../../../utils/Utilities";
import { MESSAGES } from "../../../constants/messages";
import mongoose from "mongoose";
import { classModel } from "../../../db/classes";
import { PartnerLocationModel } from "../../../db/partnerLocations";


export const getAllClasses = async (token: any, query: any, next: any) => {
  try {
    let skip = parseInt(query.skip) || 0;
    let limit = parseInt(query.limit) || 10;
    let sortOrder: any = query.sortOrder === 'desc' ? -1 : 1;
    const filters: any = [{ isDeleted: false }];

    if (query.className) {
      filters.push({ className: { $regex: query.className, $options: 'i' } });
    }
    if (query.partnerName) {
      filters.push({ 'partnerDetails.name': { $regex: query.partnerName, $options: 'i' } });
    }
    if (query.zipCode) {
      filters.push({ 'partnerLocation.zipCode': { $regex: query.zipCode, $options: 'i' } });
    }
    if (query.city) {
      filters.push({ 'partnerLocation.city': { $regex: query.city, $options: 'i' } });
    }
    if (query.address) {
      filters.push({ 'partnerLocation.address': { $regex: query.address, $options: 'i' } });
    }
    if(query.services){
      query.services = JSON.parse(query.services)
      if (Array.isArray(query.services)) {
        const serviceIds = query.services.map((id: string) => new mongoose.Types.ObjectId(id));
        filters.push({ 'service._id': { $in: serviceIds } });
      }
    }

    const geoNearStage:any = [];
    if (query.latitude && query.longitude) {
      const latitude = parseFloat(query.latitude);
      const longitude = parseFloat(query.longitude);
      const coordinates = [longitude, latitude];

      geoNearStage.push({
        $geoNear: {
          near: { type: "Point", coordinates: coordinates },
          distanceField: "distance",
          spherical: true,
          key: "partnerLocation.location",
          maxDistance: 10 * 1000 // 10 km in meters
        }
      });
    }

    if (query.date) {
      const date = new Date(query.date);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      filters.push({
        $or: [
          {
            createdAt: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() },
          },
          {
            createdAt: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() },
          }
        ]
      });
    }

    let aggregateQuery = [
      ...geoNearStage,
      {
        $lookup: {
          from: 'partnerlocations', 
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
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $unwind: {
          path: '$service',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $unwind: {
          path: '$partnerDetails',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $unwind: {
          path: '$partnerLocation',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: { $and: filters }
      },
      {
        $sort: {
          createdAt: sortOrder
        }
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
    ]

    const result = await classModel.aggregate(aggregateQuery);

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