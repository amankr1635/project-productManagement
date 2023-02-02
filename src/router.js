const express = require("express");
const router = express.Router();

const {user,login,getUser,updateUser} = require("./controllers/userController");
const { authentication, authorization } = require("./middleware/middleware");

router.get("/test-me", function (req, res) {
  res.send({ test: "test-api" });
});

router.post("/register", user);
router.post("/login", login);
router.get("/user/:userId/profile", authentication, getUser);
router.put("/user/:userId/profile", updateUser);




module.exports = router;
