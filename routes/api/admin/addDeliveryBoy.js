const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

/////////  Add Delivery Boy data ////////////////////
route.post("/", (req, res) => {
  let schema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: {
      coordinates: {
        longitude: Joi.string().required(),
        latitude: Joi.string().required()
      },
      address1: Joi.string().required(),
      address2: Joi.string().required(),
      area: Joi.string().required(),
      city: Joi.string().required()
    }
  });

  const { error, value } = Joi.validate(req.body.admins, schema);

  if (error) {
    console.log("Post Add DeliveryBoy schema error ", error.details[0].message);
    return res.status(400).json({
      error: {
        message: `Error add delivery boy schema,${error.details[0].message}`
      }
    });
  } else {
    value.role = {};
    value.role.deliveryBoy = true;

    return db
      .collection("admins")
      .doc(req.body.admins.id)
      .set(value)
      .then(() => {
        console.log("Delivery Boy successfully added");
        return res.status(200).json({
          res: {
            message: "Delivery BOy successfully added",
            code: "",
            deliveryBoy: value
          }
        });
      })
      .catch(e => {
        console.log("Add Delivery Boy error", e);
        return res.status(400).json({
          error: {
            message: "Error adding Delivery Boy",
            code: ""
          }
        });
      });
  }
});

/////////  Edit Delivery Boy data ////////////////////
route.put("/", (req, res) => {
  let schema = Joi.object.keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: {
      coordinates: {
        longitude: Joi.string().required(),
        latitude: Joi.string().required()
      },
      address1: Joi.string().required(),
      address2: Joi.string().required(),
      area: Joi.string().required(),
      city: Joi.string().required()
    }
  });

  const { error, value } = Joi.validate(req.body.admins, schema);

  if (error) {
    console.log("Post Add DeliveryBoy schema error ", error.details[0].message);
    return res.status(400).json({
      error: {
        message: `Error add delivery boy schema,${error.details[0].message}`
      }
    });
  } else {
    value.role = {};
    value.role.deliveryBoy = true;

    return db
      .collection("admins")
      .doc(req.body.admins.id)
      .set(value)
      .then(() => {
        console.log("Delivery Boy successfully added");
        return res.status(200).json({
          res: {
            message: "Delivery BOy successfully added",
            code: "",
            deliveryBoy: value
          }
        });
      })
      .catch(e => {
        console.log("Add Delivery Boy error", e);
        return res.status(400).json({
          error: {
            message: "Error adding Delivery Boy",
            code: ""
          }
        });
      });
  }
});

exports = module.exports = route;
