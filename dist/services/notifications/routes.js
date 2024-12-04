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
const config_1 = __importDefault(require("config"));
const Utilities_1 = require("../../utils/Utilities");
const controller_1 = require("./controller");
const basePath = config_1.default.get("BASE_PATH");
const notificationPath = 'notifications';
const notificationPathURL = basePath + notificationPath;
exports.default = [
    // Get all notifications
    {
        path: notificationPathURL + "/getAllNotifications",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.getAllNotifications)(decoded.id, req, next);
                res.status(200).send(result);
            }),
        ],
    },
];
//# sourceMappingURL=routes.js.map