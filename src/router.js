const express = require("express");
const router = express.Router();

const {user,login,getUser,updateUser} = require("./controllers/userController");
const { product, getProductQuery, getProduct, updatProduct, deleteProduct } = require("./controllers/productController");
const { authentication, authorization } = require("./middleware/middleware");
const { createCart, updateCart } = require("./controllers/cartController");

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
router.put('/products/:productId',updatProduct)
router.delete("/products/:productId",deleteProduct)


router.post('/users/:userId/cart',authentication,authorization,createCart)
router.put("/users/:userId/cart", updateCart)


router.all("/*", function (req, res) { res.status(404).send({ status: false, msg: "Invalid HTTP request" }) })

module.exports = router;
