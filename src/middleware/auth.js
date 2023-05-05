const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    var decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("invalid token");
    }
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(404).send({ error: "Please authenticate" });
  }
};
module.exports = auth;
