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
exports.deleteTeam = exports.getAllUserTeams = exports.getTeamById = exports.updateTeam = exports.createTeam = exports.getAllMyTeamMembers = exports.getAllMyTeams = void 0;
const config_1 = __importDefault(require("config"));
const httpErrors_1 = require("../../utils/httpErrors");
const Utilities_1 = require("../../utils/Utilities");
const mongoose_1 = __importDefault(require("mongoose"));
const team_1 = require("../../db/team");
const Notification_1 = require("../../db/Notification");
const lodash_1 = __importDefault(require("lodash"));
const socket_service_1 = require("../socket/socket.service");
const getAllMyTeams = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            createdBy: new mongoose_1.default.Types.ObjectId(userId)
        };
        if (search) {
            query["$or"] = [
                { teamName: new RegExp(search, 'i') }
            ];
        }
        const teams = yield team_1.TeamModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "createdBy",
                    as: "creator"
                }
            },
            {
                $unwind: {
                    path: "$creator",
                    preserveNullAndEmptyArrays: true
                },
            },
        ]);
        const totalRecord = yield team_1.TeamModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: teams,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMyTeams = getAllMyTeams;
//  common api for friends
const getAllMyTeamMembers = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            createdBy: new mongoose_1.default.Types.ObjectId(userId)
        };
        if (search) {
            query["$or"] = [
                { teamName: new RegExp(search, 'i') }
            ];
        }
        const teams = yield team_1.TeamModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "members",
                    as: "members"
                }
            },
        ]);
        let members = [];
        teams.forEach((team) => {
            members = [...members, ...team.members];
        });
        const totalRecord = members.length;
        const uniqueMembers = lodash_1.default.uniqBy(members, (member) => member._id.toString());
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: uniqueMembers,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMyTeamMembers = getAllMyTeamMembers;
const createTeam = (userId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alreadyTeam = yield team_1.TeamModel.exists({ teamName: new RegExp(bodyData === null || bodyData === void 0 ? void 0 : bodyData.teamName, 'i') });
        if (alreadyTeam) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.ALREADY_TEAM_CREATED"),
            }));
        }
        bodyData.createdBy = userId;
        const result = yield team_1.TeamModel.create(bodyData);
        result.members.forEach((userId) => __awaiter(void 0, void 0, void 0, function* () {
            const notificationData = {
                recipient: userId, // The member to receive the notification
                sender: result.createdBy, // The creator or initiator of the event
                title: `New team created: ${result.teamName}`, // Title of the notification
                description: `You have been added to the team: ${result.teamName}.`, // Notification description
            };
            const notification = new Notification_1.NotificationModel(notificationData);
            let notificationRecords = yield notification.save();
            (0, socket_service_1.sendNotification)(userId.toString(), notificationRecords);
        }));
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.TEAM_CREATED_SUCCESSFULLY"),
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createTeam = createTeam;
const updateTeam = (teamId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield team_1.TeamModel.findById(teamId);
        if (!team) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.TEAM_NOT_FOUND"),
            }));
        }
        Object.assign(team, bodyData);
        const updatedEvent = yield team.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.TEAM_UPDATED_SUCCESSFULLY"),
            data: updatedEvent,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateTeam = updateTeam;
const getTeamById = (teamId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield team_1.TeamModel.findById(teamId).populate([
            {
                path: "members",
                select: "-password"
            }
        ]);
        if (!team) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.TEAM_NOT_FOUND"),
            }));
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "",
            data: team,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getTeamById = getTeamById;
const getAllUserTeams = (userId, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            members: { $in: [new mongoose_1.default.Types.ObjectId(userId)] }
        };
        if (search) {
            query["$or"] = [
                { teamName: new RegExp(search, 'i') }
            ];
        }
        const teams = yield team_1.TeamModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "createdBy",
                    as: "creator"
                }
            },
            {
                $unwind: {
                    path: "$creator",
                    preserveNullAndEmptyArrays: true
                },
            },
        ]);
        const totalRecord = yield team_1.TeamModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: teams,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUserTeams = getAllUserTeams;
const deleteTeam = (teamId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield team_1.TeamModel.findById(teamId);
        if (!team) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.TEAM_NOT_FOUND"),
            }));
        }
        yield team_1.TeamModel.deleteOne({ _id: teamId });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.TEAM_DELETED_SUCCESSFULLY"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTeam = deleteTeam;
//# sourceMappingURL=controller.js.map