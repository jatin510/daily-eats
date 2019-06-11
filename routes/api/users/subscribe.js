const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");
const Validator = require("validatorjs");

route.use(express.json());

route.put("/", (req, res) => {
  //Code to add subscription

  let schema = {
    date: {
      from: "required",
      to: "required"
    },
    users: {
      subscription: {
        breakfast: {
          id: "",
          tag: "required",
          coordinates: {
            longitude: ""
          }
        }
      }
    }
  };
});

exports = module.exports = route;
