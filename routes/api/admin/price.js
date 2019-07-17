const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

// function getPrice(value){
//     let subSchema = {}

//     subSchema.price = {}
// }
////////// price schema  /////////////

route.post("/", (req, res) => {
  let schema = Joi.object().keys({
    id: Joi.string().required(),
    price: {
      full: Joi.string.required(),
      lite: Joi.string().required()
    },
    description: {
      lite: Joi.string().required(),
      full: Joi.string().required()
    }
  });

  const { error, value } = Joi.validate(req.body.admins, schema);

  if (error) {
    console.log("Post Add price schema error", error.details[0].message);
    return res.status(400).json({
      error: {
        message: `Error adding price schema error, ${error.details[0].message}`
      }
    });
  } else {
    let priceDocRef = db.collection("prices").doc(req.body.admins.id);

    // let priceData = getPrice(req.body.admins);

    priceDocRef
      .set(priceDocRef, value, { merge: true })
      .then()
      .catch(e => {
        console.log("Error adding price", e);
        return res
          .status(400)
          .json({ error: { message: `Error adding price ,${e}` } });
      });
  }
});
