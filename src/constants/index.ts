// type ROLESTYPE = 'admin' | 'employee' | 'fitnessPartner' | 'company'

export const ROLES : string[] = ['admin', 'employee', 'fitnessPartner', 'company'];

export const GENDERS = ['other', 'male', 'female', 'männlich', 'weiblich'];

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