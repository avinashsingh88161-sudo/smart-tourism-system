const User=require("../models/user.js");

module.exports.renderSignupForm=(req, res) => {
  res.render("users/signup");
};

module.exports.renderLoginForm= (req, res) => {
  res.render("users/login");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to Smart Tourism System! You are logged in.");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out of Smart Tourism System.");
    res.redirect("/listings");
  });
};

module.exports.signup=(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const newUser = new User({ email, username });
      await User.register(newUser, password);
      req.login(newUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Signup successful! You are now logged in.");
        res.redirect("/listings");
      });
    } catch (err) {
      console.error("Signup error:", err);
      if (err && err.stack) {
        console.error(err.stack);
      }
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  });