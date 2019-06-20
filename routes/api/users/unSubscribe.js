const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.put("/", async (req, res) => {
  const dateSchema = Joi.object({
    from: Joi.string(),
    to: Joi.string()
  });

  const schema = Joi.object().keys({
    id: Joi.string(),
    breakfast: Joi.boolean(),
    lunch: Joi.boolean(),
    dinner: Joi.boolean(),
    date: dateSchema
  });

  const { error, value } = Joi.validate(req.body.users, schema);

  if (error) {
    console.log("Post unsubscribe meal schema validation error", error);
    res
      .status(403)
      .json({ error: { message: "unsubscribe meal schema error " } });
  } else {
    let fromDate = req.body.date.fromDate;
    let toDate = req.body.date.toDate;

    let batch = db.batch();

    //////////   user subscriptions ///////////////////////////////////////////////////

    console.log("starting batch of  user unSubscription");

    let userSubscriptionsRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscriptions");

    let d = {};

    for (d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      let data = d.toLocaleDateString().split("/")[0];
      let month = d.toLocaleDateString().split("/")[1];
      let year = d.toLocaleDateString().split("/")[2];
      let day = d.toDateString().split(" ")[0];

      //ignore the day
      //
      //
      //
      // will complete it later on

      let userSubscriptionsDocRef = users;
    }

    ///////////   completed user subscriptions ////////////////

    ///////////   user calendar ///////////////////////////////
    //
    //
    ///////////   completed ser calendar //////////////////////////
  }
  //end
});

exports = module.exports = route;
