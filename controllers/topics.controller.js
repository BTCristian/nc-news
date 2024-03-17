const { fetchAllTopics } = require("../models/topics.models");
module.exports.getAllTopics = (req, res, next) => {
  fetchAllTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};
