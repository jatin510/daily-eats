const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

function createUserDb(req, res) {
  var userSchema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.number().required(),
    email: Joi.string(),
    invitationCode: Joi.string()
  });

  const { error, value } = Joi.validate(req.body.users, userSchema);

  console.log("inside createUser");

  if (req.body.users.invitationCode) {
    value.referralRedeemed = false;
  }

  console.log(req.body);

  if (error) {
    console.log("Post Add User,error", error);
    return res.status(400).json({ error: { message: "Error adding address" } });
  } else {
    return db
      .collection("users")
      .doc(req.body.users.id)
      .set(value)
      .then(() => {
        console.log("User successfully added");
        return res.status(200).json({
          res: { message: "User successfully added", user: value }
        });
      })
      .catch(e => {
        console.log("Add User error ", e);
        return res.status(400).json({ error: "Error adding User" });
      });
  }
}

route.post("/users/", (req, res) => {
  //if already exist

  db.collection("users")
    .doc(req.body.users.id)
    .get()
    .then(doc => {
      if (!doc.exists) {
        console.log("No document found");
        return createUserDb(req, res); //should I return or not
      } else {
        console.log("User already exist");
        return res.status(104).json({ message: "User already exist" });
      }
    })
    .catch(error => console.log("error", error));
});

route.use("/users/:userId", require("./users/index.js"));

route.use("/admin", require("./admin"));

route.get("/", (req, res) => {
  res.send(" api index");
});

exports = module.exports = route;
