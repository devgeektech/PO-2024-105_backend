import * as mongoose from 'mongoose';

const servicesSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
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

  servicesSchema.set('toJSON', {
  virtuals: false, transform: (doc, ret, Options) => {
    delete ret.password
    delete ret.__v
  }
})

export const servicesModel = mongoose.model('services', servicesSchema);