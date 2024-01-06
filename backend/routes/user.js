const express=require("express");
const router=express.Router();
const {signup,sendotp,login,changePassword} = require("../controllers/Auth")
const {auth} = require("../middleware/auth")
const {resetPasswordToken,resetPassword}= require("../controllers/resetPassword")




router.post("/signup",signup)
router.post("/login",login)
router.post("/sendotp", sendotp)
router.post("/changepassword",auth,changePassword)
router.post("/reset-password-token",resetPasswordToken)
router.post("/reset-password",resetPassword)



module.exports=router