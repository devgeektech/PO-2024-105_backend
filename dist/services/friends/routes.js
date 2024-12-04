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
const controller_1 = require("./controller");
const Utilities_1 = require("../../utils/Utilities");
const basePath = config_1.default.get("BASE_PATH");
const friendPath = 'friends';
const friendPathURL = basePath + friendPath;
exports.default = [
    // Get all friends requests
    {
        path: friendPathURL + "/getAllFriendRequest",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.getAllFriendRequests)(decoded.id, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    // Get all my friends
    {
        path: friendPathURL + "/getAllMyFriends",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.getAllMyFriends)(decoded.id, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    // Get all sended friend request
    {
        path: friendPathURL + "/getAllSendedFriendRequest",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.getAllSendedFriendRequests)(decoded.id, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    //add plan
    {
        path: friendPathURL,
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.sendFriendRequest)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // update plan
    {
        path: friendPathURL + '/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const eventId = req.params.id;
                const result = yield (0, controller_1.updateFriendRequest)(eventId, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
];
//# sourceMappingURL=routes.js.map