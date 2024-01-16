const express = require("express");
const { getAllTopics } = require("./controllers/topics.controller");
const endpoints = require("./endpoints.json");
const {
  getArticleById,
  getAllArticles,
} = require("./controllers/articles.controller");

const app = express();

app.get("/api", (req, res) => {
  res.json(endpoints);
});

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles);

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request, invalid id/not a number" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
