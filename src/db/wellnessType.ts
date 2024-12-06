import * as mongoose from 'mongoose';
import {  WELLNESS_BUSINESS_TYPE } from '../constants';

const wellnessTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    // enum: WELLNESS_BUSINESS_TYPE,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
},
  { timestamps: true });

  wellnessTypeSchema.set('toJSON', {
  virtuals: false, transform: (doc, ret, Options) => {
    delete ret.password
    delete ret.__v
  }
})

export const wellnessTypeModel = mongoose.model('wellnessType', wellnessTypeSchema);