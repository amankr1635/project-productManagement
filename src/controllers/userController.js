const userModel = require('../models/userModel')
const uploadFile = require('../aws/aws')

const user = async function(req,res){
    let data = req.body

    let files = req.files
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            data.profileImage = uploadedFileURL
        }
        else {
            return res.status(400).send({ msg: "No file found" })
        }
    let createUser = await userModel.create(data)
    return res.status(201).send({status:true,message: "User created successfully",data:createUser})
}

module.exports = {user}