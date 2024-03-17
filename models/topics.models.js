const db = require("../db/connection");

module.exports.fetchAllTopics = () => {
  return db.query("SELECT * FROM topics").then((result) => {
    return result.rows;
  });
};
