const mongoose = require("mongoose");

// Notification schema supports per-user notifications and broadcast (user null + audience filter in future)
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional; null means broadcast to all users
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "event", "ticket", "system"],
      default: "info",
    },
    data: { type: Object }, // arbitrary payload (e.g., {eventId, ticketId})
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    scheduledFor: { type: Date }, // optional future scheduling
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
