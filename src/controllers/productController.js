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





























const getProduct=async function(req,res)
{
    try{

    let data=req.query;
    if(Object.keys(data).length==0)
    {
    let data=await productModel.find({isDeleted:false})
    

    return res.status(200).send({status:true,message:"",data:data})

    }
    else{
        let product=await productModel.find({isDeleted:false,...data})
        if(product.length==0) return res.status(404).send({status:false,message:"no prodect found"})
        return res.status(200).send({status:true,data:product})

    }
}
catch(error){
   return res.status(500).send({ status: false, msg: err.message });
}

}