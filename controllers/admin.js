const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");

module.exports.dashboard = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalListings = await Listing.countDocuments();
  const totalBookings = await Booking.countDocuments();

  const pendingBookings = await Booking.countDocuments({ bookingStatus: "Pending" });
  const confirmedBookings = await Booking.countDocuments({ bookingStatus: "Confirmed" });
  const cancelledBookings = await Booking.countDocuments({ bookingStatus: "Cancelled" });
  const completedBookings = await Booking.countDocuments({ bookingStatus: "Completed" });

  // Calculate Total Revenue from Non-Cancelled Bookings
  const revenueResult = await Booking.aggregate([
    { $match: { bookingStatus: { $ne: "Cancelled" } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Upcoming Check-ins
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingCheckIns = await Booking.find({
    checkInDate: { $gte: today },
    bookingStatus: { $ne: "Cancelled" },
  })
    .populate("listing")
    .populate("user")
    .sort({ checkInDate: 1 })
    .limit(5);

  const recentBookings = await Booking.find()
    .populate("listing")
    .populate("user")
    .sort({ createdAt: -1 })
    .limit(5);

  res.render("admin/dashboard", {
    stats: {
      totalUsers,
      totalListings,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
    },
    upcomingCheckIns,
    recentBookings,
  });
};

module.exports.bookingsIndex = async (req, res) => {
  const { search, status, dateFilter } = req.query;

  let filter = {};

  if (status && status !== "All") {
    filter.bookingStatus = status;
  }

  if (dateFilter) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (dateFilter === "today") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.checkInDate = { $gte: now, $lt: tomorrow };
    } else if (dateFilter === "upcoming") {
      filter.checkInDate = { $gte: now };
    } else if (dateFilter === "this_week") {
      const weekLater = new Date(now);
      weekLater.setDate(weekLater.getDate() + 7);
      filter.checkInDate = { $gte: now, $lte: weekLater };
    }
  }

  let bookings = await Booking.find(filter)
    .populate("listing")
    .populate("user")
    .sort({ createdAt: -1 });

  // Client-side / In-memory search filter for Booking ID, Guest Name, Email, Property Title
  if (search && search.trim() !== "") {
    const q = search.trim().toLowerCase();
    bookings = bookings.filter((b) => {
      const bId = b.bookingId ? b.bookingId.toLowerCase() : "";
      const gName = b.guestName ? b.guestName.toLowerCase() : "";
      const email = b.email ? b.email.toLowerCase() : "";
      const propTitle = b.listing && b.listing.title ? b.listing.title.toLowerCase() : "";
      return bId.includes(q) || gName.includes(q) || email.includes(q) || propTitle.includes(q);
    });
  }

  res.render("admin/bookings", {
    bookings,
    currentSearch: search || "",
    currentStatus: status || "All",
    currentDateFilter: dateFilter || "all",
  });
};

module.exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { bookingStatus, paymentStatus } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    req.flash("error", "Booking not found!");
    return res.redirect("/admin/bookings");
  }

  if (bookingStatus) {
    booking.bookingStatus = bookingStatus;
  }
  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
  }

  await booking.save();

  req.flash("success", `Booking ${booking.bookingId} status updated to '${booking.bookingStatus}'.`);
  res.redirect("/admin/bookings");
};

module.exports.usersIndex = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  // Attach booking count for each user
  const usersWithCounts = await Promise.all(
    users.map(async (u) => {
      const bookingCount = await Booking.countDocuments({ user: u._id });
      return {
        ...u.toObject(),
        bookingCount,
      };
    })
  );

  res.render("admin/users", { users: usersWithCounts });
};

module.exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findById(id);
  if (!user) {
    req.flash("error", "User not found!");
    return res.redirect("/admin/users");
  }

  user.role = role === "admin" ? "admin" : "user";
  await user.save();

  req.flash("success", `User '${user.username}' role updated to '${user.role}'.`);
  res.redirect("/admin/users");
};

module.exports.listingsIndex = async (req, res) => {
  const listings = await Listing.find().populate("owner").sort({ createdAt: -1 });

  const listingsWithCounts = await Promise.all(
    listings.map(async (l) => {
      const bookingCount = await Booking.countDocuments({ listing: l._id });
      return {
        ...l.toObject(),
        bookingCount,
      };
    })
  );

  res.render("admin/listings", { listings: listingsWithCounts });
};
