// type ROLESTYPE = 'admin' | 'employee' | 'fitnessPartner' | 'company'

export const ROLES : string[] = ['admin', 'employee', 'fitnessPartner', 'company'];

export const GENDERS = ['','other', 'male', 'female'];

export const DEFAULT_ADMIN = {
    firstName: "Admin",
    lastName: "",
    email: "admin@admin.com",
    password: "Qwerty@123",  
    role: "admin",
    approved: true,
    isSuperUser: true
};

export const TASK_STATUS = ["inprogress", "completed", "cancelled"]

export const EVENT_STATUS=[ "pending", "accepted", "rejected"];

export const EVENT_TYPES=[ "training", "match", "practice"];

export const PLAN_TYPES=[ "individual", "family", "special"];

export const ROOM_TYPES=[ "ground"];

export const ADVERTING_STATUS = ["available", "booked"];

export const WELLNESS_BUSINESS_TYPE = ["", "gym", "studio", "wellness services"];

export const PARTNER_ACCOUNT_STATUS = ["pending", "accepted", "rejected"];

export const COMPANY_STATUS = ["active", "rejected"]

export const CLASS_STATUS = ["active", "inactive"]

export const CLASS_TYPE = ["thisWeek","thisMonth","everyMonth","thisQuater","thisYear"]