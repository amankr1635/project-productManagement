const { default: mongoose } = require("mongoose");
const productModel = require("../models/productModel");
const uploadFile = require("../aws/aws");
const { isValidTitle, isValidImage } = require("../validations/validation");

const product = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0 || !req.body) {
      return res
        .status(400)
        .send({ status: false, message: "please enter something in body" });
    }
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
        return res.status(400).send({
          status: false,
          message: `${dataArr[i]} field is mandatory `,
        });
      if (entries[j][k] == "title") {
        data.title = entries[j][1].trim();
        if (entries[j][1] == "")
          return res.status(400).send({
            status: false,
            message: `${entries[j][k]} field cannot be empty `,
          });
        if (Number(data.title.split(" ").join("")) || !isValidTitle(data.title))
          return res
            .status(400)
            .send({ status: false, message: "title is Invalid" });
      }
      if (entries[j][k] == "description") {
        data.description = entries[j][1].trim();
        if (entries[j][1] == "")
          return res.status(400).send({
            status: false,
            message: `${entries[j][k]} field cannot be empty `,
          });
      }
      if (entries[j][k] == "price") {
        if (entries[j][1].trim() == "")
          return res.status(400).send({
            status: false,
            message: `${entries[j][k]} field cannot be empty `,
          });
        if (!Number(entries[j][1])) {
          return res.status(400).send({
            status: false,
            message: `${entries[j][k]} can only be a number and can not be 0 `,
          });
        }
      }
      if (entries[j][k] == "currencyId") {
        data.currencyId = entries[j][1].trim();
        if (data.currencyId == "")
          return res.status(400).send({
            status: false,
            message: `${entries[j][k]} cannot be empty `,
          });
        if (entries[j][1].trim() != "INR")
          return res.status(400).send({
            status: false,
            message: `${entries[j][k]} must be 'INR' `,
          });
      }
      if (entries[j][k] == "currencyFormat") {
        data.currencyFormat = entries[j][1].trim();
        if (data.currencyFormat == "")
          return res.status(400).send({
            status: false,
            message: `${entries[j][k]} field cannot be empty `,
          });
        if (entries[j][1].trim() != "₹")
          return res
            .status(400)
            .send({ status: false, message: `${entries[j][k]} must be '₹' ` });
      }
    }
    if (data.isDeleted) {
      delete data.isDeleted;
    }
    if (data.deletedAt) {
      delete data.deletedAt;
    }
    if (data.files[0] && !isValidImage(data.files[0].originalname))
      return res.status(400).send({
        status: false,
        message:
          "Image format is Invalid please provide .jpg or .png or .jpeg format",
      });
    if (data.style || data.style == "") {
      data.style = data.style.trim();
      if (data.style == "")
        return res
          .status(400)
          .send({ status: false, message: "Enter value for style field" });
    }

    if (data.installments || data.installments == "") {
      data.installments = data.installments.trim();
      if (data.installments == "")
        return res.status(400).send({
          status: false,
          message: "Installment field can not be empty",
        });
      if (!Number(data.installments))
        return res.status(400).send({
          status: false,
          message: "Installment field can only contain Number",
        });
    }

    let arr = [];
    let sizes;
    if (data.availableSizes) {
      data.availableSizes = data.availableSizes.trim();
      sizes = data.availableSizes.split(",");
      let availableSizesEnum = productModel.schema.obj.availableSizes.enum;
      sizes.forEach((a) => {
        if (availableSizesEnum.includes(a)) arr.push(a);
      });
      data.availableSizes = arr;
    }

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
    createProduct = createProduct.toObject()
    delete createProduct["__v"]
    return res.status(201).send({
      status: true,
      message: "Product created successfully",
      data: createProduct,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
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
      let obj = {};
      let availableSizesEnum = productModel.schema.obj.availableSizes.enum;
      if (data.size || data.size == "") {
        data.availableSizes = data.size.trim();

        if (data.availableSizes == "")
          return res
            .status(400)
            .send({ status: false, message: "Size field can not be empty" });
        if (!availableSizesEnum.includes(data.availableSizes))
          return res.status(400).send({
            status: false,
            message: `Enter a valid Size from ${availableSizesEnum}`,
          });
        obj.availableSizes = data.size;
      }
      if (data.title || data.title == "") {
        data.title = data.title.trim();
        if (data.title == "")
          return res
            .status(400)
            .send({ status: false, message: "Name field can not be empty" });
      }
      if (data.title) {
        if (Number(data.title))
          return res.status(400).send({
            status: false,
            message: "Name can not contain numbers only",
          });
        if (!isValidTitle(data.title))
          return res
            .status(400)
            .send({ status: false, message: "Name is Invalid" });
        obj.title = data.title;
      }
      let num;
      if (req.query.priceSort) {
        num = req.query.priceSort;
        if (num !== "-1" && num !== "1")
          return res.status(400).send({
            status: false,
            message: "Please enter -1 or 1 for price sorting",
          });
        obj.priceSort = num;
      }
      if (req.query.priceGreaterThan && req.query.priceLessThan) {
        req.query.priceGreaterThan = req.query.priceGreaterThan.trim();
        req.query.priceLessThan = req.query.priceLessThan.trim();
        if (req.query.priceGreaterThan == "" && req.query.priceLessThan == "")
          return res
            .status(400)
            .send({ status: false, message: "Price field can not be empty" });
        if (
          !Number(req.query.priceGreaterThan) ||
          !Number(req.query.priceLessThan)
        )
          return res
            .status(400)
            .send({ status: false, message: "Enter price in Number" });
        obj.$and = [
          { price: { $gte: req.query.priceGreaterThan } },
          { price: { $lte: req.query.priceLessThan } },
        ];
      } else if (req.query.priceGreaterThan) {
        req.query.priceGreaterThan = req.query.priceGreaterThan.trim();
        if (req.query.priceGreaterThan == "")
          return res
            .status(400)
            .send({ status: false, message: "Price field can not be empty" });
        if (!Number(req.query.priceGreaterThan))
          return res
            .status(400)
            .send({ status: false, message: "Enter price in Number" });
        obj.$and = [{ price: { $gte: req.query.priceGreaterThan } }];
      } else if (req.query.priceLessThan) {
        req.query.priceLessThan = req.query.priceLessThan.trim();
        if (req.query.priceLessThan == "")
          return res
            .status(400)
            .send({ status: false, message: "Price field can not be empty" });
        if (!Number(req.query.priceLessThan))
          return res
            .status(400)
            .send({ status: false, message: "Enter price in Number" });
        obj.$and = [{ price: { $lte: req.query.priceLessThan } }];
      }
      if (Object.keys(obj).length == 0)
        return res
          .status(400)
          .send({ status: false, message: "please pass valid data" });
      let product = await productModel
        .find({ isDeleted: false, ...obj })
        .sort({ price: num });
      if (product.length == 0)
        return res
          .status(404)
          .send({ status: false, message: "no product found" });
      return res
        .status(200)
        .send({ status: true, message: "Success", data: product });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter a valid productId" });

    let products = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!products) {
      return res.status(404).send({
        status: false,
        message: "No product available with productId",
      });
    }
    return res
      .status(200)
      .send({ status: true, message: "Success", data: products });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
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
    if (Object.keys(data).length == 0 && !req.files)
      return res
        .status(400)
        .send({ status: false, message: "please provide some data to update" });
    if (req.files.length > 0) {
      data.files = req.files;
    }
    let keys = Object.keys(data);
    let arr = [
      "title",
      "description",
      "price",
      "currencyId",
      "currencyFormat",
      "isFreeShipping",
      "productImage",
      "files",
      "style",
      "availableSizes",
      "installments",
    ];
    for (let i = 0; i < keys.length; i++) {
      if (!arr.includes(keys[i])) {
        delete data[keys[i]];
      } else {
        if (keys[i] == "title") {
          data.title = data.title.trim();
          if (data.title == "")
            return res
              .status(400)
              .send({ status: false, message: "Title field cannot be empty" });
          if (
            Number(data.title.split(" ").join("")) ||
            !isValidTitle(data.title)
          )
            return res
              .status(400)
              .send({ status: false, message: "title is Invalid" });
          let dbCall = await productModel.findOne({ title: data.title });
          if (dbCall)
            return res
              .status(400)
              .send({ status: false, message: "Title already exist" });
        }
        if (keys[i] == "description") {
          data.description = data.description.trim();
          if (data.description == "")
            return res.status(400).send({
              status: false,
              message: `${keys[i]} field cannot be empty `,
            });
          if (Number(data.description.split(" ").join("")))
            return res
              .status(400)
              .send({ status: false, message: `${keys[i]} is Invalid` });
        }
        if (keys[i] == "price") {
          if (data.price == "")
            return res.status(400).send({
              status: false,
              message: `${keys[i]} field cannot be empty `,
            });
          if (!Number(data.price))
            return res
              .status(400)
              .send({ status: false, message: `${keys[i]} is Invalid` });
        }
        if (keys[i] == "currencyId") {
          data.currencyId = data.currencyId.trim();
          if (data.currencyId == "")
            return res.status(400).send({
              status: false,
              message: `${keys[i]} field cannot be empty `,
            });
          if (data.currencyId != "INR")
            return res.status(400).send({
              status: false,
              message: `${keys[i]} must be 'INR' `,
            });
        }
        if (keys[i] == "currencyFormat") {
          data.currencyFormat = data.currencyFormat.trim();
          if (data.currencyFormat == "")
            return res.status(400).send({
              status: false,
              message: `${keys[i]} field cannot be empty `,
            });
          if (data.currencyFormat != "₹")
            return res
              .status(400)
              .send({ status: false, message: `${keys[i]} must be '₹' ` });
        }
        if (keys[i] == "isFreeShipping") {
          data.isFreeShipping = data.isFreeShipping.trim();
          if (data.isFreeShipping == "")
            return res.status(400).send({
              status: false,
              message: `${keys[i]} field cannot be empty `,
            });
          if (data.isFreeShipping != "true" && data.isFreeShipping != "false")
            return res.status(400).send({
              status: false,
              message: `${keys[i]} must be 'true' or 'false `,
            });
        }
        if (req.body.productImage == "") {
          if (req.files.length === 0)
            return res
              .status(400)
              .send({ status: false, message: "productImage cannot be empty" });
        }
        if (keys[i] == "files") {
          if (data.files[0] && !isValidImage(data.files[0].originalname))
            return res.status(400).send({
              status: false,
              message:
                "Image format is Invalid please provide .jpg or .png or .jpeg format",
            });
          if (data.files && data.files.length > 0) {
            let uploadedFileURL = await uploadFile(data.files[0]);
            data.productImage = uploadedFileURL;
          }
        }
        if (keys[i] == "style") {
          data.style = data.style.trim();
          if (data.style == "")
            return res.status(400).send({
              status: false,
              message: `${keys[i]} field cannot be empty `,
            });
          if (Number(data.style) || !isValidTitle(data.style))
            return res
              .status(400)
              .send({ status: false, message: `${keys[i]} is Invalid` });
        }
        if (keys[i] == "availableSizes") {
          data.availableSizes = data.availableSizes.trim();
          if (data.availableSizes == "")
            return res
              .status(400)
              .send({ status: false, message: "Please enter size" });
          let arr = [];
          let sizes;
          sizes = data.availableSizes.split(",");
          let availableSizesEnum = productModel.schema.obj.availableSizes.enum;
          let flag = true;
          sizes.forEach((a) => {
            if (availableSizesEnum.includes(a.trim())) arr.push(a.trim());
            else {
              flag = false;
            }
          });
          if (!flag)
            return res.status(400).send({
              status: false,
              message: `Give valid Sizes between ${availableSizesEnum}`,
            });
          delete data.availableSizes;
          data.$addToSet = { availableSizes: arr };
        }
      }
      if (keys[i] == "installments") {
        if (!Number(data.installments))
          return res.status(400).send({
            status: false,
            message: "Installment field can only contain Number",
          });
      }
    }
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "you can not update this feild" });
    let update = await productModel.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      data,
      { new: true }
    );
    if (!update)
      return res
        .status(404)
        .send({ status: false, message: "productId does not exist" });
    return res
      .status(200)
      .send({ status: true, message: "Success", data: update });
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

    return res.status(200).send({ status: false, message: "Success" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  product,
  getProductQuery,
  getProduct,
  updatProduct,
  deleteProduct,
};
