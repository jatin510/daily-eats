const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");
const Validator = require("validatorjs");

route.use(express.json());

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
  const error = 1;

  //validation is unfinished

  if (error) {
    console.log("Post Subscription Error", error);
    return res
      .status(105)
      .json({ error: { message: "Post subscription error" } });
  } else {
    //to create DocID
    subDocId = req.body.date;

    let batch = db.batch();

    // user subscription
    let userSubRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("subscription")
      .doc(subDocSub)
      .set({}, { merge: true });

    batch.set(userSubRef, {}, { merge: true });
    //user calender

    let userCalenderRef = db
      .collection("users")
      .doc(req.params.userId)
      .collection("calender")
      .doc(subDocCalender)
      .set({}, { merge: true });

    batch.set(userCalenderRef, {}, { merge: true });

    // order

    let orderRef = db.collection("orders").doc(doc);
    batch.set(orderRef, {}, { merge: true });

    //kitchen Manager

    let kitchenRef = db.collection("kitchen").doc();
    batch.set(kitchenRef, {}, { merge: true });
  }
});

exports = module.exports = route;
