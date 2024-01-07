const Course = require("../models/Course");
const Section = require("../models/Section");
const SubSection=require("../models/Subsection")

async function createSection(req,res){
    try{
        const sectionName=req.body.sectionName;
        const courseId=req.body.courseId;

        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                msg:"Please provide all the inputs"
            })
        }

        const newSection=await Section.create({
            sectionName
        })

        //understand this
        const updatedCourse=await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true}
        ).populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            }
        }).exec()

        return res.status(200).json({
            success:true,
            msg:"Section created successfully",
            updatedCourse
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            msg:"Server error failed to create a section"
        })

    }
}


async function deleteSection(req,res){
    try{
        const sectionId=req.body.sectionId;
        const courseId=req.body.courseId;

        await Course.findByIdAndUpdate(
            courseId,
            {
                $pull:{
                    courseContent:sectionId
                }
            }
        )

        const section=await Section.findById(sectionId)
        console.log(sectionId,courseId)
        if(!section){
            return res.status(404).json({
                success:false,
                msg:"Section not found"
            })
        }

        //understand this
        await SubSection.deleteMany({
            _id:{$in:section.subSection}
        })
        await Section.findByIdAndDelete(sectionId)

        const course=await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            }
        }).exec()

        return res.status(200).json({
            success:true,
            msg:"Section deleted",
            course
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            msg:"Server error failed to delete the section"
        })
    }
}


async function updateSection(req,res){
    try{
        const sectionName=req.body.sectionName;
        const sectionId=req.body.sectionId;
        const courseId=req.body.courseId;

        const section=await Section.findByIdAndUpdate(
            sectionId,
            {sectionName},
            {new:true}
        )

        const course=await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        }).exec()

        console.log(course);

        res.status(200).json({
            success:true,
            msg:"Section updated successfully",
            course
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            msg:"Internal server error"
        })
    }
}

module.exports={
    createSection,
    deleteSection,
    updateSection
}