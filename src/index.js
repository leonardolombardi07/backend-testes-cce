const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

require("./services/database");
const authRoutes = require("./routes/authRoutes");
const projectsRoutes = require("./routes/projectsRoutes");

const server = express();
server.use(cors());
server.use(helmet());
server.use(compression());

server.use(express.json());
server.use(authRoutes);
server.use(projectsRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});
