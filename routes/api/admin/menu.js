const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

route.post("/", (req, res) => {
  const schema = Joi.object().keys({
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
    if (req.body.menu.time === "breakfast") {
      console.log("inside breakfast");
      let type = req.body.menu.type;
      let foodName = req.body.menu.name;
      let docRef = db.collection("menu").doc("breakfast");

      docRef
        .set(
          {
            [type]: admin.firestore.FieldValue.arrayUnion(foodName)
          },
          { merge: true }
        )
        .then(() => {
          console.log("Breakfast Menu added successfully ");
          return res
            .status(200)
            .json({ res: { message: "Breakfast Menu added successfully" } });
        })
        .catch(e => {
          console.log("error adding Breakfast menu");
          return res
            .status(400)
            .json({ error: { message: "Error adding Breakfast menu" } });
        });
    }

    // lunch
    if (req.body.menu.time === "lunch") {
      console.log("inside lunch");
      let type = req.body.menu.type;
      let foodName = req.body.menu.name;

      let docRef = db.collection("menu").doc("lunch");

      docRef
        .update(
          {
            [type]: admin.firestore.FieldValue.arrayUnion(foodName)
          },
          { merge: true }
        )
        .then(() => {
          console.log("lunch Menu added successfully ");
          return res
            .status(200)
            .json({ res: { message: "lunch Menu added successfully" } });
        })
        .catch(e => {
          console.log("error adding lunch menu");
          return res
            .status(400)
            .json({ error: { message: "Error adding lunch menu" } });
        });
    }

    // dinner
    if (req.body.menu.time === "dinner") {
      console.log("inside dinner");
      let type = req.body.menu.type;
      let foodName = req.body.menu.name;

      let docRef = db.collection("menu").doc("dinner");

      docRef
        .set(
          {
            [type]: admin.firestore.FieldValue.arrayUnion(foodName)
          },
          { merge: true }
        )
        .then(() => {
          console.log("dinner Menu added successfully ");
          return res
            .status(200)
            .json({ res: { message: "dinner Menu added successfully" } });
        })
        .catch(e => {
          console.log("error adding dinner menu");
          return res
            .status(400)
            .json({ error: { message: "Error adding dinner menu" } });
        });
    }
  }
});

///////////////// delete //////////////
////////////////////////////////////////

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
    console.log("inside menu ");
    // breakfast
    if (req.body.menu.time === "breakfast") {
      console.log("inside breakfast");
      let type = req.body.menu.type;
      let foodName = req.body.menu.name;
      let docRef = db.collection("menu").doc("breakfast");

      docRef
        .set(
          { [type]: admin.firestore.FieldValue.arrayRemove(foodName) },
          { merge: true }
        )
        .then(() => {
          console.log("Breakfast Menu deleted successfully ");
          return res
            .status(200)
            .json({ res: { message: "Breakfast Menu deleted successfully" } });
        })
        .catch(e => {
          console.log("error delete Breakfast menu");
          return res
            .status(400)
            .json({ error: { message: "Error delete Breakfast menu" } });
        });
    }

    // lunch
    if (req.body.menu.time === "lunch") {
      console.log("inside lunch");

      let type = req.body.menu.type;
      let foodName = req.body.menu.name;

      let docRef = db.collection("menu").doc("lunch");

      docRef
        .set(
          {
            [type]: admin.firestore.FieldValue.arrayRemove(foodName)
          },
          { merge: true }
        )
        .then(() => {
          console.log("lunch Menu deleted successfully ");
          return res
            .status(200)
            .json({ res: { message: "lunch Menu deleted successfully" } });
        })
        .catch(e => {
          console.log("error delete lunch menu");
          return res
            .status(400)
            .json({ error: { message: "Error delete lunch menu" } });
        });
    }

    // dinner
    if (req.body.menu.time === "dinner") {
      console.log("inside dinner");
      let type = req.body.menu.type;
      let foodName = req.body.menu.name;

      let docRef = db.collection("menu").doc("dinner");

      docRef
        .set(
          {
            [type]: admin.firestore.FieldValue.arrayRemove(foodName)
          },
          { merge: true }
        )
        .then(() => {
          console.log("dinner Menu deleted successfully ");
          return res
            .status(200)
            .json({ res: { message: "dinner Menu deleted successfully" } });
        })
        .catch(e => {
          console.log("error delete dinner menu");
          return res
            .status(400)
            .json({ error: { message: "Error delete dinner menu" } });
        });
    }
  }
});

exports = module.exports = route;
