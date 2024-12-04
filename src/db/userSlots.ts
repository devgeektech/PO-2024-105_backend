import * as mongoose from "mongoose";

const userSlotSchema = new mongoose.Schema({
  duration: { type: String, required: false },
  date: {
    type: Date
  }, 
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'rooms',
  },
  slots: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
      status: {
        type: String,
        enum: ['cancelled', 'available','booked'],
        default: 'available',
      },
      calenderStartDate: { 
        type: Date,
        required: false 
      },
      eventId: {
        type: String,
      },
      users:[
        {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: 'users',
        }     
      ]
    },
  ],
});

export const userSlotsModel = mongoose.model("userSlots", userSlotSchema);