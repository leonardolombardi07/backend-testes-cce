const { Router, static } = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");
const handleImages = require("../middlewares/handleImages");
const { pathHandler } = require("../utils/pathHandlers");
const keys = require("../config/keys");

const Project = mongoose.model("Project");

const imagesPath = pathHandler({
  givenPath: `../data`,
});

const router = Router();
router.use("/static", static(imagesPath));
// router.use(requireAuth);

router.get("/project/:name", async (request, response) => {
  const { name } = request.params;

  if (!name) {
    return response
      .status(500)
      .json({ error: "Please provide a project name" });
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

router.post(
  "/projects",
  handleImages("projectLogo"),
  async (request, response) => {
    const projectLogo = request.file;
    const { projectName, projectDescription, projectBugsReport } = request.body;
    const formattedProjectName = projectName.replace(
      /[ &\/\\#,+()$~%.'":*?<>{}]/g,
      ""
    );

    if (!projectName || !projectDescription) {
      return response.status(400).json({
        error: "Please provide a project name and a project description",
      });
    }

    try {
      const project = new Project({
        projectName,
        projectLogoUrl: projectLogo
          ? `${keys.staticImagesUrl}${formattedProjectName}.png`
          : null,
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
  }
);

router.put(
  "/project/:name",
  handleImages("projectLogo"),
  async (request, response) => {
    const projectLogo = request.file;
    const { name } = request.params;
    const { projectName, projectDescription, projectBugsReport } = request.body;
    const formattedProjectName = projectName.replace(
      /[ &\/\\#,+()$~%.'":*?<>{}]/g,
      ""
    );
    const requestObject = {
      projectName,
      projectLogoUrl: projectLogo
        ? `${keys.staticImagesUrl}${formattedProjectName}.png`
        : null,
      projectDescription,
      projectBugsReport,
    };

    if (!name) {
      return response
        .status(500)
        .json({ error: "Please provide a project name" });
    }

    try {
      let editedProject = {};
      for (var requestItem in requestObject) {
        if (requestObject[requestItem]) {
          editedProject[requestItem] = requestObject[requestItem];
        }
      }

      const project = await Project.findOneAndUpdate(
        { projectName: name },
        editedProject
      );

      if (!project) {
        throw new Error("We couldn't find a project with the given name");
      }
      response.status(202).json(project);
    } catch (error) {
      response.status(500).json({
        error: "Something went wrong in our server",
        detailedError: error.message,
      });
    }
  }
);

module.exports = router;
