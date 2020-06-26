const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  bugsReport: {
    type: String,
    default: "",
  },
  logoUrl: {
    type: String,
    default: null,
  },
});

mongoose.model("Project", projectSchema);
