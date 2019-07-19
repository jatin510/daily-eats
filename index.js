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

//handling trialPack
exports.trialRedeem = functions.firestore
  .document("users/{userId}/transaction/{transactionId}")
  .onCreate((snap, context) => {});

//handling refer code on user creation
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

// user subscribing the meal
exports.onUserSubscribe = functions.firestore
  .document("users/{userId}/subscriptions/{subscriptionId}")
  .onWrite((change, context) => {
    console.log(change.after.data());

    //batch creation
    let batch = db.batch();

    //subscriptionDocId
    let subscriptionDocId = context.params.subscriptionId;

    // for accessing different documents
    let date = subscriptionDocId.substring(0, 2);
    let month = subscriptionDocId.substring(2, 4);
    let year = subscriptionDocId.substring(4, 8);

    /// order  collection updation ///
    let orderData = change.after.data();

    let orderDocRef = db
      .collection("orders")
      .doc(`${month}${year}`)
      .collection(`${date}${month}${year}`)
      .doc(context.params.userId);

    batch.set(orderDocRef, orderData, { merge: true });

    /////////////////////////////////////////
    /////// kitchen collection ////////////
    /////// total collection ////////////////

    // kitchen collection
    let kitchenDocRef = db
      .collection("kitchen")
      .doc(kitchenId)
      .collection("deliveries")
      .doc(`${date}${month}${year}`);

    // kitchen total
    let kitchenTotalDocRef = db.collection("totals").doc("kitchens");

    // monthly total
    let monthlyTotalDocRef = db
      .collection("totals")
      .doc("kitchens")
      .collection("months")
      .doc(`${month}${date}`);

    // daily total
    let dailyTotalDocRef = db
      .collection("totals")
      .doc("kitchens")
      .collection("months")
      .doc(`${month}${year}`)
      .collection("dates")
      .doc(`${date}${month}${year}`);

    //breakfast
    if (orderData.breakfast) {
      /// upcoming true
      if (orderData.breakfast.status.upcoming === true) {
        if (orderData.breakfast.lite) {
          // kitchen collection
          kitchenDocRef.update({});
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          /// monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
        if (orderData.breakfast.full) {
          //kitchen collection
          kitchenDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          //monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
      }

      /// upcoming false
      if (orderData.breakfast.status.upcoming === false) {
        if (orderData.breakfast.lite) {
          //kitchen collection
          kitchenDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
        if (orderData.breakfast.full) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
      }

      /// vacation true
      if (orderData.breakfast.status.vacation === true) {
        if (orderData.breakfast.lite) {
          //kitchen collection
          kitchenDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          //monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
        if (orderData.breakfast.full) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
      }

      /// vacation false
      if (
        orderData.breakfast.status.vacation === false &&
        orderData.breakfast.status.upcoming === true
      ) {
        if (orderData.breakfast.lite) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              breakfast: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
        if (orderData.breakfast.full) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              breakfast: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
      }
    }

    //lunch
    if (orderData.lunch) {
      /// upcoming true
      if (orderData.lunch.status.upcoming === true) {
        if (orderData.lunch.lite) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          /// monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
        if (orderData.lunch.full) {
          //kitchen collection
          kitchenDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          //monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
      }

      /// upcoming false
      if (orderData.lunch.status.upcoming === false) {
        if (orderData.lunch.lite) {
          //kitchen collection
          kitchenDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
        if (orderData.lunch.full) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
      }

      /// vacation true
      if (orderData.lunch.status.vacation === true) {
        if (orderData.lunch.lite) {
          //kitchen collection
          kitchenDocRef.update({
            [totalCount]: admin.firestore.FieldValue.increment(-1)
          });
          //kitchen total
          kitchenTotalDocRef.update({
            [totalCount]: admin.firestore.FieldValue.increment(-1)
          });
          //monthly total
          monthlyTotalDocRef.update({
            [totalCount]: admin.firestore.FieldValue.increment(-1)
          });
          // daily total
          dailyTotalDocRef.update({
            [totalCount]: admin.firestore.FieldValue.increment(-1)
          });
        }
        if (orderData.lunch.full) {
          let totalCount = "totalCount.lunch.full";
          // kitchen collection
          kitchenDocRef.update({
            [totalCount]: admin.firestore.FieldValue.increment(-1)
          });
          //kitchen total
          kitchenTotalDocRef.update({
            [totalCount]: admin.firestore.FieldValue.increment(-1)
          });
          // monthly total
          monthlyTotalDocRef.update({
            [totalCount]: admin.firestore.FieldValue.increment(-1)
          });
          // daily total
          dailyTotalDocRef.update({
            [totalCount]: admin.firestore.FieldValue.increment(-1)
          });
        }
      }

      /// vacation false
      if (orderData.lunch.status.vacation === false) {
        if (orderData.lunch.lite) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              lunch: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
        if (orderData.lunch.full) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              lunch: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
      }
    }

    //dinner
    if (orderData.dinner) {
      /// upcoming true
      if (orderData.dinner.status.upcoming === true) {
        if (orderData.dinner.lite) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          /// monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
        if (orderData.dinner.full) {
          //kitchen collection
          kitchenDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          //monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
      }

      /// upcoming false
      if (orderData.dinner.status.upcoming === false) {
        if (orderData.dinner.lite) {
          //kitchen collection
          kitchenDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
        if (orderData.dinner.full) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
      }

      /// vacation true
      if (orderData.dinner.status.vacation === true) {
        if (orderData.dinner.lite) {
          //kitchen collection
          kitchenDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          //monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
        if (orderData.dinner.full) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(-1)
              }
            }
          });
        }
      }

      /// vacation false
      if (orderData.dinner.status.vacation === false) {
        if (orderData.dinner.lite) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              dinner: {
                lite: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
        if (orderData.dinner.full) {
          // kitchen collection
          kitchenDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          //kitchen total
          kitchenTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // monthly total
          monthlyTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
          // daily total
          dailyTotalDocRef.update({
            totalCount: {
              dinner: {
                full: admin.firestore.FieldValue.increment(1)
              }
            }
          });
        }
      }
    }

    return batch
      .commit()
      .then(() => console.log("Subscription trigger successful"))
      .catch(e => {
        console.log("Error in subscription trigger");
      });
  });

// successful delivery
exports.onSuccessfulDelivery = functions.firestore
  .document(
    "admin/{deliveryBoyId}/deliveries/{deliveryId}/{timeOfDay}/{userId}"
  )
  .onWrite((change, context) => {
    const document = change.after.exists
      ? change.after.data()
      : change.before.data();

    //finding the date month and year of the
    let date = deliveryId.substring(0, 2);
    let month = deliveryId.substring(2, 4);
    let year = deliveryId.substring(4, 8);
    ///// have to split deliveryId
    calenderDocId = deliveryId;

    // update status in calendar
    db.collection("users")
      .doc(context.params.userId)
      .collection("calendar")
      .doc(calenderDocId);

    // update status in subscriptions
    db.collection("users")
      .doc(context.params.userId)
      .collection("subscriptions");

    // sending fcm
    if (document.status.delivered === true) {
      let registrationToken = "registration token";

      let message = {
        data: {
          m: "hello"
        },
        token: registrationToken
      };

      admin
        .messaging()
        .send(message)
        .then(response => {
          return console.log("successfully sent message", response);
        })
        .catch(e => console.log("error sending message : ", e));
    }
  });

// upcoming meal triggers

exports.upcomingMeal = functions.firestore
  .document("upcomingMeals/{upcomingMealId}")
  .onWrite((change, context) => {
    let upcomingMealDocId = context.params.upcomingMealId;
    let menuData = change.after.data();

    //finding the date month and year of the
    let date = upcomingMealDocId.substring(0, 2);
    let month = upcomingMealDocId.substring(2, 4);
    let year = upcomingMealDocId.substring(4, 8);

    let batch = db.batch();

    /// user collection

    // what to do about description
    let menuSchema = {};
    let time = menuData.id;
    menuSchema[time] = {};
    menuSchema[time].name = menuData.name;
    menuSchema[time].image = menuData.image;
    menuSchema[time].description = menuData;

    db.collection("users")
      .get()
      .then(querySnapShot => {
        querySnapShot.forEach(doc => {
          // user calendar
          db.collection("users")
            .doc(doc.id)
            .collection("calendar")
            .doc(`${month}${year}`)
            .set({ [date]: menuSchema }, { merge: true });

          // user subscriptions
          db.collection("users")
            .doc(doc.id)
            .collection("subscriptions")
            .doc(`${date}${month}${date}`)
            .set(menuData, { merge: true });

          // order collection

          db.collection("orders")
            .doc(`${month}${year}`)
            .collection(`${day}${month}${year}`)
            .get()
            .then(querySnapShot => {
              querySnapShot.forEach(doc => {
                // user order update
                db.collection("orders")
                  .doc(`${month}${year}`)
                  .collection(`${day}${month}${year}`)
                  .doc(doc.id)
                  .update(menuData);
              });
              return;
            })
            .catch(e => console.log(e));

          // kitchen

          // db.collection('kitchen').get()
          // .then(querySnapShot=>{
          //   querySnapShot.forEach(doc => {
          //     db.collection('kitchen').doc(doc.id).collection('deliveries').doc(`${date}${month}${year}`)
          //   })
          // })
          //
        });
        return;
      })
      .catch(e => console.log(e));

    /// kitchen collection

    ///
  });

exports.api = functions.https.onRequest(app);
