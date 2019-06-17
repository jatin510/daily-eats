const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.use(express.json());

function getCalenderData(value) {
  let subSchema = {};

  subSchema.status.vacation = true;

  return subSchema;
}

function getSubscriptionData(value) {
  let subSchema = {};

  subSchema.breakfast.status.upcoming = false;
  subSchema.lunch.status.upcoming = false;
  subSchema.dinner.status.upcoming = false;

  return subSchema;
}

function getOrderData(value) {
  let subSchema = {};
  subSchema.breakfast.status.upcoming = false;
  subSchema.lunch.status.upcoming = false;
  subSchema.dinner.status.upcoming = false;
  return subSchema;
}

function getKitchenData(value) {
  let subSchema = {};

  subSchema;
}

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

  const { error, value } = Joi.validate(req.body.users, vacationSchema);

  if (error) {
    console.log("Post Add Vacation error", error);
    return res
      .status(400)
      .json({ error: { message: "Error post add vacation " } });
  } else {
    let batch = db.batch();

    /////////// user calender /////////////////////////////////////////////////////////////////////////////////////

    let calenderData = getCalenderData(req.body);

    let year = req.body.users.date.from.split("-")[0];
    let month = req.body.users.date.from.split("-")[1];
    let monthYear = [...month, ...year].join("");
    let fromDate = req.body.users.date.from.split("-")[2];
    let toDate = req.body.users.date.from.split("-")[2];

    //have to correct date
    let userCalenderDocRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("calender")
      .doc(monthYear);
    let date = {};

    for (date = fromDate; date <= toDate; i++) {
      date = { ...date, ...calenderData };

      batch.update(userCalenderDocRef, { temp });
    }

    // user subscription ///////////////////////////////////////////////////////
    let subscriptionData = getSubscriptionData(req.body);
    let userSubCollectionRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("subscription");

    let fromDateMonthYear = req.body.users.date.from.split("-");
    let toDateMonthYear = req.body.users.date.from.split("-");

    let date = {};
    //have to correct date
    for (date = fromDateMonthYear; date <= toDateMonthYear; date++) {
      let userSubDocRef = userSubCollectionRef.doc(date);
      batch.update(userSubDocRef, { subscriptionData });
    }

    // order /////////////////////////////////////////////////

    //have to correct date
    let orderData = getOrderData(req.body);

    let orderRef = db.collection("orders");

    for (date = fromDateMonthYear; (date = toDateMonthYear); date++) {
      orderRef
        .doc(date)
        .collection("users")
        .doc(req.body.users.id);

      // let data = `breakfast.${orderData}`;
      batch.update(orderRef, { data });
      let data = `lunch.${orderData}`;
      batch.update(orderRef, { data });
      let data = `dinner.${orderData}`;
      batch.update(orderRef, { data });
    }

    // kitchen /////////////////////////////////////////////
    let userSector = db.collection('users').doc(req.body.users.id).collection('address')
    let kitchenRef = db.collection("kitchen").where(`areaHandling.${}`,"==",true).get()

    kitchenRef.
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
