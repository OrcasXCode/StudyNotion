const express=require("express");
const { isInstructor, auth, isAdmin, isStudent } = require("../middleware/auth");
const { createCourse, editCourse, getInstructorCourses, getAllCourses, getCourseDetails, deleteCourse, getFullCourseDetails } = require("../controllers/Course");
const { createSection, updateSection, deleteSection } = require("../controllers/Section");
const { updatedSubSection, deleteSubSection, createSubSection } = require("../controllers/Subsection");
const { getAllRatingReview, getAverageRating, createRating } = require("../controllers/RatingandReview");
const { updateCourseProgress } = require("../controllers/courseProgress");
const { createCategory, showAllCategories, categoryPageDetails } = require("../controllers/Category");
const router=express.Router();



router.post("/createCourse",auth,isInstructor,createCourse)
router.post("/editCourse",auth,isInstructor,editCourse)
router.post("/addSection",auth,isInstructor,createSection)
router.post("/updateSection",auth,isInstructor,updateSection)
router.post("/deleteSection",auth,isInstructor,deleteSection)
router.post("/updateSubSection",auth,isInstructor,updatedSubSection)
router.post("/deleteSubSection",auth,isInstructor,deleteSubSection)
router.post("/addSubSection",auth,isInstructor,createSubSection)
router.post("/getInstructorCourses",auth,isInstructor,getInstructorCourses)
router.post("/getAllCourses",getAllCourses)
router.post("/getCourseDetails",getCourseDetails)
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)
router.delete("/deleteCourse", deleteCourse)
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRatingReview)

module.exports = router



module.exports=router