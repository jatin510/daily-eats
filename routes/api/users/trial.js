const admin = require("firebase-admin");

const db = admin.firestore();
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.post("/", (req, res) => {
  const schema = {};

  let { error, value } = Joi.validate(req.body.users, schema);

  if (error) {
    console.log("Post trial schema error");
    return res.status(400).json({
      error: {
        message: `Post trial schema error , ${error.details[0].message}`
      }
    });
  } else {
    let date = req.body.users.date;

    date = new Date(date);

    let month = date.getMonth() + 1;
    let year = date.getFullYear();
  }
});

module.exports = route;
