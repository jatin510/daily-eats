const admin = require("firebase-admin");

const db = admin.firestore();
const express = require("express");
const route = express.Router();
const Joi = require("@hapi/joi");

// post request

route.post("/", (req, res) => {
  const schema = {
    id: Joi.string().required(),
    transaction: {
      id: Joi.string().required(),
      method: Joi.string().required(),
      amount: Joi.string().required(),
      status: {
        successfull: Joi.boolean(),
        failed: Joi.boolean(),
        pending: Joi.boolean()
      },
      accountEntry: {
        credit: Joi.boolean(),
        debit: Joi.boolean()
      },
      time: Joi.string().required()
    }
  };

  let { error, value } = Joi.validate(req.body.users, schema);

  if (error) {
    console.log("Post transaction schema error", error.details[0].message);
    return res.status(400).json({
      error: {
        nessage: `Post transaction schema error, ${error.details[0].message}`,
        code: ""
      }
    });
  } else {
    let batch = db.batch();

    //user transaction
    console.log("user transaction batch starting");
    let transactionData = getTransaction(req.body.users);

    let userTransactionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("transactions");

    // preparing data for the transaction
    transactionData = value.transaction;
    batch.set(userTransactionRef, transactionData, { merge: true });

    console.log("user transaction batch ended");

    // transaction collection
    console.log(" transaction collection batch starting");
    console.log(" transaction collection batch ended");

    // batch commit

    batch
      .commit()
      .then(() => {
        console.log("Transaction batch successfully completed");
        return res.status(200).json({
          res: { message: "transaction batch successfully completed", code: "" }
        });
      })
      .catch(e => {
        console.log("problem in transaction batch");
        return res.status(403).json({
          error: { message: "error in transacation batch", code: "" }
        });
      });
  }
});

// put request

module.exports = route;
