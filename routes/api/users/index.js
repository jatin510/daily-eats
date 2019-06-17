const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

const validateUser = (req, res, next) => {
  console.log("Check if request is authorized with Firebase ID token");
  console.log(req.body.users.id);
  console.log(req.body.users);
  return db
    .collection("users")
    .doc(req.body.users.id + "")
    .get()
    .then(userDoc => {
      if (!userDoc.exists) {
        console.log("User does not exist", req.body.users.id);
        return res
          .status(404)
          .json({ error: { message: "User does not exist", code: "" } });
      }

      return next();
    })
    .catch(error => {
      console.error("Error while verifying Firebase ID token:", error);
      res.status(403).json({ error: { message: "Unauthorized", code: "" } });
    });
};

route.use(validateUser);
route.use("/address", require("./address"));
route.use("/subscribe", require("./subscribe"));
route.use("/unsubscribe", require("./unSubscribe"));
route.use("/vacation", require("./vacation"));
route.use("/endvacation", require("./endVacation"));

route.get("/", (req, res) => {
  res.send("users api index");
});

module.exports = route;
