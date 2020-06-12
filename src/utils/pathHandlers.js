const path = require("path");

exports.pathHandler = ({ givenPath }) => path.join(__dirname, givenPath);
