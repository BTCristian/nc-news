const fs = require("fs/promises");

module.exports.fetchAllEndpoints = () => {
  return fs.readFile("./endpoints.json", "utf8").then((result) => {
    return JSON.parse(result);
  });
};
