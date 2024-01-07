const Section = require("../models/Section");
const Subsection = require("../models/Subsection");
const {uploadImageToCloudinary} = require("../utils/imageUploader")



async function createSubSection(req,res){
    try{
        const sectionId=req.body.sectionId;
        const title=req.body.title;
        const description=req.body.description;
        const video=req.files.video;

        if(!sectionId || !title || !description || !video){
            return res.status(404).json({
                success:false,
                msg:"All fields are required"
            })
        }

        const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME)
        console.log(uploadDetails)

        const SubSectionDetails=await Subsection.create({
            title:title,
            timeDuration: `${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url
        })

        const updatedSection=await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push:{
                    subSection:SubSectionDetails._id
                }
            },
            {new:true}
        ).populate("subSection")

        return res.status(200).json({
            success:true,
            msg:"SubSection created successfully",
            updatedSection
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            msg:"Server Error , failed to create a section"
        })
    }
}


async function updatedSubSection(req,res){
    try{
        const sectionId=req.body.sectionId;
        const subSectionId=req.body.subSectionId;
        const description=req.body.description;
        const title=req.files.title;

        const subSection=await Subsection.findById(subSectionId)
        if(!subSection){
            return res.status(404).json({
                success:false,
                msg:"Sub Section not found"
            })
        }

        if(title!==undefined){
            subSection.title=title
        }
        if(description!==undefined){
            subSection.description=description
        }
        if(req.files && req.files.video !== undefined){
            const video=req.files.video
            const uploadDetails=await uplaodImageToCloudinary(video,process.env.FOLDER_NAME)
            subSection.videoUrl=uploadDetails.secure_url
            subSection.timeDuration= `${uploadDetails.duration}`
        }

        await subSection.save()

        const updatedSection=await Section.findById(sectionId).populate("subSection")
        console.log(updatedSection)
        return res.json({
            success:true,
            message:"Section updated successfully",
            updatedSection
        })
    }
    catch(error){
        console.log(error)
        return res.status(400).json({
            success: false,
            msg:"Server error,failed to update sub section"
        })
    }
}

async function deleteSubSection(req,res){
    try{
        const subSectionId=req.body.subSectionId;
        const sectionId=req.body.sectionId;

        await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $pull:{
                    subSection:subSectionId
                }
            }
        )

        const subSection= await Subsection.findByIdAndDelete({
            _id:subSectionId
        })

        if(!subSection){
            return res.status(404).json({
                success:false,
                msg:"No such sub-section found!"
            })
        }

        const updatedSection=await Section.findById(sectionId).populate("subSection")

        return res.status(200).json({
            success:true,
            msg:"Sub Section delete successfully",
            data:updatedSection
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            msg:"Server Error , failed delete sub section"
        })
    }
}


module.exports={
    createSubSection,
    updatedSubSection,
    deleteSubSection
}