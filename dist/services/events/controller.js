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
exports.updateUserEventStatus = exports.approveEvent = exports.deleteEvent = exports.updateEvent = exports.addEvent = exports.getAllEventInvitationsWithSlots = exports.getAllMyEventsWithSlots = exports.getAllMyEvents = exports.getAllMyEventInvitation = exports.getAllEvents = void 0;
const config_1 = __importDefault(require("config"));
const ejs_1 = __importDefault(require("ejs"));
const httpErrors_1 = require("../../utils/httpErrors");
const Utilities_1 = require("../../utils/Utilities");
const Event_1 = require("../../db/Event");
const mongoose_1 = __importDefault(require("mongoose"));
const lodash_1 = __importDefault(require("lodash"));
const User_1 = require("../../db/User");
const MailerUtilities_1 = require("../../utils/MailerUtilities");
const moment_1 = __importDefault(require("moment"));
const socket_service_1 = require("../socket/socket.service");
const Notification_1 = require("../../db/Notification");
const userSlots_1 = require("../../db/userSlots");
function isDateTimeCurrentOrPrevious(payload) {
    const { date, time } = payload;
    // Get the current date and time
    const currentDate = new Date();
    // Format current date and time for comparison
    const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = currentDate.toTimeString().slice(0, 5); // HH:MM
    // Convert payload date and time to a Date object for easier comparison
    const payloadDateTime = new Date(`${date}T${time}:00Z`);
    const currentDateTime = new Date(); // Current date and time
    // Logging for debugging purposes
    console.log(`Payload DateTime: ${payloadDateTime.toISOString()}`, `Current DateTime: ${currentDateTime.toISOString()}`);
    // Check if the payload datetime is <= current datetime
    return payloadDateTime <= currentDateTime;
}
//  common api for events
const getAllEvents = (req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            isDeleted: false
        };
        if (search) {
            query["$or"] = [
                { description: new RegExp(search, 'i') }
            ];
        }
        const events = yield Event_1.EventModel.find(Object.assign({}, query)).populate([
            {
                path: "room"
            },
            {
                path: "participants.user",
                select: "firstName lastName avatar email"
            },
            {
                path: "teamA.user",
                select: "firstName lastName avatar email"
            },
            {
                path: "teamB.user",
                select: "firstName lastName avatar email"
            },
            {
                path: "createdBy",
                select: "firstName lastName avatar email"
            }
        ]).skip(Number((page - 1) * limit)).limit(Number(limit)).sort({ createdAt: -1 });
        const totalRecord = yield Event_1.EventModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: events,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllEvents = getAllEvents;
//  common api for events
const getAllMyEventInvitation = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        let query = {
            // approved: true,
            isDeleted: false,
            $or: [
                {
                    participants: { $elemMatch: { user: userId } }
                },
                {
                    teamA: { $elemMatch: { user: userId } }
                },
                {
                    teamB: { $elemMatch: { user: userId } }
                },
                {
                    createdBy: userId
                }
            ]
        };
        if (search) {
            query["$or"] = [
                { description: new RegExp(search, 'i') }
            ];
        }
        const events = yield Event_1.EventModel.find(Object.assign({}, query)).populate([
            {
                path: "room"
            },
            {
                path: "participants.user",
                select: "firstName lastName avatar email"
            },
            {
                path: "teamA.user",
                select: "firstName lastName avatar email"
            },
            {
                path: "teamB.user",
                select: "firstName lastName avatar email"
            },
            {
                path: "createdBy",
                select: "firstName lastName avatar email"
            }
        ]);
        const totalRecord = yield Event_1.EventModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: events,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMyEventInvitation = getAllMyEventInvitation;
//  common api for events
const getAllMyEvents = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        let query = {
            isDeleted: false,
            $or: [
                {
                    participants: { $elemMatch: { user: userId } }
                },
                {
                    teamA: { $elemMatch: { user: userId } }
                },
                {
                    teamB: { $elemMatch: { user: userId } }
                },
                {
                    createdBy: userId
                }
            ]
        };
        if (search) {
            query["$or"] = [
                { description: new RegExp(search, 'i') }
            ];
        }
        const events = yield Event_1.EventModel.find(Object.assign({}, query)).populate([
            {
                path: "room"
            },
            {
                path: "participants.user",
                select: "firstName lastName avatar email"
            },
            {
                path: "teamA.user",
                select: "firstName lastName avatar email"
            },
            {
                path: "teamB.user",
                select: "firstName lastName avatar email"
            },
            {
                path: "createdBy",
                select: "firstName lastName avatar email"
            }
        ]);
        const totalRecord = yield Event_1.EventModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: events,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMyEvents = getAllMyEvents;
//  common api for events
const getAllMyEventsWithSlots = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = [];
        let query = {
            "slots.users": new mongoose_1.default.Types.ObjectId(userId)
        };
        const events = yield userSlots_1.userSlotsModel.find(Object.assign({}, query)).lean();
        if (events === null || events === void 0 ? void 0 : events.length) {
            const filteredData = events.map((item) => { var _a; return ((_a = item === null || item === void 0 ? void 0 : item.slots) === null || _a === void 0 ? void 0 : _a.filter((slot) => slot.eventId)) || []; });
            data.push(...filteredData);
        }
        const groupedArray = data.map(subArray => Object.values(subArray.reduce((groups, item) => {
            if (!groups[item.eventId]) {
                groups[item.eventId] = item; // Add the first element of the group
            }
            return groups;
        }, {})));
        let finalData = [];
        let flattenedArray = groupedArray.flat();
        for (let item of flattenedArray) {
            let key = item;
            const event = yield Event_1.EventModel.findOne({ _id: key.eventId, approved: true, isDeleted: false }).populate([
                {
                    path: "room"
                },
                {
                    path: "participants.user",
                    select: "firstName lastName avatar email"
                },
                {
                    path: "teamA.user",
                    select: "firstName lastName avatar email"
                },
                {
                    path: "teamB.user",
                    select: "firstName lastName avatar email"
                },
                {
                    path: "createdBy",
                    select: "firstName lastName avatar email"
                }
            ]).lean();
            finalData.push(Object.assign(Object.assign({}, key), event));
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: finalData
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMyEventsWithSlots = getAllMyEventsWithSlots;
const getAllEventInvitationsWithSlots = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = [];
        let aggregateQuery = {
            "slots.users": new mongoose_1.default.Types.ObjectId(userId)
        };
        const events = yield userSlots_1.userSlotsModel.find(Object.assign({}, aggregateQuery)).lean();
        const { search } = req.query;
        let query = {
            approved: true,
            isDeleted: false,
        };
        if (search) {
            query["$or"] = [
                { description: new RegExp(search, 'i') }
            ];
        }
        if (events === null || events === void 0 ? void 0 : events.length) {
            const filteredData = events.map((item) => { var _a; return ((_a = item === null || item === void 0 ? void 0 : item.slots) === null || _a === void 0 ? void 0 : _a.filter((slot) => slot.eventId)) || []; });
            data.push(...filteredData);
        }
        const groupedArray = data.map(subArray => Object.values(subArray.reduce((groups, item) => {
            if (!groups[item.eventId]) {
                groups[item.eventId] = item; // Add the first element of the group
            }
            return groups;
        }, {})));
        let finalData = [];
        let flattenedArray = groupedArray.flat();
        for (let item of flattenedArray) {
            let key = item;
            query._id = key.eventId;
            const eventsData = yield Event_1.EventModel.findOne(Object.assign({}, query))
                .populate([
                {
                    path: "room"
                },
                {
                    path: "participants.user",
                    select: "firstName lastName avatar email"
                },
                {
                    path: "teamA.user",
                    select: "firstName lastName avatar email"
                },
                {
                    path: "teamB.user",
                    select: "firstName lastName avatar email"
                },
                {
                    path: "createdBy",
                    select: "firstName lastName avatar email"
                }
            ])
                .lean();
            finalData.push(Object.assign(Object.assign({}, key), eventsData));
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: finalData
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllEventInvitationsWithSlots = getAllEventInvitationsWithSlots;
const addEvent = (createdBy, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (isDateTimeCurrentOrPrevious(bodyData)) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_CURRENT_TIME"),
            }));
        }
        let payload = bodyData;
        if (!(payload === null || payload === void 0 ? void 0 : payload.createdBy)) {
            payload.createdBy = createdBy;
        }
        const { room, date, time } = payload;
        const already = yield Event_1.EventModel.exists({
            room, date, time,
            createdBy
        });
        // if(already){
        //   throw new HTTP400Error(
        //     Utilities.sendResponsData({
        //       code: 400,
        //       message: config.get("ERRORS.COMMON_ERRORS.EVENT_ALREADY_EXISTS"),
        //     })
        //   );
        // }
        const result = yield Event_1.EventModel.create(bodyData);
        let senderRecord = yield Event_1.EventModel.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(result._id)
                }
            },
            {
                $lookup: {
                    from: 'users', // The 'users' collection to look up
                    localField: 'createdBy',
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
            {
                $project: {
                    participants: 1,
                    createdBy: 1,
                    approved: 1,
                    isDeleted: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    eventType: 1,
                    senderDetails: {
                        firstName: '$senderDetails.firstName',
                        lastName: '$senderDetails.lastName',
                        role: '$senderDetails.role'
                    } // Project only `firstName` and `lastName` from senderDetails
                }
            }
        ]);
        senderRecord = senderRecord[0];
        if (result.participantType == 'individual') {
            result.participants.forEach((data) => __awaiter(void 0, void 0, void 0, function* () {
                const notificationData = {
                    recipient: data.user, // The member to receive the notification
                    sender: result.createdBy, // The creator or initiator of the event
                    title: `You have added to the Event ${senderRecord.eventType} by ${senderRecord.senderDetails.firstName} ${senderRecord.senderDetails.lastName}.`, // Title of the notification
                    description: `You have added to the Event ${senderRecord.eventType} by ${senderRecord.senderDetails.firstName} ${senderRecord.senderDetails.lastName}.`, // Notification description
                };
                const notification = new Notification_1.NotificationModel(notificationData);
                let notificationRecords = yield notification.save();
                (0, socket_service_1.sendNotification)(data.user.toString(), notificationRecords);
            }));
        }
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
exports.addEvent = addEvent;
const updateEvent = (eventId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event_1.EventModel.findById(eventId);
        if (!event) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        Object.assign(event, bodyData);
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
const deleteEvent = (eventId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield Event_1.EventModel.findById(eventId);
        if (!event) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        const slotResponse = yield userSlots_1.userSlotsModel.findOne({ _id: new mongoose_1.default.Types.ObjectId(event.slotId) }).lean();
        let availableSlots = slotResponse === null || slotResponse === void 0 ? void 0 : slotResponse.slots;
        let eventIndex = event.eventIndex;
        if (eventIndex && availableSlots && eventIndex.length && availableSlots.length) {
            eventIndex.forEach((index) => {
                availableSlots[index].status = "available";
                availableSlots[index].users = [];
                delete availableSlots[index].eventId;
                delete availableSlots[index].calenderStartDate;
            });
        }
        const update = yield userSlots_1.userSlotsModel.updateOne({ _id: event.slotId }, {
            $set: { slots: availableSlots },
        });
        console.log(update);
        event.isDeleted = true;
        yield event.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_DELETED"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteEvent = deleteEvent;
const approveEvent = (eventId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const event = yield Event_1.EventModel.findById(eventId).populate([
            {
                path: "createdBy",
                select: "firstName lastName avatar email"
            },
            {
                path: "room",
            }
        ]);
        const { approved } = bodyData;
        if (!event) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        const updatedEvent = yield Event_1.EventModel.findOneAndUpdate({ _id: (_a = event === null || event === void 0 ? void 0 : event._id) === null || _a === void 0 ? void 0 : _a.toString() }, { $set: { approved } }, { new: true });
        if (approved) {
            let members = [(_c = (_b = event.createdBy) === null || _b === void 0 ? void 0 : _b._id) === null || _c === void 0 ? void 0 : _c.toString()];
            if (((_d = event === null || event === void 0 ? void 0 : event.teamA) === null || _d === void 0 ? void 0 : _d.length) && event.participantType == 'team') {
                members.concat((_e = event === null || event === void 0 ? void 0 : event.teamA) === null || _e === void 0 ? void 0 : _e.map((ta) => { var _a; return (_a = ta === null || ta === void 0 ? void 0 : ta.user) === null || _a === void 0 ? void 0 : _a.toString(); }));
            }
            if (((_f = event === null || event === void 0 ? void 0 : event.teamB) === null || _f === void 0 ? void 0 : _f.length) && event.participantType == 'team') {
                members.concat((_g = event === null || event === void 0 ? void 0 : event.teamB) === null || _g === void 0 ? void 0 : _g.map((ta) => { var _a; return (_a = ta === null || ta === void 0 ? void 0 : ta.user) === null || _a === void 0 ? void 0 : _a.toString(); }));
            }
            if (((_h = event === null || event === void 0 ? void 0 : event.participants) === null || _h === void 0 ? void 0 : _h.length) && event.participantType == 'team') {
                members.concat((_j = event === null || event === void 0 ? void 0 : event.participants) === null || _j === void 0 ? void 0 : _j.map((ta) => { var _a; return (_a = ta === null || ta === void 0 ? void 0 : ta.user) === null || _a === void 0 ? void 0 : _a.toString(); }));
            }
            members = lodash_1.default.uniq(members);
            for (const member of members) {
                let user = yield User_1.UserModel.findById(member);
                let link = "";
                let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/eventInvitation.ejs", {
                    name: `${(user === null || user === void 0 ? void 0 : user.firstName) || ""} ${(user === null || user === void 0 ? void 0 : user.lastName) || ""}`, eventLink: link,
                    date: (0, moment_1.default)(event.date).format("DD MMM YYYY"), time: event === null || event === void 0 ? void 0 : event.time, location: event === null || event === void 0 ? void 0 : event.location, roomName: (_k = event === null || event === void 0 ? void 0 : event.room) === null || _k === void 0 ? void 0 : _k.roomName, trainer: (_l = event === null || event === void 0 ? void 0 : event.createdBy) === null || _l === void 0 ? void 0 : _l.firstName
                }, { async: true });
                let mailResponse = yield MailerUtilities_1.MailerUtilities.sendSendgridMail({
                    recipient_email: [user === null || user === void 0 ? void 0 : user.email],
                    subject: "Einladung zur Teilnahme an unserer bevorstehenden Veranstaltung",
                    text: messageHtml,
                });
            }
        }
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
exports.approveEvent = approveEvent;
const updateUserEventStatus = (eventId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, userId } = bodyData;
        let event = yield Event_1.EventModel.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(eventId)
                }
            },
            {
                $lookup: {
                    from: 'users', // The 'users' collection to look up
                    localField: 'createdBy',
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
            {
                $lookup: {
                    from: 'users', // The 'users' collection for participants
                    localField: 'participants.user', // Reference the `user` field inside participants
                    foreignField: '_id',
                    as: 'participants' // The name of the field to store populated participant details
                }
            },
        ]);
        if (event.length < 1) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        const participantDetails = event[0].participants.filter((data) => (data['_id'] == userId));
        // First, try to update the participant in the `participants` array.
        let updatedEvent = yield Event_1.EventModel.findOneAndUpdate({ _id: eventId, "participants.user": userId }, { $set: { "participants.$.status": status } }, { new: true });
        // If no match was found in `participants`, try `teamA`.
        if (!updatedEvent) {
            updatedEvent = yield Event_1.EventModel.findOneAndUpdate({ _id: eventId, "teamA.user": userId }, { $set: { "teamA.$.status": status } }, { new: true });
        }
        // If still no match, try `teamB`.
        if (!updatedEvent) {
            updatedEvent = yield Event_1.EventModel.findOneAndUpdate({ _id: eventId, "teamB.user": userId }, { $set: { "teamB.$.status": status } }, { new: true });
        }
        const notificationData = {
            recipient: updatedEvent.createdBy, // The member to receive the notification
            sender: userId, // The creator or initiator of the event
            title: `${participantDetails[0]['firstName']} ${participantDetails[0]['lastName']} ${status}  the ${updatedEvent['eventType']} event  Request that you added.`, // Title of the notification
            description: `${participantDetails[0]['firstName']} ${participantDetails[0]['lastName']} accepted  the event ${updatedEvent['eventType']} Request that you added.`, // Notification description
        };
        const notification = new Notification_1.NotificationModel(notificationData);
        let notificationRecords = yield notification.save();
        (0, socket_service_1.sendNotification)(updatedEvent.createdBy.toString(), notificationRecords);
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
exports.updateUserEventStatus = updateUserEventStatus;
//# sourceMappingURL=controller.js.map