import { Request, Response, NextFunction } from "express";
import { HTTP400Error, HTTP403Error } from "../../../utils/httpErrors";
import Joi, { any } from "joi";
import config from "config";
import { Utilities } from "../../../utils/Utilities";
import { invalidTokenError, errorMessageHander } from "../../../utils/ErrorHandler";

export const checkLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Email cannot be empty",
    }),
    password: Joi.string().trim().required().messages({
      "string.empty": "Password cannot be empty"
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

export const checkAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  const token: any = req.get(config.get("AUTHORIZATION"));
  Utilities.verifyToken(token)
    .then((result) => {
      next();
    })
    .catch((error) => {
      res.status(403)
        .send({ responseCode: 401, responseMessage: error.message, data: {} });
    });
};

export const validateMemberRegister = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().trim().required().messages({
      "string.empty": "Fullname cannot be empty",
    }),
    phone: Joi.string().trim().required().messages({
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

//************  partner validation  *********//
export const checkPartnerSignup = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().trim().required().messages({
      "string.empty": "Name cannot be empty",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "Email cannot be empty",
    }),
    businessName: Joi.string().allow(''),
    businessWebsite: Joi.string().allow(''),
    phone: Joi.string().allow(''),
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