const express = require("express");
const router = express.Router();

const { pushOrderInPurchaseList, getUserById } = require("../controllers/user");
const { isAdmin, isAuthenticated, isSignedIn } = require("../controllers/auth");
const { updateStock } = require("../controllers/product");
const {
  getOrderById,
  createOrder,
  getAllOrders,
  updateStatus,
  getOrderStatus,
  makePayment,
  getAllOrdersForAdmin,
  changeOrderStatus,
  cancelOrder,
} = require("../controllers/order");

//params
router.param("userId", getUserById);
router.param("orderId", getOrderById);

//create
router.post("/order/create/:userId", isSignedIn, isAuthenticated, createOrder);

//read
router.get("/order/:userId", isSignedIn, isAuthenticated, getAllOrders);

router.get(
  "/order/all/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllOrdersForAdmin
);

//status of order
router.get(
  "/order/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getOrderStatus
);
router.put(
  "/order/:orderId/status/userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateStatus
);
router.post("/order/payment/:userId", isSignedIn, isAuthenticated, makePayment);

router.post(
  "/order/status/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  changeOrderStatus
);
router.get(
  "/order/cancel/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  cancelOrder
);

module.exports = router;
