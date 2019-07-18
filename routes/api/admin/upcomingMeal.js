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
    subSchema.breakfast.description.lite = value.breakfast.description.lite;
    subSchema.breakfast.description.full = value.breakfast.description.full;
  }

  //// lunch
  if (value.lunch) {
    subSchema.lunch = {};
    subSchema.lunch.name = value.lunch.name;
    subSchema.lunch.image = value.lunch.image;

    subSchema.lunch.price = {};
    subSchema.lunch.price.lite = value.lunch.price.lite;
    subSchema.lunch.price.full = value.lunch.price.full;

    subSchema.lunch.description = {};
    subSchema.lunch.description.lite = value.lunch.description.lite;
    subSchema.lunch.description.full = value.lunch.description.full;
  }

  //// dinner
  if (value.dinner) {
    subSchema.dinner = {};
    subSchema.dinner.name = value.dinner.name;
    subSchema.dinner.image = value.dinner.image;

    subSchema.dinner.price = {};
    subSchema.dinner.price.lite = value.dinner.price.lite;
    subSchema.dinner.price.full = value.dinner.price.full;

    subSchema.dinner.description = {};
    subSchema.dinner.description.lite = value.dinner.description.lite;
    subSchema.dinner.description.full = value.dinner.description.full;
  }

  return subSchema;
}

////////////////
// add upcoming meal
route.post("/", (req, res) => {
  let schema;
  schema = Joi.object().keys({
    date: Joi.string().required(),
    breakfast: {
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
    },
    lunch: {
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
    },
    dinner: {
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
    }
  });

  const { error, value } = Joi.validate(req.body.upcomingMeals, schema);

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
    // maybe this will not be required
    let upcomingMealData = getUpcomingMeal(req.body.upcomingMeals);

    let dateString = req.body.upcomingMeals.date;

    let d = new Date(dateString);

    let date = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();

    // to be done
    let docId = `${date}${month}${year}`;

    let upcomingMealDocRef = db.collection("upcomingMeals").doc(docId);

    // console.log("value", value);
    // deleting date inside the value
    delete value.date;

    upcomingMealDocRef
      .set(value, { merge: true })
      .then(() => {
        console.log("Added upcoming meal successfully ");
        return res.status(200).json({
          message: "added upcoming meal successfully",
          code: ""
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

// edit upcoming meal

exports = module.exports = route;
