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
exports.deleteTask = exports.updateTask = exports.addTask = exports.getUserProfileById = exports.getAllTasks = void 0;
const config_1 = __importDefault(require("config"));
const httpErrors_1 = require("../../utils/httpErrors");
const User_1 = require("../../db/User");
const Utilities_1 = require("../../utils/Utilities");
const Task_1 = require("../../db/Task");
const mongoose_1 = __importDefault(require("mongoose"));
//  common api for users
const getAllTasks = (auth, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, trainer, search } = req.query;
        let query = {
            isDeleted: false,
        };
        if (search) {
            query["$or"] = [
                { taskName: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { status: new RegExp(search, 'i') },
                { comment: new RegExp(search, 'i') },
            ];
        }
        if (trainer) {
            query['trainer'] = new mongoose_1.default.Types.ObjectId(trainer);
        }
        let queryOngoing = Object.assign(Object.assign({}, query), { status: "inprogress" });
        let queryCompleted = Object.assign(Object.assign({}, query), { status: "completed" });
        const ongoingTasks = yield Task_1.TaskModel.aggregate([
            {
                $match: Object.assign({}, queryOngoing),
            },
            {
                $skip: Number((page - 1) * limit),
            },
            {
                $limit: Number(limit),
            },
        ]);
        const completedTasks = yield Task_1.TaskModel.aggregate([
            {
                $match: Object.assign(Object.assign({}, queryCompleted), { status: "completed" }),
            },
            {
                $skip: Number((page - 1) * limit),
            },
            {
                $limit: Number(limit),
            },
        ]);
        const allTasks = yield Task_1.TaskModel.aggregate([
            {
                $match: Object.assign({}, query),
            },
            {
                $skip: Number((page - 1) * limit),
            },
            {
                $limit: Number(limit),
            },
        ]);
        const totalRecordAll = yield Task_1.TaskModel.countDocuments(query);
        const totalRecordOngoing = yield Task_1.TaskModel.countDocuments(queryOngoing);
        const totalRecordCompleted = yield Task_1.TaskModel.countDocuments(queryCompleted);
        let response = {
            ongoingTasks: { data: ongoingTasks, totalRecord: totalRecordOngoing },
            completedTasks: {
                data: completedTasks,
                totalRecord: totalRecordCompleted,
            },
            allTasks: { data: allTasks, totalRecord: totalRecordAll },
        };
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: response,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllTasks = getAllTasks;
const getUserProfileById = (userId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield User_1.UserModel.findById(userId).select("-password").lean();
        if (!user) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
            }));
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_ADDED"),
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserProfileById = getUserProfileById;
const addTask = (user, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        bodyData.trainer = new mongoose_1.default.Types.ObjectId(bodyData.trainer);
        bodyData.createdBy = new mongoose_1.default.Types.ObjectId(user);
        bodyData.updatedBy = new mongoose_1.default.Types.ObjectId(user);
        const result = yield Task_1.TaskModel.create(bodyData);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.TASK_ADDED"),
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addTask = addTask;
const updateTask = (taskId, bodyData, user, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = yield Task_1.TaskModel.findById(taskId);
        if (!task) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.TASK_NOT_FOUND"),
            }));
        }
        let { taskName, description, comment, deadLine, trainer, status, } = bodyData;
        let payload = {
            taskName,
            description,
            comment,
            deadLine,
            trainer,
        };
        if ((status == "completed")) {
            payload.status = "completed";
            payload.deadLine = new Date();
            payload.completedOn = new Date().toISOString();
        }
        const updatedUser = yield Task_1.TaskModel.findOneAndUpdate({ _id: taskId }, { $set: payload });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.TASK_UPDATED"),
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateTask = updateTask;
const deleteTask = (taskId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = yield Task_1.TaskModel.findById(taskId);
        if (!task) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.TASK_NOT_FOUND"),
            }));
        }
        task.isDeleted = true;
        yield task.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.TASK_DELETED"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTask = deleteTask;
//# sourceMappingURL=controller.js.map