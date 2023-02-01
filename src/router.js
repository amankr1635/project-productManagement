const express = require("express");
const { user, login } = require("./controllers/userController");
const router = express.Router()



router.get('/test-me',function(req,res){
    res.send({test:"test-api"})
})


router.post("/register",user)
router.post("/login",login)

module.exports = router