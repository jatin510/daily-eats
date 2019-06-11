const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

function createUserDb(data) {
  userSchema = Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.number().required,
    email: Joi.string(),
    referralCode: Joi.string()
  });

  const { error, value } = Joi.validate(data.body, userSchema);

  if (error) {
    console.log("Post Add User,error", error);
    return res.status(400).json({ error: { message: "Error adding address" } });
  } else {
    return db
      .collection("users")
      .doc(req.body.id)
      .set(value)
      .then(val => {
        value.id = val.id;
        console.log("Address successfully added");
        return res.status(200).json({
          res: { message: "Address successfully added", user: value }
        });
      })
      .catch(e => {
        console.log("Add User error ", e);
        return res.status(400).json({ error: "Add address error" });
      });
  }
}

route.post("/users/:userId", (req, res) => {
  //if already exist

  db.collection("users")
    .doc(req.params.userId)
    .get()
    .then(doc => {
      if (!doc.exists) {
        console.log("No document found");
        return createUserDb(req);
      } else {
        console.log("User already exist");
        return { message: "user already exist" };
      }
    })
    .catch(error => console.log("error", error));
});

route.use("/users/", require("./users/index.js"));
route.use("/admin", require("./admin"));

route.get("/", (req, res) => {
  res.send(" api index");
});

exports = module.exports = route;
