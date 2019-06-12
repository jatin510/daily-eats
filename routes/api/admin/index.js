const route = require("express").Router();

route.get("/", (req, res) => {
  res.get("admin api index");
});

module.exports = route;
