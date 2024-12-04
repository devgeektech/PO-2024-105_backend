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
exports.updateFriendRequest = exports.sendFriendRequest = exports.getAllMyFriends = exports.getAllFriendRequests = exports.getAllSendedFriendRequests = void 0;
const config_1 = __importDefault(require("config"));
const httpErrors_1 = require("../../utils/httpErrors");
const Utilities_1 = require("../../utils/Utilities");
const FriendRequest_1 = require("../../db/FriendRequest");
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_1 = require("../../db/Notification");
const socket_service_1 = require("../socket/socket.service");
const getAllSendedFriendRequests = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            status: { $in: ['pending', 'rejected'] },
            senderId: new mongoose_1.default.Types.ObjectId(userId)
        };
        const friendsRequest = yield FriendRequest_1.FriendRequestModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "userId",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $match: {
                    'user.isDeleted': false,
                },
            },
        ]);
        const totalRecord = yield FriendRequest_1.FriendRequestModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: friendsRequest,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllSendedFriendRequests = getAllSendedFriendRequests;
//  common api for friends
const getAllFriendRequests = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            status: 'pending',
            userId: new mongoose_1.default.Types.ObjectId(userId)
        };
        if (search) {
            query["$or"] = [
                { title: new RegExp(search, 'i') }
            ];
        }
        const friendsRequest = yield FriendRequest_1.FriendRequestModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "senderId",
                    as: "sender"
                }
            },
            {
                $unwind: {
                    path: "$sender",
                    preserveNullAndEmptyArrays: true
                },
            },
        ]);
        const totalRecord = yield FriendRequest_1.FriendRequestModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: friendsRequest,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllFriendRequests = getAllFriendRequests;
const getAllMyFriends = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search, id } = req.query;
        let query = {
            status: 'accepted',
            $or: [
                {
                    userId: new mongoose_1.default.Types.ObjectId(id ? id : userId)
                },
                {
                    senderId: new mongoose_1.default.Types.ObjectId(id ? id : userId)
                }
            ]
        };
        const friends = yield FriendRequest_1.FriendRequestModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "senderId",
                    as: "sender"
                }
            },
            {
                $unwind: {
                    path: "$sender",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $match: {
                    'sender.isDeleted': false,
                },
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "userId",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $match: {
                    'user.isDeleted': false,
                },
            },
        ]);
        const totalRecord = yield FriendRequest_1.FriendRequestModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: friends,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMyFriends = getAllMyFriends;
const sendFriendRequest = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alreadyRequested = yield FriendRequest_1.FriendRequestModel.exists(bodyData);
        if (alreadyRequested) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.ALREADY_FRIENDS_REQUESTED"),
            }));
        }
        const result = yield FriendRequest_1.FriendRequestModel.create(bodyData);
        let senderRecord = yield FriendRequest_1.FriendRequestModel.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(result._id)
                }
            },
            {
                $lookup: {
                    from: 'users', // The 'users' collection to look up
                    localField: 'senderId',
                    foreignField: '_id',
                    as: 'senderDetails', // The array name where the sender's details will be stored
                }
            },
            {
                $unwind: {
                    path: '$senderDetails', // Unwind senderDetails array
                    preserveNullAndEmptyArrays: true
                }
            },
        ]);
        senderRecord = senderRecord[0];
        const notificationData = {
            recipient: senderRecord.userId, // The member to receive the notification
            sender: senderRecord.senderId, // The creator or initiator of the event
            title: `You have a new friend request from ${senderRecord.senderDetails.firstName} ${senderRecord.senderDetails.lastName}`, // Title of the notification
            description: `You have a new friend request from ${senderRecord.senderDetails.firstName} ${senderRecord.senderDetails.lastName}.`, // Notification description
            type: 'friendnRequest'
        };
        const notification = new Notification_1.NotificationModel(notificationData);
        let notificationRecords = yield notification.save();
        (0, socket_service_1.sendNotification)(senderRecord.userId.toString(), notificationRecords);
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
exports.sendFriendRequest = sendFriendRequest;
const updateFriendRequest = (requestId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = yield FriendRequest_1.FriendRequestModel.findById(requestId);
        if (!request) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        Object.assign(request, bodyData);
        const updatedEvent = yield request.save();
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
exports.updateFriendRequest = updateFriendRequest;
//# sourceMappingURL=controller.js.map