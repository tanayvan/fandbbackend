const mongoose = require("mongoose");
const crypto = require("crypto");
const schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");
var userSchema = new schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    encry_password: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Array,
      default: [],
    },
    security_code: {
      type: Number,
    },
    email_verification_code: {
      type: Number,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    phone_number: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.encry_password = this.securepassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  securepassword: function (plainPassword) {
    if (!plainPassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainPassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  authenticate: function (plainPassword) {
    return this.securepassword(plainPassword) === this.encry_password;
  },
};

module.exports = mongoose.model("User", userSchema);
