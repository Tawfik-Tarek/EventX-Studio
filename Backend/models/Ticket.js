const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seatNumber: {
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["booked", "used"],
    default: "booked",
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  usedDate: {
    type: Date,
  },
});

ticketSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model("Ticket", ticketSchema);
