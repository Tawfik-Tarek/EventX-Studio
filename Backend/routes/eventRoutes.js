const express = require("express");
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { auth, adminAuth } = require("../middleware/auth");
const {
  validate,
  eventCreateSchema,
  eventUpdateSchema,
  eventQuerySchema,
} = require("../middleware/validation");

const router = express.Router();

router.get("/", validate(eventQuerySchema, "query"), getAllEvents);
router.get("/:id", getEventById);
router.post("/", auth, adminAuth, validate(eventCreateSchema), createEvent);
router.put("/:id", auth, validate(eventUpdateSchema), updateEvent);
router.delete("/:id", auth, deleteEvent);

module.exports = router;
