const mongoose = require("mongoose");

const keys = require("../config/keys");
require("../models/User");
require("../models/Project");

exports.connectToDatabase = () => {
  return mongoose.connect(
    keys.mongoUri,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (error, connection) => {
      if (connection) {
        console.log("Conectado ao banco de dados mongoDB");
      }

      if (error) {
        console.log("Não foi possível conectar ao banco de dados");
      }
    }
  );
};
