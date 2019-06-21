// user subscribing the meal
exports.onUserSubscribe = functions.firestore
  .document("users/{userId}/subscriptions/{subscriptionId}")
  .onCreate((snap, context) => {
    console.log(snap.data());

    //order Data
    // orderData = getOrderDataForSubscription(snap.data());

    //subscriptionDocId
    let subscriptionDocId = snap.id;

    let date = subscriptionDocId;
    let month = "";
    let year = "";

    db.collection("orders")
      .doc(`${month}${year}`)
      .collection(`${month}${year}`.doc(context.params.userId));
  });
