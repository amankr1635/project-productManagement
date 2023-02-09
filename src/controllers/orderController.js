const { isValidObjectId } = require("mongoose");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");

const createOrder = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide some data to order" });
    if (!data.cartId)
      return res
        .status(400)
        .send({ status: false, message: " cartId is a mandatory feild" });
    data.cartId = data.cartId.trim();
    if (data.cartId == "")
      return res
        .status(400)
        .send({ status: false, message: " cartId cannot be empty" });
    if (!isValidObjectId(data.cartId))
      return res
        .status(400)
        .send({ status: false, message: "enter a valid cart id" });
    const checkCart = await cartModel.findOne({ _id: data.cartId });
    
    if (!checkCart)
      return res.status(400).send({ status: false, message: "no cart found" });
    if (checkCart.totalItems == 0)
      return res
        .status(400)
        .send({ status: false, message: "your cart is empty" });
        

    let obj = {};
    obj.userId = req.params.userId;
    obj.items = checkCart.items;
    obj.totalPrice = checkCart.totalPrice;
    obj.totalItems = checkCart.totalItems;
    let totalQuantity = 0;
    for (let i = 0; i < checkCart.items.length; i++) {
      totalQuantity += checkCart.items[i].quantity;
    }
    obj.totalQuantity = totalQuantity;
    if (data.cancellable) {
      if (data.cancellable != true) {
        return res.status(400).send({
          status: false,
          message: " please enter true || false for cancellable in Boolean",
        });
      }
      obj.cancellable = data.cancellable;
    }
    if (!data.cancellable) {
      let keys = Object.keys(data);
      if (keys.includes("cancellable")) obj.cancellable = false;
    }
    let orderCreation = await orderModel.create(obj);
    await cartModel.findOneAndUpdate(
      { _id: data.cartId },
      { items: [], totalPrice: 0, totalItems: 0 }
    );
    return res
      .status(201)
      .send({ status: true, message: "Success", data: orderCreation });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateOrder = async function (req, res) {
  try {
    let data = req.body;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide some data to body" });
    if (!data.orderId)
      return res
        .status(400)
        .send({ status: false, message: "enter orderId in body" });
    if (!data.status)
      return res
        .status(400)
        .send({ status: false, message: "please enter status in body" });
    data.orderId = data.orderId.trim();
    if (data.orderId == "")
      return res
        .status(400)
        .send({ status: false, message: "orderId cannot be empty" });
    if (!isValidObjectId(data.orderId))
      return res
        .status(400)
        .send({ status: false, message: "please enter valid orderId" });

    data.status = data.status.trim();
    if (data.status == "")
      return res
        .status(400)
        .send({ status: false, message: "status cannot be empty" });

    if (!["completed", "cancelled"].includes(data.status))
      return res.status(400).send({
        status: false,
        message: "status can be only completed,cancelled",
      });

    let orders = await orderModel.findOne({ _id: data.orderId });
    if (!orders)
      return res
        .status(400)
        .send({ status: false, message: "no orders found" });
    if (orders.status == "completed")
      return res
        .status(400)
        .send({ status: false, message: "order is already completed" });
    if (orders.status == "cancelled")
      return res
        .status(400)
        .send({ status: false, message: "order is already cancelled" });

    if (orders.userId != req.params.userId)
      return res.status(400).send({ status: "please enter your own orderId" });
    if (!orders.cancellable)
      return res
        .status(400)
        .send({ status: false, message: "this order cannot be cancel" });

    let updatedData = await orderModel.findOneAndUpdate(
      { _id: data.orderId },
      { status: data.status },
      { new: true }
    );
     return res
      .status(200)
      .send({ status: false, message: "Success", data: updatedData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createOrder, updateOrder };
