const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

function getSubscription(value) {
  subSchema = {};

  if (value.breakfast) {
    subSchema.breakfast.status.upcoming = false;
  }
  if (value.lunch) {
    subSchema.lunch.status.upcoming = false;
  }
  if (value.dinner) {
    subSchema.dinner.status.upcoming = false;
  }

  return subSchema;
}

function getCalender(value) {
  subSchema = {};

  if (value.breakfast) {
    subSchema.breakfast.status.upcoming = false;
  }
  if (value.lunch) {
    subSchema.lunch.status.upcoming = false;
  }
  if (value.dinner) {
    subSchema.dinner.status.upcoming = false;
  }

  return subSchema;
}

function getOrder(value) {
  subSchema = {};

  if (value.breakfast) {
    subSchema.breakfast.status.upcoming = false;
  }
  if (value.lunch) {
    subSchema.lunch.status.upcoming = false;
  }
  if (value.dinner) {
    subSchema.dinner.status.upcoming = false;
  }

  return subSchema;
}

function getKitchen(value) {
  let subSchema = {};

  subSchema.status.pending = false;

  return subSchema;
}

route.put("/", (req, res) => {
  const dateSchema = Joi.object({
    from: Joi.string(),
    to: Joi.string()
  });

  const schema = Joi.object().keys({
    id: Joi.string(),
    date: dateSchema
  });

  const { error, value } = Joi.validate(req.body.users, schema);

  if (error) {
    console.log("Post unsubscribe meal error", error);
    res.status(400).json({ error: { message: "Post unsubscribe meal error" } });
  } else {
    let fromDate = req.body.date.from.split("-")[2];
    let toDate = req.body.date.to.split("-")[2];
    let month = req.body.date.from.split("-")[1];
    let year = req.body.date.from.split("-")[0];

    let batch = db.batch();

    // subscription/////////////////////////////////////////

    let subscriptionData = getSubscription(req.body.users);

    let userSubscriptionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscription");

    let date = {};
    for (date = fromDate; date <= toDate; date++) {
      let userSubRefDoc = userSubscriptionRef.doc(`${date}${month}${year}`);

      batch.set(userSubRefDoc, { subscriptionData }, { merge: true });
    }

    //calender

    calenderData = getCalender(req.body.users);
    calenderRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("calender")
      .doc(month);

    // let date = {};
    for (date = fromDate; date <= toDate; date++) {
      // date = { ...date, ...calenderData };
      // batch.update(userCalenderDocRef, { calenderData });

      temp = `${date}.${calenderData}`;
      batch.update(userCalenderDocRef, { temp });
    }

    // order ////////////////////////////////////////////////

    let orderData = getOrder(req.body.users);

    let orderRef = db.collection("orders").doc(`${month}${year}`);

    batch.set(orderRef, {}, { merge: true });

    for (date = fromDate; date <= toDate; date++) {
      let orderDocRef = orderRef
        .collection(`${date}${month}${year}`)
        .doc(req.body.users.id);

      batch.update(orderDocRef, { orderData });
    }
    //kitchen////////////////////////////////////////
    userSector = req.body.users.address.area;

    kitchenData = getKitchen(req.body.users);

    let kitchenManagerDocRef = db
      .collection("kitchen")
      .where(`areaHandling.${userSector}`, "==", true);

    kitchenManagerDocRef
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
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
        return;
      })
      .catch(e => {
        console.log("error in unsubscribe kitchen");
        return res
          .status(400)
          .json({ error: { message: "error in unsubscribe kitchen " } });
      });

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
