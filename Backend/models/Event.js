const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  totalSeats: { type: Number, required: true, min: 1 },
  availableSeats: { type: Number, required: true, min: 0 },
  seatMap: [
    {
      number: { type: Number, required: true },
      status: {
        type: String,
        enum: ["available", "booked", "blocked"],
        default: "available",
      },
    },
  ],
  status: {
    type: String,
    enum: ["upcoming", "active", "closed"],
    default: "upcoming",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Indexes for faster querying / analytics
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ createdBy: 1 });

eventSchema.pre("save", function (next) {
  const now = new Date();
  if (this.date < now && this.status === "upcoming") {
    this.status = "active";
  }

  if (this.isNew && (!this.seatMap || this.seatMap.length === 0)) {
    this.seatMap = Array.from({ length: this.totalSeats }, (_, i) => ({
      number: i + 1,
      status: "available",
    }));
  } else if (
    !this.isNew &&
    this.seatMap &&
    this.seatMap.length !== this.totalSeats
  ) {
    const currentLength = this.seatMap.length;
    const newLength = this.totalSeats;
    if (newLength > currentLength) {
      for (let i = currentLength; i < newLength; i++) {
        this.seatMap.push({
          number: i + 1,
          status: "available",
        });
      }
    } else if (newLength < currentLength) {
      while (this.seatMap.length > newLength) {
        const lastSeat = this.seatMap[this.seatMap.length - 1];
        if (lastSeat.status === "available") {
          this.seatMap.pop();
        } else {
          break;
        }
      }
    }
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
