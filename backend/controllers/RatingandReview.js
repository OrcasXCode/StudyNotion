const Course = require("../models/Course");
const RatingandReview = require("../models/RatingandReview");
const mongoose= require("mongoose")



async function createRating(req,res){
    try{
        const userId=req.user.id;
        const rating=req.body.rating;
        const review=req.body.review;
        const courseId=req.body.courseId;

        const courseDetails=await Course.findOne({
            _id:courseId,
            studentsEnroled:{
                $elemMatch:{$eq:userId}
            }
        })
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                msg:"Student is not enrolled in this course"
            })
        }

        const alreadyReviewed=await RatingAndReview.findOne({
            user:userId,
            course:courseId
        })
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course already reviewed by the user"
            })
        }

        const ratingReview = await RatingandReview.create({
            rating,
            review,
            course: courseId,
            user: userId,
        })
        await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    ratingAndReviews:ratingReview
                }
            }
        )
        await courseDetails.save()

        return res.status(200).json({
            success:true,
            msg:"Rating and review added successfully",
            ratingReview
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            msg:"Server error failed to create rating"
        })
    }
}


async function getAverageRating(req,res){
    try{
        const courseId=req.body.courseId

        const result=await RatingandReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])
        if(result.length>0){
            return res.status(200).json({
                success: true,
                data: result[0].averageRating
            })
        }

        return res.status(200).json({
            success:true,
            msg:"average rating got successfully",
            averageRating:0
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            msg:"Server Error Failed to get average rating"
        })
    }
}


async function getAllRatingReview(req,res){
    try{
        const allReviews=await RatingAndReview.find({})
        .sort({rating:"desc"})
        .populate({
            path:"user",
            select:"firstName lastName email image"
        })
        .populate({
            path:"course",
            select:"courseName"
        })

        res.status(200).json({
            success:true,
            msg:"successfully got all the reviews",
            allReviews
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success: false,
            msg:"Server error cannot get all ratings"
        })
    }
}


module.exports={
    createRating,
    getAverageRating,
    getAllRatingReview
}