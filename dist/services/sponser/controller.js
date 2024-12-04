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
exports.updateEvent = exports.getEvents = void 0;
const config_1 = __importDefault(require("config"));
const httpErrors_1 = require("../../utils/httpErrors");
const Utilities_1 = require("../../utils/Utilities");
const mongoose_1 = __importDefault(require("mongoose"));
const Event_1 = require("../../db/Event");
const getEvents = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {
            date: { $gte: new Date() },
            isDeleted: false,
            $or: [
                { sponserId: new mongoose_1.default.Types.ObjectId(userId) },
                { sponserId: null }
            ]
        };
        const events = yield Event_1.EventModel.aggregate([
            {
                $match: Object.assign({}, query)
            }
        ]);
        delete query.$or;
        query.date = { $lt: new Date() };
        query.sponserId = new mongoose_1.default.Types.ObjectId(userId);
        const pastEvents = yield Event_1.EventModel.aggregate([
            {
                $match: Object.assign({}, query)
            }
        ]);
        query.date = { $gte: new Date() };
        const activeEvents = yield Event_1.EventModel.aggregate([
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
            { $unwind: "$roomDetail" }
        ]);
        let Obj = {
            all: events,
            active: activeEvents,
            past: pastEvents,
        };
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: Obj
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getEvents = getEvents;
const updateEvent = (userId, eventId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event_1.EventModel.findById(eventId);
        if (!event) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        Object.assign(event, Object.assign(Object.assign({}, event), { sponserId: new mongoose_1.default.Types.ObjectId(userId), advertisingStatus: 'booked' }));
        const updatedEvent = yield event.save();
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
exports.updateEvent = updateEvent;
//# sourceMappingURL=controller.js.map