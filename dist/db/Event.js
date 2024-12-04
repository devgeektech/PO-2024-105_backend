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
exports.EventModel = void 0;
const mongoose = __importStar(require("mongoose"));
const constants_1 = require("../constants");
const eventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        enum: constants_1.EVENT_TYPES,
        required: true
    },
    eventDuration: {
        type: String,
        required: false
    },
    room: {
        type: mongoose.Types.ObjectId,
        ref: 'rooms',
        required: true
    },
    date: {
        type: Date
    },
    time: {
        type: String
    },
    timeDuration: {
        type: String
    },
    description: {
        type: String
    },
    participantType: {
        type: String,
        enum: ['individual', 'team']
    },
    maxParticipant: {
        type: Number
    },
    price: {
        type: Number
    },
    location: {
        type: String
    },
    teamA: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'users'
            },
            status: {
                type: String,
                enum: constants_1.EVENT_STATUS,
                default: "pending"
            }
        }
    ],
    teamB: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'users'
            },
            status: {
                type: String,
                enum: constants_1.EVENT_STATUS,
                default: "pending"
            }
        }
    ],
    participants: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'users'
            },
            status: {
                type: String,
                enum: constants_1.EVENT_STATUS,
                default: "pending"
            }
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId
    },
    approved: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    eventIndex: [
        {
            type: Number,
            required: false
        }
    ],
    slotId: {
        type: mongoose.Schema.Types.ObjectId
    },
    sponserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    advertisingStatus: {
        type: String,
        default: "available",
        enum: constants_1.ADVERTING_STATUS
    }
}, { timestamps: true });
eventSchema.set('toJSON', {
    virtuals: false, transform: (doc, ret, Options) => {
        delete ret.__v;
    }
});
exports.EventModel = mongoose.model('events', eventSchema);
//# sourceMappingURL=Event.js.map