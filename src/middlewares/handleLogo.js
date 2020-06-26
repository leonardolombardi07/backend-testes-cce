const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../services/awsStorage");

const path = require("path");
const { uuid } = require("uuidv4");

const mongoose = require("mongoose");
const Project = mongoose.model("Project");

const storageTypes = {
  local: multer.diskStorage({
    destination: (request, file, callback) => {
      callback(null, path.resolve(__dirname, "..", "data", "images"));
    },
    filename: async (request, file, callback) => {
      const { id } = request.params;

      if (!id) {
        file.location = `${uuid()}.png`;
        return callback(null, file.location);
      }

      try {
        const project = await Project.findById(id);
        if (!project?.logoUrl) {
          file.location = `${uuid()}.png`;
          return callback(null, file.location);
        }

        file.location = project.logoUrl;
        callback(null, file.location);
      } catch (error) {
        callback(null, "Something went wrong.");
      }
    },
  }),
  aws: multerS3({
    s3,
    bucket: require("../config/keys").awsBucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: async (request, file, callback) => {
      const { id } = request.params;

      if (!id) {
        const fileName = `${uuid()}`;
        return callback(null, fileName);
      }

      try {
        const project = await Project.findById(id);

        if (!project) {
          throw new Error(
            "Não conseguimos encontrar o projeto com a id especificada."
          );
        }

        const fileName = project?.logoUrl
          ? project.logoUrl.slice(59, -1)
          : `${uuid()}`;
        callback(null, fileName);
      } catch (error) {
        callback(error, null);
      }
    },
  }),
};

const type = process.env.NODE_ENV === "production" ? "aws" : "local";
const storage = storageTypes["aws"]; // mudar "aws" pra type
module.exports = (formDataName) => multer({ storage }).single(formDataName);
