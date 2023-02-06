const cartModel = require("../models/cartModel");
const { isValidObjectId } = require("mongoose");
const productModel = require("../models/productModel");
const { findOneAndUpdate } = require("../models/productModel");

const createCart = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please enter something in body" });
    const checkUserInCart = await cartModel.findOne({
      userId: req.params.userId,
    });
    if (!data.productId)
      return res
        .status(400)
        .send({ status: false, message: "product id is mandatory feild" });
    data.productId = data.productId.trim();
    if (data.productId == "")
      return res
        .status(400)
        .send({ status: false, message: "product id cannot be empty" });
    if (!isValidObjectId(data.productId))
      return res
        .status(400)
        .send({ status: false, message: "please enter valid produtId" });

    const checkProduct = await productModel.findOne({
      _id: data.productId,
      isDeleted: false,
    });
    if (!checkProduct)
      return res
        .status(400)
        .send({ status: false, message: "product doesn't exist" });

    if (!checkUserInCart) {
      data.userId = req.params.userId;
      data.items = [{ productId: data.productId, quantity: 1 }];
      data.totalPrice = checkProduct.price;
      data.totalItems = 1;
      const cart = await cartModel.create(data);
      return res.status(201).send({ status: true, data: cart });
    } else {
      if (!data.cartId)
        return res
          .status(400)
          .send({ status: false, message: "please enter cart ID" });
      data.cartId = data.cartId.trim();
      if (!isValidObjectId(data.cartId))
        return res
          .status(400)
          .send({ status: false, message: "invalid cart id" });
      if (checkUserInCart._id != data.cartId)
        return res
          .status(400)
          .send({ status: false, message: "please enter your own cart ID" });
      let obj = {};
      let arr = [...checkUserInCart.items];
      let flag = false;
      for (let i = 0; i < checkUserInCart.items.length; i++) {
        if (data.productId == checkUserInCart.items[i].productId) {
          for (let j = 0; j < arr.length; j++) {
            if (arr[j].productId == data.productId) {
              arr[j]["quantity"] += 1;
            }
          }
          obj.items = arr;
          obj.totalPrice = checkProduct.price + checkProduct.price;
          obj.totalPrice = checkUserInCart.totalPrice + checkProduct.price;

          flag = true;
        }
      }
      if (!flag) {
        obj.$push = { items: { productId: data.productId, quantity: 1 } };
        obj.totalPrice = checkUserInCart.totalPrice + checkProduct.price;
        obj.totalItems = checkUserInCart.totalItems + 1;
      }
      const updateCart = await cartModel.findOneAndUpdate(
        { userId: req.params.userId },
        obj,
        { new: true }
      );
      return res
        .status(201)
        .send({ status: true, message: "Success", data: updateCart });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


module.exports = { createCart };
