const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
var nodemailer = require("nodemailer");
var otpgen = require("@argha0277/otp-generator");
const crypto = require("crypto");
const user = require("../models/user");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "projectbackend789@gmail.com",
    pass: "ProjectBackend@789",
  },
});

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      field: errors.array()[0].param,
    });
  }
  const code = otpgen.generate(6);
  const userBody = {
    ...req.body,
    email_verification_code: code,
  };
  const user = new User(userBody);

  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "not able to save in DB",
      });
    }
    var mailOptions = {
      from: "howto2311@gmail.com",
      to: user.email,
      subject: "Security Code For Email Verification",
      text: `\nChayoos\nThe Security Code For Email Verification is ${code}\n`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error, 47);
      } else {
        res.json({
          name: user.name,
          email: user.email,
          _id: user._id,
        });
      }
    });
  });
};

exports.signin = (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      field: errors.array()[0].param,
    });
  }
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "user does not exists",
      });
    }
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "email and password do not match",
      });
    }
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    // put token in cookie
    res.cookie("token", token, { expire: new Date() + 100 });
    //send response to frontend
    const { _id, name, email, role, isEmailVerified } = user;
    return res.json({
      token,
      user: { _id, name, email, role, isEmailVerified },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Sign Out Successfully",
  });
};

//protected routes

exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
});

//custom middlewares

exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.auth._id == req.profile._id;
  if (!checker) {
    return res.status(403).json({
      error: "Access Denied",
    });
  }
  next();
};
exports.isAdmin = (req, res, next) => {
  if (req.profile.role == 0) {
    return res.status(403).json({
      error: "You are not admin, Access Denied",
    });
  }
  next();
};

exports.forgotPassword = (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      user.security_code = otpgen.generate(6);
      user.save((err, user) => {
        if (err) {
          return res.status(400).json({
            error: true,
            message: "Error saving security Code",
          });
        }
        var mailOptions = {
          from: "howto2311@gmail.com",
          to: user.email,
          subject: "Security Code For Forgot Password",
          text: `\nChayoos\nThe Security Code For Reset Password is ${user.security_code}\n`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            return res.status(400).json({
              error: true,
              message: "Error sending email.",
            });
          } else {
            return res.status(200).json("Email sent Sucessfully");
          }
        });
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        error: true,
        message: "Email Not Found",
      });
    });
};

exports.verifySecurityCode = (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      req.profile = user;
      if (
        req.profile.security_code == req.body.security_code &&
        req.profile.security_code !== 0
      ) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({
          success: false,
          message: "The security Code was Incorrect",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        error: true,
        message: "Email Not Found",
      });
    });
};

exports.changePassword = (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      req.profile = user;
      if (
        req.profile.security_code != req.body.security_code &&
        req.profile.security_code !== 0
      ) {
        return res
          .status(400)
          .json({ success: false, message: "The security Code was Incorrect" });
      } else {
        function securepassword(plainPassword) {
          if (!plainPassword) return "";
          try {
            return crypto
              .createHmac("sha256", req.profile.salt)
              .update(plainPassword)
              .digest("hex");
          } catch (err) {
            return "";
          }
        }
        req.profile.encry_password = securepassword(req.body.password);

        console.log(req.profile);
        req.profile.save((err, user) => {
          if (err) {
            return res
              .status(400)
              .json({ success: false, message: "error updating password" });
          }

          return res.status(200).json(user);
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        error: true,
        message: "Email Not Found",
      });
    });
};

exports.verifyEmail = (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      req.profile = user;
      if (
        req.profile.email_verification_code ==
          req.body.email_verification_code &&
        req.profile.email_verification_code !== 0
      ) {
        req.profile.isEmailVerified = true;
        req.profile.save((err, data) => {
          if (err) {
            return res.status(400).json({
              success: false,
              message: "Error verifying email",
            });
          }
        });
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({
          success: false,
          message: "The security Code was Incorrect",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        error: true,
        message: "Email Not Found",
      });
    });
};

exports.sendCode = (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    const code = otpgen.generate(6);
    var mailOptions = {
      from: "howto2311@gmail.com",
      to: req.body.email,
      subject: "Security Code For Email Verification",
      text: `\nChayoos\nThe Security Code For Email Verification is ${code}\n`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error, 47);
      } else {
        user.email_verification_code = code;
        user.save((err, data) => {
          if (err) {
            return res.json({
              success: false,
              message: "Error sending code ",
            });
          }
          res.json({
            success: true,
            message: "Code sent sucessfully",
          });
        });
      }
    });
  });
};
