const express = require("express");
const {} = require("./controllers/articles.controller");
const {} = require("./controllers/comments.controller");
const { getAllTopics } = require("./controllers/topics.controller");
const {} = require("./controllers/users.controllers");

const app = express();

app.use(express.json());

app.get("/api/topics", getAllTopics);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;

// Should:
// be available on endpoint /api/topics.
// get all topics.

// Responds with:
// an array of topic objects, each of which should have the following properties:
// slug
// description
// As this is the first endpoint, you will need to set up your testing suite.
