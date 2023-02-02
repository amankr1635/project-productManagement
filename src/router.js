const express = require("express");
const { user, login, getUser, updateUser } = require("./controllers/userController");
const router = express.Router()
const {authentication,authorization} = require("./middleware/middleware")


router.get('/test-me',function(req,res){
    // console.log(req.authorization.)
    res.send({test:"test-api"})
})


router.post("/register",user)
router.post("/login",login)
router.get("/user/:userId/profile",getUser)
router.put("/user/:userId/profile",updateUser)

module.exports = router