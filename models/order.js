const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const ProductCartSchema = new mongoose.Schema({
  product: {
    type: Object,
  },
  quantity: Number,
  size: String,
  sugar: String,
  milk: String,
});

const OrderSchema = new mongoose.Schema(
  {
    products: [ProductCartSchema],
    transaction_id: {},
    amount: Number,
    branch: String,
    type: String,
    table: Number,
    instructions: String,
    status: {
      type: String,
      default: "Recieved",
    },
    updated: Date,
    user: {
      type: ObjectId,
      ref: "User",
    },
    payment: String,
  },
  { timestamps: true }
);

const ProductCart = mongoose.model("productCart", ProductCartSchema);
const Order = mongoose.model("Order", OrderSchema);
module.exports = { Order, ProductCart };
