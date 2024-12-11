import * as mongoose from 'mongoose';

const partnerLocationSchema = new mongoose.Schema({
  partnerId: {
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
  zipcode: {
    type: String,
  },
  location: {
    type: {
      type: String, 
      enum: ["Point"]
    },
    coordinates: {
      type: [Number], 

    },
  },
  weekDays: [
    {
      type: String,
    }
  ],
  phone: {
    type: String
  },
  images: [{
    type: String,
    default: ""
  }],
  services: [
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

export const PartnerLocationModel = mongoose.model('partnerloaction', partnerLocationSchema);