const User = require("../models/User");

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });

    if (!existingAdmin) {
      const adminUser = new User({
        name: "Tawfik Tarek",
        email: "tawfik@gmail.com",
        password: "admin123",
        role: "admin",
        age: 25,
        gender: "male",
        interests: ["technology", "events"],
        location: "Egypt",
      });

      await adminUser.save();
      console.log("✅ Default admin user created successfully!");
      console.log("📧 Email: tawfik@gmail.com");
      console.log("🔑 Password: admin123");
    } else {
      console.log("ℹ️  Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

module.exports = createDefaultAdmin;
