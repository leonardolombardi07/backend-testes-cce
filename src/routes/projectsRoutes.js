const { Router, static } = require("express");
const mongoose = require("mongoose");

const requireAuth = require("../middlewares/requireAuth");
const handleImages = require("../middlewares/handleImages");

const { pathHandler } = require("../utils/pathHandlers");
const {
  getProjectLogoUrl,
  createEditedProject,
} = require("../utils/projectHandlers");

const Project = mongoose.model("Project");

const imagesPath = pathHandler({
  givenPath: `../data`,
});

const router = Router();
router.use("/static", static(imagesPath));

router.get(
  "/project/:id",
  // requireAuth,
  async (request, response) => {
    const { id } = request.params;
    try {
      const project = await Project.findById(id);
      if (!project) {
        throw new Error(
          "Não conseguimos encontrar o projeto com a id especificada."
        );
      }
      response.status(200).json(project);
    } catch (error) {
      response.status(500).json({
        error:
          "Tivemos algum problema nos nossos servidores. Por favor tente novamente mais tarde.",
        detailedError: error.message,
      });
    }
  }
);

router.get(
  "/projects",
  // requireAuth,
  async (request, response) => {
    try {
      const projects = await Project.find();
      response.status(200).json(projects);
    } catch (error) {
      response.status(500).json({
        error:
          "Tivemos algum problema nos nossos servidores. Por favor tente novamente mais tarde.",
        detailedError: error.message,
      });
    }
  }
);

router.post(
  "/projects",
  // requireAuth,
  handleImages("projectLogo"),
  async (request, response) => {
    const { projectName, projectDescription, projectBugsReport } = request.body;
    const projectLogo = request.file;
    console.log(projectLogo);

    if (!projectName || !projectDescription) {
      return response.status(400).json({
        error: "Por favor providencie um nome e uma descrição pro projeto.",
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
        error:
          "Tivemos algum problema nos nossos servidores. Por favor tente novamente mais tarde.",
        detailedError: error.message,
      });
    }
  }
);

router.put(
  "/project/:id",
  // requireAuth,
  handleImages("projectLogo"),
  async (request, response) => {
    const { id } = request.params;
    const { projectName, projectDescription, projectBugsReport } = request.body;
    const projectLogo = request.file;

    if (!projectName) {
      return response
        .status(400)
        .json({ error: "Por favor providencie um nome pro projeto." });
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
        throw new Error(
          "Não conseguimos encontrar o projeto com a id especificada."
        );
      }

      const responseProject = {
        ...project._doc,
        ...editedProject,
      };
      response.status(202).json(responseProject);
    } catch (error) {
      response.status(500).json({
        error:
          "Tivemos algum problema nos nossos servidores. Por favor verifique se a id do projeto especificada é valida.",
        detailedError: error.message,
      });
    }
  }
);

module.exports = router;
