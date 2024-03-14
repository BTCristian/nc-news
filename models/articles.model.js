const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.article_id, articles.title, articles.author, articles.topic, articles.created_at, articles.votes, articles.article_img_url, articles.body, COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`,
      [article_id]
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

exports.selectArticles = (topic, sort_by = "created_at", order = "DESC") => {
  const validQueries = [
    "created_at",
    "article_id",
    "title",
    "author",
    "votes",
    "comment_count",
  ];

  if (!validQueries.includes(sort_by)) {
    return Promise.reject({ status: 404, message: "Invalid sort_by Query" });
  }

  let queryString = `SELECT articles.article_id, articles.title, articles.author, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url ,
COUNT(comments.comment_id) AS comment_count
FROM articles
LEFT JOIN comments ON articles.article_id = comments.article_id`;

  const queryParams = [];

  if (topic) {
    queryString += `  WHERE topic = $1`;
    queryParams.push(topic);
  }

  queryString += `
GROUP BY articles.article_id`;

  if (sort_by === "comment_count") {
    queryString += `
ORDER BY comment_count ${order};`;
  } else {
    queryString += `
ORDER BY articles.${sort_by} ${order};`;
  }

  return db.query(queryString, queryParams).then((results) => {
    return results.rows;
  });
};

exports.updateArticleById = (article_id, body) => {
  const { inc_votes } = body;

  if (Object.keys(body).length === 0) {
    return db
      .query(`SELECT * FROM articles WHERE article_id = ${article_id} `)
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
    UPDATE articles
  SET votes = votes + $1
  WHERE article_id = ${article_id} 
  RETURNING *`,
      [inc_votes]
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

exports.addArticle = (newArticle) => {
  const { author, title, body, topic, article_img_url } = newArticle;

  let queryString = `INSERT INTO articles (author, title, body, topic`;
  const queryParams = [author, title, body, topic];

  if (article_img_url) {
    queryString += ` , article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    queryParams.push(article_img_url);
  } else {
    queryString += `) VALUES ($1, $2, $3, $4) RETURNING *;`;
  }

  return db
    .query(queryString, queryParams)
    .then((result) => {
      return db.query(
        `SELECT articles.*, 
    COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id`,
        [result.rows[0].article_id]
      );
    })
    .then((result) => {
      return result.rows[0];
    });
};

exports.removeArticleById = (article_id) => {
  return db
    .query(`DELETE FROM comments WHERE article_id = $1 RETURNING *;`, [
      article_id,
    ])
    .then(() => {
      return db.query(
        `DELETE FROM articles WHERE article_id = $1 RETURNING *;`,
        [article_id]
      );
    })
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Article Does Not Exist",
        });
      }
    });
};
