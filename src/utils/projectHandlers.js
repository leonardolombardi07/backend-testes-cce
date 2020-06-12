const keys = require("../config/keys");

exports.getValidFileNameFromString = ({ string }) => {
  const validFileName = string.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, "");
  return validFileName;
};

exports.getProjectLogoUrl = ({ projectLogo, projectName }) => {
  if (projectLogo) {
    const validFileName = this.getValidFileNameFromString({
      string: projectName,
    });
    return `${keys.staticImagesUrl}${validFileName}.png`;
  } else {
    return null;
  }
};

exports.createEditedProject = ({
  projectLogo,
  projectName,
  projectDescription,
  projectBugsReport,
}) => {
  const rawRequestObject = {
    projectName,
    projectDescription,
    projectBugsReport,
  };

  const editedProject = {};
  for (var property in rawRequestObject) {
    const value = rawRequestObject[property];
    if (value) {
      editedProject[property] = value;
    }
  }

  if (projectLogo) {
    editedProject["projectLogoUrl"] = this.getProjectLogoUrl({
      projectLogo,
      projectName,
    });
  }

  return editedProject;
};
