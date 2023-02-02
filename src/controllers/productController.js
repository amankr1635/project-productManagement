const productModel = require('../models/productModel')

const product = async function (req, res) {
    try {
        let data = req.body
        data.files = req.files;
        let keys = Object.keys(data);
        let dataArr = ["title", "description", "price", "files"];
        for (let i of dataArr) {
            if (!keys.includes(i))
                return res
                    .status(400)
                    .send({ status: false, message: `${i} field is mandatory ` });
        }

        data.title = data.title.trim();
        if (!isValidName(data.title))
            return res
                .status(400)
                .send({ status: false, message: "title is Invalid" });
                
        let findTitle = await productModel.findOne({ title: data.title })
        if (findTitle) return res.status(400).send({ status: false, message: "title is already exist" });

        if (data.files && data.files.length > 0) {
            let uploadedFileURL = await uploadFile(data.files[0]);
            data.productImage = uploadedFileURL;
        } else {
            return res.status(400).send({ msg: "No file found" });
        }
        let createProduct = await productModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: createProduct, });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}

module.exports = { product }