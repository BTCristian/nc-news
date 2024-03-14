const { selectUsers, selectByUsername } = require("../models/users.model");

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getByUsername = (req, res, next) => {
  const { username } = req.params;

  selectByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};
