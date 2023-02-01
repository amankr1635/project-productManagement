const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      // valid email
    },
    profileImage: {
      type: String,
      required: true,
      // s3 link
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      //  valid Indian mob.number
    },
    password: {
      type: String,
      requuired: true,
      // encrypted password length min 8 max -15
    },
    address: {
      shipping: {
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        pincode: {
          type: Number,
          required: true,
        },
      },
      billing: {
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          require: true,
        },
        pincode: {
          type: Number,
          required: true,
        }
      }
    }
  },{ timestamps: true });

  module.exports = mongoose.model("usersdata",userSchema)
