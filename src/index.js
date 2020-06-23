const express = require("express");
require("./services/database");

const server = express();
server.use(require("cors")());
server.use(express.json());
server.use(require("helmet")());
server.use(require("compression")());

server.use(require("./routes/authRoutes"));
server.use(require("./routes/projectsRoutes"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});
