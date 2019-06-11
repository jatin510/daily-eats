const route = require("express").Router();

// route.post("/users", require("./routes/api/"));

route.post("/users", (req, res) => {
  res.send("chal gyi");
});
route.use("/users/:id", require("./user"));
route.use("/admin", require("./admin"));

route.get("/", (req, res) => {
  res.send(" api index");
});
exports = module.exports = route;
