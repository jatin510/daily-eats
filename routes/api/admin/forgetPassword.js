const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = require("express").Router();
const Joi = require("@hapi/joi");
const nodeMailer = require("nodemailer");
const crypto = require("crypto");
const async = require("async");

route.post("/", (req, res) => {
  let email = req.body.email;

  let auth = admin.auth();
  let emailAddress = email;

  auth
    .sendPasswordResetEmail(emailAddress)
    .then(() => {
      console.log("Rest Email sent");
      return res
        .status(200)
        .json({ res: { message: "Password reset Email set", code: "" } });
    })
    .catch(e => {
      console.log("Error sending email for reset password");
      return res.status(403).json({
        res: { message: "Error sending email for reset password", code: "" }
      });
    });
});

exports = module.exports = route;

// async.waterfall([
//     function(done) {
//       crypto.randomBytes(20, function(err, buf) {
//         let token = buf.toString("hex");
//         done(err, token);
//       });
//     },
//     function(token,done){
//        //find user in db

//     },
//     function(token,user,done){
//        // send mail

//        let smtpTransport = nodemailer.createTransport({
//           service : 'Gmail',
//           auth : {
//              user : 'xxxxxx@gmail.com',
//              pass : 'xxxxxxx'
//           }
//        });

//        let mailOptions = {
//           to : '',
//           from : 'xxxxx@gmail.com',
//           subject : 'Password Reset ',
//           text : ''
//        }
//     }

//   ]);
