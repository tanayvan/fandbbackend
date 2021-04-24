const express = require("express");
const router = express.Router();

const {
  getCityById,
  createCity,
  getAllCity,
  getCity,
  updateCity,
  deleteCity,
} = require("../controllers/city");
const { isAdmin, isAuthenticated, isSignedIn } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//params
router.param("userId", getUserById);
router.param("cityId", getCityById);

//actual routes goes here
router.post(
  "/city/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createCity
);

//Read Route
router.get("/city/:cityId", getCity);
router.get("/cities", getAllCity);

//update
router.put(
  "/city/:cityId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateCity
);

//delete
router.delete(
  "/city/:cityId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteCity
);

module.exports = router;
