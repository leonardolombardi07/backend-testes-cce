const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const keys = require("../config/keys");
const User = mongoose.model("User");

module.exports = (request, response, next) => {
  const { authorization } = request.headers;
  console.log(authorization);

  if (!authorization) {
    return response.status(401).json({ error: "Please provide a token" });
  }

  const token = authorization;
  jwt.verify(token, keys.jwbSecretKey, async (error, payload) => {
    if (error) {
      return response.status(404).json({ error: "You must be logged in" });
    }

    const { userId } = payload;
    const user = await User.findById(userId);
    request.user = user;
    next();
  });
};
