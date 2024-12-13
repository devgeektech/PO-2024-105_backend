import { Request, Response, NextFunction } from "express";
import { HTTP400Error, HTTP403Error } from "../../../../utils/httpErrors";
import Joi, { any } from "joi";
import config from "config";
import { Utilities } from "../../../../utils/Utilities";
import { invalidTokenError, errorMessageHander } from "../../../../utils/ErrorHandler";

export const checkLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    countryCode: Joi.string().trim().required().messages({
      "string.empty": "Phone number country code cannot be empty",
    }),
    mobileNumber: Joi.string().trim().required().messages({
      "string.empty": "Phone number cannot be empty"
    }),
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    let messageArr = errorMessageHander(error.details);
    throw new HTTP400Error(
      Utilities.sendResponsData({
        code: 400,
        message: messageArr[0],
      })
    );
  } else {
    req.body = value;
    next();
  }
};

export const checkAuthenticate = (req: any, res: Response, next: NextFunction) => {
  const token: any = req.get(config.get("AUTHORIZATION"));
  Utilities.verifyToken(token)
    .then((result:any) => {
      req.user = result;
      next();
    })
    .catch((error:any) => {
      res.status(403)
        .send({ responseCode: 401, responseMessage: error.message, data: {} });
    });
};