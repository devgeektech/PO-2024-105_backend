import config from "config";
import { HTTP400Error, HTTP404Error } from "../../utils/httpErrors";
import { Utilities } from "../../utils/Utilities";
import { wellnessTypeModel } from '../../db/wellnessType';
import { MESSAGES } from "../../constants/messages";
import { FileUpload } from "../../utils/FileUploadUtilities";

// add wellness Type //
export const addWellnessType = async (bodyData: any, files: any, next: any) => {
  try {
    let imageUrl;
    let isExist = await wellnessTypeModel.findOne({ name: bodyData.name });
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

    wellnessType.name = bodyData.name || wellnessType.name;
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

