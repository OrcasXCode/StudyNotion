const express=require("express");
const router=express.Router();
const {signup,sendotp,login,changePassword} = require("../controllers/Auth")
const {auth} = require("../middleware/auth")




router.post("/signup",signup)
router.post("/login",login)
router.post("/sendotp", sendotp)
router.post("/changepassword",auth,changePassword)



module.exports=router