const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Subsection = require("../models/Subsection");

async function updateCourseProgress(req,res){
    const courseId=req.body.courseId;
    const subSectionId=req.body.subSectionId;
    const userId=req.user.id;
    try{
        const subsection=await Subsection.findById(subSectionId);
        if(!subsection){
            return res.status(404).json({
                success:false,
                msg:"Sub Section not found"
            })
        }

        let courseProgress=await CourseProgress.findOne({
            courseID:courseId,
            userId:userId
        })
        if(!courseProgress){
            return res.status(400).json({
                success: false,
                msg:"Course Progress does not exits"
            })
        }
        else{
            if(courseProgress.completedVideos.includes(subSectionId)){
                return res.status(400).json({
                    success:false,
                    msg:"Sub Section already completed"
                })
                courseProgress.completedVideos.push(subSectionId)
            }
        }
        await courseProgress.save();
        return res.status(200).json({
            success:true,
            msg:"Course Progress updated"
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            msg:"Server error failed to update course progress"
        })
    }
}


//getProgressPercentage 