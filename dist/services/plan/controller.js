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
exports.createDefaultPlans = exports.deletePlan = exports.updatePlan = exports.addPlan = exports.getAllPlans = void 0;
const config_1 = __importDefault(require("config"));
const httpErrors_1 = require("../../utils/httpErrors");
const Utilities_1 = require("../../utils/Utilities");
const Plan_1 = require("../../db/Plan");
const plans_1 = require("../../constants/plans");
//  common api for plans
const getAllPlans = (req, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const plans = yield Plan_1.PlanModel.aggregate([
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
        const totalRecord = yield Plan_1.PlanModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: plans,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllPlans = getAllPlans;
const addPlan = (bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Plan_1.PlanModel.create(bodyData);
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
exports.addPlan = addPlan;
const updatePlan = (planId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const plan = yield Plan_1.PlanModel.findById(planId);
        if (!plan) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.EVENT_NOT_FOUND"),
            }));
        }
        Object.assign(plan, bodyData);
        const updatedEvent = yield plan.save();
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
exports.updatePlan = updatePlan;
const deletePlan = (planId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield Plan_1.PlanModel.findById(planId);
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
exports.deletePlan = deletePlan;
const createDefaultPlans = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const plan = yield Plan_1.PlanModel.exists({});
        if (!plan) {
            yield Plan_1.PlanModel.create(plans_1.DEFAULT_PLANS);
            console.log("Default plan created successfully.");
        }
    }
    catch (error) {
        console.log(`Error when creating default plans.`);
    }
});
exports.createDefaultPlans = createDefaultPlans;
//# sourceMappingURL=controller.js.map