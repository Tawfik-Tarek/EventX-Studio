const mongoose = require("mongoose");

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
    data: { type: Object },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // users who have read this notification
    scheduledFor: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
