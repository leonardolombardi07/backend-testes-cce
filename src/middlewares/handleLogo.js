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
        file.key = `${uuid()}.png`;
        return callback(null, file.key);
      }

      try {
        const project = await Project.findById(id);
        file.key = project.logoKey;
        callback(null, file.key);
      } catch (error) {
        callback(null, "something");
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
        const fileName = project.logoKey;
        callback(null, fileName);
      } catch (error) {
        callback(error, null);
      }
    },
  }),
};

const type = process.env.NODE_ENV === "production" ? "aws" : "local";
const storage = storageTypes[type];
module.exports = (formDataName) => multer({ storage }).single(formDataName);
