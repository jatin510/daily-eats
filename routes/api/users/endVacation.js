const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.use(express.json());

route.get("/", (req, res) => {
  res.send("End Vacation");
});

route.put("/", (req, res) => {
  //Code to end vacation

  nestedDateSchema = Joi.object().keys({
    from: Joi.string().required,
    to: Joi.string().required
  });

  endVacationSchema = Joi.object().keys({
    id: Joi.string().required,
    date: nestedDateSchema
  });

  const { error, value } = Joi.validate(req.body, endVacationSchema);

  if (error) {
    console.log("Put End Vacation, Error", error);
    return res.status(400).json({ error: { message: "Error adding address" } });
  } else {
    // logic for date
    //
    //
    // logic for date

    return db
      .collection("users")
      .doc(req.body.id)
      .collection("subscription")
      .update
      //login
      //to
      //update
      //the endVacation Table
      ()
      .then(val => {
        console.log("Ended vacation successfully");
        return res.status(200).json({
          res: { address: value, message: "Address successfully added" }
        });
      })
      .catch(e => {
        console.log("Add Address error ", e);
        return res.status(400).json({ error: "Add address error" });
      });
  }
});

exports = module.exports = route;
