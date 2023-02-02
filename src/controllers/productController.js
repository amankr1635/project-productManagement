const productModel = require('../models/productModel')

const product = async function (req, res) {
    let data = req.body
    let createProduct = await productModel.create(data)
    return res.status(201).send({
        status: true,
        message: "User created successfully",
        data: createProduct,
    });
}

module.exports = {product}