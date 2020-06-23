const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  logoKey: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  bugsReport: {
    type: String,
    default: "",
  },
});

mongoose.model("Project", projectSchema);
