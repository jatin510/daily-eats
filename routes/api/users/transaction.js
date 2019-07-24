const admin = require("firebase-admin");

const db = admin.firestore();
const route = require("express").Router();
const Razorpay = require("razorpay");
const Joi = require("@hapi/joi");

let instance = new Razorpay({
  key_id: "rzp_test_UVxky2BI7xOprZ",
  key_secret: "ejLssWIVxjaKB5eLMbk7j1yo"
});

function getTransaction(value) {
  let subSchema = {};

  subSchema.method = value.transaction.method;
  subSchema.amount = value.transaction.amount;
  subSchema.status = {};
  subSchema.status.pending = true;
  // don't know how to do this time

  subSchema.accountEntry = {};
  if (value.transaction.accountEntry.credit) {
    subSchema.accountEntry.credit = true;
  }
  if (value.transaction.accountEntry.debit) {
    subSchema.accountEntry.debit = true;
  }

  return subSchema;
}

route.post("/createorder", (req, res) => {
  let schema = Joi.object().keys({
    id: Joi.string().required(),
    transaction: {
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
      receipt: Joi.string(),
      time: Joi.string().required()
    }
  });

  const { value, error } = Joi.validate(req.body.users, schema);

  //   const error = false;

  if (error) {
    console.log("Error in the creating order schema", error.details[0].message);
    return res.status(400).json({
      error: `error in the transaction schema, ${error.details[0].message}`
    });
  } else {
    let batch = db.batch();

    let options = {
      amount: req.body.users.transaction.amount,
      currency: "INR",
      receipt: req.body.users.transaction.receipt,
      payment_capture: "1"
    };

    instance.orders.create(options, (err, order) => {
      if (err) {
        console.log("transaction error", err);
        return res.status.json({ error: { message: `error, ${err}` } });
      }

      console.log("storing data into db");

      let userTrasactionData = getTransaction(req.body.users);

      let userTrasactionDocRef = db
        .collection("users")
        .doc(req.body.users.id)
        .collection("transactions")
        .doc(order.id);

      // adding order id into the db
      userTrasactionData.id = order.id;
      userTrasactionData.entity = order.entity;
      userTrasactionData.notes = order.notes;
      userTrasactionData.creationTime = order["created_at"];

      console.log(order);

      batch.set(userTrasactionDocRef, userTrasactionData, { merge: true });

      batch
        .commit()
        .then(() => {
          console.log("transaction successfull");

          return res.status(200).json({ res: { message: order.id } });
        })
        .catch(e => {
          console.log("Error commiting the batch", e);
          return res.status(400).json({
            error: {
              message: `Error commiting the batch `,
              code: ""
            }
          });
        });
    });
  }
});

route.post("/paymentconfirm", (req, res) => {
  let schema = {
    users: {
      id: Joi.string().required(),
      orderId: Joi.string().required(),
      paymentId: Joi.string().required(),
      amount: Joi.number().required()
    }
  };
  const { error, value } = Joi.validate(req.body, schema);

  if (error) {
    console.log("Error in confirm payment Schema ,", error.details[0].message);

    res.status(400).json({
      error: {
        message: `Error in payment confirmation schema , ${
          error.details[0].message
        }`
      }
    });
  } else {
    let batch = db.batch();

    /// user wallet

    let userWalletDoc = db.collection("users").doc(req.body.users.id);

    batch.set(userWalletDoc, {
      wallet: admin.firestore.FieldValue.increment(amount)
    });

    // user transaction doc
    let userTransactionDoc = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("transactions")
      .doc(req.body.users.orderId);

    batch.set(
      userTransactionDoc,
      {
        paymentId: req.body.users.paymentId,
        status: {
          successful: true
        }
      },
      { merge: true }
    );

    // transaction collection

    let transactionDocRef = db.collection("transactions");

    batch
      .commit()
      .then(() => {
        console.log("Payment Confirnmation successfull");
        return res.status(200).json({
          res: {
            message: "payment confirmed"
          }
        });
      })
      .catch(e => {
        console.log("Error in confirm payment ", e);
        return res.status(400).json({
          error: {
            message: "Error in confirm payment"
          }
        });
      });
  }
});

module.exports = route;
