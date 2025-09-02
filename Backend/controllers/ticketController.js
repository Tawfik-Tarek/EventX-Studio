const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const { generateQR } = require("../utils/qrGenerator");

const bookTicket = async (req, res) => {
  try {
    const { eventId, seatNumber } = req.body;

    // Check if event exists and has available seats
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    // Check if seat is already booked
    const existingTicket = await Ticket.findOne({ eventId, seatNumber });
    if (existingTicket) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    // Generate QR code data
    const qrData = `Event: ${event.title}, Seat: ${seatNumber}, User: ${req.user._id}`;
    const qrCode = await generateQR(qrData);

    // Create ticket
    const ticket = new Ticket({
      eventId,
      userId: req.user._id,
      seatNumber,
      qrCode,
    });

    await ticket.save();

    // Update event available seats
    event.availableSeats -= 1;
    await event.save();

    res.status(201).json({
      message: "Ticket booked successfully",
      ticket,
    });
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

    // Update event available seats
    const event = await Event.findById(ticket.eventId);
    event.availableSeats += 1;
    await event.save();

    res.json({ message: "Ticket cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const useTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status !== "booked") {
      return res.status(400).json({ message: "Ticket cannot be used" });
    }

    ticket.status = "used";
    ticket.usedDate = new Date();
    await ticket.save();

    res.json({ message: "Ticket used successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  bookTicket,
  getUserTickets,
  getEventTickets,
  cancelTicket,
  useTicket,
};
