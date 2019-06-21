const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const route = require("express").Router();
const Joi = require("@hapi/joi");

function getSubscriptions() {
  let subSchema = {};

  //breakfast
  subSchema.breakfast = {};
  subSchema.breakfast.status = {};
  subSchema.breakfast.status.vacation = false;

  //lunch
  subSchema.lunch = {};
  subSchema.lunch.status = {};
  subSchema.lunch.status.vacation = false;

  //dinner
  subSchema.dinner = {};
  subSchema.dinner.status = {};
  subSchema.dinner.status.vacation = false;

  return subSchema;
}

function getCalendar() {
  let subSchema = {};

  //breakfast
  subSchema.breakfast = {};
  subSchema.breakfast.status = {};
  subSchema.breakfast.status.vacation = false;

  //lunch
  subSchema.lunch = {};
  subSchema.lunch.status = {};
  subSchema.lunch.status.vacation = false;

  //dinner
  subSchema.dinner = {};
  subSchema.dinner.status = {};
  subSchema.dinner.status.vacation = false;

  return subSchema;
}

route.put("/", (req, res) => {
  //schema validation

  nestedDateSchema = Jo.object().keys({
    from: Joi.string().required(),
    to: Joi.string().required()
  });

  schema = Joi.object().keys({
    id: Joi.string().required,
    date: nestedDateSchema
  });

  const { error, value } = Joi.validate(req.body.users, schema);

  if (error) {
    console.log("Put End vacation schema error ", error.details[0]);
    return res.status(400).json({
      error: { message: `Put End vacation schema error,${error.details[0]}` }
    });
  } else {
    let batch = db.batch();

    ////////  user calendar /////////////////////////

    console.log("calendar endVacation starting");

    let d = {};

    let calendarData = getCalendar();

    for (d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      let date = d.toLocaleDateString().split("/")[0];
      let month = d.toLocaleDateString().split("/")[1];
      let year = d.toLocaleDateString().split("/")[2];
      let day = d.toDateString().split(" ")[0];

      let userCalendarDocRef = db
        .collection("users")
        .doc(req.body.users.id)
        .collection("calendar")
        .doc(`${month}${year}`);

      batch.set(userCalendarDocRef, { [date]: calendarData }, { merge: true });
    }

    console.log("calendar endVacation completed");
    //////// completed user calendar  ///////////////

    //////// user subscription //////////////////////
    console.log("subscription endVacation starting");

    let subscriptionsData = getSubscriptions();

    let userSubCollectionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscriptions");

    for (d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      let date = d.toLocaleDateString().split("/")[0];
      let month = d.toLocaleDateString().split("/")[1];
      let year = d.toLocaleDateString().split("/")[2];
      let day = d.toDateString().split(" ")[0];

      let userSubDocRef = userSubCollectionRef.doc(`${date}${month}${year}`);

      batch.set(userSubDocRef, subscriptionsData, { merge: true });
    }

    console.log("subscription endVacation ended");

    //////// completed user subscription ////////////

    ////// batch commit starting ///////////////////
    console.log("batch commit starting");

    return batch
      .commit()
      .then(() => {
        console.log("successfully ended vacation");
        return res.status(200).json({
          res: { message: "successfully ended vacation", code: "330" }
        });
      })
      .catch(e => {
        console.log("error adding vacation");
        res
          .status(403)
          .json({ error: { message: "error adding vacation", code: "331" } });
      });

    ////// batch commit ended   ////////////////////
  }
});

exports = module.exports = route;
