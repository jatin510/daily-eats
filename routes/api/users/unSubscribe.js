const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

function getSubscriptions(value) {
  subSchema = {};

  if (value.breakfast) {
    console.log("inside breakfast");
    subSchema.breakfast = {};
    subSchema.breakfast.status = {};
    subSchema.breakfast.status.upcoming = false;
  }
  if (value.lunch) {
    subSchema.lunch = {};
    subSchema.lunch.status = {};
    subSchema.lunch.status.upcoming = false;
  }
  if (value.dinner) {
    subSchema.dinner = {};
    subSchema.dinner.status = {};
    subSchema.dinner.status.upcoming = false;
  }

  return subSchema;
}

function getCalendar(value) {
  subSchema = {};

  if (value.breakfast) {
    subSchema.breakfast = {};
    subSchema.breakfast.status = {};
    subSchema.breakfast.status.upcoming = false;
  }
  if (value.lunch) {
    subSchema.lunch = {};
    subSchema.lunch.status = {};
    subSchema.lunch.status.upcoming = false;
  }
  if (value.dinner) {
    subSchema.dinner = {};
    subSchema.dinner.status = {};
    subSchema.dinner.status.upcoming = false;
  }

  return subSchema;
}

route.post("/", async (req, res) => {
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
    let fromDate = req.body.users.date.from;
    let toDate = req.body.users.date.to;

    console.log("from date", fromDate);
    console.log("to date", toDate);

    console.log("from");

    let batch = db.batch();

    //////////   user existing subscriptions /////////////////////////

    console.log("deleting subscription");

    let existingSubscriptionDocRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("existingSubscription")
      .doc("existingSubscriptionDoc");

    batch.delete(existingSubscriptionDocRef);

    //////////   user subscriptions ///////////////////////////////////////////////////

    console.log("starting batch of  user unSubscription");

    let subscriptionsData = getSubscriptions(req.body.users);

    let userSubscriptionsRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscriptions");

    let d;
    toDate = new Date(toDate);

    console.log(subscriptionsData);

    console.log("outside for lop");
    for (d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      let date = d.getDate();
      let month = d.getMonth() + 1;
      let year = d.getFullYear();
      let day = d.toDateString().split(" ")[0];

      // for proper formatting
      if (date < 10) {
        date = "0" + date;
      }
      if (month < 10) {
        month = "0" + month;
      }

      let userSubDocRef = userSubscriptionsRef.doc(`${date}${month}${year}`);

      batch.set(userSubDocRef, subscriptionsData, { merge: true });
    }

    console.log("completed batch of  user unSubscription");

    ///////////   completed user subscriptions ////////////////

    ///////////   user calendar ///////////////////////////////
    console.log("starting batch of  user unSubscription calendar");

    let calendarData = getCalendar(req.body.users);
    console.log(calendarData);

    for (d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      let date = d.getDate();
      let month = d.getMonth() + 1;
      let year = d.getFullYear();
      let day = d.toDateString().split(" ")[0];

      // for proper formatting
      if (date < 10) {
        date = "0" + date;
      }
      if (month < 10) {
        month = "0" + month;
      }

      let calendarRef = db
        .collection("users")
        .doc(req.body.users.id)
        .collection("calendar")
        .doc(`${month}${year}`);

      batch.set(calendarRef, { [date]: calendarData }, { merge: true });
    }
    console.log("completed batch of  user unSubscription calendar");

    ///////////   completed user calendar //////////////////////////

    /////// starting batch commit  //////////////////////////

    return batch
      .commit()
      .then(val => {
        console.log(val);
        console.log("Successfully batched unSubscription");
        return res.status(200).send({
          res: {
            message: "User successfully unsubscribed the meal",
            code: "310"
          }
        });
      })
      .catch(e => {
        console.log("unsubscribing the meal error");
        res.status(403).send({
          error: {
            message: "Unsubscribing the meal batch error",
            code: "311"
          }
        });
      });

    ///// batch committed ////////
  }
  //end
});

exports = module.exports = route;
