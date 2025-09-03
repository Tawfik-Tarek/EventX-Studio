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
    console.log("🌱 Starting data seeding...");

    await Event.deleteMany({});
    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log("🗑️  All data deleted successfully!");

    const users = [];
    for (let i = 0; i < 40; i++) {
      const user = new User({
        name: faker.person.fullName(),
        email: i === 0 ? "admin@example.com" : faker.internet.email(),
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
      users.push(user);
    }
    await User.insertMany(users);
    console.log("👥 40 users created successfully!");

    const events = [];
    for (let i = 0; i < 50; i++) {
      const totalSeats = faker.number.int({ min: 50, max: 200 });
      const event = new Event({
        title: faker.lorem.words({ min: 3, max: 7 }),
        description: faker.lorem.paragraphs(2),
        date: faker.date.future(),
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
        status: "upcoming",
        createdBy: faker.helpers.arrayElement(users)._id,
      });
      events.push(event);
    }
    await Event.insertMany(events);
    console.log("🎉 50 events created successfully!");

    const tickets = [];
    for (const event of events) {
      const numTickets = faker.number.int({
        min: 10,
        max: event.totalSeats / 2,
      }); 
      const bookedSeats = new Set();

      for (let i = 0; i < numTickets; i++) {
        let seatNumber;
        do {
          seatNumber = faker.number.int({ min: 1, max: event.totalSeats });
        } while (bookedSeats.has(seatNumber));

        bookedSeats.add(seatNumber);

        const user = faker.helpers.arrayElement(users);
        const ticketData = `Event: ${event.title}, Seat: ${seatNumber}, User: ${user.email}`;
        const qrCode = await generateQR(ticketData);

        const ticket = new Ticket({
          eventId: event._id,
          userId: user._id,
          seatNumber: seatNumber.toString(),
          qrCode,
          status: "booked",
        });
        tickets.push(ticket);
      }
    }
    await Ticket.insertMany(tickets);
    console.log(`🎫 ${tickets.length} tickets created successfully!`);

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
