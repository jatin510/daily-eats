//writing kitchen details in each user collection

let userRef = db
  .collection("users")
  .doc(req.body.users.id)
  .collection("subscriptions");

let kitchenAssignment = getKitchenAssignment(id);
let date = {};
for (date = fromDate; date <= toDate; date++) {
  let userSubRefDoc = userRef.doc(`${date}${month}${year}`);
  batch.set(userSubRefDoc, kitchenAssignment, { merge: true });
}

// writing kitchen details is completed
