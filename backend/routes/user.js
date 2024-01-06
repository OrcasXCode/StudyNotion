const express=require("express");
const router=express.Router();
const {signup,sendotp} = require("../controllers/Auth")




router.post("/signup",signup)
router.post("/sendotp", sendotp)



module.exports=router