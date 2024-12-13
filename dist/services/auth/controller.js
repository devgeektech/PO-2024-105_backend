"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberByEmail = exports.checkEmailExistence = exports.verifyAccount = exports.deleteUserbyAdmin = exports.memberRegister = exports.memberLoginByToken = exports.memberLogin = exports.partnerChangePassword = exports.partnerResetPassword = exports.partnerVerifyResetLink = exports.partnerForgotPassword = exports.partnerLogin = exports.partnerCreateNewPassword = exports.partnerAddWithLocation = exports.partnerResendVerifyCode = exports.partnerVerifyCode = exports.partnerSignup = exports.adminChangePassword = exports.createNewPassword = exports.verifyResetLink = exports.forgotPassword = exports.adminLogin = exports.adminSignUp = void 0;
const ejs_1 = __importDefault(require("ejs"));
const httpErrors_1 = require("../../utils/httpErrors");
const config_1 = __importDefault(require("config"));
const user_1 = require("../../db/user");
const Utilities_1 = require("../../utils/Utilities");
var mongoose = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const moment_1 = __importDefault(require("moment"));
const constants_1 = require("../../constants");
const MailerUtilities_1 = require("../../utils/MailerUtilities");
const utils_1 = require("../../utils");
const messages_1 = require("../../constants/messages");
const partner_1 = require("../../db/partner");
const partnerLocations_1 = require("../../db/partnerLocations");
//********************  admin controller  ***********************************//
const adminSignUp = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let adminData = constants_1.DEFAULT_ADMIN;
        let checkExist = yield user_1.UserModel.exists({ email: adminData.email });
        if (!checkExist) {
            const pass = yield Utilities_1.Utilities.cryptPassword(adminData.password);
            adminData.password = pass;
            yield user_1.UserModel.create(adminData);
            console.log('admin created successfully');
        }
    }
    catch (error) {
        console.log('Create error at time of admin creation.');
    }
});
exports.adminSignUp = adminSignUp;
const adminLogin = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = bodyData;
        const admin = yield user_1.UserModel.findOne({
            role: { $in: ["admin"] },
            isDeleted: false,
            email,
        });
        if (!admin) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
        const passwordMatch = yield Utilities_1.Utilities.VerifyPassword(password, admin.password);
        if (!passwordMatch) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.INVALID_CREDENTIAL,
            }));
        }
        let adminToken = yield Utilities_1.Utilities.createJWTToken({
            id: admin._id,
            email: admin.email,
            firstName: admin.firstName || "",
            lastName: admin.lastName || "",
            role: admin.role,
        });
        admin.token = adminToken;
        const userData = Object.assign({}, admin);
        const result = userData === null || userData === void 0 ? void 0 : userData._doc;
        result.accessToken = adminToken;
        delete result.password;
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: messages_1.MESSAGES.LOGIN_SUCCESS,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.adminLogin = adminLogin;
//  Forgot password  //
const forgotPassword = (body, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userRes = yield user_1.UserModel.findOne({
            email: body.email,
            isDeleted: false,
        });
        if (userRes) {
            let randomOTP = Utilities_1.Utilities.genNumericCode(6);
            console.log('randomOTP >>>> ', randomOTP, process.env.psswordResetBaseUrl + 'auth/resetLink/' + userRes._id + '?otp=' + randomOTP);
            // Get email template to send email
            let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/forgotPassword.ejs", { link: process.env.psswordResetBaseUrl + 'auth/resetLink/' + userRes._id + '?otp=' + randomOTP }, { async: true });
            let mailResponse = MailerUtilities_1.MailerUtilities.sendSendgridMail({
                recipient_email: [body.email],
                subject: "Password reset link",
                text: messageHtml,
            });
            userRes['otp'] = randomOTP;
            userRes['otpVerified'] = false;
            userRes['otpExipredAt'] = (0, moment_1.default)().add(10, "m");
            yield userRes.save();
            return Utilities_1.Utilities.sendResponsData({
                code: 200,
                message: "Mail is sent with link",
            });
        }
        else {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
//  verify Reset sLink  //
const verifyResetLink = (params, query, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield user_1.UserModel.findById(params.id);
        if (!user) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.INVALID_LINK,
            }));
        }
        if (user.otp != query.otp) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.INVALID_LINK,
            }));
        }
        if ((0, moment_1.default)().isAfter((0, moment_1.default)(user.otpExipredAt))) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.LINK_EXPIRED,
            }));
        }
        user.otp = 0;
        user.otpVerified = true;
        yield user.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: messages_1.MESSAGES.LINK_VERIFIED,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyResetLink = verifyResetLink;
// create new password
const createNewPassword = (body, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userRes = yield user_1.UserModel.findOne({
            email: body.email,
            isDeleted: false,
        });
        if (userRes) {
            const pass = yield Utilities_1.Utilities.cryptPassword(body.password);
            let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/changePassword.email.ejs", { name: userRes.firstName.charAt(0).toUpperCase() + userRes.firstName.slice(1) }, { async: true });
            yield MailerUtilities_1.MailerUtilities.sendSendgridMail({
                recipient_email: [userRes.email],
                subject: "Change Password",
                text: messageHtml,
            });
            userRes.password = pass;
            yield userRes.save();
            return Utilities_1.Utilities.sendResponsData({
                code: 200,
                message: messages_1.MESSAGES.PASSWORD_UPDATED,
                data: userRes
            });
        }
        else {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
    }
    catch (error) {
        next(error);
    }
});
exports.createNewPassword = createNewPassword;
//  change Password  //
const adminChangePassword = (token, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldPassword, newPassword } = bodyData;
        const decoded = yield Utilities_1.Utilities.getDecoded(token);
        let adminRes = yield user_1.UserModel.findOne({
            _id: new mongoose.Types.ObjectId(decoded.id),
            isDeleted: false,
        });
        if (adminRes) {
            const match = yield Utilities_1.Utilities.VerifyPassword(oldPassword, adminRes.password);
            if (match) {
                let hashedPassword = yield Utilities_1.Utilities.cryptPassword(newPassword);
                adminRes.password = hashedPassword;
                yield adminRes.save();
                return Utilities_1.Utilities.sendResponsData({
                    code: 200,
                    message: messages_1.MESSAGES.PASSWORD_UPDATED,
                });
            }
            else {
                throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                    code: 400,
                    message: messages_1.MESSAGES.INVALID_PASSWORD,
                }));
            }
        }
        else {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
    }
    catch (error) {
        next(error);
    }
});
exports.adminChangePassword = adminChangePassword;
//********************  FITNESS PRTNER controller  ***********************************//
//  partner Signup //
const partnerSignup = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let partnerExists = yield partner_1.PartnerModel.findOne({ email: bodyData.email, isDeleted: false });
        if (partnerExists) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_EXISTS,
            }));
        }
        let randomOTP = Utilities_1.Utilities.genNumericCode(4);
        console.log('randomOTP >>>> ', randomOTP);
        // Get email template to send email
        let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/partnerRegistration.ejs", { code: randomOTP }, { async: true });
        let mailResponse = MailerUtilities_1.MailerUtilities.sendSendgridMail({
            recipient_email: [bodyData.email],
            subject: "Verification code",
            text: messageHtml,
        });
        bodyData['otp'] = randomOTP;
        bodyData['otpVerified'] = false;
        bodyData['otpExipredAt'] = (0, moment_1.default)().add(10, "m");
        let result = yield partner_1.PartnerModel.create(bodyData);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: messages_1.MESSAGES.PARTNER.VERIFICATION_CODE_SEND,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
});
exports.partnerSignup = partnerSignup;
//  partner Verify Code  //
const partnerVerifyCode = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let partner = yield partner_1.PartnerModel.findOne({ email: bodyData.email, isDeleted: false });
        if (!partner) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
        if (partner.otp != bodyData.otp) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.PARTNER.INVALID_CODE,
            }));
        }
        if ((0, moment_1.default)().isAfter((0, moment_1.default)(partner.otpExipredAt))) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.PARTNER.CODE_EXPIRED,
            }));
        }
        partner.otp = 0;
        partner.otpVerified = true;
        yield partner.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: messages_1.MESSAGES.PARTNER.CODE_VERIFIED,
            data: partner
        });
    }
    catch (error) {
        next(error);
    }
});
exports.partnerVerifyCode = partnerVerifyCode;
//  partner Resend Verify Code  //
const partnerResendVerifyCode = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let partner = yield partner_1.PartnerModel.findOne({ email: bodyData.email, isDeleted: false });
        if (!partner) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
        let randomOTP = Utilities_1.Utilities.genNumericCode(4);
        console.log('randomOTP >>>> ', randomOTP);
        // Get email template to send email
        let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/partnerRegistration.ejs", { code: randomOTP }, { async: true });
        let mailResponse = MailerUtilities_1.MailerUtilities.sendSendgridMail({
            recipient_email: [bodyData.email],
            subject: "Verification code",
            text: messageHtml,
        });
        partner['otp'] = randomOTP;
        partner['otpVerified'] = false;
        partner['otpExipredAt'] = (0, moment_1.default)().add(10, "m");
        yield partner.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: messages_1.MESSAGES.PARTNER.VERIFICATION_CODE_SEND,
            data: partner
        });
    }
    catch (error) {
        next(error);
    }
});
exports.partnerResendVerifyCode = partnerResendVerifyCode;
//  partner Add With Location  //
const partnerAddWithLocation = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate if email is already in use
        const partner = yield partner_1.PartnerModel.findOne({ email: bodyData.email, isDeleted: false });
        if (!partner) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.ADMIN.PARTNER_NOT_FOUND,
            }));
        }
        // Create partner location(s)
        const locationPromises = bodyData.locations.map((location) => {
            return partnerLocations_1.PartnerLocationModel.create({
                partnerId: partner === null || partner === void 0 ? void 0 : partner._id,
                address: location.address,
                city: location.city,
                state: location.state,
                phone: location.phone,
                images: location.images,
                services: bodyData.services,
                date: new Date(location.date),
                startTime: location.startTime, // 09:00
                endTime: location.endTime, // 03:00
                googleBussinessPageLink: location.googleBussinessPageLink,
            });
        });
        const locations = yield Promise.all(locationPromises);
        for (let item of locations) {
            partner.locations.push(item._id);
        }
        partner.wellnessTypeId = bodyData.wellnessTypeId;
        partner.isGoogleVerified = bodyData.isGoogleVerified;
        partner.checkinRate = bodyData.checkinRate;
        yield partner.save();
        // Get welcome email template to send email
        let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/welcome.ejs", { name: partner.name }, { async: true });
        let mailResponse = MailerUtilities_1.MailerUtilities.sendSendgridMail({
            recipient_email: [bodyData.email],
            subject: "Registration Success",
            text: messageHtml,
        });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: messages_1.MESSAGES.ADMIN.PARTNER_CREATED,
            data: { partner, locations },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.partnerAddWithLocation = partnerAddWithLocation;
// create new password On-board  //
const partnerCreateNewPassword = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const partner = yield partner_1.PartnerModel.findOne({ email: bodyData.email, isDeleted: false });
        if (!partner) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.ADMIN.PARTNER_NOT_FOUND,
            }));
        }
        const pass = yield Utilities_1.Utilities.cryptPassword(bodyData.password);
        partner.password = pass;
        partner.onBoarded = true;
        let partnerToken = yield Utilities_1.Utilities.createJWTToken({
            id: partner._id,
            email: partner.email,
            name: partner.name || "",
        });
        partner.token = partnerToken;
        yield partner.save();
        delete partner.password;
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: messages_1.MESSAGES.ADMIN.PARTNER_CREATED,
            data: partner
        });
    }
    catch (error) {
        next(error);
    }
});
exports.partnerCreateNewPassword = partnerCreateNewPassword;
//  partner Login  //
const partnerLogin = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const partner = yield partner_1.PartnerModel.findOne({ email: bodyData.email, isDeleted: false });
        if (!partner) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
        const passwordMatch = yield Utilities_1.Utilities.VerifyPassword(bodyData.password, partner.password);
        if (!passwordMatch) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.INVALID_CREDENTIAL,
            }));
        }
        let partnerToken = yield Utilities_1.Utilities.createJWTToken({
            id: partner._id,
            email: partner.email,
            name: partner.name || "",
        });
        partner.token = partnerToken;
        yield partner.save();
        delete partner.password;
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: messages_1.MESSAGES.LOGIN_SUCCESS,
            data: partner,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.partnerLogin = partnerLogin;
//  partner Forgot Password  //
const partnerForgotPassword = (body, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let partner = yield partner_1.PartnerModel.findOne({ email: body.email, isDeleted: false });
        if (partner) {
            let randomOTP = Utilities_1.Utilities.genNumericCode(6);
            console.log('randomOTP >>>> ', randomOTP, process.env.psswordResetBaseUrl + 'auth/partner/resetLink/' + partner._id + '?otp=' + randomOTP);
            // Get email template to send email
            let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/forgotPassword.ejs", { link: process.env.psswordResetBaseUrl + 'auth/partner/resetLink/' + partner._id + '?otp=' + randomOTP }, { async: true });
            let mailResponse = MailerUtilities_1.MailerUtilities.sendSendgridMail({
                recipient_email: [body.email],
                subject: "Password reset link",
                text: messageHtml,
            });
            partner['otp'] = randomOTP;
            partner['otpVerified'] = false;
            partner['otpExipredAt'] = (0, moment_1.default)().add(10, "m");
            yield partner.save();
            return Utilities_1.Utilities.sendResponsData({
                code: 200,
                message: "Mail is sent with link",
            });
        }
        else {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
    }
    catch (error) {
        next(error);
    }
});
exports.partnerForgotPassword = partnerForgotPassword;
//  partner Verify Reset Link  //
const partnerVerifyResetLink = (params, query, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let partner = yield partner_1.PartnerModel.findById(params.id);
        if (!partner) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.INVALID_LINK,
            }));
        }
        if (partner.otp != query.otp) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.INVALID_LINK,
            }));
        }
        if ((0, moment_1.default)().isAfter((0, moment_1.default)(partner.otpExipredAt))) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.LINK_EXPIRED,
            }));
        }
        partner.otp = 0;
        partner.otpVerified = true;
        yield partner.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: messages_1.MESSAGES.LINK_VERIFIED,
            data: partner
        });
    }
    catch (error) {
        next(error);
    }
});
exports.partnerVerifyResetLink = partnerVerifyResetLink;
//  partner Reset Password  //
const partnerResetPassword = (body, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let partner = yield partner_1.PartnerModel.findOne({ email: body.email, isDeleted: false });
        if (partner) {
            const pass = yield Utilities_1.Utilities.cryptPassword(body.password);
            let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/changePassword.email.ejs", { name: partner.name.charAt(0).toUpperCase() + partner.name.slice(1) }, { async: true });
            yield MailerUtilities_1.MailerUtilities.sendSendgridMail({
                recipient_email: [partner.email],
                subject: "Change Password",
                text: messageHtml,
            });
            partner.password = pass;
            yield partner.save();
            return Utilities_1.Utilities.sendResponsData({
                code: 200,
                message: messages_1.MESSAGES.PASSWORD_UPDATED,
                data: partner
            });
        }
        else {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
    }
    catch (error) {
        next(error);
    }
});
exports.partnerResetPassword = partnerResetPassword;
//  partner Change Password  //
const partnerChangePassword = (token, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldPassword, newPassword } = bodyData;
        const decoded = yield Utilities_1.Utilities.getDecoded(token);
        let partner = yield user_1.UserModel.findOne({ _id: new mongoose.Types.ObjectId(decoded.id), isDeleted: false });
        if (partner) {
            const match = yield Utilities_1.Utilities.VerifyPassword(oldPassword, partner.password);
            if (match) {
                let hashedPassword = yield Utilities_1.Utilities.cryptPassword(newPassword);
                partner.password = hashedPassword;
                yield partner.save();
                return Utilities_1.Utilities.sendResponsData({
                    code: 200,
                    message: messages_1.MESSAGES.PASSWORD_UPDATED
                });
            }
            else {
                throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                    code: 400,
                    message: messages_1.MESSAGES.INVALID_PASSWORD
                }));
            }
        }
        else {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: messages_1.MESSAGES.USER_NOT_EXISTS,
            }));
        }
    }
    catch (error) {
        next(error);
    }
});
exports.partnerChangePassword = partnerChangePassword;
//***********************   MEMBER   *************************//
//  common api for login and ragister
const memberLogin = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = bodyData;
        const user = yield user_1.UserModel.findOne({ email, isDeleted: false, role: { $in: ["member", "trainer", "sponsor"] } });
        if (!user) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_EXIST"),
            }));
        }
        const passwordMatch = yield bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.INVALID_PASSWORD"),
            }));
        }
        if (!(user === null || user === void 0 ? void 0 : user.approved)) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.ACCOUNT_NOT_APPROVED"),
            }));
        }
        let userToken = yield Utilities_1.Utilities.createJWTToken({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user === null || user === void 0 ? void 0 : user.lastName,
            role: user.role
        }, '7d');
        const userData = Object.assign({}, user);
        let result = userData === null || userData === void 0 ? void 0 : userData._doc;
        delete result.password;
        result.token = userToken;
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.memberLogin = memberLogin;
const memberLoginByToken = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = bodyData;
        const decoded = yield Utilities_1.Utilities.getDecoded(token);
        const user = yield user_1.UserModel.findOne({ _id: decoded === null || decoded === void 0 ? void 0 : decoded.id, isDeleted: false, role: { $in: ["member"] } });
        if (!user) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_EXIST"),
            }));
        }
        if (!(user === null || user === void 0 ? void 0 : user.approved)) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.ACCOUNT_NOT_APPROVED"),
            }));
        }
        let userToken = yield Utilities_1.Utilities.createJWTToken({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user === null || user === void 0 ? void 0 : user.lastName,
            role: user.role
        }, '7d');
        const userData = Object.assign({}, user);
        let result = userData === null || userData === void 0 ? void 0 : userData._doc;
        delete result.password;
        result.token = userToken;
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.memberLoginByToken = memberLoginByToken;
const memberRegister = (files, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = bodyData;
        const query = [{ isDeleted: false }, { email }];
        const user = yield user_1.UserModel.findOne({ $and: query });
        if (user) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_EXISTS"),
            }));
        }
        let matchPermissionDoc, clubTransferDoc, birthCertificateDoc, residenceCertificateDoc, playersParentDeclarationDoc, copyOfPassportDoc, attachmentArgentinaDoc, attachmentIstupnicaDoc, attachmentBrisovnicaDoc;
        if (files && (files === null || files === void 0 ? void 0 : files.length)) {
            for (let file of files) {
                if (file.fieldname == 'matchPermissionDoc') {
                    matchPermissionDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                else if (file.fieldname == 'clubTransferDoc') {
                    clubTransferDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'birthCertificateDoc') {
                    birthCertificateDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'residenceCertificateDoc') {
                    residenceCertificateDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'playersParentDeclarationDoc') {
                    playersParentDeclarationDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'copyOfPassportDoc') {
                    copyOfPassportDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'attachmentArgentinaDoc') {
                    attachmentArgentinaDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'attachmentIstupnicaDoc') {
                    attachmentIstupnicaDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'attachmentBrisovnicaDoc') {
                    attachmentBrisovnicaDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
            }
        }
        const pass = yield Utilities_1.Utilities.cryptPassword(bodyData.password);
        bodyData.password = pass;
        bodyData.role = ['member'];
        bodyData = Object.assign(Object.assign({}, bodyData), { matchPermissionDoc, clubTransferDoc, birthCertificateDoc, residenceCertificateDoc,
            playersParentDeclarationDoc, copyOfPassportDoc, attachmentArgentinaDoc, attachmentIstupnicaDoc,
            attachmentBrisovnicaDoc, siblingDetails: JSON.parse(bodyData.siblingDetails), joinedAt: (0, moment_1.default)().add(1, 'months').set("date", 1).toISOString(), email: String(email).toLowerCase() });
        const registerUser = yield new user_1.UserModel(bodyData).save();
        const link = yield (0, utils_1.generateVerificationLink)(registerUser);
        let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/registrationVerification.ejs", { name: `${bodyData === null || bodyData === void 0 ? void 0 : bodyData.firstName}`, verifyLink: link }, { async: true });
        let mailResponse = MailerUtilities_1.MailerUtilities.sendSendgridMail({
            recipient_email: [bodyData.email],
            subject: "Kontoaktivierung",
            text: messageHtml,
        });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Registrierung erfolgreich abgeschlossen!",
            data: registerUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.memberRegister = memberRegister;
const deleteUserbyAdmin = (token, userId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = yield Utilities_1.Utilities.getDecoded(token);
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.INVALID_ID_FORMAT"),
            });
        }
        const userData = yield user_1.UserModel.findOne({ _id: mongoose.Types.ObjectId(userId), isDeleted: false });
        if (!userData) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.NO_RECORD_FOUND"),
            }));
        }
        userData.isDeleted = true;
        userData.updatedBy = decoded.id;
        yield userData.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.DELETE_ACC"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUserbyAdmin = deleteUserbyAdmin;
//account verification
const verifyAccount = (body, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = yield Utilities_1.Utilities.getDecoded(body === null || body === void 0 ? void 0 : body.token);
        const userId = decoded === null || decoded === void 0 ? void 0 : decoded.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.INVALID_ID_FORMAT"),
            }));
        }
        const verifyLink = yield Utilities_1.Utilities.verifyToken(body === null || body === void 0 ? void 0 : body.token);
        if (verifyLink) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.LINK_EXPIRED"),
            }));
        }
        const userData = yield user_1.UserModel.findOne({ _id: mongoose.Types.ObjectId(userId), isDeleted: false });
        if (!userData) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
            }));
        }
        userData.isCompanyVerified = true;
        yield userData.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Account verfied successfully!",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyAccount = verifyAccount;
// check email exists
const checkEmailExistence = (body, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExist = yield user_1.UserModel.exists({ email: body === null || body === void 0 ? void 0 : body.email });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            data: isExist
        });
    }
    catch (error) {
        next(error);
    }
});
exports.checkEmailExistence = checkEmailExistence;
const getMemberByEmail = (body, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.UserModel.findOne({ email: body === null || body === void 0 ? void 0 : body.email }).select("firstName lastName dob email").lean();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMemberByEmail = getMemberByEmail;
//# sourceMappingURL=controller.js.map