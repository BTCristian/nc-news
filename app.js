const express = require("express");
const {} = require("./controllers/articles.controller");
const {} = require("./controllers/comments.controller");
const { getAllTopics } = require("./controllers/topics.controller");
const {} = require("./controllers/users.controllers");
const endpoints = require("./endpoints.json");
const { end } = require("./db/connection");

const app = express();

app.get("/api", (req, res) => {
  res.json(endpoints);
});

app.get("/api/topics", getAllTopics);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
