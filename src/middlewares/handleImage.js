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
    // toDo: se for um PUT/PATCH, deletar imagem antiga do projeto
    const fileName = `${uuid()}`;
    callback(null, fileName);
  },
});

module.exports = (formDataName) => multer({ storage }).single(formDataName);
