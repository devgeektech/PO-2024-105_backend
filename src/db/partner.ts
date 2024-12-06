import * as mongoose from 'mongoose';
import { GENDERS} from '../constants';

const partnerSchema = new mongoose.Schema({
  // partner
  name: {
    type: String,
    default: ""
  },
  bussinessName: {
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
    required: true,
  },
  image: {
    type: String,
    default: ""
  },
  phone: {
    type: String
  },
  gender: {
    type: String,
    enum: GENDERS
  },
  approved: {
    type: Boolean,
    default: false
  },
  bussinessWebsite: {
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
  }
},
  { timestamps: true });

  partnerSchema.set('toJSON', {
  virtuals: false, transform: (doc, ret, Options) => {
    delete ret.password
    delete ret.__v
  }
})

export const PartnerModel = mongoose.model('partners', partnerSchema);