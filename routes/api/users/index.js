const route = require("express").Router();

const validateUser = (req, res, next) => {
  console.log("Check if request is authorized with Firebase ID token");

  return db
    .collection("users")
    .doc(req.user.uid)
    .get()
    .then(userDoc => {
      if (!userDoc.exists) {
        console.log("User does not exist", req.user.uid);
        return res
          .status(404)
          .json({ error: { message: "User does not exist" } });
      }

      req.user.detail = userDoc.data();
      req.user.detail.id = userDoc.id;

      return next();
    })
    .catch(error => {
      console.error("Error while verifying Firebase ID token:", error);
      res.status(403).json({ error: { message: "Unauthorized" } });
    });
};

route.use(validateUser);
route.use("/", require("./users"));
route.use("/address", require("./address"));
route.use("/subscribe", require("./subscribe"));
route.use("/unsubscribe", require("./unSubscribe"));
route.use("/vacation", require("./vacation"));
route.use("/endvacation", require("./endVacation"));
// route.use("/wallet", require("./wallet"));

route.get("/", (req, res) => {
  res.send("users api index");
});

module.exports = route;
