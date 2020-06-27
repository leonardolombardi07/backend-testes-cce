const mongoose = require("mongoose");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { uuid } = require("uuidv4");

const s3 = require("../services/awsStorage");
const Project = mongoose.model("Project");

const storage = multerS3({
  s3,
  bucket: require("../config/keys").awsBucket,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: "public-read",
  key: async (request, file, callback) => {
    const { id } = request.params;
    const { method } = request;

    // toDo: se for um PUT/PATCH, deletar imagem antiga do projeto
    let fileName = `${uuid()}`;
    if (method === "PUT" || method === "PATCH") {
      try {
        const project = await Project.findById(id);
        if (!project) {
          callback(null, fileName);
        }

        const oldLogoUrl = project?.logoUrl;
        const n = oldLogoUrl.lastIndexOf("/");
        fileName = oldLogoUrl.substring(n + 1);

        console.log(fileName);
        callback(null, fileName);
      } catch (error) {
        callback(false);
      }
    }

    callback(null, fileName);
  },
});

module.exports = (formDataName) => multer({ storage }).single(formDataName);
