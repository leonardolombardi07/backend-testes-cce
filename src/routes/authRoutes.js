const { Router } = require("express");
const mongoose = require("mongoose");
const jwb = require("jsonwebtoken");
const axios = require("axios");
const keys = require("../config/keys");
const { validateEmail, validatePassword } = require("../utils/validators");
const { getQueryParameterByName } = require("../utils/getters");

const User = mongoose.model("User");

const router = Router();

router.get("/auth/podio", (request, response) => {
  response.redirect(
    `https://podio.com/oauth/authorize?client_id=${keys.podioClientId}&redirect_uri=${keys.podioRedirectUrl}&scope=user`
  );
});

router.get("/auth/podio/callback", async (request, response) => {
  const { url } = request;
  const authCode = getQueryParameterByName("code", url);

  try {
    const baseUrl = "https://podio.com/oauth/token/?";
    const body = `grant_type=authorization_code&client_id=${keys.podioClientId}&redirect_uri=${keys.podioRedirectUrl}&client_secret=${keys.podioAppSecret}&code=${authCode}`;
    const postUrl = baseUrl + body;
    const { data } = await axios.post(postUrl);
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({
      error: "Something went wrong in podio servers",
      detailedError: error.message,
    });
  }
});

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
