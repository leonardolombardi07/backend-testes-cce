const mongoose = require("mongoose");
const keys = require("../config/keys");

mongoose.connect(
  keys.mongoUri,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error, connection) => {
    if (connection) {
      console.log("Sucessfully connect to mongoDB database");
    }
  }
);
