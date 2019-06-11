const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

route.use(express.json());

function notHaveRight(res) {
  console.log("User does not have this right");
  return res
    .status(403)
    .json({ error: { message: "User does not have this right" } });
}

route.post("/", (req, res) => {
  const user = req.users;

  const role = req.user.role;

  if (role) {
    console.log("hello");
  } else return notHaveRight(res);

  const userSchema = Joi.object().keys({
    id: Joi.string(),
    name: Joi.string().required(),
    phone: Joi.number().required(),
    email: Joi.string().email({ minDomainSegments: 2 }),
    role: Joi.object().required() //
  });

  const { error, value } = Joi.validate(req.body, userSchema);

  if (error) {
    console.log("Post Add User Error", error);
    return res.status(400).json({ error: { message: "Post Add User Error" } });
  } else {
    return db
      .collection("users")
      .doc(value.id)
      .set(value)
      .then(val => {
        console.log("User successfully added");
        return res
          .status(200)
          .json({ res: { message: "User successfully added", user: value } });
      })
      .catch(error => {
        console.log("Post Add User Error", error);
        return res.status(400).json({ error: { message: "" } });
      });
  }
});

module.exports = route;
