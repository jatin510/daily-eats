const route = require("express").Router();

route.use("/assigndeliveryboy", require("./assigningDeliveryBoy.js"));

module.exports = route;
