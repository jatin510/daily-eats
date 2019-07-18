const route = require("express").Router();
const Razorpay = require("razorpay");
const Joi = require("@hapi/joi");

let instance = new Razorpay({
  key_id: "rzp_test_UVxky2BI7xOprZ",
  key_secret: "ejLssWIVxjaKB5eLMbk7j1y"
});

route.post("/createorder", (req, res) => {
  // let schema = Joi.object().keys({
  //   users: {
  //     id: Joi.string().required(),
  //     method: Joi.string().required(),
  //     amount: Joi.number().required(),
  //     receipt: Joi.string().required(),
  //     time: Joi.string().required()
  //   }
  // });

  // const { value, error } = Joi.validate(req.body, schema);

  const error = false;
  if (error) {
    console.log("Error in the creating order schema", error.details[0].message);
    return res.status(400).json({
      error: `error in the transaction schema, ${error.details[0].message}`
    });
  } else {
    let options = {
      amount: 100000,
      currency: "INR",
      receipt: "order_rcptid_11",
      payment_capture: "0"
    };

    instance.orders
      .create(options, (err, order) => {
        if (err) {
          return console.log("transaction error", err);
          // throw err;
        }
        console.log(order);
      })
      // .then(val => {
      //   console.log("value", val);
      //   return res.status(200).json({ message: val });
      // })
      .catch(err => {
        console.log("error ", err);
        return res.status(400).json({ error: { error: `error ,${err}` } });
      });
  }
});

module.exports = route;
