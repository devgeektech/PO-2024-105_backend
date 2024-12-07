import ejs from "ejs";
import { HTTP400Error } from "../../utils/httpErrors";
import config from "config";
import { UserModel } from "../../db/User";
import { Utilities } from "../../utils/Utilities";
var mongoose = require("mongoose");
import * as bcrypt from "bcrypt";
import moment from "moment";
import { DEFAULT_ADMIN } from "../../constants";
import { MailerUtilities } from "../../utils/MailerUtilities";
import { generateVerificationLink } from "../../utils";
import { MESSAGES } from "../../constants/messages";
import { NextFunction } from "express";

//********************  admin controller  ***********************************//
export const adminSignUp = async () => {
  try {
    let adminData = DEFAULT_ADMIN;
    let checkExist = await UserModel.exists({ email: adminData.email });
    if (!checkExist) {
      const pass: any = await Utilities.cryptPassword(adminData.password);
      adminData.password = pass;
      await UserModel.create(adminData);
      console.log('admin created successfully');
    }
  } catch (error) {
    console.log('Create error at time of admin creation.')
  }
};

export const adminLogin = async (bodyData: any, next: any) => {
  try {
    const { email, password } = bodyData;
    const admin: any = await UserModel.findOne({
      role: { $in: ["admin"] },
      isDeleted: false,
      email,
    });
    if (!admin) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.USER_NOT_EXISTS,
        })
      );
    }
    const passwordMatch = await Utilities.VerifyPassword(password, admin.password);
    if (!passwordMatch) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.INVALID_CREDENTIAL,
        })
      );
    }
    let adminToken = await Utilities.createJWTToken({
      id: admin._id,
      email: admin.email,
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      role: admin.role,
    });
    admin.token = adminToken;
    const userData = { ...admin };
    const result = userData?._doc;
    result.accessToken = adminToken;
    delete result.password;
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.LOGIN_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//  Forgot password  //
export const forgotPassword = async (body: any, next: any) => {
  try {
    let userRes: any = await UserModel.findOne({
      email: body.email,
      isDeleted: false,
    });
    if (userRes) {
      let randomOTP = Utilities.genNumericCode(6);
      console.log('randomOTP >>>> ', randomOTP, process.env.psswordResetBaseUrl + 'auth/resetLink/' + userRes._id + '?otp=' + randomOTP);

      // Get email template to send email
      let messageHtml = await ejs.renderFile(
        process.cwd() + "/src/views/forgotPassword.ejs",
        { link: process.env.psswordResetBaseUrl + 'auth/resetLink/' + userRes._id + '?otp=' + randomOTP },
        { async: true }
      );
      let mailResponse = MailerUtilities.sendSendgridMail({
        recipient_email: [body.email],
        subject: "Password reset link",
        text: messageHtml,
      });

      userRes['otp'] = randomOTP;
      userRes['otpVerified'] = false;
      userRes['otpExipredAt'] = moment().add(10, "m");
      await userRes.save();

      return Utilities.sendResponsData({
        code: 200,
        message: "Mail is sent with link",
      });
    } else {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.USER_NOT_EXISTS,
        })
      );
    }
  } catch (error) {
    next(error);
  }
};

//  verify Reset sLink  //
export const verifyResetLink = async (params: any, query: any, next: NextFunction) => {
  try {
    let user = await UserModel.findById(params.id);
    if (!user) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.INVALID_LINK,
        })
      );
    }
    if (user.otp != query.otp) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.INVALID_LINK,
        })
      );
    }
    if (moment().isAfter(moment(user.otpExipredAt))) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.LINK_EXPIRED,
        })
      );
    }

    user.otp = 0;
    user.otpVerified = true;
    await user.save();
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.LINK_VERIFIED,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

// create new password
export const createNewPassword = async (body: any, next: any) => {
  try {
    let userRes: any = await UserModel.findOne({
      email: body.email,
      isDeleted: false,
    });
    if (userRes) {
      const pass = await Utilities.cryptPassword(body.password);
      let messageHtml = await ejs.renderFile(
        process.cwd() + "/src/views/changePassword.email.ejs",
        { name: userRes.firstName.charAt(0).toUpperCase() + userRes.firstName.slice(1) },
        { async: true }
      );
      await MailerUtilities.sendSendgridMail({
        recipient_email: [userRes.email],
        subject: "Change Password",
        text: messageHtml,
      });

      userRes.password = pass;
      await userRes.save();
      return Utilities.sendResponsData({
        code: 200,
        message: MESSAGES.PASSWORD_UPDATED,
        data: userRes
      });
    } else {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.USER_NOT_EXISTS,
        })
      );
    }
  } catch (error) {
    next(error)
  }
};

//  change Password  //
export const adminChangePassword = async (token: any, bodyData: any, next: any) => {
  try {
    const { oldPassword, newPassword } = bodyData;
    const decoded: any = await Utilities.getDecoded(token);
    let adminRes: any = await UserModel.findOne({
      _id: new mongoose.Types.ObjectId(decoded.id),
      isDeleted: false,
    });
    if (adminRes) {
      const match = await Utilities.VerifyPassword(
        oldPassword,
        adminRes.password
      );
      if (match) {
        let hashedPassword = await Utilities.cryptPassword(newPassword);
        adminRes.password = hashedPassword;
        adminRes.save();
        return Utilities.sendResponsData({
          code: 200,
          message: MESSAGES.PASSWORD_UPDATED,
        });
      } else {
        throw new HTTP400Error(
          Utilities.sendResponsData({
            code: 400,
            message: MESSAGES.INVALID_PASSWORD,
          })
        );
      }
    } else {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.USER_NOT_EXISTS,
        })
      );
    }
  } catch (error) {
    next(error);
  }
};


//***********************   MEMBER   *************************//
//  common api for login and ragister
export const memberLogin = async (bodyData: any, next: any) => {
  try {
    const { email, password } = bodyData;
    const user: any = await UserModel.findOne({ email, isDeleted: false, role: { $in: ["member", "trainer", "sponsor"] } });
    if (!user) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.USER_NOT_EXIST"),
        })
      );
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.INVALID_PASSWORD"),
        })
      );
    }

    if (!user?.approved) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.ACCOUNT_NOT_APPROVED"),
        })
      );
    }
    let userToken = await Utilities.createJWTToken({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user?.lastName,
      role: user.role
    }, '7d');

    const userData = { ...user };
    let result = userData?._doc;
    delete result.password;
    result.token = userToken;

    return Utilities.sendResponsData({
      code: 200,
      message: "Success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const memberLoginByToken = async (bodyData: any, next: any) => {
  try {
    const { token } = bodyData;
    const decoded: any = await Utilities.getDecoded(token);
    const user: any = await UserModel.findOne({ _id: decoded?.id, isDeleted: false, role: { $in: ["member"] } });
    if (!user) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.USER_NOT_EXIST"),
        })
      );
    }

    if (!user?.approved) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.ACCOUNT_NOT_APPROVED"),
        })
      );
    }
    let userToken = await Utilities.createJWTToken({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user?.lastName,
      role: user.role
    }, '7d');

    const userData = { ...user };
    let result = userData?._doc;
    delete result.password;
    result.token = userToken;

    return Utilities.sendResponsData({
      code: 200,
      message: "Success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const memberRegister = async (files: any, bodyData: any, next: any) => {
  try {
    const { email } = bodyData;
    const query = [{ isDeleted: false }, { email }];

    const user = await UserModel.findOne({ $and: query });
    if (user) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.USER_EXISTS"),
        })
      );
    }

    let matchPermissionDoc, clubTransferDoc, birthCertificateDoc, residenceCertificateDoc,
      playersParentDeclarationDoc, copyOfPassportDoc, attachmentArgentinaDoc, attachmentIstupnicaDoc,
      attachmentBrisovnicaDoc;
    if (files && files?.length) {
      for (let file of files) {
        if (file.fieldname == 'matchPermissionDoc') {
          matchPermissionDoc = file?.filename;
        } else if (file.fieldname == 'clubTransferDoc') {
          clubTransferDoc = file?.filename;
        } if (file.fieldname == 'birthCertificateDoc') {
          birthCertificateDoc = file?.filename;
        } if (file.fieldname == 'residenceCertificateDoc') {
          residenceCertificateDoc = file?.filename;
        } if (file.fieldname == 'playersParentDeclarationDoc') {
          playersParentDeclarationDoc = file?.filename;
        } if (file.fieldname == 'copyOfPassportDoc') {
          copyOfPassportDoc = file?.filename;
        } if (file.fieldname == 'attachmentArgentinaDoc') {
          attachmentArgentinaDoc = file?.filename;
        } if (file.fieldname == 'attachmentIstupnicaDoc') {
          attachmentIstupnicaDoc = file?.filename;
        } if (file.fieldname == 'attachmentBrisovnicaDoc') {
          attachmentBrisovnicaDoc = file?.filename;
        }
      }
    }
    const pass: any = await Utilities.cryptPassword(bodyData.password);
    bodyData.password = pass;
    bodyData.role = ['member'];

    bodyData = {
      ...bodyData,
      matchPermissionDoc, clubTransferDoc, birthCertificateDoc, residenceCertificateDoc,
      playersParentDeclarationDoc, copyOfPassportDoc, attachmentArgentinaDoc, attachmentIstupnicaDoc,
      attachmentBrisovnicaDoc,
      siblingDetails: JSON.parse(bodyData.siblingDetails),
      joinedAt: moment().add(1, 'months').set("date", 1).toISOString(),
      email: String(email).toLowerCase()
    }
    const registerUser = await new UserModel(bodyData).save();
    const link = await generateVerificationLink(registerUser);
    let messageHtml = await ejs.renderFile(
      process.cwd() + "/src/views/registrationVerification.ejs",
      { name: `${bodyData?.firstName}`, verifyLink: link },
      { async: true }
    );
    let mailResponse = MailerUtilities.sendSendgridMail({
      recipient_email: [bodyData.email],
      subject: "Kontoaktivierung",
      text: messageHtml,
    });
    return Utilities.sendResponsData({
      code: 200,
      message: "Registrierung erfolgreich abgeschlossen!",
      data: registerUser,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteUserbyAdmin = async (token: any, userId: any, next: any) => {
  try {
    const decoded: any = await Utilities.getDecoded(token);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return Utilities.sendResponsData({
        code: 400,
        message: config.get("ERRORS.COMMON_ERRORS.INVALID_ID_FORMAT"),
      });
    }
    const userData = await UserModel.findOne({ _id: mongoose.Types.ObjectId(userId), isDeleted: false });
    if (!userData) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.NO_RECORD_FOUND"),
        })
      );
    }
    userData.isDeleted = true;
    userData.updatedBy = decoded.id;
    await userData.save();
    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.DELETE_ACC"),
    });
  } catch (error) {
    next(error);
  }
};

//account verification
export const verifyAccount = async (body: any, next: any) => {
  try {
    const decoded: any = await Utilities.getDecoded(body?.token);
    const userId = decoded?.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.INVALID_ID_FORMAT"),
        })
      );
    }
    const verifyLink = await Utilities.verifyToken(body?.token);
    if (verifyLink) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.LINK_EXPIRED"),
        })
      );
    }
    const userData = await UserModel.findOne({ _id: mongoose.Types.ObjectId(userId), isDeleted: false });
    if (!userData) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
        })
      );
    }
    userData.isCompanyVerified = true;
    await userData.save();
    return Utilities.sendResponsData({
      code: 200,
      message: "Account verfied successfully!",
    });
  } catch (error) {
    next(error)
  }
};


// check email exists
export const checkEmailExistence = async (body: any, next: any) => {
  try {
    const isExist = await UserModel.exists({ email: body?.email })
    return Utilities.sendResponsData({
      code: 200,
      data: isExist
    });
  } catch (error) {
    next(error)
  }
};

export const getMemberByEmail = async (body: any, next: any) => {
  try {
    const user = await UserModel.findOne({ email: body?.email }).select("firstName lastName dob email").lean();
    return Utilities.sendResponsData({
      code: 200,
      data: user
    });
  } catch (error) {
    next(error)
  }
};