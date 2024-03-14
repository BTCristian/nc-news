const db = require("../db/connection");
const fs = require("fs/promises");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((results) => {
    return results.rows;
  });
};

exports.selectEndpoints = () => {
  return fs.readFile("endpoints.json", "utf8").then((results) => {
    return JSON.parse(results);
  });
};

exports.addTopic = (newTopic) => {
  const { slug, description } = newTopic;

  let queryString = `INSERT INTO topics (slug`;
  const queryParams = [slug];

  if (description) {
    queryString += ` , description) VALUES ($1, $2) RETURNING *;`;
    queryParams.push(description);
  } else {
    queryString += ` ) VALUES ($1) RETURNING *`;
  }

  return db.query(queryString, queryParams).then((result) => {
    return result.rows[0];
  });
};
