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
const userPath = 'users';
const userPathURL = basePath + userPath;
exports.default = [
    // Get all users
    {
        path: userPathURL + "/getAllUsers",
        method: "get",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllUsers)(req.user, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: userPathURL + "/getAllMembers",
        method: "get",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllMembers)(req.user, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    // get all trainers
    {
        path: userPathURL + "/getAllTrainers",
        method: "get",
        handler: [
            check_1.checkAuthenticate,
            (_, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllTrainers)(next);
                res.status(200).send(result);
            }),
        ],
    },
    // Get all users for exports
    {
        path: userPathURL + "/getAllUsersForExport",
        method: "get",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllUsersForExport)(next);
                res.status(200).send(result);
            }),
        ],
    },
    // Get user by id
    {
        path: userPathURL + "/profile/:id",
        method: "get",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = req.params.id;
                const result = yield (0, controller_1.getUserProfileById)(userId, next);
                res.status(200).send(result);
            }),
        ],
    },
    //add user
    {
        path: userPathURL,
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.addUser)(req.body, req.files, next);
                res.status(200).send(result);
            }),
        ],
    },
    //update user
    {
        path: userPathURL + '/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = req.params.id;
                const result = yield (0, controller_1.updateUser)(userId, req.body, req.files, next);
                res.status(200).send(result);
            }),
        ],
    },
    //update user
    {
        path: userPathURL + '/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = req.params.id;
                const result = yield (0, controller_1.updateUser)(userId, req.body, req.files, next);
                res.status(200).send(result);
            }),
        ],
    },
    //update sponsor
    {
        path: userPathURL + '/sponsor/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = req.params.id;
                const result = yield (0, controller_1.updateSponsor)(userId, req.body, req.files, next);
                res.status(200).send(result);
            }),
        ],
    },
    // Approve User
    {
        path: userPathURL + '/approve/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = req.params.id;
                const result = yield (0, controller_1.approveUser)(userId, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: userPathURL + '/:id',
        method: "delete",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = req.params.id;
                const result = yield (0, controller_1.deleteUser)(userId, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: userPathURL + "/slots/:date",
        method: "get",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const date = req.params.date;
                const result = yield (0, controller_1.getUserSlots)(req.get(config_1.default.get("AUTHORIZATION")), date, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    // {
    //   path: userPathURL + "/slots",
    //   method: "post",
    //   handler: [
    //     // checkAuthenticate,
    //     async (req: any, res: Response, next: NextFunction) => {
    //       const result = await addSlots(await Utilities.getDecoded(req.get(config.get("AUTHORIZATION"))), req, next);
    //       res.status(200).send(result);
    //     },
    //   ],
    // },
    {
        path: userPathURL + "/trainer/:id/assignedMembers",
        method: "put",
        handler: [
            // checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = req.params.id;
                const result = yield (0, controller_1.assignedMembers)(userId, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: userPathURL + "/trainer/:id/assignedMembers",
        method: "get",
        handler: [
            // checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = req.params.id;
                const result = yield (0, controller_1.assignedMembersRecords)(userId, next);
                res.status(200).send(result);
            }),
        ],
    },
];
//# sourceMappingURL=routes.js.map