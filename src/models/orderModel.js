const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({

    userId:{
        type : ObjectId,
        ref : "usersdata",
        required: true
    },
    items : {
        type :[Object],
        productId :{ ObjectId,
            ref : "product",
            required : true
        },
        quantity  :{
            type : Number,
            required: true
        }
    },
    totalPrice : {
        type : Number,
        required: true
    },
    totalItems : {
        type : Number,
        required : true
    },
    totalQuantity : {
        type : Number,
        required : true
    },
    cancellable: {
        type : Boolean,
        default: true
    },
    status : {
        type :String,
        enum : ["pending", "completed", "cancled"],
        default : "pending"
    },
    deletedAt : Date,
    isDeleted : {
        type : Boolean,
        default :  false
    }
},{timestamps : true})

module.exports = mongoose.model("order", orderSchema)