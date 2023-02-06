const cartModel = require("../models/cartModel");
const {isValidObjectId}=require('mongoose');
const productModel = require("../models/productModel");

const createCart=async function(req,res)
{
    let data=req.body;
     const checkUser=await cartModel.findOne({userId:req.params.userId})
     const checkProduct=await productModel.findOne({_id:data.productId})

    if(!checkUser)
    {
        data.userId=req.params.userId
        data.items=[{productId:data.productId,quantity:1}]
        data.totalPrice=checkProduct.price
        data.totalItems=1
       const cart=await cartModel.create(data)
        return res.status(201).send({status:true,data:cart})
    }
    else
    {
        
        for(let i=0;i<checkUser.items.length;i++)
        {
            if(data.productId==checkUser.items[i].productId)
            {
                checkUser.items[i].quantity
                
            }
        }
       if()
       {}
       else
       {}

        return res.status(201).send({status:true,data:"update sucessfully"})

    }
}
module.exports={createCart}
