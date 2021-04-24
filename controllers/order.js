const { Order, ProductCart } = require("../models/order");
const stripe = require("stripe")("sk_test_3bxP4RwV3YadRUPFAI84xWoK00nSSCyvnW");
const uuid = require("uuid/v4");
const branch = require("../models/branch");
exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No order Found in Db",
        });
      }
      req.order = order;
      next();
    });
};

exports.createOrder = (req, res) => {
  const order = new Order(req.body);
  order.save((err, order) => {
    if (err) {
      return res.status(400).json({
        error: `Failed To create a Order + ${err}`,
      });
    }
    branch.findOne({ name: req.body.branch }).then((branchD) => {
      if (req.body.table !== 0) {
        branchD.reserved_table.push(req.body.table);
      }
      branchD.save().then((data) => {
        res.json(order);
      });
    });
  });
};

exports.getAllOrders = (req, res) => {
  Order.find({ user: req.params.userId })
    .populate("user", "_id name")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No Order Found",
        });
      }
      res.json(order);
    });
};

exports.updateStatus = (req, res) => {
  Order.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: "Cannot update Order status",
        });
      }
      res.json(order);
    }
  );
};

exports.getOrderStatus = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.makePayment = (req, res) => {
  const { product, token, amount } = req.body;
  console.log("Product", product);
  console.log("PRICE", product.price);
  const idempotencyKey = uuid();
  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: amount,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: product[0].name,
        },
        { idempotencyKey }
      );
    })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => console.log(err));
};
exports.getAllOrdersForAdmin = (req, res) => {
  Order.find({})
    .then((orders) => {
      res.json(orders);
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        error: "Cannot get all  Orders",
      });
    });
};

exports.changeOrderStatus = (req, res) => {
  req.order.status = req.body.status;
  req.order.save((err, order) => {
    if (err) {
      return res.status(400).json({
        error: "Error Changing Order Status",
      });
    }
    res.status(200).json({
      success: true,
      message: "Status Changed sucessfully",
    });
  });
};
exports.cancelOrder = (req, res) => {
  req.order.status = "Cancelled";
  req.order.save((err, order) => {
    if (err) {
      return res.status(400).json({
        error: "Error Canceling the  Order ",
      });
    }
    console.log(order);
    res.status(200).json({
      success: true,
      message: "Order Cancelled  sucessfully",
    });
  });
};
