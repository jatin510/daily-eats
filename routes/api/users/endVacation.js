const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");

route.use(express.json());

route.get("/", (req, res) => {
  res.send("End Vacation");
});

route.post("/", (req, res) => {
  //Code to end vacation
});

exports = module.exports = route;
