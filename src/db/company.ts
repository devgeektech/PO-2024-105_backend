import * as mongoose from 'mongoose';
import { COMPANY_STATUS } from '../constants';

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    required: true
  },
  numberOfEmployees: {
    type: Number,
    required: false
  },
  tax: {
    type: String,
    required: false
  },
  description: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: COMPANY_STATUS,
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

  companySchema.set('toJSON', {
  virtuals: false, transform: (doc, ret, Options) => {
    delete ret.password
    delete ret.__v
  }
})

export const CompanyModel = mongoose.model('companies', companySchema);