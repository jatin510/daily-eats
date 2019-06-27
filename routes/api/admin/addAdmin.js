const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

//////////   Add request /////////////
route.post("/admins", (req, res) => {
  var schema = Joi.object.keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().required()
  });

  const { error, value } = Joi.validate(req.body.admins, schema);

  if (error) {
    console.log("Post Add Admin schema error", error.details[0].message);
    return res.status(400).json({
      error: {
        message: `Error adding admin schema , ${error.details[0].message}`
      }
    });
  } else {
    value.role = {};
    value.role.admin = true;
    value.role.manager = true;
    return db
      .collection("admins")
      .req(req.body.admins.id)
      .set(value)
      .then(() => {
        console.log("Admin successfully added");
        return res.status(200).json({
          res: { message: "Admin successfully added", code: "", admin: value }
        });
      })
      .catch(e => {
        console.log("Add Admin error ", e);
        return res.status(400).json({
          error: {
            message: "Error adding Admin",
            code: ""
          }
        });
      });
  }
});

//////   Edit Request ////////////

route.put("/admins", (req, res) => {
  var schema = Joi.object.keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().required()
  });

  const { error, value } = Joi.validate(req.body.admins, schema);

  if (error) {
    console.log("Post Add Admin schema error", error.details[0].message);
    return res.status(400).json({
      error: {
        message: `Error adding admin schema , ${error.details[0].message}`
      }
    });
  } else {
    value.role = {};
    value.role.admin = true;
    value.role.manager = true;
    return db
      .collection("admins")
      .req(req.body.admins.id)
      .set(value)
      .then(() => {
        console.log("Admin successfully added");
        return res.status(200).json({
          res: { message: "Admin successfully added", code: "", admin: value }
        });
      })
      .catch(e => {
        console.log("Add Admin error ", e);
        return res.status(400).json({
          error: {
            message: "Error adding Admin",
            code: ""
          }
        });
      });
  }
});

exports = module.exports = route;
