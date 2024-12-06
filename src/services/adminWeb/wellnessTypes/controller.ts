import config from "config";
import { HTTP400Error, HTTP404Error } from "../../../utils/httpErrors";
import { Utilities } from "../../../utils/Utilities";
import { wellnessTypeModel } from '../../../db/wellnessType';
import { MESSAGES } from "../../../constants/messages";
import { FileUpload } from "../../../utils/FileUploadUtilities";
import mongoose from "mongoose";

// add wellness Type //
export const addWellnessType = async (token:any, bodyData: any, files: any, next: any) => {
  try {
    let imageUrl;
    let isExist = await wellnessTypeModel.findOne({ name: bodyData.name.toLowerCase(), isDeleted:false });
    const decoded: any = await Utilities.getDecoded(token);
    console.log(decoded,">>> decoded >>>>")
    if (isExist) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.WELLNESS_TYPE_EXISTS,
        })
      );
    }

    if (files && files.length) {
      imageUrl = await FileUpload.uploadFileToAWS(files[0], 'wellnesstype')
    }
    bodyData.image = imageUrl;
    bodyData.name = bodyData.name.toLowerCase();
    bodyData.createdBy = new mongoose.Types.ObjectId(decoded.id)
    const result = await wellnessTypeModel.create(bodyData);

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.WELLNESS_TYPE_CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//  update Wellness Type  //
export const updateWellnessType = async (params: any, bodyData: any, files: any, next: any) => {
  try {
    let wellnessType: any = await wellnessTypeModel.findById(params.id);
    if (!wellnessType) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.WELLNESS_TYPE_NOT_EXISTS,
        })
      );
    }

    if (files && files.length) {
      let imageUrl = await FileUpload.uploadFileToAWS(files[0], 'wellnesstype');
      wellnessType.image = imageUrl;
    }

    wellnessType.name = bodyData.name.toLowerCase() || wellnessType.name;
    wellnessType.description = bodyData.description || wellnessType.description;
    await wellnessType.save();

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.WELLNESS_TYPE_UPDATED,
      data: wellnessType,
    });
  } catch (error) {
    next(error);
  }
}

//  get Wellness Types //
export const getAllWellnessTypes = async (query:any, next: any) => {
  try {
    let skip = parseInt(query.skip) || 0;
    let limit = parseInt(query.limit) || 10;
    let wellnessTypes: any = await wellnessTypeModel.find({isDeleted:false}).skip(skip).limit(limit);
    let totalCount:number = await wellnessTypeModel.countDocuments({isDeleted:false});

    if (!wellnessTypes || wellnessTypes.length === 0) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.WELLNESS_TYPE_NOT_FOUND,
        })
      );
    }

    // Return the list of wellness types
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.WELLNESS_TYPES_FETCHED,
      totalRecord: totalCount,
      data: wellnessTypes,
    });
  } catch (error) {
    next(error);
  }
}

//  Get Wellness Type by ID  //
export const getWellnessTypeById = async (id: string, next: any) => {
  try {
    let wellnessType: any = await wellnessTypeModel.findById(id);

    if (!wellnessType) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.WELLNESS_TYPE_NOT_FOUND, 
        })
      );
    }

    // Return the wellness type found
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.WELLNESS_TYPE_FETCHED,
      data: wellnessType,
    });
  } catch (error) {
    next(error);
  }
}

//  Delete Wellness Type by ID  //
export const deleteWellnessType = async (id: string, next: any) => {
  try {
    // Find the wellness type by its ID
    const wellnessType = await wellnessTypeModel.findById(id);

    if (!wellnessType) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.WELLNESS_TYPE_NOT_FOUND,
        })
      );
    }

    // Check if it's already deleted
    if (wellnessType.isDeleted) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.WELLNESS_TYPE_ALREADY_DELETED,
        })
      );
    }

    // Update isDeleted field to true (soft delete)
    wellnessType.isDeleted = true;
    const result = await wellnessType.save();

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.WELLNESS_TYPE_DELETED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
