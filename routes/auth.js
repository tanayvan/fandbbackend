const express = require("express");
const router = express.Router();
const {
  signout,
  signup,
  signin,
  isSignedIn,
  forgotPassword,
  verifySecurityCode,
  changePassword,
  verifyEmail,
  sendCode,
} = require("../controllers/auth");
const { check, validationResult } = require("express-validator");
const { getUserById } = require("../controllers/user");

router.param("userId", getUserById);

router.post(
  "/signup",
  [
    check("name", "Name Should be Atleast 3 Character").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("password", "Password Should be Atleast 3 Character").isLength({
      min: 3,
    }),
  ],
  signup
);
router.post(
  "/signin",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password not big enough").isLength({
      min: 1,
    }),
  ],
  signin
);

router.post("/forgotpassword", forgotPassword);
router.post("/sendcode", sendCode);
router.post("/verify", verifySecurityCode);
router.post("/verify/email", verifyEmail);
router.post("/changepassword", changePassword);
router.get("/signout", signout);

module.exports = router;
