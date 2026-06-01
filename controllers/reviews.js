const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const mongoose = require("mongoose");

module.exports.createReview = async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid listing ID");
    return res.redirect("/listings");
  }

  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Review added!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewID } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(reviewID)
  ) {
    req.flash("error", "Invalid ID");
    return res.redirect("/listings");
  }

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewID },
  });

  await Review.findByIdAndDelete(reviewID);

  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};
