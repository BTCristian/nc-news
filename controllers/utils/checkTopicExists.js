const db = require("../../db/connection");

exports.checkTopicExists = (topic) => {
  return db
    .query(
      `
    SELECT * FROM topics WHERE slug = $1
    `,
      [topic]
    )
    .then((results) => {
      if (results.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Topic Does Not Exist" });
      }
    });
};
