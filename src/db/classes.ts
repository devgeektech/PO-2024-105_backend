import * as mongoose from 'mongoose';
import { CLASS_STATUS, CLASS_TYPE } from '../constants';

const classesSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId
  },
  partnerLocation: {
    type: mongoose.Schema.Types.ObjectId
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  className: {
    type: String,
    required: true
  },
  classStatus: {
    type: Boolean,
    default: true
  },
  description : {
    type: String,
    default: ''
  },
  classType: {
    type: String,
    enum: CLASS_TYPE,
    default: 'thisMonth'
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  },
  days: [{
    type: String
  }],
  maxBooking : { // Class Capacity
    type: Number,
  },
  allowCancel: {
    type: Boolean,
    default: false
  },
  images: [
    {
      type: String
    }
  ],
  video: {
    type: String,
    default: ''
  },
  cancellationUpto: { // Minimum Cancellation notice in hours
    type: Number
  },
  status: {
    type: String,
    enum: CLASS_STATUS,
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
},
  { timestamps: true });

  classesSchema.set('toJSON', {
  virtuals: false, transform: (doc, ret, Options) => {
    delete ret.password
    delete ret.__v
  }
})

export const classModel = mongoose.model('classes', classesSchema);