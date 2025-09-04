const express = require("express");
const { auth, adminAuth } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  listNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
  create,
  stream,
} = require("../controllers/notificationController");

const router = express.Router();

// Authenticated user routes
router.get("/", auth, listNotifications);
router.get("/unread", auth, getUnreadCount);
router.put("/mark-all/read", auth, markAllRead);
router.put("/:id/read", auth, markRead);

router.get("/stream", async (req, res, next) => {
  if (req.header("Authorization"))
    return auth(req, res, () => stream(req, res));
  const { token } = req.query;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    stream(req, res);
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Admin create broadcast/targeted
router.post("/", auth, adminAuth, create);

module.exports = router;
