const admin = require("firebase-admin");
const functions = require("firebase-functions");

const db = admin.firestore();
const route = require("express").Router();
const Joi = require("@hapi/joi");

async function getSubscriptions(value) {
  let subSchema = {};

  if (value.breakfast) {
    subSchema.breakfast = {};
    subSchema.breakfast.address = {};
    subSchema.breakfast.address.coordinates = {};
    subSchema.breakfast.status = {};

    /// user sector /////

    let kitchenManagerDocRef = await db
      .collection("kitchens")
      .where(`areaHandling.${userSector}`, "==", true)
      .get();

    kitchenManagerDocRef.forEach(doc => {
      console.log("Kitchen breakfast getting sector", doc.data());
      let id = doc.id;
      let kitchenName = doc.data().name;

      subSchema.breakfast.kitchen = {};
      subSchema.breakfast.kitchen.id = id;
      subSchema.breakfast.kitchen.name = kitchenName;
    });

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

    //user sector
    let userSector = value.lunch.address.area;

    let kitchenManagerDocRef = await db
      .collection("kitchens")
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

    //user sector
    let userSector = value.dinner.address.area;

    let kitchenManagerDocRef = await db
      .collection("kitchens")
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

    calenderSchema.breakfast.fullAddress = address;
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

    calenderSchema.lunch.fullAddress = address;
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

    calenderSchema.dinner.fullAddress = address;
    if (value.dinner.quantity !== 0)
      calenderSchema.dinner.status.upcoming = true;
    else calenderSchema.dinner.status.upcoming = false;

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

  if (value.lite) subSchema.lite = true;
  if (value.full) subSchema.full = true;
  subSchema.status.pending = true;

  return subSchema;
}

//// subscribing the trial pack /////

route.post("/", async (req, res) => {
  const schema = {};

  ///  validate
  ///  the data
  ///  for the
  ///  trial meal

  let { error, value } = Joi.validate(req.body.users, schema);

  error = false;
  if (error) {
    console.log("Post trial schema error", error.details[0].message);
    return res.status(400).json({
      error: {
        message: `Post trial schema error , ${error.details[0].message}`
      }
    });
  } else {
    let batch = db.batch();

    /////   users    ///////

    db.collection("users")
      .doc(req.body.users.id)
      .update({
        trialRedeemed: true
      })
      .then(() => console.log("updated field in the user "))
      .catch(e => console.log("cannot update the field in user"));

    let date = req.body.date;

    date = new Date(date);

    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    date = date.getDate();

    // for proper formatting
    if (date < 10) {
      date = "0" + date;
    }
    if (month < 10) {
      month = "0" + month;
    }

    //// user subscriptions ////
    console.log("user trial subscription start");
    let SubscriptionData = await getSubscriptions(req.body.users.trial);

    let userSubscriptionsRef = await db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscriptions");

    let docId = `${date}${month}${year}`;
    let userSubDocRef = userSubscriptionsRef.doc(docId);

    batch.set(userSubDocRef, SubscriptionData, { merge: true });
    console.log("user trial subscription ended");

    /////  completed user subscription //////////

    /////  user calendar starting ///////////////

    console.log("user trial calendar start");

    let calendarData = await getCalendar(req.body.users.trial);

    let userCalendarDocRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("calendar")
      .doc(`${month}${year}`);

    batch.set(userCalendarDocRef, { [date]: calendarData }, { merge: true });

    console.log("user trial calendar ended");

    //// user calendar ended ////////

    ///// order started ////
    console.log("order batch started");

    let orderData = getOrder(req.body.users.trial);

    let orderDocRef = db
      .collection("orders")
      .doc(`${month}${year}`)
      .collection(`${date}${month}${year}`)
      .doc(req.body.users.id);

    batch.set(orderDocRef, orderData, { merge: true });

    console.log("order batch ended ");
    //// order ended ///////

    //// kitchen collection and totals collection starting ////////
    console.log("kitchen batch starting");

    let kitchenId;
    let kitchenName;

    //breakfast
    if (req.body.users.trial.breakfast) {
      let kitchenData = getKitchen(req.body.users.trial.breakfast);
      let userSector = req.body.users.trial.breakfast.address.area;

      let kitchenManagerDocRef = await db
        .collection("kitchens")
        .where(`areHandling.${userSector}`)
        .get();

      kitchenManagerDocRef.forEach(doc => {
        kitchenId = doc.id;
        kitchenName = doc.name;
      });

      // increment count of total trial meals inside the
      // kitchen per day doc

      let kitchenDocRef = db
        .collection("kitchen")
        .doc(kitchenId)
        .collection("deliveries")
        .doc(`${date}${month}${year}`);

      let kitchenTotalDocRef = db.collection("totals").doc("kitchens");

      let monthlyTotalDocRef = db
        .collection("totals")
        .doc("kitchens")
        .collection("months")
        .doc(`${month}${year}`);

      let dailyTotalDocRef = db
        .collection("totals")
        .doc("kitchens")
        .collection("months")
        .doc(`${month}${year}`)
        .collection("dates")
        .doc(`${date}${month}${year}`);

      if (req.body.users.trial.breakfast.lite) {
        let totalCount = "trialCount.breakfast.lite";
      }
      if (req.body.users.trial.breakfast.full) {
        let totalCount = "trialCount.breakfast.lite";
      }
      batch.update(kitchenDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });
      batch.update(kitchenTotalDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });
      batch.update(monthlyTotalDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });
      batch.update(dailyTotalDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });

      // adding data of user in the kitchen collection
      let breakfast = db
        .collection("kitchens")
        .doc(kitchenId)
        .collection("deliveries")
        .doc(`${date}${month}${year}`)
        .collection("breakfast")
        .doc(req.body.users.id);

      batch.set(breakfast, kitchenData, { merge: true });

      console.log("Successful subscribe breakfast kitchen");
    }

    //lunch
    if (req.body.users.trial.lunch) {
      let kitchenData = getKitchen(req.body.users.trial.lunch);
      let userSector = req.body.users.trial.lunch.address.area;

      let kitchenManagerDocRef = await db
        .collection("kitchens")
        .where(`areHandling.${userSector}`)
        .get();

      kitchenManagerDocRef.forEach(doc => {
        kitchenId = doc.id;
        kitchenName = doc.name;
      });

      // increment count of total trial meals inside the
      // kitchen per day doc

      let kitchenDocRef = db
        .collection("kitchen")
        .doc(kitchenId)
        .collection("deliveries")
        .doc(`${date}${month}${year}`);

      let kitchenTotalDocRef = db.collection("totals").doc("kitchens");

      let monthlyTotalDocRef = db
        .collection("totals")
        .doc("kitchens")
        .collection("months")
        .doc(`${month}${year}`);

      let dailyTotalDocRef = db
        .collection("totals")
        .doc("kitchens")
        .collection("months")
        .doc(`${month}${year}`)
        .collection("dates")
        .doc(`${date}${month}${year}`);

      if (req.body.users.trial.lunch.lite) {
        let totalCount = "trialCount.lunch.lite";
      }
      if (req.body.users.trial.lunch.full) {
        let totalCount = "trialCount.lunch.lite";
      }
      batch.update(kitchenDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });
      batch.update(kitchenTotalDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });
      batch.update(monthlyTotalDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });
      batch.update(dailyTotalDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });

      db.collection("kitchens");

      // adding data of user inside the deliveries
      let lunch = db
        .collection("kitchens")
        .doc(kitchenId)
        .collection("deliveries")
        .doc(`${date}${month}${year}`)
        .collection("lunch")
        .doc(req.body.users.id);

      batch.set(lunch, kitchenData, { merge: true });

      console.log("Successful subscribe lunch kitchen");
    }

    //dinner
    if (req.body.users.trial.dinner) {
      let kitchenData = getKitchen(req.body.users.trial.dinner);
      let userSector = req.body.users.trial.dinner.address.area;

      let kitchenManagerDocRef = await db
        .collection("kitchens")
        .where(`areHandling.${userSector}`)
        .get();

      kitchenManagerDocRef.forEach(doc => {
        kitchenId = doc.id;
        kitchenName = doc.name;
      });
      // increment count of total trial meals inside the
      // kitchen per day doc

      let kitchenDocRef = db
        .collection("kitchen")
        .doc(kitchenId)
        .collection("deliveries")
        .doc(`${date}${month}${year}`);

      let kitchenTotalDocRef = db.collection("totals").doc("kitchens");

      let monthlyTotalDocRef = db
        .collection("totals")
        .doc("kitchens")
        .collection("months")
        .doc(`${month}${year}`);

      let dailyTotalDocRef = db
        .collection("totals")
        .doc("kitchens")
        .collection("months")
        .doc(`${month}${year}`)
        .collection("dates")
        .doc(`${date}${month}${year}`);

      if (req.body.users.trial.dinner.lite) {
        let totalCount = "trialCount.dinner.lite";
      }
      if (req.body.users.trial.dinner.full) {
        let totalCount = "trialCount.dinner.lite";
      }
      batch.update(kitchenDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });
      batch.update(kitchenTotalDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });
      batch.update(monthlyTotalDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });
      batch.update(dailyTotalDocRef, {
        [totalCount]: admin.firestore.FieldValue.increment(1)
      });

      let dinner = db
        .collection("kitchens")
        .doc(kitchenId)
        .collection("deliveries")
        .doc(`${date}${month}${year}`)
        .collection("dinner")
        .doc(req.body.users.id);

      batch.set(dinner, kitchenData, { merge: true });

      console.log("Successful subscribe dinner kitchen");
    }

    console.log("ended batch of kitchen collection");

    /// kitchen ended //////////////

    //// batch commit ///////////////

    return batch
      .commit()
      .then(() => {
        console.log("user trial batch successful");
        // http request for trial pack

        return res.status(200).json({
          res: { message: "user trial successful", code: "" }
        });
      })
      .catch(e => {
        console.log("trial batch error");
        return res.status(403).json({
          error: { message: "trial is not successful", code: "" }
        });
      });
  }
});

fu;

module.exports = route;

exports.trial = functions.https.onRequest((req, res) => {
  const registrationTokens = [];

  const message = {
    data: {
      message:
        "You have successfully subscribe our trial meal. Enjoy the day !!!"
    }
  };

  admin
    .messaging()
    .send(message)
    .then(response => console.log("Successfully sent trial message ", response))
    .catch(error => console.log("Error sending error: ", error));
});
