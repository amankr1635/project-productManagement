const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");

const authentication = async function(req,res,next){
let token = req.headers.authorization.split(" ")[1]
console.log(token)
let userId = req.params.userId
if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status: false, message: "enter a valid userId"})

if(!token) return res.status(400).send({status: false, message: "please enter token"})
jwt.verify(token, "group5californium", (err, decodedToken) => {
    if (err) {
      return res.status(400).send({ status: false, message: "invalid token" });
    } else {
      req.decodedToken = decodedToken;
      next();
    }
})
}

const authorization = async function(req,res,next){
    let userToken = req.decodedToken.userId;
  let userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).send({ status: false, message: "Invalid user ID" });

  let userData = await userModel.findOne({ _id: userId });
  if (!userData)
    return res
      .status(404)
      .send({ status: false, message: "user with this ID is not present." });

  if (userToken != userData.userId)
    return res
      .status(401)
      .send({ status: false, message: "You are not authorized" });
  // if (userData.isDeleted == true) {
  //   return res
  //     .status(404)
  //     .send({ status: false, message: "document already deleted" });
  // }

  next();
};



module.exports = {authentication,authorization}