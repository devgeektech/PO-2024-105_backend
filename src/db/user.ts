import * as mongoose from 'mongoose';
import { GENDERS, ROLES } from '../constants';

const userSchema = new mongoose.Schema({
  // user
  firstName: {
    type: String,
    default: ""
  },
  lastName: {
    type: String,
    default: ""
  },
  role:{
    type: String,
    enum: ROLES,
    default: ''
  } ,
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
    enum: GENDERS
  },
  approved: {
    type: Boolean,
    default: false
  },
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
  otp: {
    type: Number,
    default: 0
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  otpExipredAt: {
    type: Date,
    default: null
  }
},
  { timestamps: true });

userSchema.set('toJSON', {
  virtuals: false, transform: (doc, ret, Options) => {
    delete ret.password
    delete ret.__v
  }
})

export const UserModel = mongoose.model('users', userSchema);