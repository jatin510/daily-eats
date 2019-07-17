const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

function getKitchenData(value) {
  let subSchema = {};

  subSchema.id = value.id;
  subSchema.name = value.name;
  subSchema.address = {};
  subSchema.address.coordinates = {};
  subSchema.address.coordinates.longitude = value.address.coordinates.longitude;
  subSchema.address.coordinates.latitude = value.address.coordinates.latitude;
  subSchema.address.address1 = value.address.address1;
  subSchema.address.address2 = value.address.address2;
  subSchema.address.area = value.address.area;
  subSchema.address.city = value.address.city;

  //kitchen manager
  subSchema.kitchenManager = {};
  subSchema.kitchenManager.id = value.kitchenManager.id;
  subSchema.kitchenManager.name = value.kitchenManager.name;

  // area handling
  subSchema.areaHandling = {};
  subSchema.areaHandling = value.areaHandling;

  return subSchema;
}

/////////    Add Kitchen Manager  //////////////
route.post("/", (req, res) => {
  let schema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    address: {
      coordinates: {
        longitude: Joi.string().required(),
        latitude: Joi.string().required()
      },
      address1: Joi.string().required(),
      address2: Joi.string().required(),
      area: Joi.string().required(),
      city: Joi.string().required()
    },
    kitchenManager: {
      id: Joi.string().required(),
      name: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required()
    },

    // how to verify area handling

    areaHandling: Joi.object().pattern(/^/, [Joi.string(), Joi.number()])
  });

  const { error, value } = Joi.validate(req.body.admins, schema);

  if (error) {
    console.log(
      "Post Add Kitchen Data schema error ",
      error.details[0].message
    );
    return res.status(400).json({
      error: {
        message: `Error adding Kitchen Manager schema, ${
          error.details[0].message
        }`
      }
    });
  } else {
    let batch = db.batch();

    value.role = {};
    value.role.kitchenManager = true;

    // kitchen data
    console.log("kitchen is updating");

    let kitchenData = getKitchenData(req.body.admins);

    console.log("kitchenData", kitchenData);

    let kitchenRef = db.collection("kitchens").doc(req.body.admins.id);

    console.log("kitchenRef", kitchenRef);
    batch.set(kitchenRef, kitchenData, { merge: true });

    // kitchen manager

    console.log("kitchen manager is updating");
    let adminRef = db
      .collection("admins")
      .doc(req.body.admins.kitchenManager.id);
    batch.set(adminRef, value, { merge: true });

    // add New User sector in the sector collection

    let locationCollectionRef = db
      .collection("locations")
      .doc(req.body.admins.address.city);

    // converting the object into array of its values
    let areaHandling = req.body.admins.areaHandling;

    const keys = Object.keys(areaHandling);

    console.log(keys);

    for (const key of keys) {
      batch.set(
        locationCollectionRef,
        {
          areaHandling: admin.firestore.FieldValue.arrayUnion(key)
        },
        { merge: true }
      );
    }

    batch
      .commit()
      .then(() => {
        console.log("successfully added the kitchen and km");
        return res.status(200).json({
          res: { message: "successfully added the kitchen and km", code: "" }
        });
      })
      .catch(error => {
        console.log("Error adding the kitchen and kitchen Manager", error);
        return res.status(400).json({
          error: {
            message: "Error adding the kitchen  and KM",
            code: ""
          }
        });
      });
  }
});

//////////    Edit Kitchen Manager //////////////
route.put("/", (req, res) => {
  let schema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    address: {
      coordinates: {
        longitude: Joi.string().required(),
        latitude: Joi.string().required()
      },
      address1: Joi.string().required(),
      address2: Joi.string().required(),
      area: Joi.string().required(),
      city: Joi.string().required()
    },
    kitchenManager: {
      id: Joi.string().required(),
      name: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required()
    },

    // how to verify area handling

    areaHandling: Joi.object().pattern(/^/, [Joi.string(), Joi.number()])
  });

  const { error, value } = Joi.validate(req.body.admins, schema);

  if (error) {
    console.log(
      "Post Add Kitchen Data schema error ",
      error.details[0].message
    );
    return res.status(400).json({
      error: {
        message: `Error adding Kitchen Manager schema, ${
          error.details[0].message
        }`
      }
    });
  } else {
    let batch = db.batch();

    value.role = {};
    value.role.kitchenManager = true;

    // kitchen data
    console.log("kitchen is updating");

    let kitchenData = getKitchenData(req.body.admins);

    console.log("kitchenData", kitchenData);

    let kitchenRef = db.collection("kitchens").doc(req.body.admins.id);

    console.log("kitchenRef", kitchenRef);
    batch.set(kitchenRef, kitchenData, { merge: true });

    // kitchen manager

    console.log("kitchen manager is updating");
    let adminRef = db
      .collection("admins")
      .doc(req.body.admins.kitchenManager.id);
    batch.set(adminRef, value, { merge: true });

    // add New User sector in the sector collection

    let locationCollectionRef = db
      .collection("locations")
      .doc(req.body.admins.address.city);

    // converting the object into array of its values
    let areaHandling = req.body.admins.areaHandling;

    const keys = Object.keys(areaHandling);

    for (const key of keys) {
      batch.set(locationCollectionRef, {
        areaHandling: admin.firestore.FieldValue.arrayUnion(key)
      });
    }

    batch
      .commit()
      .then(() => {
        console.log("successfully added the kitchen and km");
        return res.status(200).json({
          res: { message: "successfully added the kitchen and km", code: "" }
        });
      })
      .catch(error => {
        console.log("Error adding the kitchen and kitchen Manager", error);
        return res.status(400).json({
          error: {
            message: "Error adding the kitchen  and KM",
            code: ""
          }
        });
      });
  }
});

exports = module.exports = route;
