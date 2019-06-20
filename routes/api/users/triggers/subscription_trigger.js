exports.onUserSubscription = functions.firestore
  .document("users/{userId}/subscriptions/{subscriptionId}")
  .onCreate((snap, context) => {});
