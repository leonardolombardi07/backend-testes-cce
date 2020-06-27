const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const keys = require("../config/keys");
const User = mongoose.model("User");

module.exports = (request, response, next) => {
  const { authorization } = request.headers;

  if (!authorization) {
    return response
      .status(401)
      .json({ error: "Por favor providencie um token de autenticação." });
  }

  const token = authorization;
  jwt.verify(token, keys.jwbSecretKey, async (error, payload) => {
    if (error) {
      return response.status(404).json({
        error: "Por favor providencie um token de autenticação válido.",
        token,
      });
    }

    const { userId } = payload;
    try {
      const user = await User.findById(userId);
      request.user = user;
      next();
    } catch (error) {
      response.status(500).json({
        error:
          "Tivemos algum problema nos nossos servidores. Por favor tente novamente mais tarde.",
        detailedError: error.message,
      });
    }
  });
};
