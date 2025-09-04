const Notification = require("../models/Notification");
const EventEmitter = require("events");

// Shared emitter for in-memory fan-out; for multi-instance deployments use Redis pub/sub etc.
const notificationEmitter = new EventEmitter();

// Create helper (internal)
async function createNotification({
  user,
  title,
  message,
  type = "info",
  data,
}) {
  const doc = await Notification.create({ user, title, message, type, data });
  // Emit event for SSE listeners (per user + broadcast channel)
  notificationEmitter.emit("notify", { notification: doc });
  return doc;
}

// List notifications for current user (includes broadcast ones)
async function listNotifications(req, res) {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const filter = {
      $or: [{ user: req.user._id }, { user: null }],
    };
    if (unread === "true") filter.read = false;
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Notification.countDocuments(filter);
    res.json({ data: notifications, total, page: Number(page) });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
}

async function markRead(req, res) {
  try {
    const { id } = req.params;
    const n = await Notification.findOne({
      _id: id,
      $or: [{ user: req.user._id }, { user: null }],
    });
    if (!n) return res.status(404).json({ message: "Notification not found" });
    if (!n.read) {
      n.read = true;
      n.readAt = new Date();
      await n.save();
    }
    res.json({ message: "Marked read", notification: n });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
}

async function markAllRead(req, res) {
  try {
    // Mark all notifications the user can see as read
    await Notification.updateMany(
      {
        $or: [{ user: req.user._id }, { user: null }],
        read: false,
      },
      { $set: { read: true, readAt: new Date() } }
    );
    res.json({ message: "All read" });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
}

// Get total unread count for user
async function getUnreadCount(req, res) {
  try {
    const count = await Notification.countDocuments({
      $or: [{ user: req.user._id }, { user: null }],
      read: false,
    });
    res.json({ unread: count });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
}
async function create(req, res) {
  try {
    const { userId, title, message, type, data } = req.body;
    const doc = await createNotification({
      user: userId || null,
      title,
      message,
      type,
      data,
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
}

// SSE stream
function stream(req, res) {
  // Recommended headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders && res.flushHeaders();

  const userId = req.user._id.toString();

  const onNotify = ({ notification }) => {
    // Send if notification targeted to this user or broadcast
    if (!notification.user || notification.user.toString() === userId) {
      res.write(`event: notification\n`);
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
  };

  notificationEmitter.on("notify", onNotify);

  // Heartbeat every 25s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(":keep-alive\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    notificationEmitter.removeListener("notify", onNotify);
  });
}

module.exports = {
  listNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
  create,
  stream,
  createNotification, // exported for other controllers
};
