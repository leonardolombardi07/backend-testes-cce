const { Router, request } = require("express");
const mongoose = require("mongoose");
const jwb = require("jsonwebtoken");
const axios = require("axios");
const keys = require("../config/keys");
const { validateEmail, validatePassword } = require("../utils/validators");
const { getQueryParameterByName } = require("../utils/getters");
const { generateRandomPassword } = require("../utils/generateRandomPassword");

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
  const baseUrl = "https://podio.com/oauth/token/?";
  const body = `grant_type=authorization_code&client_id=${keys.podioClientId}&redirect_uri=${keys.podioRedirectUrl}&client_secret=${keys.podioAppSecret}&code=${authCode}`;

  const postUrl = baseUrl + body;
  const getUserDataUrl = "https://api.podio.com/user/status";
  try {
    const {
      data: { access_token },
    } = await axios.post(postUrl);

    const {
      data: {
        profile: { name, mail },
      },
    } = await axios.get(getUserDataUrl, {
      headers: { Authorization: `OAuth2 ${access_token}` },
    });

    const email = mail[0];
    let user = await User.findOne({ email });
    if (!user) {
      const password = generateRandomPassword();
      user = new User({ name, email, password });
      await user.save();
      // send email to "mail" address with password
    }
    console.log(user);
    const token = jwb.sign({ userId: user._id }, keys.jwbSecretKey);
    response.status(200).json({ token });
  } catch (error) {
    response.status(500).json({
      error: "Something went wrong in podio servers",
      detailedError: error.message,
    });
  }
});

router.post("/auth/signup", async (request, response) => {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response
      .status(400)
      .json({ error: "Please provide a name, an email and a password" });
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
    const user = new User({ name, email, password });
    await user.save();
    const token = jwb.sign({ userId: user._id }, keys.jwbSecretKey);
    response.status(201).json({
      name,
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

router.post("/auth/signin", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response
      .status(422)
      .json({ error: "Please provide a valid email and password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return response.status(400).json({
      error:
        "We couldn't find a user with this email. Try to Sign Up before Sign In",
    });
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

router.get("/users", async (request, response) => {
  const users = await User.find();
  response.json({ users });
});

module.exports = router;
