const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

route.use(express.json());

route.post("/", (req, res) => {
  // const schema = {};
  // const { error, value } = Joi.validate(req.body.deliveryBoy, schema);

  error = false;

  if (error) {
    console.log("Post status changing schema error", error.details[0].message);
    return res.status(400).json({
      error: {
        message: `Post status changing schema error , ${
          error.details[0].message
        }`
      }
    });
  } else {
    //update delivery status
  }
});
