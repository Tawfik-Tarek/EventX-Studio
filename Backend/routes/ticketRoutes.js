const express = require("express");
const {
  bookTicket,
  getUserTickets,
  getEventTickets,
  cancelTicket,
  useTicket,
} = require("../controllers/ticketController");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/book", auth, bookTicket);
router.get("/my-tickets", auth, getUserTickets);
router.get("/event/:eventId", auth, adminAuth, getEventTickets);
router.put("/:id/cancel", auth, cancelTicket);
router.put("/:id/use", auth, adminAuth, useTicket);

module.exports = router;
