if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: __dirname + "/../.env" });
}

const mongoose = require("mongoose");
const User = require("../models/user");

const atlasUrl = process.env.ATLASDB_URL;
const localUrl = "mongodb://127.0.0.1:27017/wanderlust";

const seedAdmin = async () => {
  try {
    if (atlasUrl) {
      try {
        await mongoose.connect(atlasUrl);
        console.log("Connected to Atlas DB for admin seed");
      } catch (e) {
        console.log("Atlas failed, connecting to local MongoDB for admin seed...");
        await mongoose.connect(localUrl);
      }
    } else {
      await mongoose.connect(localUrl);
      console.log("Connected to local MongoDB for admin seed");
    }

    let adminUser = await User.findOne({ username: "admin" });
    if (!adminUser) {
      adminUser = new User({
        username: "admin",
        email: "admin@smarttourism.com",
        role: "admin",
        phone: "+1 800-555-0199",
      });
      await User.register(adminUser, "admin123");
      console.log("✅ Admin user 'admin' created with password 'admin123'.");
    } else {
      adminUser.role = "admin";
      await adminUser.save();
      console.log("✅ Existing 'admin' user updated with role='admin'.");
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Admin seed error:", err);
    process.exit(1);
  }
};

seedAdmin();
