const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.use(express.json());

function getCalenderData(value) {
  let subSchema = {};
  subSchema.breakfast = {};
  subSchema.breakfast.status = {};
  subSchema.lunch = {};
  subSchema.lunch.status = {};
  subSchema.dinner = {};
  subSchema.dinner.status = {};

  subSchema.breakfast.status.vacation = true;
  subSchema.lunch.status.vacation = true;
  subSchema.dinner.status.vacation = true;

  return subSchema;
}

function getSubscriptionData(value) {
  let subSchema = {};
  subSchema.breakfast = {};
  subSchema.breakfast.status = {};
  subSchema.lunch = {};
  subSchema.lunch.status = {};
  subSchema.dinner = {};
  subSchema.dinner.status = {};

  subSchema.breakfast.status.vacation = true;
  subSchema.lunch.status.vacation = true;
  subSchema.dinner.status.vacation = true;

  return subSchema;
}

function getOrderData(value) {
  let subSchema = {};
  subSchema.breakfast = {};
  subSchema.breakfast.status = {};
  subSchema.lunch = {};
  subSchema.lunch.status = {};
  subSchema.dinner = {};
  subSchema.dinner.status = {};

  subSchema.breakfast.status.upcoming = false;
  subSchema.lunch.status.upcoming = false;
  subSchema.dinner.status.upcoming = false;
  return subSchema;
}

function getKitchen(value) {
  let subSchema = {};
  subSchema.status = {};

  subSchema.status.pending = false;

  return subSchema;
}

route.post("/", async (req, res) => {
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
    let fromDate = req.body.date.from.split("-")[2];
    let toDate = req.body.date.to.split("-")[2];
    let month = req.body.date.from.split("-")[1];
    let year = req.body.date.from.split("-")[0];

    let batch = db.batch();

    /////////// user calender /////////////////////////////////////////////////////////////////////////////////////

    console.log("vacation calender starting");
    let calenderData = getCalenderData(req.body.users);

    let userCalenderDocRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("calender")
      .doc(`${month}${year}`);
    let date = {};

    for (date = fromDate; date <= toDate; i++) {
      batch.set(userCalenderDocRef, { [date]: calenderData }, { merge: true });
    }
    console.log("vacation calender ended");

    // user subscription ///////////////////////////////////////////////////////
    console.log("vacation subscription starting");

    let subscriptionData = getSubscriptionData(req.body.users);

    let userSubCollectionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscription");

    for (date = fromDate; date <= toDate; date++) {
      let userSubDocRef = userSubCollectionRef.doc(`${date}${month}${year}`);

      batch.set(userSubDocRef, subscriptionData, { merge: true });
    }
    console.log("vacation subscription ended");

    // order /////////////////////////////////////////////////
    console.log("order vacation starting");

    let orderData = getOrderData(req.body.users);

    let orderRef = db.collection("orders").doc(`${month}${year}`);

    for (date = fromDate; date <= toDate; date++) {
      let orderDocRef = orderRef
        .collection(`${date}${month}${year}`)
        .doc(req.body.users.id);

      batch.set(orderDocRef, { [date]: orderData }, { merge: true });
    }
    console.log("vacation order ended");

    /////////kitchen //////////////////////////////////////

    kitchenData = getKitchen(req.body.users);

    let kitchenManagerDocRef = await db
      .collection("kitchen")
      .where(`areaHandling.${userSector}`, "==", true)
      .get();

    kitchenManagerDocRef.forEach(doc => {
      let deliveryRef = doc.collection("deliveries");
      date = {};
      for (date = fromDate; date <= toDate; date++) {
        let breakfast = deliveryRef
          .doc(`${day}${month}${year}`)
          .collection("breakfast")
          .doc(req.body.users.id);

        batch.update(breakfast, { kitchenData });

        let lunch = deliveryRef
          .doc(`${day}${month}${year}`)
          .collection("lunch")
          .doc(req.body.users.id);

        batch.update(lunch, { kitchenData });

        let dinner = deliveryRef
          .doc(`${day}${month}${year}`)
          .collection("dinner")
          .doc(req.body.users.id);

        batch.update(dinner, { kitchenData });
      }
    });

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
