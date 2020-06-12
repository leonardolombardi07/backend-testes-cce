const keys = require("../config/keys");

exports.getQueryParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const createEditedProjectObject = ({ orginalProjectName }) => {
  const oldProjectName = orginalProjectName;
  const formattedProjectName = getValidFileNameFromString({
    string: projectName || oldProjectName,
  });

  const requestObject = {
    projectName,
    projectLogoUrl: projectLogo
      ? `${keys.staticImagesUrl}${formattedProjectName}.png`
      : null,
    projectDescription,
    projectBugsReport,
  };

  let editedDataObject = {};
  for (var requestItem in requestObject) {
    if (requestObject[requestItem]) {
      editedProject[requestItem] = requestObject[requestItem];
    }
  }

  return editedDataObject;
};
