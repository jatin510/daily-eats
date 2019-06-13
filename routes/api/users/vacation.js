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
    let batch = db.batch();

    // user calender
    let userCalenderRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("calender");

    batch.set(userCalenderRef, {}, { merge: true });

    // user subscription
    let userSubRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("subscription")
      .doc();

    batch.set(userSubRef, {}, { merge: true });

    // order

    let orderRef = db
      .collection("orders")
      .doc()
      .collection("users");
    batch.set(orderRef, {}, { merge: true });

    // kitchen
    let kitchenRef = db.collection("orders").doc();
    batch.set(kitchenRef, {}, { merge: true });

    batch
      .commit()
      .then(() => {
        console.log("Successfully batched vacation");
        return res
          .status(400)
          .send({ message: "Successfully batched vacation" });
      })
      .catch(e => {
        console.log("error adding vacation", e);
        return res.status(400).send("Error adding vacation");
      });
  }
});

exports = module.exports = route;
