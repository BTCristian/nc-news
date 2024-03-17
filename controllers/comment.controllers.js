const {
  fetchCommentsByArticleId,
  insertComment,
  removeCommentById,
  updateCommentVotesById,
} = require("../models/comment.models");
const {
  checkArticleExists,
  checkCommentExist,
  checkUsernameExist,
} = require("../utils/checkExistence.utils");

module.exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  const fetchCommentsQuery = fetchCommentsByArticleId(article_id);
  const articleExistenceQuery = checkArticleExists(article_id);
  const queries = [fetchCommentsQuery, articleExistenceQuery];
  Promise.all(queries)
    .then((response) => {
      const comments = response[0];
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  const usernameExistenceQuery = checkUsernameExist(username);
  const articleExistenceQuery = checkArticleExists(article_id);
  const insertCommentsQuery = insertComment(username, body, article_id);
  const queries = [
    insertCommentsQuery,
    articleExistenceQuery,
    usernameExistenceQuery,
  ];
  Promise.all(queries)

    .then((response) => {
      const comment = response[0];
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  const commentExistence = checkCommentExist(comment_id);
  const deleteCommentQuery = removeCommentById(comment_id);
  const queries = [deleteCommentQuery, commentExistence];

  Promise.all(queries)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentsVotes = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  const commentExistenceQuery = checkCommentExist(comment_id);
  const updateCommentVotesQuery = updateCommentVotesById(comment_id, inc_votes);
  const queries = [updateCommentVotesQuery, commentExistenceQuery];
  Promise.all(queries)
    .then((response) => {
      const comment = response[0];
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
