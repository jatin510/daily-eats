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

    let batch = db.batch();

    //calender Ref
    let userCalenderRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("calender")
      .doc();

    batch.set(userCalenderRef, {}, { merge: true });

    // subscription Ref

    let userSubRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("subscription")
      .doc();

    batch.set(userSubRef, {}, { merge: true });

    //order Ref

    let orderRef = db.collection("orders").doc();

    batch.set(orderRef, {}, { merge: true });

    // kitchen Ref

    let kitchenRef = db.collection("kitchen").doc();

    batch.set(kitchenRef, {}, { merge: true });

    // batch commit
    return batch
      .commit()
      .then(() => {
        console.log("Successfully batched endvacation");
        return res
          .status(400)
          .send({ message: "Successfully batched endvacation" });
      })
      .catch(error => {
        console.log("endvacation batch error");
        res.status(403).send({ error: { message: "endvacation batch error" } });
      });
  }
});

exports = module.exports = route;
