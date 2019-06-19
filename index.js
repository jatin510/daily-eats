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

function getReferralCode() {
  let code = "DE";
  let random = Math.random()
    .toString(36)
    .substr(2, 4);

  code += random;
  code = code.toUpperCase();

  db.collection("referralCodes")
    .doc(code)
    .get()
    .then(doc => {
      if (!doc.exists) return;
      return getReferralCode();
    })
    .catch(e => console.log("error in referral code generation", e));
  return code;
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
      // return db
      //   .collection("users")
      //   .doc(req.user.uid)
      //   .get();
      return req;
    })
    .then(token => {
      if (!token) {
        console.log("User does not exist", req.user.uid);
        return res
          .status(403)
          .json({ error: { message: "User does not exist" } });
      }

      // req.user = userDoc.data();
      // req.user.id = userDoc.id();

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

//handling referral code
exports.onUserCreation = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    snap.data();

    console.log(snap.data());

    //invitation code of old user
    let existingUserReferralCode;
    if (snap.data().invitationCode) {
      existingUserReferralCode = snap.data().invitationCode;

      // finding the existing user
      let existingUserDocId = await db
        .collection("referralCodes")
        .doc(existingUserReferralCode)
        .get();

      existingUserDocId.forEach(doc => {
        if (!doc.exists) return console.log("Document does not exist");
        return doc.data().id;
      });

      // writing the data in the existing user
      db.collection("users")
        .doc(existingUserDocId)
        .collection("referral")
        .add({ id: newUserDocId, name: newUserName });
    }

    //new user info
    let newUserDocId = snap.data().id;
    let newUserName = snap.data().name;

    //referral code generation
    let generatedReferralCode = getReferralCode();

    //referral code collection updation

    let referralDocRef = db
      .collection("referralCodes")
      .doc(generatedReferralCode);

    referralDocRef.set(
      { userId: newUserDocId, userName: newUserName },
      { merge: true }
    );

    return snap.ref.set({
      referralCode: generatedReferralCode
    });
  });
