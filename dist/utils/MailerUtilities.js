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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerUtilities = void 0;
const config_1 = __importDefault(require("config"));
const nodemailer = __importStar(require("nodemailer"));
var sgTransport = require('nodemailer-sendgrid-transport');
class MailerUtilities {
}
exports.MailerUtilities = MailerUtilities;
_a = MailerUtilities;
MailerUtilities.sendSendgridMail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("inside function");
        var options = {
            auth: {
                api_key: config_1.default.get("SENDGRID_SETTING.API_KEY")
            }
        };
        var mailer = nodemailer.createTransport(sgTransport(options));
        var message = {
            to: [...data.recipient_email],
            cc: ['narender@geekinformatic.com'],
            from: config_1.default.get("SENDGRID_SETTING.SENDER.EMAIL"),
            subject: data.subject,
            text: data.text,
            html: data.text
        };
        if (data.cc) {
            message.cc = [...data.cc];
        }
        if (data.attachments) {
            message.attachments = [
                {
                    filename: 'test.txt',
                    path: __dirname + '/test.txt'
                }
            ];
        }
        const mailRes = yield mailer.sendMail(message);
        console.log("mailRes", mailRes);
        return mailRes;
    }
    catch (error) {
        console.log('error:', error);
        return false;
        // throw new HTTP400Error( 
        //   Utilities.sendResponsData({
        //     code: 400,
        //     message: config.get("ERRORS.SENGRID_ISSUE"),
        //   })  
        // );
    }
});
/**
 * Send email using smtp
 * @param data include (recipient_email,subject,message,attachments)
 */
MailerUtilities.sendSMTPEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve, reject) {
        let transporter = nodemailer.createTransport({
            host: config_1.default.get("SMTP_SETTING.HOST"),
            port: config_1.default.get("SMTP_SETTING.PORT"),
            secure: false, // upgrade later with STARTTLS
            auth: {
                user: config_1.default.get("SMTP_SETTING.USERNAME"),
                pass: config_1.default.get("SMTP_SETTING.PASSWORD"),
            },
            tls: {
                rejectUnauthorized: false
            },
        });
        const mailData = {
            from: {
                name: config_1.default.get("SMTP_SETTING.SENDER_NAME"),
                address: config_1.default.get("SMTP_SETTING.SENDER"),
            },
            to: data.recipient_email,
            subject: data.subject,
            html: data.text,
        };
        if (data.attachments) {
            mailData.attachments = data.attachments;
        }
        transporter.sendMail(mailData, (err, info) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(info);
            }
        });
    });
});
//# sourceMappingURL=MailerUtilities.js.map