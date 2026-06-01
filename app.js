if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// DB CONNECT
const atlasUrl = process.env.ATLASDB_URL;
const localUrl = "mongodb://127.0.0.1:27017/wanderlust";
//const url=process.env.MONGO_URL || localUrl;
const connectDB = async () => {
  try {
    if (atlasUrl) {
      await mongoose.connect(atlasUrl);
      console.log("Connected to Atlas DB");
    } else {
      await mongoose.connect(localUrl);
      console.log("Connected to local MongoDB");
    }
  } catch (err) {
    console.error("Primary MongoDB connection error:", err);
    if (atlasUrl) {
      console.log("Atlas failed, trying local MongoDB fallback...");
      try {
        await mongoose.connect(localUrl);
        console.log("Connected to local MongoDB fallback");
        return;
      } catch (fallbackErr) {
        console.error("Local MongoDB fallback failed:", fallbackErr);
      }
    }
    process.exit(1);
  }
};

connectDB();

// BASIC MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "public")));

//  sessionOptions without the bug
const sessionOptions = {
  secret: process.env.SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

//   session & flash BEFORE routes and home
app.use(session(sessionOptions));
app.use(flash());

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy({ usernameField: "username" }, User.authenticate()),
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// LOCALS MIDDLEWARE
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//   Home route AFTER all middleware
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ROUTES
app.use("/listings", listingRouter);
app.use("/listings", reviewRouter);
app.use("/", userRouter);

// 404
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// SERVER
app.listen(8080, () => {
  console.log("server running on 8080");
});
