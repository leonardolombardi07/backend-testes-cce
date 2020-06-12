const fs = require("mz/fs");

exports.checkFileExistence = async ({ filePath }) => {
  try {
    const file = await fs.access(filePath);
    return file;
  } catch (error) {
    throw error;
  }
};
