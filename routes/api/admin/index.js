const route = require("express").Router();

// route.use("/", require("../index"));
route.use("/admins", require("./addAdmin.js"));
route.use("/menu", require("./menu.js"));
route.use("/upcomingmeals", require("./upcomingMeal.js"));
route.use("/addkitchenmanager", require("./addKitchenManager"));
route.use("/adddeliveryboys", require("./addDeliveryBoy.js"));
route.use("/forgetpassword", require("./forgetPassword.js"));

module.exports = route;
