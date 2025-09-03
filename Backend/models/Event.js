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
  category: { type: String, trim: true },
  image: { type: String }, // URL or path
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

// Auto-update "status" based on date (lightweight; can be optimized or moved to cron for scale)
eventSchema.pre("save", function (next) {
  const now = new Date();
  if (this.date < now && this.status === "upcoming") {
    this.status = "active"; // simplistic transition; real logic could consider end time
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
