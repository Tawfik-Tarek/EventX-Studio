const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const dotenv = require("dotenv");
const Event = require("../models/Event");
const User = require("../models/User");
const Ticket = require("../models/Ticket");
const { generateQR } = require("./qrGenerator");

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log("Starting data seeding...");

    await Event.deleteMany({});
    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log("All data deleted successfully!");

    const users = [];
    for (let i = 0; i < 40; i++) {
      const user = new User({
        name: faker.person.fullName(),
        email: i === 0 ? "tawfik@eventex.com" : faker.internet.email(),
        password: "password123",
        role: i === 0 ? "admin" : "user",
        age: faker.number.int({ min: 18, max: 65 }),
        gender: faker.helpers.arrayElement(["male", "female", "other"]),
        interests: faker.helpers.arrayElements(
          ["technology", "music", "sports", "art", "food", "travel"],
          { min: 1, max: 3 }
        ),
        location: faker.location.city(),
      });
      await user.save();
      users.push(user);
    }
    console.log("40 users created successfully!");

    const regularUsers = users.filter((user) => user.role !== "admin");

    const events = [];
    for (let i = 0; i < 50; i++) {
      const totalSeats = faker.number.int({ min: 50, max: 200 });

      let eventDate;
      let eventStatus;

      if (i < 15) {
        const daysAgo = faker.number.int({ min: 1, max: 365 });
        eventDate = new Date();
        eventDate.setDate(eventDate.getDate() - daysAgo);
        eventStatus = "closed";
      } else if (i < 35) {
        const daysAhead = faker.number.int({ min: 1, max: 365 });
        eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + daysAhead);
        eventStatus = "upcoming";
      } else {
        const daysAgo = faker.number.int({ min: 1, max: 60 });
        eventDate = new Date();
        eventDate.setDate(eventDate.getDate() - daysAgo);
        eventStatus = "active";
      }

      const event = new Event({
        title: faker.lorem.words({ min: 3, max: 7 }),
        description: faker.lorem.paragraphs(2),
        date: eventDate,
        time: faker.helpers.arrayElement([
          "10:00 AM",
          "2:00 PM",
          "6:00 PM",
          "8:00 PM",
        ]),
        venue: faker.company.name() + " Hall",
        price: faker.number.int({ min: 10, max: 100 }),
        totalSeats,
        availableSeats: totalSeats,
        status: eventStatus,
        createdBy: faker.helpers.arrayElement(users)._id,
      });
      events.push(event);
    }
    await Event.insertMany(events);
    console.log("50 events created successfully!");
    console.log(
      `Event distribution: ${
        events.filter((e) => e.status === "closed").length
      } closed, ${events.filter((e) => e.status === "active").length} active, ${
        events.filter((e) => e.status === "upcoming").length
      } upcoming`
    );

    console.log("\nDate distribution sample:");
    events.slice(0, 10).forEach((event, index) => {
      console.log(
        `Event ${index + 1}: ${event.title.substring(
          0,
          25
        )}... - ${event.date.toDateString()} (${event.status})`
      );
    });

    const tickets = [];
    for (const event of events) {
      let numTickets;

      if (event.status === "closed") {
        numTickets = faker.number.int({
          min: Math.floor(event.totalSeats * 0.1),
          max: Math.floor(event.totalSeats * 0.9),
        });
      } else if (event.status === "active") {
        numTickets = faker.number.int({
          min: Math.floor(event.totalSeats * 0.6),
          max: Math.floor(event.totalSeats * 0.95),
        });
      } else {
        numTickets = faker.number.int({
          min: Math.floor(event.totalSeats * 0.05),
          max: Math.floor(event.totalSeats * 0.5),
        });
      }

      if (faker.datatype.boolean({ probability: 0.1 })) {
        numTickets = 0;
      }

      const bookedSeats = new Set();

      for (let i = 0; i < numTickets; i++) {
        let seatNumber;
        do {
          seatNumber = faker.number.int({ min: 1, max: event.totalSeats });
        } while (bookedSeats.has(seatNumber));

        bookedSeats.add(seatNumber);

        const user = faker.helpers.arrayElement(regularUsers);
        const ticketData = `Event: ${event.title}, Seat: ${seatNumber}, User: ${user.email}`;
        const qrCode = await generateQR(ticketData);

        let bookingDate = new Date();
        if (event.status === "closed") {
          const daysBeforeEvent = faker.number.int({ min: 1, max: 30 });
          bookingDate = new Date(event.date);
          bookingDate.setDate(bookingDate.getDate() - daysBeforeEvent);
        } else if (event.status === "active") {
          const daysAgo = faker.number.int({ min: 0, max: 7 });
          bookingDate.setDate(bookingDate.getDate() - daysAgo);
        } else {
          const daysAgo = faker.number.int({ min: 0, max: 14 });
          bookingDate.setDate(bookingDate.getDate() - daysAgo);
        }

        const ticket = new Ticket({
          eventId: event._id,
          userId: user._id,
          seatNumber: seatNumber.toString(),
          qrCode,
          status: "booked",
          bookingDate: bookingDate,
        });
        tickets.push(ticket);
      }
    }
    await Ticket.insertMany(tickets);
    console.log(`${tickets.length} tickets created successfully!`);

    const ticketStats = events.map((event) => {
      const eventTickets = tickets.filter(
        (t) => t.eventId.toString() === event._id.toString()
      );
      return {
        title: event.title.substring(0, 30),
        status: event.status,
        totalSeats: event.totalSeats,
        booked: eventTickets.length,
        percentage: Math.round((eventTickets.length / event.totalSeats) * 100),
      };
    });

    console.log("\nTicket booking distribution:");
    ticketStats.slice(0, 10).forEach((stat) => {
      console.log(
        `${stat.title}... (${stat.status}): ${stat.booked}/${stat.totalSeats} (${stat.percentage}%)`
      );
    });

    for (const event of events) {
      const eventTickets = tickets.filter(
        (t) => t.eventId.toString() === event._id.toString()
      );
      event.availableSeats = event.totalSeats - eventTickets.length;
      event.seatMap = Array.from({ length: event.totalSeats }, (_, i) => {
        const seatNum = i + 1;
        const isBooked = eventTickets.some(
          (t) => parseInt(t.seatNumber) === seatNum
        );
        return {
          number: seatNum,
          status: isBooked ? "booked" : "available",
        };
      });
      await event.save();
    }

    console.log("Data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};

const runSeeder = async () => {
  await connectDB();
  await seedData();
};

if (require.main === module) {
  runSeeder();
}

module.exports = { seedData };
