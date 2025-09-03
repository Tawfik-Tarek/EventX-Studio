const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const { generateQR } = require("../utils/qrGenerator");
const jwt = require("jsonwebtoken");

// Helper to ensure seat is valid and available using seatMap
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

const bookTicket = async (req, res) => {
  try {
    const { eventId } = req.body;
    const seatNumber = Number(req.body.seatNumber);

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.availableSeats <= 0)
      return res.status(400).json({ message: "No seats available" });

    const seatError = validateSeat(event, seatNumber);
    if (seatError) return res.status(400).json({ message: seatError });

    // Atomically mark seat as booked if still available and decrement availableSeats
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

    res.status(201).json({ message: "Ticket booked successfully", ticket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Simulated payment + booking (checkout)
const checkoutTicket = async (req, res) => {
  try {
    const { eventId } = req.body;
    const seatNumber = Number(req.body.seatNumber);
    const amount = Number(req.body.amount);

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (amount !== event.price)
      return res.status(400).json({ message: "Amount mismatch" });

    // We can reuse book logic; for clarity replicate minimal steps
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

const getEventTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ eventId: req.params.eventId })
      .populate("userId", "name email")
      .sort({ bookingDate: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if user owns the ticket
    if (ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update ticket status
    ticket.status = "cancelled";
    await ticket.save();

    // Free seat in seatMap and increment availableSeats
    await Event.findOneAndUpdate(
      {
        _id: ticket.eventId,
        [`seatMap.${ticket.seatNumber - 1}.status`]: "booked",
      },
      {
        $set: { [`seatMap.${ticket.seatNumber - 1}.status`]: "available" },
        $inc: { availableSeats: 1 },
      }
    );

    res.json({ message: "Ticket cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const useTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status !== "booked")
      return res.status(400).json({ message: "Ticket cannot be used" });
    ticket.status = "used";
    ticket.usedDate = new Date();
    await ticket.save();
    res.json({ message: "Ticket used successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate QR code token and mark ticket used (admin scan)
const validateQRAndUse = async (req, res) => {
  try {
    const { qr } = req.body; // qr token (not dataURL)
    let payload;
    try {
      payload = jwt.verify(qr, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ message: "Invalid or expired QR" });
    }
    const { e: eventId, s: seatNumber, u: userId } = payload;
    const ticket = await Ticket.findOne({ eventId, seatNumber, userId });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status !== "booked")
      return res.status(400).json({ message: "Ticket already processed" });
    ticket.status = "used";
    ticket.usedDate = new Date();
    await ticket.save();
    res.json({ message: "QR validated", ticket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  bookTicket,
  checkoutTicket,
  getUserTickets,
  getEventTickets,
  cancelTicket,
  useTicket,
  validateQRAndUse,
};
