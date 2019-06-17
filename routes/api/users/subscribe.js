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
    if (value.breakfast.meal.lite) subSchema.breakfast.meal = "lite";
    if (value.breakfast.meal.full) subSchema.breakfast.meal = "full";
    subSchema.breakfast.address.id = value.breakfast.address.id;
    subSchema.breakfast.address.tag = value.breakfast.address.tag;
    subSchema.breakfast.address.coordinates.latitude =
      value.breakfast.address.coordinates.latitude;
    subSchema.breakfast.address.coordinates.longitude =
      value.breakfast.address.coordinates.longitude;
    subSchema.breakfast.address.address1 = value.breakfast.address.address1;
    subSchema.breakfast.address.address2 = value.breakfast.address.address2;
    subSchema.breakfast.address.area = value.breakfast.address.area;
    subSchema.breakfast.address.city = value.breakfast.city;
    subSchema.breakfast.price = value.breakfast.price;
    subSchema.breakfast.quantity = value.breakfast.quantity;
    if (subSchema.breakfast.quantity != 0) {
      subSchema.breakfast.status.upcoming = true;
    } else {
      subSchema.breakfast.status.upcoming = false;
    }
  }
  if (value.lunch) {
    if (value.lunch.meal.lite) subSchema.lunch.meal = "lite";
    if (value.lunch.meal.full) subSchema.lunch.meal = "full";
    subSchema.lunch.address.id = value.lunch.address.id;
    subSchema.lunch.address.tag = value.lunch.address.tag;
    subSchema.lunch.address.coordinates.latitude =
      value.lunch.address.coordinates.latitude;
    subSchema.lunch.address.coordinates.longitude =
      value.lunch.address.coordinates.longitude;
    subSchema.lunch.address.address1 = value.lunch.address.address1;
    subSchema.lunch.address.address2 = value.lunch.address.address2;
    subSchema.lunch.address.area = value.lunch.address.area;
    subSchema.lunch.address.city = value.lunch.city;
    subSchema.lunch.price = value.lunch.price;
    subSchema.lunch.quantity = value.lunch.quantity;
    if (subSchema.lunch.quantity != 0) {
      subSchema.lunch.status.upcoming = true;
    } else {
      subSchema.lunch.status.upcoming = false;
    }
  }
  if (value.dinner) {
    if (value.dinner.meal.lite) subSchema.dinner.meal = "lite";
    if (value.dinner.meal.full) subSchema.dinner.meal = "full";
    subSchema.dinner.address.id = value.dinner.address.id;
    subSchema.dinner.address.tag = value.dinner.address.tag;
    subSchema.dinner.address.coordinates.latitude =
      value.dinner.address.coordinates.latitude;
    subSchema.dinner.address.coordinates.longitude =
      value.dinner.address.coordinates.longitude;
    subSchema.dinner.address.address1 = value.dinner.address.address1;
    subSchema.dinner.address.address2 = value.dinner.address.address2;
    subSchema.dinner.address.area = value.dinner.address.area;
    subSchema.dinner.address.city = value.dinner.city;
    subSchema.dinner.price = value.dinner.price;
    subSchema.dinner.quantity = value.dinner.quantity;
    if (subSchema.dinner.quantity != 0) {
      subSchema.dinner.status.upcoming = true;
    } else {
      subSchema.dinner.status.upcoming = false;
    }
  }

  return subSchema;
}

function getCalender(value) {
  var calenderSchema = {};

  if (value.breakfast) {
    let address = "";
    address += `${value.breakfast.address1}  `;
    address += `,${value.breakfast.address2} `;
    address += `,${value.breakfast.area}`;
    address += `,${value.breakfast.city}`;

    calenderSchema.fullAddress = address;
    if (value.breakfast.quantity != 0)
      calenderSchema.breakfast.status.upcoming = false;
    else calenderSchema.breakfast.status.upcoming = true;

    calenderSchema.price = value.subscription.breakfast.price;

    if (value.breakfast.meal.lite) calenderSchema.breakfast.meal = "lite";
    if (value.breakfast.meal.full) calenderSchema.breakfast.meal = "full";
  }
  if (value.lunch) {
    let address = "";
    address += `${value.lunch.address1}  `;
    address += `,${value.lunch.address2} `;
    address += `,${value.lunch.area}`;
    address += `,${value.lunch.city}`;

    calenderSchema.fullAddress = address;
    if (value.lunch.quantity != 0) calenderSchema.lunch.status.upcoming = false;
    else calenderSchema.lunch.status.upcoming = true;

    calenderSchema.price = value.subscription.lunch.price;

    if (value.lunch.meal.lite) calenderSchema.lunch.meal = "lite";
    if (value.lunch.meal.full) calenderSchema.lunch.meal = "full";
  }
  if (value.dinner) {
    let address = "";
    address += `${value.dinner.address1}  `;
    address += `,${value.dinner.address2} `;
    address += `,${value.dinner.area}`;
    address += `,${value.dinner.city}`;

    calenderSchema.fullAddress = address;
    if (value.dinner.quantity != 0)
      calenderSchema.dinner.status.upcoming = false;
    else calenderSchema.dinner.status.upcoming = true;

    calenderSchema.price = value.subscription.dinner.price;

    if (value.dinner.meal.lite) calenderSchema.dinner.meal = "lite";
    if (value.dinner.meal.full) calenderSchema.dinner.meal = "full";
  }

  return calenderSchema;
}

function getOrder(value) {
  var orderSchema = {};

  if (value.breakfast) {
    orderSchema.breakfast.address.tag = value.breakfast.address.tag;
    orderSchema.breakfast.address.coordinates.latitude =
      value.breakfast.address.coordinates.latitude;
    orderSchema.breakfast.address.coordinates.longitude =
      value.breakfast.address.coordinates.longitude;
    orderSchema.breakfast.address.address1 = value.breakfast.address.address1;
    orderSchema.breakfast.address.address2 = value.breakfast.address.address2;
    orderSchema.breakfast.address.area = value.breakfast.address.area;
    orderSchema.breakfast.address.city = value.breakfast.city;

    if (value.breakfast.quantity != 0)
      orderSchema.breakfast.status.upcoming = true;
    else orderSchema.breakfast.status.upcoming = false;

    orderSchema.breakfast.price = value.subscription.price;
    if (value.meal.lite) orderSchema.breakfast.meal = "lite";
    if (value.meal.full) orderSchema.breakfast.meal = "full";
  }
  if (value.lunch) {
    orderSchema.lunch.address.tag = value.lunch.address.tag;
    orderSchema.lunch.address.coordinates.latitude =
      value.lunch.address.coordinates.latitude;
    orderSchema.lunch.address.coordinates.longitude =
      value.lunch.address.coordinates.longitude;
    orderSchema.lunch.address.address1 = value.lunch.address.address1;
    orderSchema.lunch.address.address2 = value.lunch.address.address2;
    orderSchema.lunch.address.area = value.lunch.address.area;
    orderSchema.lunch.address.city = value.lunch.city;

    if (value.lunch.quantity != 0) orderSchema.lunch.status.upcoming = true;
    else orderSchema.lunch.status.upcoming = false;

    orderSchema.lunch.price = value.subscription.price;
    if (value.meal.lite) orderSchema.lunch.meal = "lite";
    if (value.meal.full) orderSchema.lunch.meal = "full";
  }
  if (value.dinner) {
    orderSchema.dinner.address.tag = value.dinner.address.tag;
    orderSchema.dinner.address.coordinates.latitude =
      value.dinner.address.coordinates.latitude;
    orderSchema.dinner.address.coordinates.longitude =
      value.dinner.address.coordinates.longitude;
    orderSchema.dinner.address.address1 = value.dinner.address.address1;
    orderSchema.dinner.address.address2 = value.dinner.address.address2;
    orderSchema.dinner.address.area = value.dinner.address.area;
    orderSchema.dinner.address.city = value.dinner.city;

    if (value.dinner.quantity != 0) orderSchema.dinner.status.upcoming = true;
    else orderSchema.dinner.status.upcoming = false;

    orderSchema.dinner.price = value.subscription.price;
    if (value.meal.lite) orderSchema.dinner.meal = "lite";
    if (value.meal.full) orderSchema.dinner.meal = "full";
  }

  return orderSchema;
}

function getKitchen(value) {
  let subSchema = {};

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
            tag: "required",
            coordinates: {
              longitude: "required",
              latitude: "required"
            },
            address1: "required",
            address2: "required",
            area: "required",
            city: "required"
          },
          lite: "required",
          full: "required",
          price: "required",
          quantity: "required",
          ignore: {
            monday: "required",
            tuesday: "required"
          }
        },
        lunch: {
          address: {
            tag: "required",
            coordinates: {
              longitude: "required",
              latitude: "required"
            },
            address1: "required",
            address2: "required",
            area: "required",
            city: "required"
          },
          lite: "required",
          full: "required",
          price: "required",
          quantity: "required",
          ignore: {
            monday: "required",
            tuesday: "required"
          }
        },
        dinner: {
          address: {
            tag: "required",
            coordinates: {
              longitude: "required",
              latitude: "required"
            },
            address1: "required",
            address2: "required",
            area: "required",
            city: "required"
          },
          lite: "required",
          full: "required",
          price: "required",
          quantity: "required",
          ignore: {
            monday: "required",
            tuesday: "required"
          }
        }
      }
    }
  });

  const value = 1;
  const error = false;
  //till here is the validation
  //of the data

  if (error) {
    console.log("Post Subscription Error", error);
    return res
      .status(400)
      .json({ error: { message: "Post subscription error", code: "" } });
  } else {
    let subscriptionData = getSubscriptions(req.body.users.subscription);

    let fromDate = req.body.date.from.split("-")[2];
    let toDate = req.body.date.to.split("-")[2];
    let month = req.body.date.from.split("-")[1];
    let year = req.body.date.from.split("-")[0];

    let batch = db.batch();

    // user subscription ////////////////////////////////////////////////////////
    let userSubscriptionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscription");

    let date = {};
    for (date = fromDate; date <= toDate; date++) {
      //check for the day of the week

      let day = new Date(`${year}-${month}-${day}`).split("-")[0];

      if (req.body.users.subscription.ignore.day) continue;
      console.log("ignore the day");

      let userSubRefDoc = userSubscriptionRef.doc(`${date}${month}${year}`);

      batch.set(userSubRefDoc, { subscriptionData }, { merge: true });
    }

    //user calender//////////////////////////////////////////////////////////////

    let calenderData = getCalender(req.body.users.subscription);

    let userCalenderDocRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("calender")
      .doc(month);

    let date = {};
    for (date = fromDate; date <= toDate; date++) {
      let day = new Date(`${year}-${month}-${day}`).split("-")[0];

      if (req.body.users.subscription.ignore.day) continue;

      date = { ...date, ...calenderData };
      batch.update(userCalenderDocRef, { date });
    }

    // order///////////////////////////////////////////////////////////

    let orderData = getOrder(req.body.users.subscription);

    let orderRef = db.collection("orders").doc(`${month}${year}`);

    for (date = fromDate; date <= toDate; date++) {
      let day = new Date(`${year}-${month}-${day}`).split("-")[0];

      if (req.body.users.subscription.ignore.day) continue;

      let orderDocRef = orderRef
        .collection(`${date}${month}${year}`)
        .doc(req.body.users.id);

      date = { ...date, ...calenderData };
      batch.update(orderDocRef, { date });
    }

    //kitchen Manager////////////////////////////////////////////////////

    //user sector
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

    // batch.set(kitchenRef, {}, { merge: true });

    //batch commit
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
