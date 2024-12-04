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
exports.deleteRoom = exports.updateRoom = exports.addRoom = exports.getRooms = exports.getAllRooms = void 0;
const config_1 = __importDefault(require("config"));
const httpErrors_1 = require("../../utils/httpErrors");
const Utilities_1 = require("../../utils/Utilities");
const Room_1 = require("../../db/Room");
//  common api for room
const getAllRooms = (req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            isDeleted: false
        };
        if (search) {
            query["$or"] = [
                { roomName: new RegExp(search, 'i') }
            ];
        }
        const rooms = yield Room_1.RoomModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $skip: Number((page - 1) * limit)
            },
            {
                $limit: Number(limit),
            }
        ]);
        const totalRecord = yield Room_1.RoomModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: rooms,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllRooms = getAllRooms;
//  common api for get all room
const getRooms = (req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        let query = {
            isDeleted: false
        };
        if (search) {
            query["$or"] = [
                { roomName: new RegExp(search, 'i') }
            ];
        }
        const rooms = yield Room_1.RoomModel.aggregate([
            {
                $match: Object.assign({}, query)
            }
        ]);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: rooms
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getRooms = getRooms;
const addRoom = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = Object.assign(Object.assign({}, bodyData), { area: {
                width: bodyData.width,
                height: bodyData.height
            } });
        const existingRoom = yield Room_1.RoomModel.findOne({ roomName: bodyData.roomName });
        if (existingRoom) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.ROOM_ALREADY_EXISTS"),
            }));
        }
        const result = yield Room_1.RoomModel.create(payload);
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
exports.addRoom = addRoom;
const updateRoom = (roomId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield Room_1.RoomModel.findById(roomId);
        if (!room) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        let payload = Object.assign(Object.assign({}, bodyData), { area: {
                width: bodyData.width,
                height: bodyData.height
            } });
        Object.assign(room, payload);
        const updatedEvent = yield room.save();
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
exports.updateRoom = updateRoom;
const deleteRoom = (roomId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield Room_1.RoomModel.findById(roomId);
        if (!room) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        room.isDeleted = true;
        yield room.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_DELETED"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteRoom = deleteRoom;
//# sourceMappingURL=controller.js.map