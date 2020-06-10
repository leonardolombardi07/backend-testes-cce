const { Router } = require("express");
const mongoose = require("mongoose");

const Project = mongoose.model("Project");

const router = Router();

router.get("/project/:name", async (request, response) => {
  const { name } = request.params;

  if (!name) {
    response.status(500).send("Please provide a project name");
  }

  try {
    const project = await Project.find({ projectName: name });
    if (project.length === 0) {
      throw new Error("We couldn't find a project with the given name");
    }
    response.status(200).json(project);
  } catch (error) {
    response.status(500).json({
      error: "Sorry, something went wrong. Please try again later",
      detailedError: error.message,
    });
  }
});

router.get("/projects", async (request, response) => {
  try {
    const projects = await Project.find();
    response.status(200).json(projects);
  } catch (error) {
    response.status(500).json({
      error: "Sorry, something went wrong. Please try again later!",
      detailedError: error.message,
    });
  }
});

router.post("/projects", async (request, response) => {
  const { projectName, projectDescription, projectBugsReport } = request.body;

  if (!projectName || !projectDescription) {
    response.status(400).json({
      error: "Please provide a project name and a project description",
    });
  }

  try {
    const project = new Project({
      projectName,
      projectDescription,
      projectBugsReport,
    });
    await project.save();
    response.status(201).json(project);
  } catch (error) {
    response.status(500).json({
      error:
        "Sorry, something went wrong in our database. Please try again later",
      detailedError: error.message,
    });
  }
});

module.exports = router;
