const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.use(express.json());
route.post("/", (req, res) => {
  //Code to add vacation

  const nestedDates = Joi.object({
    from: Joi.number(),
    to: Joi.number()
  });
  const vacationSchema = Joi.object().keys({
    id: Joi.string(),
    date: nestedDates
  });

  const { error, value } = Joi.validate(req.body, vacationSchema);

  if (error) {
    console.log("Post Add Vacation error", error);
    return res
      .status(400)
      .json({ error: { message: "Error post add vacation " } });
  } else {
    return db
      .collection("users")
      .doc(req.body.id)
      .update({});
  }
});

exports = module.exports = route;
