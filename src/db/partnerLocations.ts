import * as mongoose from 'mongoose';
import { GENDERS} from '../constants';

const partnerLocationSchema = new mongoose.Schema({
  // partner
  partnerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'partners'
  },
  address: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  }, 
  state: {
    type: String,
    default: ""
  },
  phone: {
    type: String
  },
  images: [{
    type: String,
    default: ""
  }],
  servivces: [
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ],
  date: {
    type: Date,
    default: null
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  },
  googleBussinessPageLink: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
},
  { timestamps: true });

  partnerLocationSchema.set('toJSON', {
  virtuals: false, transform: (doc, ret, Options) => {
    delete ret.password
    delete ret.__v
  }
})

export const PartnerModel = mongoose.model('partners', partnerLocationSchema);