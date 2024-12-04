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
const bookingPath = 'bookings';
const bookingPathURL = basePath + bookingPath;
exports.default = [
    // Get all bookings
    {
        path: bookingPathURL + "/getAllRoomBookings",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllRoomBookings)(req, next);
                res.status(200).send(result);
            }),
        ],
    },
    // get all booking by room
    {
        path: bookingPathURL + "/room/:id",
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.getAllRoomBookingsByRoomId)(req, next);
                res.status(200).send(result);
            }),
        ],
    },
    //add booking
    {
        path: bookingPathURL,
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.addRoomBooking)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // update booking
    {
        path: bookingPathURL + '/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const bookingId = req.params.id;
                const result = yield (0, controller_1.updateRoomBooking)(bookingId, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // Approve Booking
    {
        path: bookingPathURL + '/approve/:id',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const bookingId = req.params.id;
                const result = yield (0, controller_1.approveBooking)(bookingId, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //delete booking
    {
        path: bookingPathURL + '/:id',
        method: "delete",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const bookingId = req.params.id;
                const result = yield (0, controller_1.deleteRoomBooking)(bookingId, next);
                res.status(200).send(result);
            }),
        ],
    }
];
//# sourceMappingURL=routes.js.map