const jwt = require("jsonwebtoken");
const USER = require("../models/userschema.model");
const secretKey = process.env.JWT_LOGIN_SECRET_KEY;

const authenticate = async (req, res, next) => {
  try {
    const gettingTokenData = req.headers.authorization;
    const verifyToken = jwt.verify(gettingTokenData, secretKey);
    const rootUser = await USER.findOne({
      _id: verifyToken._id,
      token: gettingTokenData,
    });
    if(!rootUser) {
        throw new Error("Not root user!")
    }
    req.userID = rootUser._id;
    req.rootUser = rootUser;
    req.token = rootUser.token;
    next();
  } catch (error) {
    res
      .status(404)
      .json({ message: "Token not found or internal server error!" });
  }
};

module.exports = authenticate;
