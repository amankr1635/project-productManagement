const express = require("express");
const mongoose = require("mongoose");

const routes = require("./src/router");
const app = express();

app.use(express.json());


mongoose.set("strictQuery", true);
mongoose.connect("mongodb+srv://product05:rWxRNvyBP8Ci1wPV@productdb.twut47t.mongodb.net/group06Database")
.then(()=> console.log("mongo Db is connected"))
.catch((err)=> console.log(err))

app.use("/",routes)

app.listen(3000, function(){
    console.log("port is connected "+3000)
})