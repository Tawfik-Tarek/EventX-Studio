const Event = require("../models/Event");

const getAllEvents = async (req, res) => {
  try {
    const {
      page,
      limit,
      search,
      status,
      minPrice,
      maxPrice,
      fromDate,
      toDate,
      sort,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortMap = {
      date: { date: 1 },
      "-date": { date: -1 },
      price: { price: 1 },
      "-price": { price: -1 },
      createdAt: { createdAt: 1 },
      "-createdAt": { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || { date: 1 };

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("createdBy", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(query),
    ]);

    res.json({
      data: events,
      page: pageNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name"
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, price, totalSeats } =
      req.body;

    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      price,
      totalSeats,
      availableSeats: totalSeats,
      createdBy: req.user._id,
    });

    await event.save();
    const createdEvent = await Event.findById(event._id).populate(
      "createdBy",
      "name"
    );
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the creator or admin
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = req.body;

    if (updates.totalSeats !== undefined) {
      const newTotalSeats = Number(updates.totalSeats);
      const bookedSeats = event.totalSeats - event.availableSeats;
      if (newTotalSeats < bookedSeats) {
        return res.status(400).json({
          message: `Cannot reduce total seats below ${bookedSeats} booked seats`,
        });
      }
      updates.availableSeats = newTotalSeats - bookedSeats;
    }

    Object.keys(updates).forEach((key) => {
      event[key] = updates[key];
    });

    await event.save();
    const updatedEvent = await Event.findById(req.params.id).populate(
      "createdBy",
      "name"
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the creator or admin
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
