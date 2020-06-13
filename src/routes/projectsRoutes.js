const { Router, static } = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");
const handleImages = require("../middlewares/handleImages");
const { pathHandler } = require("../utils/pathHandlers");
const {
  getProjectLogoUrl,
  createEditedProject,
} = require("../utils/projectHandlers");
const keys = require("../config/keys");

const Project = mongoose.model("Project");

const imagesPath = pathHandler({
  givenPath: `../data`,
});

const router = Router();
router.use(requireAuth);
router.use("/static", static(imagesPath));

router.get("/project/:id", async (request, response) => {
  const { id } = request.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      throw new Error("We couldn't find a project with the given id");
    }
    response.status(200).json(project);
  } catch (error) {
    response.status(500).json({
      error: "Sorry, something went wrong. Please try again later.",
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
      error: "Sorry, something went wrong. Please try again later.",
      detailedError: error.message,
    });
  }
});

router.post(
  "/projects",
  handleImages("projectLogo"),
  async (request, response) => {
    const { projectName, projectDescription, projectBugsReport } = request.body;
    const projectLogo = request.file;

    if (!projectName || !projectDescription) {
      return response.status(400).json({
        error: "Please provide a project name and a project description.",
      });
    }

    try {
      const project = new Project({
        projectName,
        projectLogoUrl: getProjectLogoUrl({ projectName, projectLogo }),
        projectDescription,
        projectBugsReport,
      });
      await project.save();
      response.status(201).json(project);
    } catch (error) {
      response.status(500).json({
        error: "Sorry, something went wrong. Please try again later.",
        detailedError: error.message,
      });
    }
  }
);

router.put(
  "/project/:id",
  handleImages("projectLogo"),
  async (request, response) => {
    const { id } = request.params;
    const { projectName, projectDescription, projectBugsReport } = request.body;
    const projectLogo = request.file;

    if (!projectName) {
      return response
        .status(400)
        .json({ error: "Please provide a project name." });
    }

    const editedProject = createEditedProject({
      projectName,
      projectDescription,
      projectBugsReport,
      projectLogo,
    });

    try {
      const project = await Project.findOneAndUpdate(
        { _id: id },
        editedProject
      );

      if (!project) {
        throw new Error("We couldn't find a project with the given id");
      }

      const responseProject = {
        ...project._doc,
        ...editedProject,
      };
      response.status(202).json(responseProject);
    } catch (error) {
      response.status(500).json({
        error: "Sorry, something went wrong. Please try again later.",
        detailedError: error.message,
      });
    }
  }
);

module.exports = router;
