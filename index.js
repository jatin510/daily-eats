const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const express = require("express");
const cors = require("cors")({ origin: true });
const Joi = require("@hapi/joi");
const app = express();
const cookieParser = require("cookie-parser")();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//refer code generation
function getReferCode() {
  let code = "";
  let random = Math.random()
    .toString(36)
    .substr(2, 6);

  code += random;
  code = code.toUpperCase();

  db.collection("referCodes")
    .doc(code)
    .get()
    .then(doc => {
      if (!doc.exists) return;
      return getReferCode();
    })
    .catch(e => console.log("error in refer code generation", e));

  return code;
}

function getOrderData(value) {
  var orderSchema = {};

  if (value.breakfast) {
    //breakfast
    orderSchema.breakfast = {};
    orderSchema.breakfast.address = {};
    orderSchema.breakfast.address.coordinates = {};
    orderSchema.breakfast.status = {};

    orderSchema.breakfast.address.tag = value.breakfast.address.tag;
    orderSchema.breakfast.address.coordinates.latitude =
      value.breakfast.address.coordinates.latitude;
    orderSchema.breakfast.address.coordinates.longitude =
      value.breakfast.address.coordinates.longitude;
    orderSchema.breakfast.address.address1 = value.breakfast.address.address1;
    orderSchema.breakfast.address.address2 = value.breakfast.address.address2;
    orderSchema.breakfast.address.area = value.breakfast.address.area;
    orderSchema.breakfast.address.city = value.breakfast.address.city;

    if (value.breakfast.quantity !== 0)
      orderSchema.breakfast.status.upcoming = true;
    else orderSchema.breakfast.status.upcoming = false;

    orderSchema.breakfast.price = value.breakfast.price;
    if (value.breakfast.lite) orderSchema.breakfast.lite = true;
    if (value.breakfast.full) orderSchema.breakfast.full = true;
  }
  if (value.lunch) {
    //lunch
    orderSchema.lunch = {};
    orderSchema.lunch.address = {};
    orderSchema.lunch.address.coordinates = {};
    orderSchema.lunch.status = {};

    orderSchema.lunch.address.tag = value.lunch.address.tag;
    orderSchema.lunch.address.coordinates.latitude =
      value.lunch.address.coordinates.latitude;
    orderSchema.lunch.address.coordinates.longitude =
      value.lunch.address.coordinates.longitude;
    orderSchema.lunch.address.address1 = value.lunch.address.address1;
    orderSchema.lunch.address.address2 = value.lunch.address.address2;
    orderSchema.lunch.address.area = value.lunch.address.area;
    orderSchema.lunch.address.city = value.lunch.address.city;

    if (value.lunch.quantity !== 0) orderSchema.lunch.status.upcoming = true;
    else orderSchema.lunch.status.upcoming = false;

    orderSchema.lunch.price = value.lunch.price;
    if (value.lunch.lite) orderSchema.lunch.lite = true;
    if (value.lunch.full) orderSchema.lunch.full = true;
  }
  if (value.dinner) {
    //dinner
    orderSchema.dinner = {};
    orderSchema.dinner.address = {};
    orderSchema.dinner.address.coordinates = {};
    orderSchema.dinner.status = {};

    orderSchema.dinner.address.tag = value.dinner.address.tag;
    orderSchema.dinner.address.coordinates.latitude =
      value.dinner.address.coordinates.latitude;
    orderSchema.dinner.address.coordinates.longitude =
      value.dinner.address.coordinates.longitude;
    orderSchema.dinner.address.address1 = value.dinner.address.address1;
    orderSchema.dinner.address.address2 = value.dinner.address.address2;
    orderSchema.dinner.address.area = value.dinner.address.area;
    orderSchema.dinner.address.city = value.dinner.address.city;

    if (value.dinner.quantity !== 0) orderSchema.dinner.status.upcoming = true;
    else orderSchema.dinner.status.upcoming = false;

    orderSchema.dinner.price = value.dinner.price;
    if (value.dinner.lite) orderSchema.dinner.lite = true;
    if (value.dinner.full) orderSchema.dinner.full = true;
  }

  return orderSchema;
}

const validateFirebaseIdToken = (req, res, next) => {
  console.log("Check if request is authorized with Firebase ID token");

  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      "No Firebase ID token was passed as a Bearer token in the Authorization header.",
      "Make sure you authorize your request by providing the following HTTP header:",
      "Authorization: Bearer <Firebase ID Token>",
      'or by passing a "__session" cookie.'
    );
    res.status(403).send("UnAuthorized");
    return;
  }

  let idToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    console.log('Found "__session" cookie');
    //Read the ID Token from cookie
    idToken = req.cookies.__session;
  } else {
    //No cookie
    console.log("no cookie");
    res.status(403).send("Unauthorized");
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedIdToken => {
      req.user = decodedIdToken;

      return req;
    })
    .then(token => {
      if (!token) {
        console.log("User does not exist", req.user.uid);
        return res
          .status(403)
          .json({ error: { message: "User does not exist" } });
      }

      return next();
    })
    .catch(error => {
      console.error("Error while verifying Firebase ID token:", error);
      res.status(403).json({ error: { message: "Unauthorized" } });
    });
};

app.use(cookieParser);
// app.use(validateFirebaseIdToken);
app.use("/", require("./routes/api"));

app.get("/hello", (req, res) => {
  console.log("hello");
  res.send("Hello");
});

exports.api = functions.https.onRequest(app);

//handling trialPack
exports.trialRedeem = functions.firestore
  .document("users/{userId}/transaction/{transactionId}")
  .onCreate((snap, context) => {});

//handling refer code
exports.onUserCreation = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    //new user info
    let newUserDocId = snap.data().id;
    let newUserName = snap.data().name;

    console.log(snap.data());

    //invitation code of old user
    let existingUserReferCode;
    if (snap.data().invitationCode) {
      console.log("invitation code data");

      existingUserReferCode = snap.data().invitationCode;

      // finding the document id of existing user
      let existingUserDocId = await db
        .collection("referCodes")
        .doc(existingUserReferCode)
        .get();

      console.log("test");
      console.log(existingUserDocId);

      if (existingUserDocId) {
        if (existingUserDocId.exists) {
          existingUserDocId = existingUserDocId.data().userId;
          console.log("document does exist inside the refers");
          // writing the data in the existing user
          if (existingUserDocId) {
            db.collection("users")
              .doc(existingUserDocId)
              .collection("refers")
              .add({ id: newUserDocId, name: newUserName });
          }
        }
      }
      console.log("existing user doc id", existingUserDocId);
    }

    //refer code generation
    let generatedReferCode = getReferCode();

    //refer code collection updation

    console.log("update in refer codes");
    let referDocRef = db.collection("referCodes").doc(generatedReferCode);

    referDocRef.set(
      { userId: newUserDocId, userName: newUserName },
      { merge: true }
    );

    //update for admin totals

    console.log("update in totals");

    let totalActiveUser = db.collection("totals").doc("users");

    totalActiveUser.update({
      totalUsers: admin.firestore.FieldValue.increment(1)
    });

    console.log("starting refer code updation");

    return snap.ref.update({
      referCode: generatedReferCode
    });
  });

//user subscribing the meal
// exports.onUserSubscription = functions.firestore
//   .document("users/{userId}/subscriptions/{subscriptionId}")
//   .onCreate((snap, context) => {
//     console.log(snap.data());

//     //order Data
//     orderData = getOrderData(snap.data());

//     if (snap.data().breakfast) {
//     }
//   });
