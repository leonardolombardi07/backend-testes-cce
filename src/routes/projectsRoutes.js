const { Router, static } = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const requireAuth = require("../middlewares/requireAuth");
const handleLogo = require("../middlewares/handleLogo");

const { pathHandler } = require("../utils/pathHandlers");
const { createEditedProject } = require("../utils/projectHandlers");
const getAwsUrl = require("../utils/getAwsUrl");

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
  handleLogo("logoKey"),
  async (request, response) => {
    const { name, description, bugsReport } = request.body;

    if (!name || !description) {
      return response.status(401).json({
        error: "Por favor providencie um nome e uma descrição pro projeto.",
      });
    }

    try {
      const project = new Project({
        name,
        description,
        bugsReport,
        logoKey: request.file ? request.file.key : null,
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
  "/projects/:id",
  // requireAuth,
  handleLogo("logoKey"),
  async (request, response) => {
    const { id } = request.params;
    const { name, description, bugsReport } = request.body;

    if (!name) {
      return response
        .status(401)
        .json({ error: "Por favor providencie um nome pro projeto." });
    }

    const editedProject = createEditedProject({
      name,
      description,
      bugsReport,
      logoKey: request.file ? request.file.key : null,
    });

    try {
      const project = await Project.findOneAndUpdate(
        { _id: id },
        editedProject,
        { new: true }
      );

      if (!project) {
        return response.status(400).json({
          error: "Não conseguimos encontrar o projeto com a id especificada.",
        });
      }

      response.status(202).json(project);
    } catch (error) {
      response.status(500).json({
        error:
          "Tivemos algum problema nos nossos servidores. Por favor tente novamente mais tarde.",
        detailedError: error.message,
      });
    }
  }
);

router.get("/projects/:logoKey", async (request, response) => {
  const { logoKey } = request.params;

  try {
    const awsImageUrl = getAwsUrl(logoKey);
    const { data } = await axios.get(awsImageUrl);

    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({
      error:
        "Tivemos algum problema nos nossos servidores. Por favor tente novamente mais tarde.",
      detailedError: error.message,
    });
  }
});

module.exports = router;
