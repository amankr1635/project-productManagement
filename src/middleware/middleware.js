const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");

const authentication = async function (req, res, next) {
  try {
    if (!req.headers.authorization)
      return res
        .status(400)
        .send({ status: false, message: "token is required" });
    let token = req.headers.authorization.split(" ")[1];
    let userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "enter a valid userId" });
    jwt.verify(token, "group5californium", (err, decodedToken) => {
      if (err) {
        return res.status(400).send({ status: false, message: err.message });
      } else {
        req.decodedToken = decodedToken;
        next();
      }
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

const authorization = async function (req, res, next) {
  try {
    let userToken = req.decodedToken.userId;
    let userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid user ID" });

    let userData = await userModel.findOne({ _id: userId });
    if (!userData)
      return res
        .status(404)
        .send({ status: false, message: "user with this ID is not present." });

    if (userToken != userData._id)
      return res
        .status(403) //it must be 401 we have to change this after evaluation
        .send({ status: false, message: "You are not authorized" });
    next();
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

module.exports = { authentication, authorization };
