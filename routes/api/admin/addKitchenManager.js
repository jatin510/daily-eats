const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

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
      name: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required()
    }
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

    let kitchenData = getKitchenData(req.body.admins)

    let kitchenRef = db.collection('kitchens')
    batch.add(kitchenRef,kitchenData)

    let adminRef = db.collection("admins").doc(req.body.admins.id);
    batch.set(adminRef, value)
      
    batch.commit()
    .then(()=>{
      console.log('successfully added the kitchen and km')
      return res.status(200).json({res :{message : "successfully added the kitchen and km",code :""}})
    })
    .catch(error => {
      console.log('Error adding the kitchen and kitchen Manager',error)
      return res.status(400).json({error :{
        message :"Error adding the kitchen  and KM",
        code :""
      }})
    })
   
}

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
      name: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  });
  const { error, value } = Joi.validate(req.body.admins, schema);

  if (error) {
    console.log(
      "Post editing Kitchen Data schema error ",
      error.details[0].message
    );
    return res.status(400).json({
      error: {
        message: `Error editing Kitchen Manager schema, ${
          error.details[0].message
        }`
      }
    });
  } else {
    value.role = {};
    value.role.kitchenManager = true;

    return db
      .collection("admins")
      .doc(req.body.admins.id)
      .set(value)
      .then(() => {
        console.log("Kitchen Manager successfully edited ");
        return res.status(200).json({
          res: {
            message: "Kitchen manager successfully edited successfully",
            code: "",
            kitchenManager: value
          }
        });
      })

      .catch(e => {
        console.log("edit Kitchen Manager error ", e);
        return res.status(400).json({
          error: {
            message: "Error editing kitchen manager",
            code: ""
          }
        });
      });
  }
});

exports = module.exports = route;
