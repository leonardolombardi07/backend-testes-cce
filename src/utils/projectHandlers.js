const keys = require("../config/keys");

exports.getValidFileNameFromString = ({ string }) => {
  const validFileName = string.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, "");
  return validFileName;
};

exports.createEditedProject = ({ name, description, bugsReport, logoKey }) => {
  const rawRequestObject = {
    name,
    description,
    bugsReport,
  };

  const editedProject = {};
  for (var property in rawRequestObject) {
    const value = rawRequestObject[property];
    if (value) {
      editedProject[property] = value;
    }
  }

  if (logoKey) {
    editedProject["logoKey"] = logoKey;
  }

  return editedProject;
};
