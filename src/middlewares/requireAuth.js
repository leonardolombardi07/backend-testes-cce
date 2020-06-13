const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const keys = require("../config/keys");
const User = mongoose.model("User");

module.exports = (request, response, next) => {
  const { authorization } = request.headers;

  if (!authorization) {
    return response.status(401).json({ error: "Please provide a token" });
  }

  const token = authorization;
  jwt.verify(token, keys.jwbSecretKey, async (error, payload) => {
    if (error) {
      return response
        .status(404)
        .json({ error: "You must be logged in", token });
    }

    const { userId } = payload;
    try {
      const user = await User.findById(userId);
      request.user = user;
      next();
    } catch (error) {
      console.log(error.message);
      response.status(500).json({
        error: "Something went wrong. Please try again later.",
        detailedError: error.message,
      });
    }
  });
};
