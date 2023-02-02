const express = require("express");
const { product, getProductQuery, getProduct } = require("./controllers/productController");
const router = express.Router();

const {user,login,getUser,updateUser} = require("./controllers/userController");
const { authentication, authorization } = require("./middleware/middleware");

router.get("/test-me", function (req, res) {
  res.send({ test: "test-api" });
});

router.post("/register", user);
router.post("/login", login);
router.get("/user/:userId/profile", authentication, getUser);
router.put("/user/:userId/profile", authentication, authorization, updateUser);


router.post("/products",product)
router.get("/products",getProductQuery)
router.get("/products/:productId",getProduct)


router.all("/*", function (req, res) { res.status(404).send({ status: false, msg: "Invalid HTTP request" }) })

module.exports = router;
