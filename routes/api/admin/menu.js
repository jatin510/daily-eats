const functions = require("firebase-functions");
const admin = require("firebase-admin");

const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

function getMenuData(value) {
  if (value.id === "breakfast") {
  }
}

route.post("/", (req, res) => {
  const schema = Joi.object({
    time: Joi.string().required(),
    type: Joi.string().required(),
    name: Joi.string().required()
  });

  const { error, value } = Joi.validate(req.body.menu, schema);

  if (error) {
    console.log("Post meal schema validation", error.details[0].message);
    res.status(400).json({
      error: {
        message: `Add Meal schema error ${error.details[0].message}`
      }
    });
  } else {
    //  let menuData = getMenuData(req.body.menu);

    // breakfast
    if (req.body.menus.time === "breakfast") {
      let type = req.body.menus.type;
      let foodName = req.body.menus.name;
      let docRef = db.collection("menus").doc("breakfast");

      docRef.update({
        type: FirebaseFirestore.firestore.FieldValue.arrayUnion(foodName)
      });
    }

    // lunch
    if (req.body.menus.time === "lunch") {
      let type = req.body.menus.type;
      let foodName = req.body.menus.name;

      let docRef = db.collection("menus").doc("lunch");

      docRef.update({
        type: FirebaseFirestore.firestore.FieldValue.arrayUnion(foodName)
      });
    }

    // dinner
    if (req.body.menus.time === "dinner") {
      let type = req.body.menus.type;
      let foodName = req.body.menus.name;

      let docRef = db.collection("menus").doc("dinner");

      docRef.update({
        type: FirebaseFirestore.firestore.FieldValue.arrayUnion(foodName)
      });
    }
  }
});

route.delete("/", (req, res) => {
  const schema = Joi.object({
    time: Joi.string().required(),
    type: Joi.string().required(),
    name: Joi.string().required()
  });

  const { error, value } = Joi.validate(req.body.menu, schema);

  if (error) {
    console.log("Post meal schema validation", error.details[0].message);
    res.status(400).json({
      error: {
        message: `Add Meal schema error ${error.details[0].message}`
      }
    });
  } else {
    // breakfast
    if (req.body.menus.time === "breakfast") {
      let type = req.body.menus.type;
      let foodName = req.body.menus.name;
      let docRef = db.collection("menus").doc("breakfast");

      docRef.update({
        type: FirebaseFirestore.firestore.FieldValue.arrayRemove(foodName)
      });
    }

    // lunch
    if (req.body.menus.time === "lunch") {
      let type = req.body.menus.type;
      let foodName = req.body.menus.name;

      let docRef = db.collection("menus").doc("lunch");

      docRef.update({
        type: FirebaseFirestore.firestore.FieldValue.arrayRemove(foodName)
      });
    }

    // dinner
    if (req.body.menus.time === "dinner") {
      let type = req.body.menus.type;
      let foodName = req.body.menus.name;

      let docRef = db.collection("menus").doc("dinner");

      docRef.update({
        type: FirebaseFirestore.firestore.FieldValue.arrayRemove(foodName)
      });
    }
  }
});

exports = module.exports = route;
