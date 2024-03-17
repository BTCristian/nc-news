const db = require("../db/connection");

module.exports.fetchCommentsByArticleId = (id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id =$1 ORDER BY created_at DESC`,
      [id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

module.exports.insertComment = (username, body, id) => {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: missing some properties",
    });
  }
  return db
    .query(
      `INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3)
        RETURNING *;`,
      [body, username, id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

module.exports.removeCommentById = (id) => {
  return db.query(`DELETE FROM comments WHERE comment_id = $1`, [id]);
};

module.exports.updateCommentVotesById = (comment_id, inc_votes) => {
  const num = Number(inc_votes);
  if (!num) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: missing some properties OR inc_votes is not a integer",
    });
  }
  return db
    .query(
      `UPDATE comments 
        SET votes = comments.votes+$1 
        WHERE comment_id = $2
        RETURNING *;`,
      [num, comment_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};
