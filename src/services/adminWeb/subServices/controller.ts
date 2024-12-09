import { HTTP400Error, HTTP404Error } from "../../../utils/httpErrors";
import { Utilities } from "../../../utils/Utilities";
import { MESSAGES } from "../../../constants/messages";
import mongoose from "mongoose";
import { servicesModel } from "../../../db/services";
import { subServicesModel } from "../../../db/subServices";

// Add a new sub-service
export const addSubService = async (token: any, bodyData: any, next: any) => {
  try {
    const decoded: any = await Utilities.getDecoded(token);

    const isExist = await subServicesModel.findOne({
      name: bodyData.name.toLowerCase(),
      isDeleted: false,
      serviceId: new mongoose.Types.ObjectId(bodyData.serviceId),
    });
    if (isExist) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SUBSERVICE_EXISTS,
        })
      );
    }

    const serviceExist = await servicesModel.findById(bodyData.serviceId);
    if (!serviceExist) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SERVICE_NOT_FOUND,
        })
      );
    }

    const subServiceData = {
      name: bodyData.name.toLowerCase(),
      description: bodyData.description,
      createdBy: (decoded.id),
      serviceId: new mongoose.Types.ObjectId(bodyData.serviceId),
    };

    const result = await subServicesModel.create(subServiceData);
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SUBSERVICE_CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get all sub-services
export const getAllSubServices = async (query:any, next: any) => {
  try {
    let skip = parseInt(query.skip) || 0;
    let limit = parseInt(query.limit) || 10;
    const subServices = await subServicesModel.find({ isDeleted: false }).skip(skip).limit(limit).populate('serviceId');
    let totalCounts = await subServicesModel.countDocuments({isDeleted: false});

    if (!subServices || subServices.length === 0) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SUBSERVICES_NOT_FOUND,
        })
      );
    }

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SUBSERVICES_FETCHED,
      totalRecord: totalCounts,
      data: subServices,
    });
  } catch (error) {
    next(error);
  }
};

// Get sub-service by ID
export const getSubServiceById = async (id: string, next: any) => {
  try {
    const subService = await subServicesModel.findById(id).populate('serviceId');

    if (!subService) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SUBSERVICE_NOT_FOUND,
        })
      );
    }

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SUBSERVICE_FETCHED,
      data: subService,
    });
  } catch (error) {
    next(error);
  }
};

// Update a sub-service
export const updateSubService = async (params: any, bodyData: any, next: any) => {
  try {
    let subService: any = await subServicesModel.findById(params.id);
    if (!subService) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SUBSERVICE_NOT_EXISTS,
        })
      );
    }

    subService.name = bodyData.name?.toLowerCase() || subService.name;
    subService.description = bodyData.description;
    subService.serviceId = bodyData.serviceId || subService.serviceId;
    await subService.save();

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SUBSERVICE_UPDATED,
      data: subService,
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete a sub-service (set isDeleted to true)
export const deleteSubService = async (subServiceId: string, next: any) => {
  try {
    const subService = await subServicesModel.findById(subServiceId);
    if (!subService) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SUBSERVICE_NOT_FOUND,
        })
      );
    }

    if (subService.isDeleted) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SUBSERVICE_ALREADY_DELETED,
        })
      );
    }

    subService.isDeleted = true;
    const result = await subService.save();

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SUBSERVICE_DELETED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};