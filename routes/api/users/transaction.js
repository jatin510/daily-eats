const admin = require("firebase-admin");

const db = admin.firestore();
const route = require("express").Router();
const Razorpay = require("razorpay");
const Joi = require("@hapi/joi");
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function main(amount, email, name) {
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    service: "gmail",
    auth: {
      user: "jon2088snow@gmail.com", // generated ethereal user
      pass: "theaccounthasnopassword" // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "john2099snow@gmail.com", // sender address
    to: email, // list of receivers
    subject: `Hello ✔ ${name} , your recharge of ${amount} was successfull`, // Subject line
    text: `Hello ✔ ${name} , your recharge of ${amount} was successfull`, // plain text body
    html: `Hello ✔ ${name} , your recharge of ${amount} was successfull` // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

async function getTransactionData(order, userId) {
  let subSchema = {};
  let userName;
  let userPhone;
  let userEmail;

  let userData = await db
    .collection("users")
    .doc(userId)
    .get();

  userData.forEach(doc => {
    let userData = doc.data();

    userName = userData.name;
    userPhone = userData.phone;
    if (userData.email) {
      userEmail = userData.email;
    }
  });

  subSchema.orderId = order.id;
  subSchema.time = order["created_at"];
  subSchema.receipt = order.receipt;

  // status
  subSchema.status = {};
  subSchema.status.pending = true;

  // account entry
  subSchema.accountEntry = {};
  subSchema.accountEntry.credit = true;

  // user details
  subSchema.user = {};
  subSchema.user.name = userName;
  subSchema.user.phone = userPhone;
  if (userEmail) subSchema.user.email = userEmail;

  return subSchema;
}

let instance = new Razorpay({
  key_id: "rzp_test_UVxky2BI7xOprZ",
  key_secret: "ejLssWIVxjaKB5eLMbk7j1yo"
});

function getTransaction(value) {
  let subSchema = {};

  // subSchema.method = value.transaction.method;
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
      // method: Joi.string().required(),
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

    instance.orders.create(options, async (err, order) => {
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

      ///////////  transaction collection //////////////////////////

      let transactionData = await getTransactionData(order, req.body.users.id);
      let transactionRef = db.collection("transactions").doc(order.id);

      batch.set(transactionRef, { transactionData }, { merge: true });

      //batch commit
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

route.post("/confirmpayment", (req, res) => {
  let schema = Joi.object().keys({
    users: {
      id: Joi.string().required(),
      orderId: Joi.string().required(),
      paymentId: Joi.string().required(),
      amount: Joi.string().required()
    }
  });
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

    // fetching user data
    let email;
    let name;

    db.collection("users")
      .doc(req.body.users.id)
      .get()
      .then(doc => {
        if (!doc.exists) {
          return console.log("user does not exist");
        } else {
          name = doc.data().name;

          if (doc.data().email) {
            email = doc.data().email;
          }
          return;
        }
      })
      .catch(e => console.log("error", e));

    /// user wallet

    let userWalletDoc = db.collection("users").doc(req.body.users.id);

    let amount = parseInt(req.body.users.amount);

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
    // have to do this

    let transactionDocRef = db
      .collection("transactions")
      .doc(req.body.users.orderId);

    batch.set(
      transactionDocRef,
      { paymentId: req.body.users.paymentId },
      { merge: true }
    );

    // batch commit
    batch
      .commit()
      .then(() => {
        console.log("Payment Confirnmation successfull");

        // send mail if email exists
        if (email) {
          main(req.body.users.amount, email, name);
        }
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

route.post("/paymentfailed", (req, res) => {
  let schema = Joi.object().keys({
    users: {
      id: Joi.string().required(),
      orderId: Joi.string().required()
    }
  });

  const { value, error } = Joi.validate(req.body, schema);

  if (error) {
    console.log("Error in the schema ,", error.details[0].message);
    return res.status(400).json({
      error: { message: `Error in the schema, ${error.details[0].message}` }
    });
  } else {
    let batch = db.batch();

    let userTransactionRef = db
      .collection("users")
      .doc(req.body.users.id)
      .collection("transactions")
      .doc(req.body.users.orderId);

    batch.set(
      userTransactionRef,
      {
        status: {
          failed: true
        }
      },
      { merge: true }
    );

    batch
      .commit()
      .then(() => {
        console.log("successfully updated status");
        return res
          .status(200)
          .json({ res: { message: "successfully updated status" } });
      })
      .catch(e => {
        console.log("error updating ", e);
        return res
          .status(400)
          .json({ error: { message: "error updating the status" } });
      });
  }
});

module.exports = route;
