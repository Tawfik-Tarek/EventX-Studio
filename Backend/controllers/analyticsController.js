const Event = require("../models/Event");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

const getDashboardStats = async (_, res) => {
  try {
    // Total events
    const totalEvents = await Event.countDocuments();

    // Total tickets sold
    const totalTicketsSold = await Ticket.countDocuments({ status: "booked" });

    // Total revenue
    const tickets = await Ticket.find({ status: "booked" }).populate(
      "eventId",
      "price"
    );
    const totalRevenue = tickets.reduce(
      (sum, ticket) => sum + (ticket.eventId?.price || 0),
      0
    );

    // Total users
    const totalUsers = await User.countDocuments({ role: "user" });

    // Recent events
    const recentEvents = await Event.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming events
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() },
      status: { $in: ["upcoming", "active"] },
    })
      .sort({ date: 1 })
      .limit(5);

    res.json({
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      totalUsers,
      recentEvents,
      upcomingEvents,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAttendeeDemographics = async (_, res) => {
  try {
    // Get users with tickets
    const usersWithTickets = await Ticket.distinct("userId");
    const attendees = await User.find({ _id: { $in: usersWithTickets } });

    // Age groups
    const ageGroups = {
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-55": 0,
      "56+": 0,
    };

    // Gender distribution
    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0,
    };

    // Interests
    const interestsCount = {};

    // Locations
    const locationsCount = {};

    attendees.forEach((user) => {
      // Age groups
      if (user.age) {
        if (user.age >= 18 && user.age <= 25) ageGroups["18-25"]++;
        else if (user.age >= 26 && user.age <= 35) ageGroups["26-35"]++;
        else if (user.age >= 36 && user.age <= 45) ageGroups["36-45"]++;
        else if (user.age >= 46 && user.age <= 55) ageGroups["46-55"]++;
        else if (user.age >= 56) ageGroups["56+"]++;
      }

      // Gender
      if (user.gender) {
        genderDistribution[user.gender]++;
      }

      // Interests
      if (user.interests) {
        user.interests.forEach((interest) => {
          interestsCount[interest] = (interestsCount[interest] || 0) + 1;
        });
      }

      // Location
      if (user.location) {
        locationsCount[user.location] =
          (locationsCount[user.location] || 0) + 1;
      }
    });

    res.json({
      ageGroups,
      genderDistribution,
      interests: interestsCount,
      locations: locationsCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getEventAttendeeDemographics = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ message: "eventId param required" });
    }

    const usersWithTickets = await Ticket.distinct("userId", {
      eventId,
      status: { $in: ["booked", "used"] },
    });

    const attendees = await User.find({ _id: { $in: usersWithTickets } });

    const ageGroups = {
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-55": 0,
      "56+": 0,
    };
    const genderDistribution = { male: 0, female: 0, other: 0 };
    const interestsCount = {};
    const locationsCount = {};

    attendees.forEach((user) => {
      if (user.age) {
        if (user.age >= 18 && user.age <= 25) ageGroups["18-25"]++;
        else if (user.age >= 26 && user.age <= 35) ageGroups["26-35"]++;
        else if (user.age >= 36 && user.age <= 45) ageGroups["36-45"]++;
        else if (user.age >= 46 && user.age <= 55) ageGroups["46-55"]++;
        else if (user.age >= 56) ageGroups["56+"]++;
      }

      if (user.gender) genderDistribution[user.gender]++;
      if (user.interests) {
        user.interests.forEach((interest) => {
          interestsCount[interest] = (interestsCount[interest] || 0) + 1;
        });
      }
      if (user.location) {
        locationsCount[user.location] =
          (locationsCount[user.location] || 0) + 1;
      }
    });

    const event = await Event.findById(eventId).select(
      "title date venue price totalSeats availableSeats status"
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const ticketsSold = await Ticket.countDocuments({
      eventId,
      status: { $in: ["booked", "used"] },
    });

    res.json({
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        price: event.price,
        totalSeats: event.totalSeats,
        availableSeats: event.availableSeats,
        status: event.status,
        ticketsSold,
        revenue: ticketsSold * event.price,
        occupancy: Number(
          ((ticketsSold / (event.totalSeats || 1)) * 100).toFixed(2)
        ),
      },
      ageGroups,
      genderDistribution,
      interests: interestsCount,
      locations: locationsCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPerEventStats = async (req, res) => {
  try {
    const events = await Event.find();
    const eventIds = events.map((e) => e._id);
    const ticketAgg = await Ticket.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: { $in: ["booked", "used"] },
        },
      },
      { $group: { _id: "$eventId", sold: { $sum: 1 } } },
    ]);
    const soldMap = ticketAgg.reduce((acc, t) => {
      acc[t._id.toString()] = t.sold;
      return acc;
    }, {});
    const data = events.map((e) => {
      const sold = soldMap[e._id.toString()] || 0;
      const revenue = sold * e.price;
      return {
        id: e._id,
        title: e.title,
        date: e.date,
        status: e.status,
        price: e.price,
        totalSeats: e.totalSeats,
        availableSeats: e.availableSeats,
        sold,
        revenue,
        occupancy: Number(((sold / e.totalSeats) * 100).toFixed(2)),
      };
    });
    res.json({ events: data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRevenueOverTime = async (req, res) => {
  try {
    const { from, to, granularity } = req.query;
    const match = { status: { $in: ["booked", "used"] } };
    if (from || to) {
      match.bookingDate = {};
      if (from) match.bookingDate.$gte = new Date(from);
      if (to) match.bookingDate.$lte = new Date(to);
    }
    const groupFormat =
      granularity === "month"
        ? { $dateToString: { format: "%Y-%m", date: "$bookingDate" } }
        : { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } };
    const agg = await Ticket.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: "$event.price" },
          tickets: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ points: agg });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const exportPerEventCSV = async (req, res) => {
  try {
    const events = await Event.find();
    const eventIds = events.map((e) => e._id);
    const ticketAgg = await Ticket.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: { $in: ["booked", "used"] },
        },
      },
      { $group: { _id: "$eventId", sold: { $sum: 1 } } },
    ]);
    const soldMap = ticketAgg.reduce((acc, t) => {
      acc[t._id.toString()] = t.sold;
      return acc;
    }, {});
    const rows = [
      "id,title,date,status,price,totalSeats,availableSeats,sold,revenue,occupancy%",
    ];
    events.forEach((e) => {
      const sold = soldMap[e._id.toString()] || 0;
      const revenue = sold * e.price;
      const occ = ((sold / e.totalSeats) * 100).toFixed(2);
      rows.push(
        `${e._id},"${e.title.replace(/"/g, '""')}",${e.date.toISOString()},${
          e.status
        },${e.price},${e.totalSeats},${
          e.availableSeats
        },${sold},${revenue},${occ}`
      );
    });
    const csv = rows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=event-stats.csv"
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAttendeeDemographics,
  getEventAttendeeDemographics,
  getPerEventStats,
  getRevenueOverTime,
  exportPerEventCSV,
};
