const db = require("../db/connection");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `
    SELECT * 
    FROM articles
    WHERE article_id = $1
    `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length !== 0) {
        return rows[0];
      }
      return Promise.reject({
        status: 404,
        msg: "Id not found",
      });
    });
};

exports.fetchAllArticles = () => {
  return db
    .query(
      `
    SELECT
      articles.author,
      articles.title,
      articles.article_id,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
    COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN
      comments ON articles.article_id = comments.article_id
    GROUP BY
      articles.article_id
    ORDER BY
      articles.created_at DESC;    
    `
    )
    .then((results) => {
      return results.rows;
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      `
  SELECT *
  FROM comments
  WHERE article_id = $1
  ORDER BY created_at DESC
  `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return db
          .query(
            `
        SELECT * FROM articles 
        WHERE article_id = $1`,
            [article_id]
          )
          .then(({ rows }) => {
            if (rows.length === 0) {
              return Promise.reject({
                status: 404,
                msg: "Article ID not found",
              });
            }
            return [];
          });
      }
      return rows;
    });
};

const checkIfUserExists = (author) => {
  return db
    .query(
      `
      SELECT * FROM users 
      WHERE username = $1
      `,
      [author]
    )
    .then(({ rows }) => {
      return rows.length > 0;
    });
};

const checkIfArticleExists = (article_id) => {
  return db
    .query(
      `
      SELECT * FROM articles 
      WHERE article_id = $1
      `,
      [article_id]
    )
    .then(({ rows }) => {
      return rows.length > 0;
    });
};

exports.insertComment = ({ article_id, author, body }) => {
  const checkUser = checkIfUserExists(author);
  const checkArticle = checkIfArticleExists(article_id);

  return Promise.all([checkUser, checkArticle]).then((data) => {
    if (!data[0]) {
      return Promise.reject({ status: 400, msg: "User not found" });
    }
    if (!data[1]) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }

    return db
      .query(
        `
    INSERT INTO comments (article_id, author, body)
    VALUES ($1,$2,$3)
    RETURNING *
    `,
        [article_id, author, body]
      )
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Article ID not found" });
        }
        return rows[0];
      });
  });
};
