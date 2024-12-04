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
const forumPath = 'forums';
const forumPathURL = basePath + forumPath;
exports.default = [
    // Get all forum
    {
        path: forumPathURL + "/getAllForums",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllForum)(req.query, next);
                res.status(200).send(result);
            }),
        ],
    },
    // Get all my forum
    {
        path: forumPathURL + "/getAllMyForums",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.getAllMyForum)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.query, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL,
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.addNewForum)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.body, req.files, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/:id",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getForumById)(req.params.id, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/:id",
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.updateForum)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.params.id, req.body, req.files, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/admin/:id",
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.updateForumAdmin)(req.params.id, req.body, req.files, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/admin/:id",
        method: "delete",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.deleteForumAdmin)(req.params.id, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/:id",
        method: "delete",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.deleteForum)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.params.id, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/vote/:id",
        method: "patch",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.voteForum)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.params.id, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/comment",
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.addNewComment)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.body, req.files, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/comment/vote/:id",
        method: "patch",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.voteComment)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.params.id, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/comment/:id",
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.updateComment)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.params.id, req.body, req.files, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/comment/:id",
        method: "delete",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.deleteComment)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.params.id, next);
                res.status(200).send(result);
            }),
        ],
    },
    // reply section
    {
        path: forumPathURL + "/reply",
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.addNewReply)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: forumPathURL + "/reply/vote/:id",
        method: "patch",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.voteReply)(decoded === null || decoded === void 0 ? void 0 : decoded.id, req.params.id, next);
                res.status(200).send(result);
            }),
        ],
    },
];
//# sourceMappingURL=routes.js.map