const {
  selectArticleById,
  selectArticles,
  updateArticleById,
  addArticle,
  removeArticleById,
} = require("../models/articles.model");
const { checkTopicExists } = require("./utils/checkTopicExists");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order } = req.query;
  let { limit, page } = req.query;
  const queries = [selectArticles(topic, sort_by, order)];

  if (topic) {
    const topicExists = checkTopicExists(topic);
    queries.push(topicExists);
  }
  if (limit === undefined) {
    limit = 10;
  }

  if (page === undefined) {
    page = 1;
  }

  Promise.all(queries)
    .then((response) => {
      const start = (page - 1) * limit;
      const end = page * limit;

      const total_count = response[0].length;
      const articles = response[0].slice(start, end);
      res.status(200).send({ total_count, articles });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const body = req.body;

  updateArticleById(article_id, body)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postArticles = (req, res, next) => {
  const newArticle = req.body;

  addArticle(newArticle)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;

  removeArticleById(article_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
