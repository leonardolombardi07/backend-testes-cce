const mongoose = require("mongoose");

const keys = require("../config/keys");
require("../models/User");
require("../models/Project");

mongoose.connect(
  keys.mongoUri,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (error, connection) => {
    if (connection) {
      console.log("Sucessfully connect to mongoDB database");
    }
  }
);
