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
const check_1 = require("./middleware/check");
const basePath = config_1.default.get("BASE_PATH");
const userPath = "tasks";
const userPathURL = basePath + userPath;
exports.default = [
    // Get all users
    {
        path: userPathURL + "/getAllTasks",
        method: "get",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllTasks)(req.user, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    // add task
    {
        path: userPathURL,
        method: "post",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.addTask)(req.user, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // update task
    {
        path: userPathURL + "/:id",
        method: "put",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const taskId = req.params.id;
                const result = yield (0, controller_1.updateTask)(taskId, req.body, req.user, next);
                res.status(200).send(result);
            }),
        ],
    },
    // delete task
    {
        path: userPathURL + "/:id",
        method: "delete",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = req.params.id;
                const result = yield (0, controller_1.deleteTask)(userId, next);
                res.status(200).send(result);
            }),
        ],
    },
];
//# sourceMappingURL=routes.js.map