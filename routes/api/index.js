const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");
const Razorpay = require("razorpay");

// create new User db function
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

  const { error, value } = Joi.validate(req.body.users, userSchema);

  console.log("inside createUser");

  if (req.body.users.invitationCode && req.body.users.invitationCode !== "") {
    value.referRedeemed = false;
  }

  value.trialRedeem = false;

  console.log(req.body);

  if (error) {
    console.log("Post Add User schema error", error.details[0].message);
    return res.status(400).json({
      error: {
        message: `Error adding user schema, ${error.details[0].message}`
      }
    });
  } else {
    // let batch = db.catch();

    value.userCreatedOn = admin.firestore.FieldValue.serverTimestamp();
    value.wallet = 0;

    // console.log("hello ", value.userCreatedOn);
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

//////create new user if does not exist ////////
route.post("/users", (req, res) => {
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
          .json({ error: { message: "User already exist", code: 104 } });
      }
    })
    .catch(error => console.log("error", error));
});

route.put("/users/", (req, res) => {
  var userSchema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string()
      .email({ minDomainSegments: 2 })
      .allow("")
  });

  const { error, value } = Joi.validate(req.body.users, userSchema);

  if (error) {
    console.log("Error in the edit user schema", error.details[0].message);
    return res
      .status(400)
      .json({ error: { message: "Error in edit user schema" } });
  } else {
    value.userCreatedOn = admin.firestore.FieldValue.serverTimestamp;
    return db
      .collection("users")
      .doc(req.body.users.id)
      .set(value, { merge: true })
      .then(() => {
        console.log("User edited successfully");
        return res
          .status(200)
          .json({ res: { message: "User edited successfully", code: "" } });
      })
      .catch(e => {
        console.log("Error editing user data", e);
        return res.status(400).json({
          error: { message: "Error editing the user data", code: "" }
        });
      });
  }
});

route.use("/users/:userId", require("./users/index.js"));

route.use("/admin", require("./admin/index.js"));

module.exports = route;
