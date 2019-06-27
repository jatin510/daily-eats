const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

function getUpcomingMeal(value) {
  let subSchema = {};

  //// breakfast
  if (value.breakfast) {
    subSchema.breakfast = {};
    subSchema.breakfast.name = value.breakfast.name;
    subSchema.breakfast.image = value.breakfast.image;
    subSchema.breakfast.price = {};
    subSchema.breakfast.price.lite = value.breakfast.price.lite;
    subSchema.breakfast.price.full = value.breakfast.price.full;
    subSchema.breakfast.description = {};
  }
}

route.post("/", (req, res) => {
  let schema = Joi.object.keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    image: Joi.string().required(),
    price: {
      lite: Joi.string().required(),
      full: Joi.string().required()
    },
    description: {
      lite: Joi.string().required(),
      full: Joi.string().required()
    }
  });

  const { error, value } = Joi.validate(req.body.upcomingMeal, schema);

  if (error) {
    console.log(
      "Post Add upcoming meal schema error",
      error.details[0].message
    );
    return res.status(400).json({
      error: {
        message: `Error add upcoming meal schema error ${
          error.details[0].message
        }`
      }
    });
  } else {
    return db
      .collection("upcomingMeals")
      .add(value)
      .then(() => {
        console.log("Added upcoming meal successfully ");
        return res.status(200).json({
          message: "",
          code: "",
          upcomingMeal: value
        });
      })
      .catch(e => {
        console.log("Add upcoming meal error", e);
        return res.status(400).json({
          error: {
            message: "Error adding upcoming meal",
            code: ""
          }
        });
      });
  }
});

exports = module.exports = route;
