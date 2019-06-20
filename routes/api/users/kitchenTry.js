if (req.body.users.subscriptions.breakfast) {
  let kitchenData = getKitchen(req.body.users.subscriptions.breakfast);

  let userRef = db
    .collection("users")
    .doc(req.body.users.id)
    .collection("subscriptions");
  for (date = fromDate; date <= toDate; date++) {
    let userKitchen = userRef.doc(`${date}${month}${year}`).get();

    userKitchen = userKitchen.forEach(doc => {
      if (!doc.exists) return console.log("Document does not exist");

      return doc.data().breakfast.kitchen.id;
    });

    let deliveryRef = db
      .collection("kitchen")
      .doc(userKitchen)
      .collection("deliveries");

    let breakfast = deliveryRef
      .doc(`${date}${month}${year}`)
      .collection("breakfast")
      .doc(req.body.users.id);

    batch.set(breakfast, kitchenData, { merge: true });
  }
}
