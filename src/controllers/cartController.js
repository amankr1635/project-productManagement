const cartModel = require("../models/cartModel");
const { isValidObjectId, default: mongoose } = require("mongoose");
const productModel = require("../models/productModel");

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
        .status(404)
        .send({ status: false, message: "product doesn't exist" });

    if (!checkUserInCart) {
      data.userId = req.params.userId;
      data.items = [{ productId: data.productId, quantity: 1 }];
      data.totalPrice = checkProduct.price;
      data.totalItems = 1;
      const cart = await cartModel.create(data);
      cart = cart.toObject()
      delete cart["__v"]
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
          obj.totalPrice = checkUserInCart.totalPrice + checkProduct.price;
          flag = true;
        }
      }
      if (!flag) {
        obj.$push = { items: { productId: data.productId, quantity: 1 } };
        obj.totalPrice = checkUserInCart.totalPrice + checkProduct.price;
        obj.totalItems = checkUserInCart.totalItems + 1;
      }
      let updateCart = await cartModel.findOneAndUpdate(
        { userId: req.params.userId },
        obj,
        { new: true }
      );
      updateCart = updateCart.toObject()
      delete updateCart["__v"] 
      return res
        .status(200)
        .send({ status: true, message: "Success", data: updateCart });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateCart = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ staus: false, message: "body can not be empty" });
    if (!data.cartId)
      return res
        .status(400)
        .send({ staus: false, message: "please enter cart id" });
    data.cartId = data.cartId.trim();
    if (data.cartId == "")
      return res
        .status(400)
        .send({ staus: false, message: "cart id can not be empty" });

    if (!data.productId)
      return res
        .status(400)
        .send({ staus: false, message: "please enter product id" });
    data.productId = data.productId.trim();
    if (data.productId == "")
      return res
        .status(400)
        .send({ staus: false, message: "product id can not be empty" });
    if (!isValidObjectId(data.cartId))
      return res
        .status(400)
        .send({ staus: false, message: "enter a valid cart id" });
    if (!isValidObjectId(data.productId))
      return res
        .status(400)
        .send({ staus: false, message: "enter a valid product id" });
    if (!data.removeProduct && data.removeProduct != 0)
      return res
        .status(400)
        .send({ staus: false, message: "removeProduct is a mandatory feild" });
    let checkCart = await cartModel.findOne({ _id: data.cartId });
    if (!checkCart)
      return res
        .status(404)
        .send({ staus: false, message: "cart does not exist" });
    let product = await productModel.findOne({
      _id: data.productId,
      isDeleted: false,
    });
    if (!product)
      return res
        .status(404)
        .send({ staus: false, message: "product does not exist" });

    if (Number(data.removeProduct) != 1 && Number(data.removeProduct) != 0)
      return res
        .status(400)
        .send({ staus: false, message: "removeProduct can only be 1 or 0" });

    let obj = {};
    let arr = [...checkCart.items];
    if (data.removeProduct == 1) {
      let flag = false;
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].productId == data.productId) {
          if (arr[j]["quantity"] == 1) {
            arr.splice(j, 1);
            obj.totalItems = checkCart.totalItems - 1;
            obj.totalPrice = checkCart.totalPrice - product.price;
            flag = true;
          } else {
            flag = true;
            arr[j]["quantity"] -= 1;
            obj.totalPrice = checkCart.totalPrice - product.price;
          }
        }
      }
      if (!flag) {
        return res.status(400).send({
          status: false,
          message: "no product available with this product id in your cart",
        });
      }
      obj.items = arr;
    }
    if (data.removeProduct == 0) {
      let flag = false;
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].productId == data.productId) {
          obj.totalItems = checkCart.totalItems - 1;
          obj.totalPrice =
            checkCart.totalPrice - product.price * arr[j]["quantity"];
          arr.splice(j, 1);
          flag = true;
        }
      }
      if (!flag)
        return res.status(400).send({
          status: false,
          message: "no product available with this product id in your cart",
        });
      obj.items = arr;
    }
    let update = await cartModel.findOneAndUpdate({ _id: data.cartId }, obj, {
      new: true,
    });
    return res
      .status(200)
      .send({ status: true, message: "Success", data: update });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please enter someting" });
    if (!data.cartId)
      return res
        .status(400)
        .send({ status: false, message: "please enter cartId" });
    data.cartId = data.cartId.trim();
    if (data.cartId == "")
      return res
        .status(400)
        .send({ status: false, message: "cartId cannot be empty" });
    if (!isValidObjectId(data.cartId))
      return res
        .status(400)
        .send({ status: false, message: "please enter valid cartId" });
    let checkCart = await cartModel.findOne({
      _id: data.cartId,
      userId: userId,
    });
    if (!checkCart)
      return res
        .status(404)
        .send({ status: false, message: "please enter your own cartId" });
    return res
      .status(200)
      .send({ status: true, message: "Success", data: checkCart });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please enter someting" });
    if (!data.cartId)
      return res
        .status(400)
        .send({ status: false, message: "please enter cartId" });
    data.cartId = data.cartId.trim();
    if (data.cartId == "")
      return res
        .status(400)
        .send({ status: false, message: "cartId cannot be empty" });
    if (!isValidObjectId(data.cartId))
      return res
        .status(400)
        .send({ status: false, message: "please enter valid cartId" });
    let checkAvailableCart = await cartModel.findOne({
      _id: data.cartId,
      userId: userId,
    });
    if (!checkAvailableCart)
      return res.status(404).send({ status: false, message: "no cart found" });
    if (checkAvailableCart.items.length == 0)
      return res.status(404).send({ status: false, message: "cart not found" });
    let checkCart = await cartModel.findOneAndUpdate(
      { _id: data.cartId, userId: userId },
      { items: [], totalPrice: 0, totalItems: 0 },
      { new: true }
    );
    if (!checkCart)
      return res.status(404).send({ status: false, message: "no cart found" });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
module.exports = { createCart, updateCart, getCart, deleteCart };
