const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

async function getSubscriptions(value) {
  var subSchema = {};

  if (value.breakfast) {
    //// user sector ///////

    let userSector = value.breakfast.address.area;

    let kitchenManagerDocRef = await db
      .collection("kitchen")
      .where(`areaHandling.${userSector}`, "==", true)
      .get();

    kitchenManagerDocRef.forEach(doc => {
      console.log("kitchen breakfast getting sector", doc.data());
      let id = doc.id;
      let kitchenName = doc.data().name;

      subSchema.breakfast.kitchen = {};
      subSchema.breakfast.kitchen.id = id;
      subSchema.breakfast.kitchen.name = kitchenName;
    });
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
    //user sector
    let userSector = value.lunch.address.area;

    let kitchenManagerDocRef = await db
      .collection("kitchen")
      .where(`areaHandling.${userSector}`, "==", true)
      .get();

    kitchenManagerDocRef.forEach(doc => {
      console.log("kitchen lunch getting sector", doc.data());
      let id = doc.id;
      let kitchenName = doc.data().name;

      subSchema.lunch.kitchen = {};
      subSchema.lunch.kitchen.id = id;
      subSchema.lunch.kitchen.name = kitchenName;
    });
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
    //user sector
    let userSector = value.dinner.address.area;

    let kitchenManagerDocRef = await db
      .collection("kitchen")
      .where(`areaHandling.${userSector}`, "==", true)
      .get();

    kitchenManagerDocRef.forEach(doc => {
      console.log("kitchen dinner getting sector", doc.data());
      let id = doc.id;
      let kitchenName = doc.data().name;

      subSchema.dinner.kitchen = {};
      subSchema.dinner.kitchen.id = id;
      subSchema.dinner.kitchen.name = kitchenName;
    });
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

function getCalendar(value) {
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
      calenderSchema.breakfast.status.upcoming = true;
    else calenderSchema.breakfast.status.upcoming = false;

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
    if (value.lunch.quantity !== 0) calenderSchema.lunch.status.upcoming = true;
    else calenderSchema.lunch.status.upcoming = false;

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
      calenderSchema.dinner.status.upcoming = true;
    else calenderSchema.dinner.status.upcoming = false;

    calenderSchema.dinner.price = value.dinner.price;

    if (value.dinner.lite) calenderSchema.dinner.lite = true;
    if (value.dinner.full) calenderSchema.dinner.full = true;
  }

  return calenderSchema;
}

route.put("/", (req, res) => {
  let error = false;
  if (error) {
    console.log("Post subscription schema error", error);
  } else {
    let fromDate = req.body.date.fromDate;
    let toDate = req.body.date.toDate;

    let batch = db.batch();

    ////  user subscriptions //////////////////////////////////

    console.log("starting batch of user subscriptions");

    let subscriptionsData = getSubscriptions(req.body.users.subscriptions);

    let userSubscriptionsRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscriptions");

    let d = {};

    for (d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      let date = d.toLocaleDateString().split("/")[0];
      let month = d.toLocaleDateString().split("/")[1];
      let year = d.toLocaleDateString().split("/")[2];
      let day = d.toDateString().split(" ")[0];

      //ignore the day

      // will complete it later on

      let userSubscriptionsDocRef = userSubscriptionsRef.doc(
        `${date}${month}${year}`
      );

      batch.set(userSubscriptionsDocRef, subscriptionsData, { merge: true });
    }

    console.log("complete batch of user subscriptions");

    ///////  completed user subscriptions ///////////////////////////////

    ///////  starting user calendar //////////////////////////////////////////////
    console.log("starting batch of user calendar");

    let calendarData = getCalendar(req.body.users.subscriptions);

    for (d = new Date(toDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      let date = d.toLocaleDateString().split("/")[0];
      let month = d.toLocaleDateString().split("/")[1];
      let year = d.toLocaleDateString().split("/")[2];
      let day = d.toDateString().split(" ")[0];

      ///ignore the day
      //
      //
      //
      //ignore the day

      let userCalendarDocRef = db
        .collection("users")
        .doc(req.body.users.id)
        .collection("calendar")
        .doc(`${month}${year}`);

      batch.set(userCalendarDocRef, { [date]: calendarData }, { merge: true });
    }
    console.log("complete batch of user calendars");
    /////// completed user calendar //////////////////////////////////////////////

    //// batch commit ///////////////

    return batch
      .commit()
      .then(() => {
        console.log("user subscriptions batch successful");
        return res.status(200).json({
          res: { message: "user subscriptions successful", code: "300" }
        });
      })
      .catch(e => {
        console.log("subscription batch error");
        res.status(403).json({
          error: { message: "subscription is not successful", code: "301" }
        });
      });
  }
});
