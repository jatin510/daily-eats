const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.put("/", (req, res) => {
  const dateSchema = Joi.object({
    from: Joi.string(),
    to: Joi.string()
  });

  const schema = Joi.object().keys({
    date: dateSchema
  });

  const { error, value } = Joi.validate(req.body, schema);

  if (error) {
    console.log("Post unsubscribe meal error", error);
    res.status(400).json({ error: { message: "Post unsubscribe meal error" } });
  } else {
    let batch = db.batch();

    // subscription

    subDoc = req.body.date.from; // incomplete

    let subRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("subscription")
      .doc(subdoc)
      .get();

    subRef.forEach(() => {});

    //calender
    calenderRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("calender");

    batch.set(calenderRef, {}, { merge: true });

    // order
    orderRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("calender");

    batch.set(orderRef, {}, { merge: true });

    //kitchen
    kitchenRef = db.collection("kitchen");

    batch.set(kitchenRef, {}, { merge: true });

    //batch commit
    return batch
      .commit()
      .then(() => {
        console.log("Successfully batched unsubscribed");
        return res
          .status(400)
          .send({ message: "Successfully batched unsubscribed" });
      })
      .catch(error => {
        console.log("unsubscribe batch error");
        res.status(403).send({ error: { message: "unsubscribe batch error" } });
      });
  }
});

route.get("/", (req, res) => {
  res.send("unsubscribe");
});

module.exports = route;
