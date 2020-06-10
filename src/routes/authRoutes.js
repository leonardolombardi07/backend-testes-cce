const { Router } = require("express");
const { validateEmail, validatePassword } = require("../utils/validators");

const router = Router();
const mongoose = require("mongoose");

const User = mongoose.model("User");

router.post("signup", async (request, response) => {
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
  } catch (error) {}

  // generate JSON WEB TOKEN
  // send response with token and user info
});
router.post("signin", (request, response) => {
  //
});

module.exports = router;
