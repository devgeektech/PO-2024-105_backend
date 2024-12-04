"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthenticate = exports.checkUserId = void 0;
const httpErrors_1 = require("../utils/httpErrors");
const config_1 = __importDefault(require("config"));
const Utilities_1 = require("../utils/Utilities");
const checkUserId = (req, next) => {
    if (!req.query.id) {
        throw new httpErrors_1.HTTP400Error("Id is required");
    }
    else {
        next();
    }
};
exports.checkUserId = checkUserId;
const checkAuthenticate = (req, res, next) => {
    const token = req.get(config_1.default.get("AUTHORIZATION"));
    if (!token) {
        throw new httpErrors_1.HTTP400Error({ responseCode: 400, responseMessage: "Token required" });
    }
    return Utilities_1.Utilities.verifyToken(token).then((result) => { next(); })
        .catch((error) => {
        throw new httpErrors_1.HTTP403Error({ responseCode: 403, responseMessage: error.message });
    });
};
exports.checkAuthenticate = checkAuthenticate;
//# sourceMappingURL=checks.js.map