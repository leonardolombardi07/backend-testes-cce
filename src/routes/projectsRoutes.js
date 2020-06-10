const { Router } = require("express");

const router = Router();

router.get("/projects", (request, response) => {
  response.json({ projects: "Send the projects" });
});

module.exports = router;
