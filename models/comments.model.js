const db = require("../db/connection");
const {
  checkArticleExists,
} = require("../controllers/utils/checkArticleExists");

exports.selectComments = (article_id) => {
  return db
    .query(
      "SELECT * FROM comments WHERE comments.article_id = $1 ORDER BY comments.created_at DESC;",
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.addComment = (article_id, newComment) => {
  const { username, body } = newComment;
  return db
    .query(
      `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;`,
      [username, body, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Article Does Not Exist",
        });
      }

      return result.rows[0];
    });
};

exports.removeCommentById = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *;", [
      comment_id,
    ])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Comment Does Not Exist",
        });
      }
    });
};

exports.updateCommentById = (comment_id, body) => {
  const { inc_votes } = body;

  if (Object.keys(body).length === 0) {
    return db
      .query(`SELECT * FROM comments WHERE comment_id = ${comment_id} `)
      .then((result) => {
        return result.rows[0];
      });
  }
  if (!inc_votes) {
    return Promise.reject({ status: 400, message: "Invalid Patch Query" });
  }

  return db
    .query(
      `
    UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = ${comment_id} 
  RETURNING *`,
      [inc_votes]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Comment Does Not Exist",
        });
      }
      return result.rows[0];
    });
};
