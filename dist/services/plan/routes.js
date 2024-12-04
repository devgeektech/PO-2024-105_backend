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
const basePath = config_1.default.get("BASE_PATH");
const roomPath = 'plans';
const roomPathURL = basePath + roomPath;
exports.default = [
    // Get all plans
    {
        path: roomPathURL + "/getAllPlans",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllPlans)(req, next);
                res.status(200).send(result);
            }),
        ],
    },
    //add plan
    {
        path: roomPathURL,
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.addPlan)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // update plan
    {
        path: roomPathURL + '/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const eventId = req.params.id;
                const result = yield (0, controller_1.updatePlan)(eventId, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //delete plan
    {
        path: roomPathURL + '/:id',
        method: "delete",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const roomId = req.params.id;
                const result = yield (0, controller_1.deletePlan)(roomId, next);
                res.status(200).send(result);
            }),
        ],
    }
];
//# sourceMappingURL=routes.js.map