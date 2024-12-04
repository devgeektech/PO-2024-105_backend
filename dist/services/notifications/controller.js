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
exports.getAllNotifications = void 0;
const Utilities_1 = require("../../utils/Utilities");
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_1 = require("../../db/Notification");
const getAllNotifications = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            recipient: new mongoose_1.default.Types.ObjectId(userId)
        };
        if (search) {
            query["$or"] = [
                { title: new RegExp(search, 'i') }
            ];
        }
        const notifications = yield Notification_1.NotificationModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "recipient",
                    as: "recipient"
                }
            },
            {
                $unwind: {
                    path: "$recipient",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);
        const totalRecord = yield Notification_1.NotificationModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: notifications,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllNotifications = getAllNotifications;
//# sourceMappingURL=controller.js.map