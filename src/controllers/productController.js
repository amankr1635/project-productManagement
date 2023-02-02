const { default: mongoose } = require('mongoose');
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







// Returns product details by product id
// - __Response format__
//   - _**On success**_ - Return HTTP status 200. Also return the product documents. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)


















































const getProduct = async function(req,res){
    let productId = req.params.productId
    if(mongoose.isValidObjectId(productId)) return res.status(400).send({status:false , message : "Please ented a valid productId"})
    
let products = await productModel.findOne({_id: productId, isDeleted: false})
if(!products){
    return res.status(404).send({status: false, message : "No product available on given userId"})
}
return res.status(200).send({status: true, message: "Success", data: products})
}

module.exports = {product,getProduct}