const { default: mongoose } = require("mongoose");
const productModel = require("../models/productModel");
const uploadFile = require("../aws/aws");
const {
  isValidPin,
  isValidTitle,
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
    let entries = Object.entries(data);
    let dataArr = [
      "title",
      "description",
      "price",
      "currencyId",
      "currencyFormat",
    ];
    for (let i = 0; i < dataArr.length; i++) {
      let flag = false;
      let k = 0;
      let j;
      for (j = 0; j < entries.length; j++) {
        if (entries[j][k] == dataArr[i]) {
          flag = true;
          break;
        }
      }
      if (!flag)
        return res
          .status(400)
          .send({
            status: false,
            message: `${dataArr[i]} field is mandatory `,
          });
      if (entries[j][k] == "title") {
        if (entries[j][1].trim() == "")
          return res
            .status(400)
            .send({
              status: false,
              message: `${entries[j][k]} field cannot be empty `,
            });
        if (data.title == "") data.title = data.title.trim();
        if (!isValidTitle(data.title))
          return res
            .status(400)
            .send({ status: false, message: "title is Invalid" });
      }
      if (entries[j][k] == "description") {
        if (entries[j][1].trim() == "")
          return res
            .status(400)
            .send({
              status: false,
              message: `${entries[j][k]} field cannot be empty `,
            });
      }
      if (entries[j][k] == "price") {
        if (entries[j][1].trim() == "")
          return res
            .status(400)
            .send({
              status: false,
              message: `${entries[j][k]} field cannot be empty `,
            });
        if (!Number(entries[j][1]))
          return res
            .status(400)
            .send({
              status: false,
              message: `${entries[j][k]} can only be a number and can not be 0 `,
            });
      }
      if (entries[j][k] == "currencyId") {
        if (entries[j][1].trim() == "")
          return res
            .status(400)
            .send({
              status: false,
              message: `${entries[j][k]} field cannot be empty `,
            });
        if (entries[j][1] != "INR")
          return res
            .status(400)
            .send({
              status: false,
              message: `${entries[j][k]} must be 'INR' `,
            });
      }
      if (entries[j][k] == "currencyFormat") {
        if (entries[j][1].trim() == "")
          return res
            .status(400)
            .send({
              status: false,
              message: `${entries[j][k]} field cannot be empty `,
            });
        if (entries[j][1] != "₹")
          return res
            .status(400)
            .send({ status: false, message: `${entries[j][k]} must be '₹' ` });
      }
    }
    if (!isValidImage(data.files[0].originalname))
      return res.status(400).send({
        status: false,
        message:
          "Image format is Invalid please provide .jpg or .png or .jpeg format",
      });
    if (data.style || data.style == "") {
      if (data.style.trim() == "")
        return res
          .status(400)
          .send({ status: false, message: "Enter value for style field" }); //delete data.style
    }

    if (data.installments || data.installments == "") {
      data.installments = data.installments.trim();
      if (data.installments == "")
        return res
          .status(400)
          .send({
            status: false,
            message: "Installment field can not be empty",
          });
      if (!Number(data.installments))
        return res
          .status(400)
          .send({
            status: false,
            message: "Installment field can only contain Number",
          });
    }

    let arr = [];
    let sizes = data.availableSizes.split("");
    let availableSizesEnum = productModel.schema.obj.availableSizes.enum;
    sizes.forEach((a) => {
      if (availableSizesEnum.includes(a)) arr.push(a);
    });
    data.availableSizes = arr;

    if (data.files && data.files.length > 0) {
      let uploadedFileURL = await uploadFile(data.files[0]);
      data.productImage = uploadedFileURL;
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Product Image is required" });
    }

    let findTitle = await productModel.findOne({ title: data.title });
    if (findTitle)
      return res
        .status(400)
        .send({ status: false, message: "title is already exist" });

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
      let availableSizesEnum = productModel.schema.obj.availableSizes.enum;
      if (data.size || data.size == "") {
        data.availableSizes = data.size.trim();

        if (data.availableSizes == "")
          return res
            .status(400)
            .send({ status: false, message: "Size field can not be empty" });
        if (!availableSizesEnum.includes(data.availableSizes))
          return res
            .status(400)
            .send({
              status: false,
              message: `Enter a valid Size from ${availableSizesEnum}`,
            });
      }
      if (Number(data.title))
        return res
          .status(400)
          .send({
            status: false,
            message: "Name can not contain numbers only",
          });
      if (!isValidTitle(data.title))
        return res
          .status(400)
          .send({ status: false, message: "Name is Invalid" });

      if (data.name || data.name == "") {
        data.title = data.name.trim();
        if (data.title == "")
          return res
            .status(400)
            .send({ status: false, message: "Name field can not be empty" });
      }

      let num;
      if (req.query.priceSort) num = req.query.priceSort;
      if (num !== "-1" && num !== "1" && num !== "0")
        return res
          .status(400)
          .send({
            status: false,
            message: "Please enter -1 or 1 for price sorting",
          });
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
    data.files = req.files;
    let productId = req.params.productId;

    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "invalid productId" });
    let keys = Object.keys(data);
    if (keys.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide someting" });

    // let productObject = {};
    let arr = [
      "title",
      "description",
      "price",
      "currencyId",
      "currencyFormat",
      "files",
      "style",
      "availableSizes",
      "installments",
    ];
    for (let i = 0; i < keys.length; i++) {
      if (!arr.includes(keys[i])) {
        delete data[keys[i]];
      } else {
        if (data[keys[i]] == "title") {
        }
        if (data[keys[i]] == "description") {
        }
        if (data[keys[i]] == "price") {
        }
        if (data[keys[i]] == "currencyId") {
        }
        if (data[keys[i]] == "currencyFormat") {
        }
        if (data[keys[i]] == "files") {
        }
        if (data[keys[i]] == "style") {
        }
        if (data[keys[i]] == "availableSizes") {
        }
        if (data[keys[i]] == "installments") {
        }
      }
    }

   

    let update = await productModel.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      data,
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
