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

module.exports = { getDashboardStats, getAttendeeDemographics };
