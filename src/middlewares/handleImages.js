const multer = require("multer");
const { pathHandler } = require("../utils/pathHandlers");
const { getValidFileNameFromString } = require("../utils/projectHandlers");

const fileFilter = (request, file, callback) => {
  const type = file.mimetype;
  if (type === "image/png") {
    callback(null, true);
  } else {
    const error = new Error("The required file extension must be png");
    callback(null, error);
  }
};

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, pathHandler({ givenPath: "../data/images" }));
  },
  filename: (request, file, callback) => {
    const { projectName } = request.body;

    if (!projectName) {
      const error = new Error("Please provide a project name.");
      return callback(error);
    }

    const formattedProjectName = getValidFileNameFromString({
      string: projectName,
    });
    const localFilePath = formattedProjectName + ".png";
    callback(null, localFilePath);
  },
});

module.exports = (formDataName) =>
  multer({ storage, fileFilter }).single(formDataName);
