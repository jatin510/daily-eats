const route = require("express").Router();

// route.get("/", (req, res) => {
//   res.get("admin api index");
// });

route.use("/", require("../index"));
route.use("/admins", require("./addAdmin.js"));
route.use("/menu", require("./menu.js"));
route.use("/upcomingmeal", require("./upcomingMeal.js"));
route.use("/addkitchens", require("./addKitchenManager"));
route.use("/adddeliveryboys", require("./addDeliveryBoy.js"));

exports = module.exports = route;
