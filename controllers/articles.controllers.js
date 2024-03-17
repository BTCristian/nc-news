const {
  fetchArticleById,
  fetchAllArticles,
  updateArticleVotes,
  insertNewArticle,
} = require("../models/articles.models");

const {
  checkTopicExist,
  checkAuthorExist,
  checkArticleExists,
} = require("../utils/checkExistence.utils");

module.exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getAllArticles = (req, res, next) => {
  const { sort_by, order, topic, author, limit, p } = req.query;

  const fetchArticlesQuery = fetchAllArticles(
    sort_by,
    order,
    topic,
    author,
    limit,
    p
  );

  const queries = [fetchArticlesQuery];

  if (topic) {
    const topicExistenceQuery = checkTopicExist(topic);
    queries.push(topicExistenceQuery);
  }

  if (author) {
    const authorExistenceQuery = checkAuthorExist(author);
    queries.push(authorExistenceQuery);
  }
  Promise.all(queries)
    .then((response) => {
      const articles = response[0];
      res.status(200).send({ articles: articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  const articleExistenceQuery = checkArticleExists(article_id);
  const updateVotesQuery = updateArticleVotes(article_id, inc_votes);
  const queries = [updateVotesQuery, articleExistenceQuery];
  Promise.all(queries)

    .then((response) => {
      const article = response[0];
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postNewArticle = (req, res, next) => {
  const { title, topic, author, body, article_img_url } = req.body;

  const topicExistenceQuery = checkTopicExist(topic);
  const authorExistenceQuery = checkAuthorExist(author);
  const insertArticleQuery = insertNewArticle(
    title,
    topic,
    author,
    body,
    article_img_url
  );
  const queries = [
    insertArticleQuery,
    authorExistenceQuery,
    topicExistenceQuery,
  ];

  Promise.all(queries)
    .then((response) => {
      const article = response[0];
      article.comment_count = 0;
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
