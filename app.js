const express = require("express");
const { getAllTopics } = require("./controllers/topics.controller");
const endpoints = require("./endpoints.json");
const {
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
} = require("./controllers/articles.controller");

const app = express();
app.use(express.json());

app.get("/api", (req, res) => {
  res.json(endpoints);
});

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticleById);

app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res
      .status(400)
      .send({ msg: "Bad request, invalid article_id/not a number" });
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

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Endpoint Invalid/Not Found" });
});

module.exports = app;
