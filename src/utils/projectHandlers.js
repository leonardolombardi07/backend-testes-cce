exports.createEditedProject = ({ name, description, bugsReport, logoUrl }) => {
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

  if (logoUrl) {
    editedProject["logoUrl"] = logoUrl;
  }

  return editedProject;
};
