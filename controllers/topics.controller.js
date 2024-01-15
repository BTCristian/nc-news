const { fetchAllTopics } = require("../models/topics.model");

exports.getAllTopics = (req, res, next) => {
  fetchAllTopics()
    .then((topic) => {
      res.status(200).send({ topic });
    })
    .catch((err) => {
      next(err);
    });
};
