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
    res.status(403).send("UnAauthorized");
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

//handling trialpack
exports.trialRedeem = functions.firestore
  .document("users/{userId}/transaction/{transactionId}")
  .onCreate((snap, context) => {});

//handling referal code
exports.onUserCreation = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    // //newUserRef
    // let userRef = db.collection("users").doc(context.params.userId);
    // //Invitation code of the existing user
    // let inviteUserCode = await userRef.get().then(doc => {
    //   if (!doc.exists) return console.log("No Document Exist");
    //   else {
    //     console.log("Document data :", doc.data());
    //     return doc.data().invitationCode;
    //   }
    // });
    // //assigning invitation code of new users
    // await userRef
    //   .update({
    //     refferalCode: ""
    //   })
    //   .then(res => {
    //     return console.log("Successfully added referal code for new user");
    //   })
    //   .catch(e => {
    //     console.log("Error adding referal code", e);
    //   });
    // //fetching data of the inviting user
    // let inviteUserDocID = await db
    //   .collection("users")
    //   .doc(inviteUserCode)
    //   .get()
    //   .then(doc => {
    //     if (!doc.exists) return console.log("Document does not exist");
    //     else {
    //       console.log("Document data : ", doc.data());
    //       return doc.data().id;
    //     }
    //   })
    //   .catch(e => console.log("error fetching the id of inviting user", e));
    // //assignment in the inviting user
    // // let dataUpdate = await db.collection('users').doc(inviteUserDocID).collection('refferal').doc().set()
    // // })

    //assignment of refferalCode to new User

    snap.data();

    //invitation code of old user
    console.log(snap.data());

    let existingUserRefferalCode;
    if (snap.data().invitationCode) {
      existingUserRefferalCode = snap.data().invitationCode;
    }

    let newUserDocId = snap.data().id;
    let newUserName = snap.data().name;

    //refferal code generation is left
    let refferalCode = "";

    let existingUserDocId = await db
      .collection("refferalCodes")
      .doc(existingUserRefferalCode)
      .get()
      .then(doc => {
        if (!doc.exists) return console.log("Docuemnt does not exist");
        return doc.data().id;
      })
      .catch(e => console.log("Error in fetching userId", e));

    db.collection("users")
      .doc(existingUserDocId)
      .collection("refferal")
      .add({ id: newUserDocId, name: newUserName });
  });
