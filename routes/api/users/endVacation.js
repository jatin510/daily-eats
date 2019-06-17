const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.use(express.json());

function getCalenderData(value) {
  let subSchema = {};

  subSchema.breakfast.status.vacation = false;
  subSchema.lunch.status.vacation = false;
  subSchema.dinner.status.vacation = false;

  return subSchema;
}

function getSubscriptionData(value) {
  let subSchema = {};

  subSchema.breakfast.status.vacation = false;
  subSchema.lunch.status.vacation = false;
  subSchema.dinner.status.vacation = false;

  return subSchema;
}

function getOrderData(value) {
  let subSchema = {};
  subSchema.breakfast.status.upcoming = true;
  subSchema.lunch.status.upcoming = true;
  subSchema.dinner.status.upcoming = true;
  return subSchema;
}

function getKitchenData(value) {
  let subSchema = {};

  subSchema.status.pending = true;

  return subSchema;
}

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

  const { error, value } = Joi.validate(req.body.users, endVacationSchema);

  if (error) {
    console.log("Put End Vacation, Error", error);
    return res
      .status(400)
      .json({ error: { message: "Error adding address", code: "" } });
  } else {
    let fromDate = req.body.date.from.split("-")[2];
    let toDate = req.body.date.to.split("-")[2];
    let month = req.body.date.from.split("-")[1];
    let year = req.body.date.from.split("-")[0];

    let batch = db.batch();

    // user calender /////////////////////////////////////////////////
    let calenderData = getCalenderData(req.body.users);

    let userCalenderDocRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("calender")
      .doc(`${month}${year}`);
    let date = {};

    for (date = fromDate; date <= toDate; i++) {
      date = { ...date, ...calenderData };
      batch.update(userCalenderDocRef, { date });
    }
    // user subscription /////////////////////////////////

    let subscriptionData = getSubscriptionData(req.body.users);
    let userSubCollectionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscription");

    let date = {};

    for (date = fromDate; date <= toDate; date++) {
      let userSubDocRef = userSubCollectionRef.doc(`${date}${month}${year}`);

      batch.update(userSubDocRef, { subscriptionData });
    }

    //order Ref

    let orderData = getOrderData(req.body.users);

    let orderRef = db.collection("orders").doc(`${month}${year}`);

    for (date = fromDate; date <= toDate; date++) {
      let orderDocRef = orderRef
        .collection(`${date}${month}${year}`)
        .doc(req.body.users.id);

      batch.update(orderDocRef, { orderData });
    }

    // kitchen Ref

    userSector = req.body.users.address.area;

    kitchenData = getKitchen(req.body.users);

    let kitchenManagerDocRef = db
      .collection("kitchen")
      .where(`areaHandling.${userSector}`, "==", true);

    kitchenManagerDocRef.get().then(snapshot => {
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
    });

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
