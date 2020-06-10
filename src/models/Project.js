const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    unique: true,
  },
  projectDescription: {
    type: String,
    required: true,
  },
  projectBugsReport: {
    type: String,
  },
});

const projectsSchema = new mongoose.Schema({
  projects: [projectSchema],
});

mongoose.model("Projects", projectsSchema);
