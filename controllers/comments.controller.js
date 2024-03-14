const {
  selectComments,
  addComment,
  removeCommentById,
  updateCommentById,
} = require("../models/comments.model");

const { checkArticleExists } = require("./utils/checkArticleExists");

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;

  let { limit, page } = req.query;

  const queries = [selectComments(article_id), checkArticleExists(article_id)];

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
      const comments = response[0].slice(start, end);
      res.status(200).send({ total_count, comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;

  addComment(article_id, newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  removeCommentById(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};

exports.patchCommentsById = (req, res, next) => {
  const { comment_id } = req.params;
  const body = req.body;

  updateCommentById(comment_id, body)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};
