const express=require("express");
const router=express.Router();
const {auth} = require("../middleware/auth")
const {deleteAccount}=require("../controllers/Profile")



router.post("/deleteProfile",auth,deleteAccount)




module.exports=router