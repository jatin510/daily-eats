const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

route.post("/", (req, res) => {
  const schema = Joi.object().keys({
    id: Joi.string().required()
  });
});

module.exports = route;
