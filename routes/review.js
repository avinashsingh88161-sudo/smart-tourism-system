const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// VALIDATION
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// CREATE REVIEW
router.post(
  "/:id/reviews",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview),
);

// DELETE REVIEW
router.delete(
  "/:id/reviews/:reviewID",
  isLoggedIn,
  wrapAsync(reviewController.deleteReview),
);

module.exports = router;
