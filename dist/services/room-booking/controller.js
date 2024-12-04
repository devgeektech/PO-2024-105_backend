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
exports.deleteRoomBooking = exports.approveBooking = exports.updateRoomBooking = exports.addRoomBooking = exports.getAllRoomBookingsByRoomId = exports.getAllRoomBookings = void 0;
const config_1 = __importDefault(require("config"));
const httpErrors_1 = require("../../utils/httpErrors");
const Utilities_1 = require("../../utils/Utilities");
const RoomBooking_1 = require("../../db/RoomBooking");
const mongoose_1 = __importDefault(require("mongoose"));
//  common api for bookings
const getAllRoomBookings = (req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            isDeleted: false
        };
        if (search) {
            query["$or"] = [
                { title: new RegExp(search, 'i') }
            ];
        }
        const bookings = yield RoomBooking_1.RoomBookingModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $lookup: {
                    from: "rooms",
                    foreignField: "_id",
                    localField: "room",
                    as: "roomDetail"
                }
            },
            {
                $unwind: {
                    path: "$roomDetail",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $skip: Number((page - 1) * limit)
            },
            {
                $limit: Number(limit),
            }
        ]);
        const totalRecord = yield RoomBooking_1.RoomBookingModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: bookings,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllRoomBookings = getAllRoomBookings;
//  common api for bookings by room id
const getAllRoomBookingsByRoomId = (req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {
            isDeleted: false,
            room: new mongoose_1.default.Types.ObjectId(req.params.id)
        };
        const bookings = yield RoomBooking_1.RoomBookingModel.aggregate([
            {
                $match: Object.assign({}, query),
            },
            {
                $lookup: {
                    from: "rooms",
                    foreignField: "_id",
                    localField: "room",
                    as: "roomDetail"
                }
            },
            {
                $unwind: {
                    path: "$roomDetail",
                    preserveNullAndEmptyArrays: true
                },
            },
        ]);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: bookings
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllRoomBookingsByRoomId = getAllRoomBookingsByRoomId;
const addRoomBooking = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, room } = bodyData;
        const start = new Date(startDate).toISOString(); // Convert to UTC format
        const end = new Date(endDate).toISOString(); // Convert to UTC format
        if (new Date(end) <= new Date(start)) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_ENDTIME_MUST_BE_GREATER"),
            }));
        }
        const checkExisting = yield RoomBooking_1.RoomBookingModel.exists({
            $and: [
                { startDate: { $lt: endDate } }, // New startDate is before an existing endDate
                { endDate: { $gt: startDate } }, // New endDate is after an existing startDate
            ],
            room: room,
        });
        if (checkExisting) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.ALREADY_BOOKING"),
            }));
        }
        const result = yield RoomBooking_1.RoomBookingModel.create(bodyData);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_ADDED"),
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addRoomBooking = addRoomBooking;
const updateRoomBooking = (bookingId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield RoomBooking_1.RoomBookingModel.findById(bookingId);
        if (!booking) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        const { startDate, endDate, room } = bodyData;
        const checkExisting = yield RoomBooking_1.RoomBookingModel.exists({
            _id: { $ne: bookingId },
            startDate: { $gte: startDate },
            endDate: { $lte: endDate },
            room: room,
        });
        if (checkExisting) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.ALREADY_BOOKING"),
            }));
        }
        Object.assign(booking, bodyData);
        const updatedEvent = yield booking.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_UPDATED"),
            data: updatedEvent,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateRoomBooking = updateRoomBooking;
const approveBooking = (bookingId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const booking = yield RoomBooking_1.RoomBookingModel.findById(bookingId);
        const { approved } = bodyData;
        if (!booking) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.BOOKING_NOT_FOUND"),
            }));
        }
        const updatedBooking = yield RoomBooking_1.RoomBookingModel.findOneAndUpdate({ _id: (_a = booking === null || booking === void 0 ? void 0 : booking._id) === null || _a === void 0 ? void 0 : _a.toString() }, { $set: { approved } }, { new: true });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.BOOKING_UPDATED"),
            data: updatedBooking,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.approveBooking = approveBooking;
const deleteRoomBooking = (bookingId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield RoomBooking_1.RoomBookingModel.findById(bookingId);
        if (!booking) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        booking.isDeleted = true;
        yield booking.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_DELETED"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteRoomBooking = deleteRoomBooking;
//# sourceMappingURL=controller.js.map