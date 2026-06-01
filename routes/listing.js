const express = require("express");
const router = express.Router();
const { isLoggedIn, isOwner } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

// File type and size validation
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PNG, JPG, and JPEG files are allowed"), false);
    }
  },
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(" ,");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    (req, res, next) => {
      upload.single(`listing[image]`)(req, res, (err) => {
        if (err) {
          return next(new ExpressError(400, err.message));
        }
        next();
      });
    },
    validateListing,
    wrapAsync(listingController.create),
  );

router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .put(
    isLoggedIn,
    isOwner,
    (req, res, next) => {
      upload.single(`listing[image]`)(req, res, (err) => {
        if (err) {
          return next(new ExpressError(400, err.message));
        }
        next();
      });
    },
    validateListing,
    wrapAsync(listingController.update),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.delete));

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;
