import config from "config";
import { HTTP400Error, HTTP404Error } from "../../../utils/httpErrors";
import { Utilities } from "../../../utils/Utilities";
import { MESSAGES } from "../../../constants/messages";
import mongoose from "mongoose";
import { servicesModel } from "../../../db/services";

// add services //  
export const addService = async (token: any, bodyData: any, next: any) => {
  try {
    const decoded: any = await Utilities.getDecoded(token);
    const isExist = await servicesModel.findOne({
      name: bodyData.name.toLowerCase(),
      isDeleted: false,
    });

    if (isExist) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SERVICE_EXISTS,
        })
      );
    }

    const serviceData = {
      name: bodyData.name.toLowerCase(),
      description: bodyData.description,
      createdBy: new mongoose.Types.ObjectId(decoded.id),
    };
    const result = await servicesModel.create(serviceData);

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SERVICE_CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get all services
export const getAllServices = async (queryData: any, next: any) => {
  try {
    let skip = parseInt(queryData.skip) || 0;
    let limit = parseInt(queryData.limit) || 10;
    let query: any = [{ isDeleted: false }];
    if (queryData.search) {
      query.push({ name: new RegExp(queryData.search, 'i') })
    }

    const services = await servicesModel.find({ $and: query }).skip(skip).limit(limit);
    const totalCounts = await servicesModel.countDocuments({ $and: query });

    if ((!services || services.length === 0) && !queryData.search) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.NO_SERVICES_FOUND,
        })
      );
    }

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SERVICES_FETCHED,
      totalRecord: totalCounts,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

// Get service by ID
export const getServiceById = async (id: string, next: any) => {
  try {
    const service = await servicesModel.findById(id);
    if (!service) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SERVICE_NOT_FOUND,
        })
      );
    }

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SERVICE_FETCHED,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// Update a service
export const updateService = async (params: any, bodyData: any, next: any) => {
  try {
    let service: any = await servicesModel.findById(params.id);
    if (!service) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SERVICE_NOT_EXISTS,
        })
      );
    }

    service.name = bodyData.name?.toLowerCase() || service.name;
    service.description = bodyData.description;
    await service.save();

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SERVICE_UPDATED,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a service (soft delete)
export const deleteService = async (serviceId: string, next: any) => {
  try {
    const service = await servicesModel.findById(serviceId);
    if (!service) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SERVICE_NOT_FOUND,
        })
      );
    }

    if (service.isDeleted) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.SERVICE_ALREADY_DELETED,
        })
      );
    }

    service.isDeleted = true;
    const result = await service.save();

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.SERVICE_DELETED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};