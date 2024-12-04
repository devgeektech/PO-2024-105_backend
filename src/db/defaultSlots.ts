import * as mongoose from "mongoose";

const defaultSlotSchema = new mongoose.Schema({
  slots: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
      status: {
        type: String,
        enum: ['cancelled', 'available'],
        default: 'available',
      },
    },
  ],
});

export const defaultSlotsModel = mongoose.model("defaultSlots", defaultSlotSchema);