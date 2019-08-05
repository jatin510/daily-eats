const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

route.post("/", (req, res) => {
  // const schema = Joi.object().keys({
  //   id: Joi.string().required()
  // });

  // const {value, error } = Joi.validate(req.body,schema)

  const error = false;

  if (error) {
    console.log("Post cancel schema error", error.details[0].message);

    return res.status(400).json({
      error: {
        message: "error in the post schema",
        error: `Error in the schema of cancel : ${error.details[0].message}`
      }
    });
  } else {
    let date = new Date(req.body.users.date);

    let month = date.getMonth() + 1;
    let year = date.getFullYear;
    date = date.getDate();

    if (date < 10) {
      date = "0" + date;
    }
    if (month < 10) {
      month = "0" + month;
    }

    let batch = db.batch();

    ///// users subscriptions //////////

    console.log("users sub cancel starting");

    let userSubscriptionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("subscriptions")
      .doc(`${date}${month}${year}`);

    let time;
    if (req.body.users.breakfast) {
      time = req.body.users.breakfast;
    }
    if (req.body.users.lunch) {
      time = req.body.users.lunch;
    }
    if (req.body.users.dinner) {
      time = req.body.users.dinner;
    }

    batch.set(
      userSubscriptionRef,
      {
        [time]: {
          status: {
            // cancel: true,
            upcoming: false
          },
          quantity: 0
        }
      },
      { merge: true }
    );

    console.log("user sub cancel completed");

    ///// users calendar ////////////////
    console.log("user calendar cancel start");

    let userCalendarRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("calendar")
      .doc(`${month}${year}`);

    batch.set(
      userCalendarRef,
      {
        [date]: {
          [time]: {
            status: {
              // cancel: true,
              upcoming: false
            },
            quantity: 0
          }
        }
      },
      { merge: true }
    );
    console.log("user calendar cancel completed");
    /////////// batch ///////////////
    batch
      .commit()
      .then(() => {
        console.log("successfully cancelled the meal");

        return res
          .status(200)
          .json({ res: { message: "successfully cancelled the meal" } });
      })
      .catch(e => {
        console.log("error commiting the cancel batch", e);
        return res
          .status(400)
          .json({ error: "error commiting the cancel batch" });
      });
  }
});

module.exports = route;
