const express = require("express");

require("./services/database");
const projectsRoutes = require("./routes/projectsRoutes");

const server = express();
server.use(express.json());
server.use(projectsRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});
