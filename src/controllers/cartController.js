const cartModel = require("../models/cartModel");
const {isValidObjectId}=require('mongoose');
const productModel = require("../models/productModel");
const { findOneAndUpdate } = require("../models/productModel");

const createCart=async function(req,res)
{
    let data=req.body;
     const checkUserInCart=await cartModel.findOne({userId:req.params.userId})
     const checkProduct=await productModel.findOne({_id:data.productId})

    if(!checkUserInCart)
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
        let obj = {}
        for(let i=0;i<checkUserInCart.items.length;i++)
        {
            if(data.productId==checkUserInCart.items[i].productId)
            {
               
                console.log(checkUserInCart.items[i].quantity+1)
                obj.totalPrice = (checkProduct.price)+(checkProduct.price)
                obj = {items:[{productId:data.productId,quantity:checkUserInCart.items[i].quantity+1}],totalPrice:(checkUserInCart.totalPrice)+(checkProduct.price)}
                console.log(obj)
                const updateCart = await cartModel.findOneAndUpdate({userId:req.params.userId},obj,{new:true})
                return res.status(200).send({status:true,data:updateCart})
                
            }
        }
    //    if()
    //    {}
    //    else
    //    {}

        return res.status(201).send({status:true,data:"update sucessfully"})

    }
}
module.exports={createCart}
