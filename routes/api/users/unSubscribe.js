const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

function getSubscription(value) {
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

function getCalender(value) {
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

function getOrder(value) {
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

function getKitchen(value) {
  let subSchema = {};
  subSchema.status = {};
  subSchema.status.pending = false;

  return subSchema;
}

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
    console.log("Post unsubscribe meal error", error);
    res.status(400).json({ error: { message: "Post unsubscribe meal error" } });
  } else {
    let fromDate = req.body.date.from.split("-")[2];
    let toDate = req.body.date.to.split("-")[2];
    let month = req.body.date.from.split("-")[1];
    let year = req.body.date.from.split("-")[0];

    let batch = db.batch();

    // subscription/////////////////////////////////////////
    console.log("user unsubscribing collection starting");

    let subscriptionData = getSubscription(req.body.users);

    let userSubscriptionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscriptions");

    let date = {};
    for (date = fromDate; date <= toDate; date++) {
      let userSubRefDoc = userSubscriptionRef.doc(`${date}${month}${year}`);

      batch.set(userSubRefDoc, subscriptionData, { merge: true });
    }
    console.log("user unsubscribing collection ending");

    //calender/////////////////////////////////////////////////////////////////////
    console.log("user calender unsubscribing starting");

    let calenderData = getCalender(req.body.users);
    calenderRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("calender")
      .doc(`${month}${year}`);

    for (date = fromDate; date <= toDate; date++) {
      // temp = `${date}.${calenderData}`;
      // batch.update(userCalenderDocRef, { temp });

      batch.set(calenderRef, { [date]: calenderData }, { merge: true });
    }

    console.log("user calender unsubscribing ending");

    // order ////////////////////////////////////////////////

    console.log("order unsubscribing starting");

    let orderData = getOrder(req.body.users);

    let orderRef = db.collection("orders").doc(`${month}${year}`);

    for (date = fromDate; date <= toDate; date++) {
      let orderDocRef = orderRef
        .collection(`${date}${month}${year}`)
        .doc(req.body.users.id);

      batch.set(orderDocRef, orderData, { merge: true });
    }

    console.log("order unsubscribing ending");

    //kitchen/////////////////////////////////////////////////

    console.log("kitchen unsubscribing starting");

    // kitchenData = getKitchen(req.body.users);

    // userKitchen = db.collection("users").doc("");

    // let kitchenManagerDocRef = await db
    //   .collection("kitchens")
    //   .where(`areaHandling.${userSector}`, "==", true)
    //   .get();

    // kitchenManagerDocRef;
    // forEach(doc => {
    //   id = doc.id;

    //   let deliveryRef = db
    //     .collection("kitchens")
    //     .doc(id)
    //     .collection("deliveries");

    //   let date = {};
    //   for (date = fromDate; date <= toDate; date++) {
    //     let breakfast = deliveryRef
    //       .doc(`${day}${month}${year}`)
    //       .collection("breakfast")
    //       .doc(req.body.users.id);

    //     batch.set(breakfast, { kitchenData }, { merge: true });

    //     let lunch = deliveryRef
    //       .doc(`${day}${month}${year}`)
    //       .collection("lunch")
    //       .doc(req.body.users.id);

    //     batch.set(lunch, { kitchenData }, { merge: true });

    //     let dinner = deliveryRef
    //       .doc(`${day}${month}${year}`)
    //       .collection("dinner")
    //       .doc(req.body.users.id);

    //     batch.set(dinner, { kitchenData }, { merge: true });
    //   }
    // });

    // console.log("kitchen unsubscribing finished");

    //breakfast////////////////////////
    if (req.body.users.subscriptions.breakfast) {
      let kitchenData = getKitchen(req.body.users.subscriptions.breakfast);

      let userRef = db
        .collection("users")
        .doc(req.body.users.id)
        .collection("subscriptions");
      for (date = fromDate; date <= toDate; date++) {
        let userKitchen = userRef.doc(`${date}${month}${year}`).get();

        userKitchen = userKitchen.forEach(doc => {
          if (!doc.exists) return console.log("Document does not exist");

          return doc.data().breakfast.kitchen.id;
        });

        let deliveryRef = db
          .collection("kitchen")
          .doc(userKitchen)
          .collection("deliveries");

        let breakfast = deliveryRef
          .doc(`${date}${month}${year}`)
          .collection("breakfast")
          .doc(req.body.users.id);

        batch.set(breakfast, kitchenData, { merge: true });
      }
    }

    //lunch ///////////////////////////////////
    if (req.body.users.subscriptions.lunch) {
      let kitchenData = getKitchen(req.body.users.subscriptions.lunch);

      let userRef = db
        .collection("users")
        .doc(req.body.users.id)
        .collection("subscriptions");
      for (date = fromDate; date <= toDate; date++) {
        let userKitchen = userRef.doc(`${date}${month}${year}`).get();

        userKitchen = userKitchen.forEach(doc => {
          if (!doc.exists) return console.log("Document does not exist");

          return doc.data().lunch.kitchen.id;
        });

        let deliveryRef = db
          .collection("kitchen")
          .doc(userKitchen)
          .collection("deliveries");

        let lunch = deliveryRef
          .doc(`${date}${month}${year}`)
          .collection("lunch")
          .doc(req.body.users.id);

        batch.set(lunch, kitchenData, { merge: true });
      }
    }

    //dinner /////////////////////////////////////////////////
    if (req.body.users.subscriptions.dinner) {
      let kitchenData = getKitchen(req.body.users.subscriptions.dinner);

      let userRef = db
        .collection("users")
        .doc(req.body.users.id)
        .collection("subscriptions");
      for (date = fromDate; date <= toDate; date++) {
        let userKitchen = userRef.doc(`${date}${month}${year}`).get();

        userKitchen = userKitchen.forEach(doc => {
          if (!doc.exists) return console.log("Document does not exist");

          return doc.data().dinner.kitchen.id;
        });

        let deliveryRef = db
          .collection("kitchen")
          .doc(userKitchen)
          .collection("deliveries");

        let dinner = deliveryRef
          .doc(`${date}${month}${year}`)
          .collection("dinner")
          .doc(req.body.users.id);

        batch.set(dinner, kitchenData, { merge: true });
      }
    }

    //batch commit /////////////////////////////////////////////////////////
    return batch
      .commit()
      .then(() => {
        console.log("Successfully batched unsubscribed");
        return res.status(400).send({
          res: { message: "User Successfully unsubscribed the meal" }
        });
      })
      .catch(error => {
        console.log("unsubscribe batch error");
        res
          .status(403)
          .send({ error: { message: "unsubscribe batch error", code: "202" } });
      });
  }
});

route.get("/", (req, res) => {
  res.send("unsubscribe");
});

module.exports = route;
