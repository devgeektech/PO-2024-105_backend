"use strict";
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
exports.generateVerificationLink = exports.applyRoutes = exports.applyMiddleware = void 0;
const config_1 = __importDefault(require("config"));
const Utilities_1 = require("./Utilities");
const applyMiddleware = (middlewareWrappers, router) => {
    for (const wrapper of middlewareWrappers) {
        wrapper(router);
    }
};
exports.applyMiddleware = applyMiddleware;
const applyRoutes = (routes, router) => {
    for (const route of routes) {
        const { method, path, handler } = route;
        router[method](path, handler);
    }
};
exports.applyRoutes = applyRoutes;
const generateVerificationLink = (userDetail) => __awaiter(void 0, void 0, void 0, function* () {
    const api_url = config_1.default.get('VERIFICATION_URL');
    const token = yield Utilities_1.Utilities.createJWTToken({ id: userDetail === null || userDetail === void 0 ? void 0 : userDetail._id }, '30m');
    const verificationLink = `${api_url}?token=${token}`;
    return verificationLink;
});
exports.generateVerificationLink = generateVerificationLink;
//# sourceMappingURL=index.js.map