const { Router } = require("express");
const mongoose = require("mongoose");
const jwb = require("jsonwebtoken");
const keys = require("../config/keys");
const { validateEmail, validatePassword } = require("../utils/validators");

const User = mongoose.model("User");

const router = Router();

router.post("/signup", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response
      .status(400)
      .json({ error: "Please provide an email and a password" });
  } else if (!validateEmail(email)) {
    return response
      .status(400)
      .json({ error: "Please provide a valid email address" });
  } else if (!validatePassword(password)) {
    return response.status(400).json({
      error:
        "Your password must contain eight characters, at least one letter and at least one number",
    });
  }

  try {
    const user = new User({ email, password });
    await user.save();
    const token = jwb.sign({ userId: user._id }, keys.jwbSecretKey);
    response.status(201).json({
      email,
      token,
    });
  } catch (error) {
    response.status(500).json({
      error: "Something went wrong with our servers. Please try again later.",
      detailedError: error.message,
    });
  }
});

router.post("/signin", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response
      .status(422)
      .json({ error: "Please provide a valid email and password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return response
      .status(400)
      .json({ error: "We couldn't find a user with this email" });
  }

  try {
    await user.comparePassword(password);
    const token = jwb.sign({ userId: user._id }, keys.jwbSecretKey);
    response.status(200).json({ email, token });
  } catch (error) {
    response.status(500).json({
      error: "Something went wrong with our servers. Please try again later.",
      detailedError: error.message,
    });
  }
});

module.exports = router;
