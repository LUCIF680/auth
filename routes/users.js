const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validate } = require("../utils/validateReq");
const joi = require("joi");
const locals = require("../utils/locals.json");
const User = require("../models/users");
const mail = require("../utils/email");
const { createAccountLimiter, loginLimit } = require("../utils/limiter");
require("dotenv").config();

const router = express.Router();
const schema = {};

router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET);

    const user = await User.findOneAndUpdate(
      { email: decoded.sub.email },
      { verified: true },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: locals.error_invalid_token });
    }

    return res.json({ message: locals.message_email_verified });
  } catch (error) {
    return res.status(400).json({ message: locals.error_invalid_token });
  }
});

schema.register = joi.object({
  email: joi.string().email().trim().required(),
  password: joi.string().min(8).trim().required(),
});

router.post(
  "/register",
  validate(schema.register),
  createAccountLimiter,
  async (req, res) => {
    const password = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      email: req.body.email,
      password: password,
      verified: false,
    });

    const verificationToken = jwt.sign(
      { sub: user },
      process.env.EMAIL_VERIFY_SECRET
    );

    mail.send({
      content: `Click on the link to verify your ${process.env.APP_NAME}'s account 
      <a href= >`,
      email: user.email,
      subject: "Verification of Unga Bunga",
    });

    return res.json({
      message:
        "Registration successful. Please check your email for verification.",
    });
  }
);

router.post("/login", loginLimit, (req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  passport.authenticate("local", { session: false }, (err, user, _info) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ message: locals.error_invalid_credentials });
    }
    if (!user.verified) {
      return res.status(400).json({
        message:
          "Email not verified. Please check your email for verification.",
      });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      const token = jwt.sign({ sub: user }, process.env.AUTH_KEY);
      return res.json({ token });
    });
  })(req, res, next);
});

// Access a protected resource
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ user: req.user });
  }
);

module.exports = router;
