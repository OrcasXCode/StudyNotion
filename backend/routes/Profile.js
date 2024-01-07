const express=require("express");
const router=express.Router();
const {auth, isInstructor} = require("../middleware/auth")
const {deleteAccount, getAllUserDetails, updatedDisplayPicture, instructorDashboard, updateProfile, getEnrolledCourses}=require("../controllers/Profile")



router.post("/deleteProfile",auth,deleteAccount)
router.post("/updateprofile",auth,updateProfile)
router.post("/getUserDetails",auth,getAllUserDetails)
router.post("/updateDisplayPicture",auth,updatedDisplayPicture)
router.post("/instructorDashboard",auth,isInstructor,instructorDashboard)
router.post("/getEnrolledCourses",auth,getEnrolledCourses)


module.exports=router