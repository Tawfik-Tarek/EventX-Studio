const Notification = require("../models/Notification");
const EventEmitter = require("events");

const notificationEmitter = new EventEmitter();

async function createNotification({
  user,
  title,
  message,
  type = "info",
  data,
}) {
  const doc = await Notification.create({ user, title, message, type, data });
  console.log(
    `Notification created: ${title} for user: ${user || "broadcast"}`
  );
  notificationEmitter.emit("notify", { notification: doc });
  console.log("Notification event emitted");
  return doc;
}

async function listNotifications(req, res) {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const filter = {
      $or: [{ user: req.user._id }, { user: null }],
    };
    if (unread === "true") {
      filter.readBy = { $ne: req.user._id };
    }
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Notification.countDocuments(filter);
    const notificationsWithRead = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.readBy.includes(req.user._id),
    }));
    res.json({ data: notificationsWithRead, total, page: Number(page) });
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
    if (!n.readBy.includes(req.user._id)) {
      n.readBy.push(req.user._id);
      await n.save();
    }
    res.json({
      message: "Marked read",
      notification: { ...n.toObject(), isRead: true },
    });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
}

async function markAllRead(req, res) {
  try {
    await Notification.updateMany(
      {
        $or: [{ user: req.user._id }, { user: null }],
        readBy: { $ne: req.user._id },
      },
      { $push: { readBy: req.user._id } }
    );
    res.json({ message: "All read" });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
}

async function getUnreadCount(req, res) {
  try {
    const count = await Notification.countDocuments({
      $or: [{ user: req.user._id }, { user: null }],
      readBy: { $ne: req.user._id },
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

function stream(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders && res.flushHeaders();

  const userId = req.user._id.toString();

  const onNotify = ({ notification }) => {
    if (!notification.user || notification.user.toString() === userId) {
      console.log(
        `Sending notification to user ${userId}: ${notification.title}`
      );
      const notificationWithRead = {
        ...notification.toObject(),
        isRead: false, // New notifications are always unread
      };
      res.write(`event: notification\n`);
      res.write(`data: ${JSON.stringify(notificationWithRead)}\n\n`);
    }
  };

  notificationEmitter.on("notify", onNotify);

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
