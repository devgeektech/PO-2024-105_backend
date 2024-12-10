import * as mongoose from 'mongoose';
import { GENDERS, PARTNER_ACCOUNT_STATUS} from '../constants';

const partnerSchema = new mongoose.Schema({
  // partner
  name: {
    type: String,
    default: ""
  },
  businessName: {
    type: String,
    default: ""
  }, 
  email: {
    type: String,
    required: true,
    index: true
  },
  password: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  gender: {
    type: String,
    enum: GENDERS,
    default: "",
  },
  status: {
    type: String,
    enum: PARTNER_ACCOUNT_STATUS,
    default: 'pending'
  },
  businessWebsite: {
    type: String,
    default: '',
  },
  businessListedDate: {
    type: Date,
    default: null
  },
  checkinRate: {
    type: String,
    default: '',
  },
  isGoogleVerified: {
    type: Boolean,
    default: false
  },
  wellnessTypeId: {
    type: mongoose.Schema.Types.ObjectId
  },
  locations: [
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ],
  token:{
    type: String,
    default: '',
  },
  createdBy: {
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
  },
  onBoarded:{
    type: Boolean,
    default: false
  },
},
  { timestamps: true });

  partnerSchema.set('toJSON', {
  virtuals: false, transform: (doc, ret, Options) => {
    delete ret.password
    delete ret.__v
  }
})

export const PartnerModel = mongoose.model('partners', partnerSchema);