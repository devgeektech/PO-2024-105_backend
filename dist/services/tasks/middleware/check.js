"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthenticate = exports.checkLogin = void 0;
const httpErrors_1 = require("../../../utils/httpErrors");
const joi_1 = __importDefault(require("joi"));
const config_1 = __importDefault(require("config"));
const Utilities_1 = require("../../../utils/Utilities");
const ErrorHandler_1 = require("../../../utils/ErrorHandler");
const checkLogin = (req, res, next) => {
    const schema = joi_1.default.object({
        countryCode: joi_1.default.string().trim().required().messages({
            "string.empty": "Phone number country code cannot be empty",
        }),
        mobileNumber: joi_1.default.string().trim().required().messages({
            "string.empty": "Phone number cannot be empty"
        }),
    });
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
    });
    if (error) {
        let messageArr = (0, ErrorHandler_1.errorMessageHander)(error.details);
        throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
            code: 400,
            message: messageArr[0],
        }));
    }
    else {
        req.body = value;
        next();
    }
};
exports.checkLogin = checkLogin;
const checkAuthenticate = (req, res, next) => {
    const token = req.get(config_1.default.get("AUTHORIZATION"));
    Utilities_1.Utilities.verifyToken(token)
        .then((result) => {
        req.user = result;
        next();
    })
        .catch((error) => {
        res.status(403)
            .send({ responseCode: 401, responseMessage: error.message, data: {} });
    });
};
exports.checkAuthenticate = checkAuthenticate;
//# sourceMappingURL=check.js.map