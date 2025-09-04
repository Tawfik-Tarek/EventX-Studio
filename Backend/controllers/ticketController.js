const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const { generateQR } = require("../utils/qrGenerator");
const { createNotification } = require("./notificationController");
const jwt = require("jsonwebtoken");

const validateSeat = (event, seatNumber) => {
  if (seatNumber < 1 || seatNumber > event.totalSeats)
    return "Seat number out of range";
  if (!event.seatMap || event.seatMap.length !== event.totalSeats)
    return "Seat map not initialized";
  const seatObj = event.seatMap[seatNumber - 1];
  if (!seatObj) return "Seat not found";
  if (seatObj.status !== "available") return "Seat not available";
  return null;
};

const checkoutTicket = async (req, res) => {
  try {
    const { eventId } = req.body;
    const seatNumber = Number(req.body.seatNumber);
    const amount = Number(req.body.amount);

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (amount !== event.price)
      return res.status(400).json({ message: "Amount mismatch" });

    const seatError = validateSeat(event, seatNumber);
    if (seatError) return res.status(400).json({ message: seatError });

    const updated = await Event.findOneAndUpdate(
      {
        _id: eventId,
        availableSeats: { $gt: 0 },
        [`seatMap.${seatNumber - 1}.status`]: "available",
      },
      {
        $set: { [`seatMap.${seatNumber - 1}.status`]: "booked" },
        $inc: { availableSeats: -1 },
      },
      { new: true }
    );
    if (!updated)
      return res.status(400).json({ message: "Seat reservation failed" });

    const qrPayload = { e: eventId, s: seatNumber, u: req.user._id };
    const qrToken = jwt.sign(qrPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const qrCode = await generateQR(qrToken);

    const ticket = await Ticket.create({
      eventId,
      userId: req.user._id,
      seatNumber,
      qrCode,
    });
    createNotification({
      user: req.user._id,
      title: "Checkout Successful",
      message: `Seat ${seatNumber} booked for event ${event.title}`,
      type: "ticket",
      data: { ticketId: ticket._id, eventId },
    }).catch(() => {});
    res.status(201).json({ message: "Checkout successful", ticket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .populate("eventId", "title date venue")
      .sort({ bookingDate: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  checkoutTicket,
  getUserTickets,
};
