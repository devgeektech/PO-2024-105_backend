import * as mongoose from 'mongoose';

// SubService Schema
const subServicesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'services',
      required: true,
    },
  },
  { timestamps: true }
);

subServicesSchema.set('toJSON', {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.password;
    delete ret.__v;
  },
});

export const subServicesModel = mongoose.model('subServices', subServicesSchema);