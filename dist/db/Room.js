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
exports.RoomModel = void 0;
const mongoose = __importStar(require("mongoose"));
const roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    roomType: {
        type: String
    },
    area: {
        width: Number,
        height: Number
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
roomSchema.set('toJSON', {
    virtuals: false, transform: (doc, ret, Options) => {
        delete ret.__v;
    }
});
exports.RoomModel = mongoose.model('rooms', roomSchema);
//# sourceMappingURL=Room.js.map