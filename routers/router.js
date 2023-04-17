const express = require("express");
const USER = require("../models/userschema.model");
const { Purchase } = require("../models/purchaseschema");
const router = new express.Router();
const bcrypt = require("bcrypt");
const authenticate = require("../middleware/authenticate");

// register route of my server
router.post("/register", async (req, res) => {
  const { fullname, mobile, password, cpassword } = req.body;
  try {
    const isUserExist = await USER.findOne({ mobile: mobile });
    if (!isUserExist) {
      if (password === cpassword) {
        const saltround = 10;
        const hsPass = await bcrypt.hash(password, saltround);
        const hsCpass = await bcrypt.hash(cpassword, saltround);
        const newUser = new USER({
          fullname: fullname,
          mobile: mobile,
          password: hsPass,
          cpassword: hsCpass,
        });
        await newUser.save();
        res.status(201).json({ message: "Successfully registered new User" });
      } else {
        res
          .status(403)
          .json({ message: "Password and confirm password not matched" });
      }
    } else {
      res.status(422).json({
        message:
          "User already exist! Can't register new account with the same number",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error! Please try again later." });
  }
});

// login route
router.post("/login", async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const findUser = await USER.findOne({ mobile: mobile });
    if (findUser) {
      const comparePassword = await bcrypt.compare(password, findUser.password);
      const genToken = await findUser.generateToken();
      res.cookie("Cocktail", genToken, {
        expires: new Date(Date.now() + 120000),
        httpOnly: true,
        secure: true,
      });
      if (comparePassword) {
        res
          .status(201)
          .json({ message: "Login successful!", token: findUser.token });
      } else {
        res.status(404).json({ message: "Password not matched!" });
      }
    } else {
      res.status(404).json({ message: "No User found!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error! Please try again later." });
  }
});

// logout route
router.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.token = null;
    await req.rootUser.save();
    res.clearCookie("Cocktail", { path: "/" });
    res.status(201).json({ message: "Successfully logout!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
});

// this router for purchase history and payment details adding tho db
router.post("/purchase/payment/complete", authenticate, async (req, res) => {
  const { bankCardDetails, products, totalItem, totalPrice } = req.body;
  console.log(bankCardDetails, products, totalItem, totalPrice);
  try {
    const findUser = await USER.findOne({ _id: req.userID });
    if (findUser) {
      const newHistory = new Purchase({
        bankCardDetails,
        products,
        totalItem,
        totalPrice,
      });
      findUser.purchaseHistory.push(newHistory);
      await findUser.save();
      res.status(201).json({ message: "Successfully purchased!" });
      console.log("User found!");
    } else {
      res.status(422).json({ message: "Can't add or find User" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error, Please try again later!" });
  }
});

router.get("/get/purchase/details", authenticate, async (req, res) => {
  try {
    const gettingHistoryData = await USER.findOne({ _id: req.userID }).select(
      "purchaseHistory"
    );
    console.log(gettingHistoryData);
    if (gettingHistoryData) {
      res
        .status(200)
        .json({ message: "Found data!", history: gettingHistoryData });
    } else {
      res.status(404).json({ message: "Purchase history data doesn't exist!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
});

router.post("/purchase/history/delete", authenticate, async (req, res) => {
  try {
    const findCurrentUser = await USER.findOne({ _id: req.userID });
    if (findCurrentUser) {
      findCurrentUser.purchaseHistory = [];
      await findCurrentUser.save();
      res
        .status(201)
        .json({ message: "Successfully deleted purchase history!" });
    } else {
      res.status(404).json({ message: "User not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
});

module.exports = router;
