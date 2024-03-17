const { fetchAllEndpoints } = require("../models/endpoints.models");

module.exports.getEndpoints = (req, res, next) => {
  fetchAllEndpoints()
    .then((instructions) => {
      res.status(200).send({ instructions });
    })
    .catch((err) => {
      console.log(err);
    });
};
