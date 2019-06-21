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

  const { error, value } = Joi.validate(req.body.users, addressSchema);
  console.log("inside address");
  console.log(req.body.users.id);

  if (error) {
    console.log("Post Add Address,error", error);
    return res.status(400).json({ error: { message: "Error adding address" } });
  } else {
    return db
      .collection("users")
      .doc(req.body.users.id)
      .collection("address")
      .add(value.address)
      .then(val => {
        value.id = val.id;
        console.log("Address successfully added");
        return res.status(200).json({
          res: {
            message: "Address successfully added",
            address: value,
            code: "210"
          }
        });
      })
      .catch(e => {
        console.log("Add Address error ", e);
        return res
          .status(400)
          .json({ error: { message: "Add address error", code: 102 } });
      });
  }
});

//it should be removed
//update
route.put("/", (req, res) => {
  //Code to Edit Address

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

  const { error, value } = Joi.validate(req.body.users, addressSchema);
  console.log("inside address");
  console.log(req.body.users.id);

  if (error) {
    console.log("Post Add Address,error", error);
    return res.status(400).json({ error: { message: "Error adding address" } });
  } else {
    return db
      .collection("users")
      .doc(req.body.users.id)
      .collection("address")
      .update(value.address)
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

//delete
route.delete("/", (req, res) => {
  //have to make api schema

  console.log("");

  return db
    .collection("users")
    .doc(req.body.users.id)
    .collection("address")
    .doc(req.body.users.addressId)
    .delete()
    .then(val => {
      console.log("successfully deleted user's address");
      return res.status(200).json({ message: "successfully deleted address" });
    })
    .catch(e => {
      console.log("Error in deleting address", e);
      return res.status(400).json({ message: "Error deleting users address" });
    });
});

exports = module.exports = route;
