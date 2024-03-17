const commentsRouter = require("express").Router();
const {
  deleteCommentById,
  patchCommentsVotes,
} = require("../controllers/comment.controllers");

commentsRouter
  .route("/:comment_id")
  .delete(deleteCommentById)
  .patch(patchCommentsVotes);

module.exports = commentsRouter;
