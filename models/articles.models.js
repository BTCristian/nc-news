const db = require("../db/connection");

module.exports.fetchArticleById = (id) => {
  return db
    .query(
      `SELECT articles.*, count(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id=comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id `,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article does not exist" });
      }
      return rows[0];
    });
};

module.exports.fetchAllArticles = (
  order_by = "created_at",
  orderWay = "desc",
  topic,
  author,
  limit = 10,
  p = 1
) => {
  const orderByAllowed = [
    "created_at",
    "author",
    "title",
    "article_id",
    "topic",
    "votes",
  ];
  const orderOptions = ["desc", "asc"];

  if (!orderByAllowed.includes(order_by)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  if (!orderOptions.includes(orderWay)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  const limitNumb = Number(limit);
  const pageNum = Number(p);

  if (typeof limitNumb !== "number") {
    limitNumb = 10;
  }
  if (typeof pageNum !== "number") {
    pageNum = 1;
  }

  let offsetVal = 0;
  if (pageNum > 1) {
    offsetVal = limitNumb * pageNum - limitNumb;
  }

  let queryStr = `SELECT
    articles.article_id,
        articles.title,
        articles.topic,
        articles.author,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        count(comments.article_id) AS comment_count,
        count(articles.article_id) AS total_count
        FROM articles LEFT JOIN comments ON articles.article_id=comments.article_id`;

  const queryParams = [];
  if (topic) {
    queryStr += " WHERE articles.topic = $1";
    queryParams.push(topic);
  }
  if (author) {
    queryStr += " WHERE articles.author = $1";
    queryParams.push(author);
  }

  queryStr += ` GROUP BY articles.article_id`;
  queryStr += ` ORDER BY ${order_by} ${orderWay}`;
  queryStr += ` LIMIT ${limitNumb} OFFSET ${offsetVal}`;
  return db.query(queryStr, queryParams).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "There is no more article yet",
      });
    }
    return result.rows;
  });
};

module.exports.updateArticleVotes = (id, votesIncr) => {
  const num = Number(votesIncr);
  if (!num) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: missing some properties OR inc_votes is not a integer",
    });
  }
  return db
    .query(
      `UPDATE articles 
        SET votes = articles.votes+$1 
        WHERE article_id = $2
        RETURNING *;`,
      [num, id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.insertNewArticle = (
  title,
  topic,
  author,
  body,
  article_img_url = "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
) => {
  if (!title || !topic || !author || !body) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: missing some properties",
    });
  }
  return db
    .query(
      `
    INSERT INTO articles (title, topic, author, body, votes, article_img_url) 
     VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;`,
      [title, topic, author, body, 0, article_img_url]
    )
    .then((result) => {
      return result.rows[0];
    });
};
