const express = require("express");
const {
  checkoutTicket,
  getUserTickets,
  cancelTicket,
} = require("../controllers/ticketController");
const { auth } = require("../middleware/auth");
const { validate, ticketCheckoutSchema } = require("../middleware/validation");

const router = express.Router();

router.post("/checkout", auth, validate(ticketCheckoutSchema), checkoutTicket);
router.get("/my-tickets", auth, getUserTickets);
router.put("/:id/cancel", auth, cancelTicket);

module.exports = router;
