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
const eventPath = 'events';
const eventPathURL = basePath + eventPath;
exports.default = [
    // Get all events
    {
        path: eventPathURL + "/getAllEvents",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllEvents)(req, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: eventPathURL + "/getAllMyEvents",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.getAllMyEvents)(decoded.id, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: eventPathURL + "/getAllMyEventsWithSlots",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.getAllMyEventsWithSlots)(decoded.id, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: eventPathURL + "/getAllEventInvitations",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.getAllMyEventInvitation)(decoded.id, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    {
        path: eventPathURL + "/getAllEventInvitationsWithSlots",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.getAllEventInvitationsWithSlots)(decoded.id, req, next);
                res.status(200).send(result);
            }),
        ],
    },
    // Approve Event
    {
        path: eventPathURL + '/approve/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const eventId = req.params.id;
                const result = yield (0, controller_1.approveEvent)(eventId, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // Change User Status from Event
    {
        path: eventPathURL + '/:id/status',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const eventId = req.params.id;
                const result = yield (0, controller_1.updateUserEventStatus)(eventId, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //add event
    {
        path: eventPathURL,
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const token = req.get(config_1.default.get("AUTHORIZATION"));
                const decoded = yield Utilities_1.Utilities.getDecoded(token);
                const result = yield (0, controller_1.addEvent)(decoded.id, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // update event
    {
        path: eventPathURL + '/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const eventId = req.params.id;
                const result = yield (0, controller_1.updateEvent)(eventId, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //delete event
    {
        path: eventPathURL + '/:id',
        method: "delete",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const eventId = req.params.id;
                const result = yield (0, controller_1.deleteEvent)(eventId, next);
                res.status(200).send(result);
            }),
        ],
    }
];
//# sourceMappingURL=routes.js.map