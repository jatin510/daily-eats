const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");
const Validator = require("validatorjs");

function getSubscriptions(value) {
  var subSchema = {};

  if (value.breakfast) {
    //breakfast schema
    subSchema.breakfast = {};
    subSchema.breakfast.address = {};
    subSchema.breakfast.address.coordinates = {};
    subSchema.breakfast.status = {};

    if (value.breakfast.lite) subSchema.breakfast.lite = true;
    if (value.breakfast.full) subSchema.breakfast.full = true;
    subSchema.breakfast.address.id = value.breakfast.address.id;
    subSchema.breakfast.address.tag = value.breakfast.address.tag;
    subSchema.breakfast.address.coordinates.latitude =
      value.breakfast.address.coordinates.latitude;
    subSchema.breakfast.address.coordinates.longitude =
      value.breakfast.address.coordinates.longitude;
    subSchema.breakfast.address.address1 = value.breakfast.address.address1;
    subSchema.breakfast.address.address2 = value.breakfast.address.address2;
    subSchema.breakfast.address.area = value.breakfast.address.area;
    subSchema.breakfast.address.city = value.breakfast.address.city;
    subSchema.breakfast.price = value.breakfast.price;
    subSchema.breakfast.quantity = value.breakfast.quantity;
    if (subSchema.breakfast.quantity !== 0) {
      subSchema.breakfast.status.upcoming = true;
    } else {
      subSchema.breakfast.status.upcoming = false;
    }
  }
  if (value.lunch) {
    // lunch schema
    subSchema.lunch = {};
    subSchema.lunch.address = {};
    subSchema.lunch.address.coordinates = {};
    subSchema.lunch.status = {};

    if (value.lunch.lite) subSchema.lunch.lite = true;
    if (value.lunch.full) subSchema.lunch.full = true;
    subSchema.lunch.address.id = value.lunch.address.id;
    subSchema.lunch.address.tag = value.lunch.address.tag;
    subSchema.lunch.address.coordinates.latitude =
      value.lunch.address.coordinates.latitude;
    subSchema.lunch.address.coordinates.longitude =
      value.lunch.address.coordinates.longitude;
    subSchema.lunch.address.address1 = value.lunch.address.address1;
    subSchema.lunch.address.address2 = value.lunch.address.address2;
    subSchema.lunch.address.area = value.lunch.address.area;
    subSchema.lunch.address.city = value.lunch.address.city;
    subSchema.lunch.price = value.lunch.price;
    subSchema.lunch.quantity = value.lunch.quantity;
    if (subSchema.lunch.quantity !== 0) {
      subSchema.lunch.status.upcoming = true;
    } else {
      subSchema.lunch.status.upcoming = false;
    }
  }
  if (value.dinner) {
    //dinner schema
    subSchema.dinner = {};
    subSchema.dinner.address = {};
    subSchema.dinner.address.coordinates = {};
    subSchema.dinner.status = {};

    if (value.dinner.lite) subSchema.dinner.lite = true;
    if (value.dinner.full) subSchema.dinner.full = true;
    subSchema.dinner.address.id = value.dinner.address.id;
    subSchema.dinner.address.tag = value.dinner.address.tag;
    subSchema.dinner.address.coordinates.latitude =
      value.dinner.address.coordinates.latitude;
    subSchema.dinner.address.coordinates.longitude =
      value.dinner.address.coordinates.longitude;
    subSchema.dinner.address.address1 = value.dinner.address.address1;
    subSchema.dinner.address.address2 = value.dinner.address.address2;
    subSchema.dinner.address.area = value.dinner.address.area;
    subSchema.dinner.address.city = value.dinner.address.city;
    subSchema.dinner.price = value.dinner.price;
    subSchema.dinner.quantity = value.dinner.quantity;
    if (subSchema.dinner.quantity !== 0) {
      subSchema.dinner.status.upcoming = true;
    } else {
      subSchema.dinner.status.upcoming = false;
    }
  }

  return subSchema;
}

function getCalender(value) {
  var calenderSchema = {};

  //breakfast

  if (value.breakfast) {
    calenderSchema.breakfast = {};
    calenderSchema.breakfast.status = {};

    let address = "";
    address += `${value.breakfast.address.address1}  `;
    address += `,${value.breakfast.address.address2} `;
    address += `,${value.breakfast.address.area}`;
    address += `,${value.breakfast.address.city}`;

    calenderSchema.fullAddress = address;
    if (value.breakfast.quantity !== 0)
      calenderSchema.breakfast.status.upcoming = false;
    else calenderSchema.breakfast.status.upcoming = true;

    calenderSchema.breakfast.price = value.breakfast.price;

    if (value.breakfast.lite) calenderSchema.breakfast.lite = true;
    if (value.breakfast.full) calenderSchema.breakfast.full = true;
  }
  //lunch

  if (value.lunch) {
    calenderSchema.lunch = {};
    calenderSchema.lunch.status = {};

    let address = "";
    address += `${value.lunch.address.address1}  `;
    address += `,${value.lunch.address.address2} `;
    address += `,${value.lunch.address.area}`;
    address += `,${value.lunch.address.city}`;

    calenderSchema.fullAddress = address;
    if (value.lunch.quantity !== 0)
      calenderSchema.lunch.status.upcoming = false;
    else calenderSchema.lunch.status.upcoming = true;

    calenderSchema.lunch.price = value.lunch.price;

    if (value.lunch.lite) calenderSchema.lunch.lite = true;
    if (value.lunch.full) calenderSchema.lunch.full = true;
  }

  // dinner
  if (value.dinner) {
    calenderSchema.dinner = {};
    calenderSchema.dinner.status = {};

    let address = "";
    address += `${value.dinner.address.address1}  `;
    address += `,${value.dinner.address.address2} `;
    address += `,${value.dinner.address.area}`;
    address += `,${value.dinner.address.city}`;

    calenderSchema.fullAddress = address;
    if (value.dinner.quantity !== 0)
      calenderSchema.dinner.status.upcoming = false;
    else calenderSchema.dinner.status.upcoming = true;

    calenderSchema.dinner.price = value.dinner.price;

    if (value.dinner.lite) calenderSchema.dinner.lite = true;
    if (value.dinner.full) calenderSchema.dinner.full = true;
  }

  return calenderSchema;
}

function getOrder(value) {
  var orderSchema = {};

  if (value.breakfast) {
    //breakfast
    orderSchema.breakfast = {};
    orderSchema.breakfast.address = {};
    orderSchema.breakfast.address.coordinates = {};
    orderSchema.breakfast.status = {};

    orderSchema.breakfast.address.tag = value.breakfast.address.tag;
    orderSchema.breakfast.address.coordinates.latitude =
      value.breakfast.address.coordinates.latitude;
    orderSchema.breakfast.address.coordinates.longitude =
      value.breakfast.address.coordinates.longitude;
    orderSchema.breakfast.address.address1 = value.breakfast.address.address1;
    orderSchema.breakfast.address.address2 = value.breakfast.address.address2;
    orderSchema.breakfast.address.area = value.breakfast.address.area;
    orderSchema.breakfast.address.city = value.breakfast.address.city;

    if (value.breakfast.quantity !== 0)
      orderSchema.breakfast.status.upcoming = true;
    else orderSchema.breakfast.status.upcoming = false;

    orderSchema.breakfast.price = value.breakfast.price;
    if (value.breakfast.lite) orderSchema.breakfast.lite = true;
    if (value.breakfast.full) orderSchema.breakfast.full = true;
  }
  if (value.lunch) {
    //lunch
    orderSchema.lunch = {};
    orderSchema.lunch.address = {};
    orderSchema.lunch.address.coordinates = {};
    orderSchema.lunch.status = {};

    orderSchema.lunch.address.tag = value.lunch.address.tag;
    orderSchema.lunch.address.coordinates.latitude =
      value.lunch.address.coordinates.latitude;
    orderSchema.lunch.address.coordinates.longitude =
      value.lunch.address.coordinates.longitude;
    orderSchema.lunch.address.address1 = value.lunch.address.address1;
    orderSchema.lunch.address.address2 = value.lunch.address.address2;
    orderSchema.lunch.address.area = value.lunch.address.area;
    orderSchema.lunch.address.city = value.lunch.address.city;

    if (value.lunch.quantity !== 0) orderSchema.lunch.status.upcoming = true;
    else orderSchema.lunch.status.upcoming = false;

    orderSchema.lunch.price = value.lunch.price;
    if (value.lunch.lite) orderSchema.lunch.lite = true;
    if (value.lunch.full) orderSchema.lunch.full = true;
  }
  if (value.dinner) {
    //dinner
    orderSchema.dinner = {};
    orderSchema.dinner.address = {};
    orderSchema.dinner.address.coordinates = {};
    orderSchema.dinner.status = {};

    orderSchema.dinner.address.tag = value.dinner.address.tag;
    orderSchema.dinner.address.coordinates.latitude =
      value.dinner.address.coordinates.latitude;
    orderSchema.dinner.address.coordinates.longitude =
      value.dinner.address.coordinates.longitude;
    orderSchema.dinner.address.address1 = value.dinner.address.address1;
    orderSchema.dinner.address.address2 = value.dinner.address.address2;
    orderSchema.dinner.address.area = value.dinner.address.area;
    orderSchema.dinner.address.city = value.dinner.address.city;

    if (value.dinner.quantity !== 0) orderSchema.dinner.status.upcoming = true;
    else orderSchema.dinner.status.upcoming = false;

    orderSchema.dinner.price = value.dinner.price;
    if (value.dinner.lite) orderSchema.dinner.lite = true;
    if (value.dinner.full) orderSchema.dinner.full = true;
  }

  return orderSchema;
}

function getKitchen(value) {
  let subSchema = {};
  subSchema.status = {};

  subSchema.status.pending = true;

  return subSchema;
}

route.put("/", (req, res) => {
  //Code to add subscription

  let schema = new Validator({
    date: {
      from: "required",
      to: "required"
    },
    users: {
      subscription: {
        breakfast: {
          address: {
            tag: "string",
            coordinates: {
              longitude: "string",
              latitude: "string"
            },
            address1: "string",
            address2: "string",
            area: "string",
            city: "string"
          },
          price: "string",
          quantity: "string",
          ignore: {
            Mon: "boolean",
            Tue: "boolean",
            Wed: "boolean",
            Thu: "boolean",
            Fri: "boolean",
            Sat: "boolean",
            Sun: "boolean"
          }
        },
        lunch: {
          address: {
            tag: "string",
            coordinates: {
              longitude: "string",
              latitude: "string"
            },
            address1: "string",
            address2: "string",
            area: "string",
            city: "string"
          },
          price: "string",
          quantity: "string",
          ignore: {
            Mon: "boolean",
            Tue: "boolean",
            Wed: "boolean",
            Thu: "boolean",
            Fri: "boolean",
            Sat: "boolean",
            Sun: "boolean"
          }
        },
        dinner: {
          address: {
            tag: "string",
            coordinates: {
              longitude: "string",
              latitude: "string"
            },
            address1: "string",
            address2: "string",
            area: "string",
            city: "string"
          },
          price: "string",
          quantity: "string",
          ignore: {
            Mon: "boolean",
            Tue: "boolean",
            Wed: "boolean",
            Thu: "boolean",
            Fri: "boolean",
            Sat: "boolean",
            Sun: "boolean"
          }
        }
      }
    }
  });

  // const value = schema.passes();
  const error = false;

  if (error) {
    console.log("Post Subscription Error", error);
    return res
      .status(400)
      .json({ error: { message: "Post subscription error", code: "" } });
  } else {
    let fromDate = req.body.date.from.split("-")[2];
    let toDate = req.body.date.to.split("-")[2];
    let month = req.body.date.from.split("-")[1];
    let year = req.body.date.from.split("-")[0];

    let batch = db.batch();

    // user subscription ////////////////////////////////////////////////////////////////////////////////////
    console.log("starting batch of user subscription");

    let subscriptionData = getSubscriptions(req.body.users.subscription);

    let userSubscriptionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscription");

    let date = {};
    for (date = fromDate; date <= toDate; date++) {
      //check for the day of the week

      let day = new Date(`${year}-${month}-${date}`).toString().split(" ")[0];

      if (req.body.users.subscription.ignore) {
        if (req.body.users.subscription.ignore.day) continue;
        console.log("ignore the day");
      }

      let userSubRefDoc = userSubscriptionRef.doc(`${date}${month}${year}`);
      console.log("subscription", subscriptionData);
      // console.log(`subscription", ${...subscriptionData}`);

      batch.set(userSubRefDoc, subscriptionData, { merge: true });
    }

    console.log("subscription schema is handled");

    //user calender//////////////////////////////////////////////////////////////////////////////////////////////////
    console.log("starting batch of user calender");

    let calenderData = getCalender(req.body.users.subscription);

    console.log(`${month}${year}`);
    let userCalenderDocRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("calender")
      .doc(`${month}${year}`);

    console.log("able to open document");
    // let date = {};
    for (date = fromDate; date <= toDate; date++) {
      let day = new Date(`${year}-${month}-${date}`).toString().split(" ")[0];

      if (req.body.users.subscription.ignore) {
        if (req.body.users.subscription.ignore.day) continue;
        console.log("ignore the day");
      }

      batch.set(userCalenderDocRef, { [date]: calenderData }, { merge: true });
    }

    console.log("calender schema is handled");

    // order/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log("starting batch of collection order");

    let orderData = getOrder(req.body.users.subscription);

    let orderRef = db.collection("orders").doc(`${month}${year}`);

    for (date = fromDate; date <= toDate; date++) {
      let day = new Date(`${year}-${month}-${date}`).toString().split(" ")[0];

      if (req.body.users.subscription.ignore) {
        if (req.body.users.subscription.ignore.day) continue;
        console.log("ignore the day");
      }

      let orderDocRef = orderRef
        .collection(`${date}${month}${year}`)
        .doc(req.body.users.id);

      batch.set(orderDocRef, { [date]: orderData }, { merge: true });
    }

    console.log("order schema is handled");

    //kitchen Manager///////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log("starting batch of collection kitchen");

    // breakfast

    let kitchenData = getKitchen();

    if (req.body.users.subscription.breakfast) {
      userSector = req.body.users.subscription.breakfast.address.area;

      console.log(userSector);

      let kitchenManagerDocRef = db
        .collection("kitchen")
        .where(`areaHandling.${userSector}`, "==", true);

      kitchenManagerDocRef
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            console.log("kitchen checking the sector", doc.data());
            let id = doc.id;
            console.log(id);
            let deliveryRef = db
              .collection("kitchen")
              .doc(id)
              .collection("deliveries");
            let date = {};
            for (date = fromDate; date <= toDate; date++) {
              let breakfast = deliveryRef
                .doc(`${date}${month}${year}`)
                .collection("breakfast")
                .doc(req.body.users.id);

              batch.set(breakfast, { kitchenData }, { merge: true });
            }
          });
          return console.log("Successful subscribe breakfast kitchen");
        })
        .catch(e => {
          console.log("error in subscribe kitchen ", e);
          return res.status(400).json({
            error: { message: "error in subscription kitchen", code: "" }
          });
        });
    }

    // lunch
    if (req.body.users.subscription.lunch) {
      userSector = req.body.users.subscription.lunch.address.area;

      let kitchenManagerDocRef = db
        .collection("kitchen")
        .where(`areaHandling.${userSector}`, "==", true);

      kitchenManagerDocRef
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            id = doc.id;
            let deliveryRef = db
              .collection("kitchen")
              .doc(id)
              .collection("deliveries");
            let date = {};
            for (date = fromDate; date <= toDate; date++) {
              let lunch = deliveryRef
                .doc(`${date}${month}${year}`)
                .collection("lunch")
                .doc(req.body.users.id);

              batch.set(lunch, { kitchenData }, { merge: true });
            }
          });
          return console.log("Successful subscribe lunch kitchen");
        })
        .catch(e => {
          console.log("error in subscribe kitchen ", e);
          return res.status(400).json({
            error: { message: "error in subscription kitchen", code: "" }
          });
        });
    }

    // dinner
    if (req.body.users.subscription.dinner) {
      userSector = req.body.users.subscription.dinner.address.area;

      let kitchenManagerDocRef = db
        .collection("kitchen")
        .where(`areaHandling.${userSector}`, "==", true);

      kitchenManagerDocRef
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            let id = doc.id;
            let deliveryRef = db
              .collection("kitchen")
              .doc(id)
              .collection("deliveries");
            let date = {};
            for (date = fromDate; date <= toDate; date++) {
              let dinner = deliveryRef
                .doc(`${date}${month}${year}`)
                .collection("dinner")
                .doc(req.body.users.id);

              batch.set(dinner, { kitchenData }, { merge: true });
            }
          });
          return console.log("Successful subscribe dinner kitchen");
        })
        .catch(e => {
          console.log("error in subscribe kitchen ", e);
          return res.status(400).json({
            error: { message: "error in subscription kitchen", code: "" }
          });
        });
    }

    console.log("kitchen manager completed");
    //batch commit//////////////////////////////////////
    return batch
      .commit()
      .then(() => {
        console.log("Successfully batched subscribed");
        return res
          .status(400)
          .send({ message: "Successfully batched subscribed" });
      })
      .catch(error => {
        console.log("subscribe batch error");
        res.status(403).send({ error: { message: "subscribe batch error" } });
      });
  }
});

exports = module.exports = route;
