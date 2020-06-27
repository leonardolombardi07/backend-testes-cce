const express = require("express");
const { connectToDatabase } = require("./services/database");

const server = express();
server.use(require("cors")());
server.use(express.json());
server.use(require("helmet")());
server.use(require("compression")());

server.use(require("./routes/authRoutes"));
server.use(require("./routes/projectsRoutes"));

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Servidor inicializado na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Algum erro ocorreu na conexão com o servidor");
  });
