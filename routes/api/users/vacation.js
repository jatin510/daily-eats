const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const route = require("express").Router();
const Joi = require("@hapi/joi");

function getSubscriptions() {
  let subSchema = {};

  //breakfast holiday
  subSchema.breakfast = {};
  subSchema.breakfast.status = {};
  subSchema.breakfast.status.vacation = true;

  //lunch holiday
  subSchema.lunch = {};
  subSchema.lunch.status = {};
  subSchema.lunch.status.vacation = true;

  //dinner holiday
  subSchema.dinner = {};
  subSchema.dinner.status = {};
  subSchema.dinner.status.vacation = true;

  return subSchema;
}

function getCalendar() {
  let subSchema = {};

  //breakfast holiday
  subSchema.breakfast = {};
  subSchema.breakfast.status = {};
  subSchema.breakfast.status.vacation = true;

  //lunch holiday
  subSchema.lunch = {};
  subSchema.lunch.status = {};
  subSchema.lunch.status.vacation = true;

  //dinner holiday
  subSchema.dinner = {};
  subSchema.dinner.status = {};
  subSchema.dinner.status.vacation = true;

  return subSchema;
}

route.put("/", (req, res) => {
  //// schema validation

  const nestedDates = Joi.object({
    from: Joi.string(),
    to: Joi.string()
  });

  const schema = Joi.object().keys({
    id: Joi.string(),
    date: nestedDates
  });

  const { error, value } = Joi.validate(req.body.users, schema);

  if (error) {
    console.log("Post add vacation schema error", error.details[0]);
    return res.status(400).json({
      error: { message: `Post add vacation schema error,${error.details[0]}` }
    });
  } else {
    //date
    let fromDate = req.body.users.date.from;
    let toDate = req.body.users.date.to;

    let batch = db.batch();
    ////////  user calendar //////////////////////////

    console.log("vacation calendar starting");

    let calendarData = getCalendar();
    let d = {};
    toDate = new Date(toDate);

    for (d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      let date = d.getDate();
      let month = d.getMonth() + 1;
      let year = d.getFullYear();
      let day = d.toDateString().split(" ")[0];

      let userCalendarDocRef = db
        .collection("users")
        .doc(req.body.users.id)
        .collection("calendar")
        .doc(`${month}${year}`);

      batch.set(userCalendarDocRef, { [date]: calendarData }, { merge: true });
    }

    console.log("vacation calendar ended");

    ////////  completed user calendar  ///////////////////////

    ////////  user subscription  /////////////////////////////

    console.log("vacation subscriptions starting");

    let subscriptionsData = getSubscriptions();

    let userSubCollectionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscriptions");

    for (d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      let date = d.getDate();
      let month = d.getMonth() + 1;
      let year = d.getFullYear();
      let day = d.toDateString().split(" ")[0];

      let userSubDocRef = userSubCollectionRef.doc(`${date}${month}${year}`);

      batch.set(userSubDocRef, subscriptionsData, { merge: true });
    }

    console.log("vacation subscriptions ended");

    ////////  completed user subscription   //////////////////

    ////////  batch starting   ///////////////////////////

    batch
      .commit()
      .then(() => {
        console.log("Successfully batched vacation");
        return res.status(200).json({
          res: { message: "successfully adding vacation", code: "320" }
        });
      })
      .catch(e => {
        console.log("error batched vacation");
        return res
          .status(403)
          .json({ error: { message: "Error adding vacation", code: "321" } });
      });
    ////////  batch completed  ///////////////////////////
  }
});

exports = module.exports = route;
