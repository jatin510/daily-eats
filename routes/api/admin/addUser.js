/// you have to implement if its necessarily required

const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

function createUserDb(req, res) {
  var userSchema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string()
      .email({ minDomainSegments: 2 })
      .allow(""),
    invitationCode: Joi.string().allow("")
  });

  if (req.body.users.invitationCode && req.body.users.invitationCode !== "") {
    value.referRedeemed = false;
  }
  value.trialRedeem = false;
  value.wallet = 0;

  const { error, value } = Joi.validate(req.body.users, userSchema);

  if (error) {
    console.log("Post Add User schema error", error.details[0].message);
    return res.status(400).json({
      error: {
        message: `Error adding user schema, ${error.details[0].message}`
      }
    });
  } else {
    value.userCreatedOn = admin.firestore.FieldValue.serverTimestamp();

    return db
      .collection("users")
      .doc(req.body.users.id)
      .set(value)
      .then(() => {
        console.log("User successfully added");
        return res.status(200).json({
          res: { message: "User successfully added", user: value, code: "200" }
        });
      })
      .catch(e => {
        console.log("Add User error ", e);
        return res.status(400).json({
          error: {
            message: `Error adding User`,
            code: "201"
          }
        });
      });
  }
}

route.post("/", (req, res) => {
  return db
    .collection("users")
    .doc(req.body.users.id)
    .get()
    .then(doc => {
      if (!doc.exists) {
        console.log("No document found");
        return createUserDb(req, res);
      } else {
        console.log("User already exist");
        return res
          .status(400)
          .json({ error: { message: "user already exist" } });
      }
    });
});

module.exports = route;
