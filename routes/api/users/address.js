const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.use(express.json());

route.post("/", (req, res) => {
  //Code to add Address

  let nestedCoordinates = Joi.object({
    latitude: Joi.string().required(),
    longitude: Joi.string().required()
  });

  let detailedAddressCoordinates = Joi.object({
    tag: Joi.string().required(),
    coordinates: nestedCoordinates,
    address1: Joi.string().required(),
    address2: Joi.string().required(),
    area: Joi.string().required(),
    city: Joi.string().required()
  });

  let addressSchema = Joi.object({
    id: Joi.string(),
    address: detailedAddressCoordinates
  });

  const { error, value } = Joi.validate(req.body, addressSchema);

  if (error) {
    console.log("Post Add Address,error", error);
    return res.status(400).json({ error: { message: "Error adding address" } });
  } else {
    return db
      .collection("users")
      .doc(req.params.userId)
      .collection("address")
      .set(value)
      .then(val => {
        value.id = val.id;
        console.log("Address successfully added");
        return res.status(200).json({
          res: { message: "Address successfully added", address: value }
        });
      })
      .catch(e => {
        console.log("Add Address error ", e);
        return res.status(400).json({ error: "Add address error" });
      });
  }
});

route.put("/", (req, res) => {
  //Code to add Address

  let nestedCoordinates = Joi.object({
    latitude: Joi.string().required(),
    longitude: Joi.string().required()
  });

  let detailedAddressCoordinates = Joi.object({
    tag: Joi.string().required(),
    coordinates: nestedCoordinates,
    address1: Joi.string().required(),
    address2: Joi.string().required(),
    area: Joi.string().required(),
    city: Joi.string().required()
  });

  let addressSchema = Joi.object({
    id: Joi.string(),
    address: detailedAddressCoordinates
  });

  const { error, value } = Joi.validate(req.body, addressSchema);

  if (error) {
    console.log("Put Edit Address,error", error);
    return res
      .status(400)
      .json({ error: { message: "Error editing address" } });
  } else {
    return db
      .collection("users")
      .doc(req.params.userId)
      .collection("address")
      .update(value)
      .then(val => {
        value.id = val.id;
        console.log("Address edited successfully");
        return res.status(200).json({
          res: { message: "Address edited successfully", address: value }
        });
      })
      .catch(e => {
        console.log("Edit Address error ", e);
        return res.status(400).json({ error: "Edit address error" });
      });
  }
});

exports = module.exports = route;
