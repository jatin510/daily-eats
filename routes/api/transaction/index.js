const route = require("express").Router();
const Razorpay = require("razorpay");

let instance = new Razorpay({
  key_id: "",
  key_secret: ""
});

module.exports = route;
