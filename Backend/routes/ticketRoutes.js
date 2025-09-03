const express = require("express");
const {
  bookTicket,
  checkoutTicket,
  getUserTickets,
  getEventTickets,
  cancelTicket,
  useTicket,
  validateQRAndUse,
} = require("../controllers/ticketController");
const { auth, adminAuth } = require("../middleware/auth");
const {
  validate,
  ticketBookSchema,
  ticketCheckoutSchema,
  ticketQRValidateSchema,
} = require("../middleware/validation");

const router = express.Router();

router.post("/book", auth, validate(ticketBookSchema), bookTicket);
router.post("/checkout", auth, validate(ticketCheckoutSchema), checkoutTicket);
router.get("/my-tickets", auth, getUserTickets);
router.get("/event/:eventId", auth, adminAuth, getEventTickets);
router.put("/:id/cancel", auth, cancelTicket);
router.put("/:id/use", auth, adminAuth, useTicket);
router.post(
  "/validate-qr",
  auth,
  adminAuth,
  validate(ticketQRValidateSchema),
  validateQRAndUse
);

module.exports = router;
