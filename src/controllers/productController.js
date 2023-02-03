const { default: mongoose } = require("mongoose");
const productModel = require("../models/productModel");
const uploadFile = require("../aws/aws");
const {
  isValidPin,
  isValidName,
  isValidEmail,
  isValidNo,
  passwordVal,
  isValidImage,
  isValidString,
} = require("../validations/validation");

const product = async function (req, res) {
  try {
    let data = req.body;
    data.files = req.files;
    let keys = Object.keys(data);
    let dataArr = ["title", "description", "price", "files"];
    for (let i of dataArr) {
      if (!keys.includes(i))
        return res
          .status(400)
          .send({ status: false, message: `${i} field is mandatory ` });
    }

    data.title = data.title.trim();
    if (!isValidName(data.title))
      return res
        .status(400)
        .send({ status: false, message: "title is Invalid" });

    let findTitle = await productModel.findOne({ title: data.title });
    if (findTitle)
      return res
        .status(400)
        .send({ status: false, message: "title is already exist" });

    if (data.files && data.files.length > 0) {
      let uploadedFileURL = await uploadFile(data.files[0]);
      data.productImage = uploadedFileURL;
    } else {
      return res.status(400).send({ msg: "No file found" });
    }
    let createProduct = await productModel.create(data);
    return res.status(201).send({
      status: true,
      message: "Product created successfully",
      data: createProduct,
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
const getProductQuery = async function (req, res) {
  try {
    let data = req.query;
    if (data.size) data.availableSizes = data.size;
    if (data.name) data.title = data.name;
    if (Object.keys(data).length == 0) {
      let data = await productModel.find({ isDeleted: false });

      return res
        .status(200)
        .send({ status: true, message: "Success", data: data });
    } else {
      let num = 0;
      if (req.query.priceSort) num = req.query.priceSort;
      let product = await productModel
        .find({ isDeleted: false, ...data })
        .sort({ price: num });
      if (product.length == 0)
        return res
          .status(404)
          .send({ status: false, message: "no prodect found" });
      return res.status(200).send({ status: true, data: product });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const getProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "Please ented a valid productId" });

    let products = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!products) {
      return res.status(404).send({
        status: false,
        message: "No product available on given userId",
      });
    }
    return res
      .status(200)
      .send({ status: true, message: "Success", data: products });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

const updatProduct = async function (req, res) {
  try {
    let data = req.body;
    let productId = req.params.productId;

    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "invalid productId" });
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide someting" });
    let productObject = {};
    if (data.title) {
      productObject.title = data.title;
    }
    if (data.description) {
      productObject.description = data.description;
    }
    if (data.price) {
      productObject.price = data.price;
    }
    if (data.currencyId) {
      productObject.currencyId = data.currencyId;
    }
    if (data.currencyFormat) {
      productObject.currencyFormat = data.currencyFormat;
    }
    if (data.isFreeShipping) {
      productObject.isFreeShipping = data.isFreeShipping;
    }
    if (data.availableSizes) {
      productObject.availableSizes = data.availableSizes;
    }
    if (data.installments) {
      productObject.installments = data.installments;
    }

    let update = await productModel.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      productObject,
      { new: true }
    );
    if (!update)
      return res
        .status(404)
        .send({ status: false, message: "productId does not exist" });
    return res.status(200).send({ status: true, message: "", data: update });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
const deleteProduct = async function (req, res) {
  try {
    let params = req.params.productId;
    if (!mongoose.isValidObjectId(params))
      return res
        .status(400)
        .send({ status: false, message: "please enter a valid productId" });

    let deletePro = await productModel.findOneAndUpdate(
      { _id: params, isDeleted: false },
      { isDeleted: true, deletedAt: Date.now() },
      { new: true }
    );
    if (!deletePro)
      return res
        .status(404)
        .send({ status: false, message: "Product not found" });

    return res
      .status(200)
      .send({ status: false, message: "Product is deleted" });
  } catch (err) {
    return res.status(400).send({ status: false, message: err.message });
  }
};

module.exports = {
  product,
  getProductQuery,
  getProduct,
  updatProduct,
  deleteProduct,
  
};
