require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { historySchema } = require("./purchaseschema");
const secretKey = process.env.JWT_LOGIN_SECRET_KEY;

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      trim: true,
      required: true,
    },
    mobile: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    cpassword: {
      type: String,
      trim: true,
      required: true,
    },
    token: String,
    purchaseHistory: [historySchema],
  },
  { timestamps: true }
);

// this instance for genarating the token
userSchema.methods.generateToken = async function () {
  try {
    const gen_token = jwt.sign({ _id: this._id }, secretKey);
    this.token = gen_token;
    await this.save();
    return gen_token;
  } catch (error) {
    console.log(error);
  }
};

const USER = mongoose.model("User", userSchema);

module.exports = USER;
