const route = require("express");

route.get("/", (req, res) => {
  res.get("admin api index");
});

module.exports = route;
