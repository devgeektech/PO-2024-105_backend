"use strict";
// type ROLESTYPE = 'admin' | 'employee' | 'fitnessPartner' | 'company'
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARTNER_ACCOUNT_STATUS = exports.WELLNESS_BUSINESS_TYPE = exports.ADVERTING_STATUS = exports.ROOM_TYPES = exports.PLAN_TYPES = exports.EVENT_TYPES = exports.EVENT_STATUS = exports.TASK_STATUS = exports.DEFAULT_ADMIN = exports.GENDERS = exports.ROLES = void 0;
exports.ROLES = ['admin', 'employee', 'fitnessPartner', 'company'];
exports.GENDERS = ['', 'other', 'male', 'female'];
exports.DEFAULT_ADMIN = {
    firstName: "Admin",
    lastName: "",
    email: "admin@admin.com",
    password: "Qwerty@123",
    role: "admin",
    approved: true,
    isSuperUser: true
};
exports.TASK_STATUS = ["inprogress", "completed", "cancelled"];
exports.EVENT_STATUS = ["pending", "accepted", "rejected"];
exports.EVENT_TYPES = ["training", "match", "practice"];
exports.PLAN_TYPES = ["individual", "family", "special"];
exports.ROOM_TYPES = ["ground"];
exports.ADVERTING_STATUS = ["available", "booked"];
exports.WELLNESS_BUSINESS_TYPE = ["", "gym", "studio", "wellness services"];
exports.PARTNER_ACCOUNT_STATUS = ["pending", "accepted", "rejected"];
//# sourceMappingURL=index.js.map