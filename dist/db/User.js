"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose = __importStar(require("mongoose"));
const constants_1 = require("../constants");
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: constants_1.ROLES,
        default: 'member'
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: ""
    },
    phone: {
        type: String
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
        enum: constants_1.GENDERS
    },
    approved: {
        type: Boolean,
        default: false
    },
    // for company
    companyName: {
        type: String,
        default: '',
    },
    websiteUrl: {
        type: String,
        default: '',
    },
    companyLogo: {
        type: String,
        default: '',
    },
    companyEmail: {
        type: String,
        default: '',
    },
    companyPhone: {
        type: String,
        default: '',
    },
    isCompanyVerified: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });
userSchema.set('toJSON', {
    virtuals: false, transform: (doc, ret, Options) => {
        delete ret.password;
        delete ret.__v;
    }
});
exports.UserModel = mongoose.model('users', userSchema);
//# sourceMappingURL=User.js.map