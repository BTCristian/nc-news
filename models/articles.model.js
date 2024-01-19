const db = require("../db/connection");

exports.fetchArticleById = (article_id) => {
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
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;
    `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length !== 0) {
        return rows[0];
      }
      return Promise.reject({
        status: 404,
        msg: "Article ID not found",
      });
    });
};

exports.fetchAllArticles = (topic) => {
  let queryString = `
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
  `;
  if (topic) {
    (queryString += `
    WHERE articles.topic = $1
    `),
      [topic];
  }

  queryString += `
  GROUP BY
    articles.article_id
  ORDER BY
    articles.created_at DESC
    `;
  return db.query(queryString, topic ? [topic] : []).then((results) => {
    if (results.rows.length === 0) {
      return db
        .query(
          `
        SELECT * FROM topics
        WHERE topics.slug = $1
        `,
          [topic]
        )
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({
              status: 404,
              msg: `No articles found with topic: ${topic}`,
            });
          }
          return [];
        });
    }
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

//to be refactored considering insert query error
// (both article_id and author are foreign keys REFERENCING other tables.
//   So you don't need to do any manual checking that they exist,
//   you can use the one POST query and if they don't exist PSQL
//   will throw an error automatically.)
// from here:
// vvv
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

//to here ^^^

exports.updateArticleVotes = (article_id, inc_votes) => {
  return db.query(
    `
      UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *
      `,
    [inc_votes, article_id]
  );
};

exports.deleteCommentById = (comment_id) => {
  return db
    .query(
      `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *
    `,
      [comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment with provided ID not found",
        });
      }
    });
};
