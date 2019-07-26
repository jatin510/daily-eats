const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

function getOffer(value) {
  let subSchema = {};

  subSchema.code = value.code;
  subSchema.validity = value.validity;
  subSchema.amount = value.amount;
  subSchema.offerAmount = value.offerAmount;

  return subSchema;
}

route.post("/", (req, res) => {
  let schema = Joi.object().keys({
    code: Joi.string().required(),
    validity: Joi.string().required(),
    amount: Joi.string().required(),
    offerAmount: Joi.string().required()
  });

  const { value, error } = Joi.validate(req.body.offers, schema);

  if (error) {
    console.log("error in offers schema", error.details[0].message);
    return res.status(400).json({
      error: `error in offers schema ,  ${error.details[0].message}`
    });
  } else {
    let offerData = getOffer(req.body.offers);

    let offerDoc = db.collection("offers").doc(req.body.offers.code);

    offerDoc
      .set(offerData)
      .then(() => {
        console.log("offer successfully added");
        return res.status(200).json({ message: "offer successfully added" });
      })
      .catch(e => {
        console.log("error adding offers", e);
        return res.status(400).json({ error: "Error adding the offer" });
      });
  }
});

module.exports = route;
