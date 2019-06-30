const route = require("express").Router();

route.use("/", require("../index"));
route.use("/admins", require("./addAdmin.js"));
route.use("/menu", require("./menu.js"));
route.use("/upcomingmeal", require("./upcomingMeal.js"));
route.use("/addkitchens", require("./addKitchenManager"));
route.use("/adddeliveryboys", require("./addDeliveryBoy.js"));
route.use("/forgetpassword", require("./forgetPassword.js"));

exports = module.exports = route;
