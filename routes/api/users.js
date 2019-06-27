const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

//////   EDIT USERS   //////////
route.put("/", (req, res) => {
  let schema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string()
      .email({ minDomainSegments: 2 })
      .allow("")
  });

  const { error, value } = Joi.validate(req.body.users, schema);

  if (error) {
    console.log("Put Edit User schema error", error);
    return res.status(400).json({
      error: { message: `Error edit user schema, ${error.details[0]}` }
    });
  } else {
    return db
      .collection("users")
      .doc(req.body.users.id)
      .update(value)
      .then(() => {
        console.log("Editing user successful");
        return res.status(200).json({
          res: { message: "User edited successfully", code: "202" }
        });
      })
      .catch(e => {
        console.log("Error editing user");
        return res.status(403).json({
          error: { message: `Error editing user's details`, code: "203" }
        });
      });
  }
});

exports = module.exports = route;
