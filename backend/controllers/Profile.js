const {User} = require("../models/User")
const {Profile} = require("../models/Profile");
const {Course}= require("../models/Course")
const {CourseProgress} = require("../models/CourseProgress")
const  mongoose  = require("mongoose");
const {uploadImageToCloudinary} = require("../config/cloudinary");
const { convertSecondsToDuration } = require("../utils/secToDuration");


async function deleteAccount(req,res){
    try{
        const id=req.user.id;
        console.log(id)
        const user=await User.findById({
            _id:id
        })
        if(!user){
            return res.status(404).json({
                success:false,
                msg:"User not found"
            })
        }

        await Profile.findByIdAndDelete({
            _id:new mongoose.Types.ObjectId(user.additionalDetails)
        })
        for(const courseId of user.courses){
            await Course.findByIdAndUpdate(
                courseId,
                {$pull:{studentsEnrolled:id}},
                {new:true}
            )
        }

        await User.findByIdAndDelete({
            _id:id
        })
        res.status(200).json({
            success: true,
            msg:'Successfully deleted account'
        })
        await CourseProgress.deleteMany({
            userId:id
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            error: "Server Error"
        })
    }
}



async function updateProfile(req,res){
    try{
        const firstName=req.body.firstName;
        const lastName = req.body.lastName;
        const dateOfBirth=req.body.dateOfBirth;
        const about=req.body.about;
        const contactNumber=req.body.contactNumber;
        const gender=req.body.gender;
        const id=req.user.id

        const userDetails=await User.findById(id)
        const profile=await Profile.findById(userDetails.additionalDetails)
        const user=await User.findByIdAndUpdate(
            id,
            {firstName,lastName},
            {new:true}
        )
        // await user.save();

        profile.dateOfBirth=dateOfBirth;
        profile.about=about;
        profile.contactNumber=contactNumber;
        profile.gender=gender;
        await profile.save();

        // const updatedUserDetails=await User.findById(id).populate("additionalDetails").exec()
        const updatedUserDetails=await User.findById(id).populate("additionalDetails")

        return res.json({
            success:true,
            msg:"Porifle updated successfully",
            data:updatedUserDetails
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            msg:"Failed to update profile details",
            error:error.message
        })
    }
}


async function getAllUserDetails(req,res){
    try{
        const id=req.user.id;
        const userDetails=await User.findById(id).populate("additionalDetails")
        if(!userDetails){
            return res.status(400).json({
                success:false,
                msg:"No user found"
            })
        }
        return res.status(200).json({
            success:true,
            msg:"User data fetched successfully",
            data:userDetails
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            msg:"Server Error!"
        })
    }
}


async function updatedDisplayPicture(req,res){
    try{
        const id=req.user.id;
        const displayPicture=req.files.displayPicture;
        const image = await uploadImageToCloudinary(
            //image
            displayPicture,
            //folder name
            process.env.FOLDER_NAME,
            //width
            1000,
            //height
            1000
        )
        console.log(image);
        const updateProfile=await User.findByIdAndUpdate(
            {_id:id},
            {image:image.secure_url},
            {new:true}
        )
        return res.status(200).json({
            success: true,
            msg:"Profile Photo updated successfully",
            user:updateProfile
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            errMsg: "Internal Server Error!"
        })
    }
}

async function instructorDashboard(req,res){
    try{
        const instructorId=req.user.id;
        const courseDetails=await Course.find({
            instructor:instructorId
        })

        const courseData=courseDetails.map((course)=>{
            const totalStudentsEnrolled=course.studentsEnrolled.length
            const totalAmountGenerated=totalStudentsEnrolled*course.price

            const courseDataWithStats={
                _id:course._id,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                totalStudentsEnrolled,
                totalAmountGenerated
            }
            return courseDataWithStats
        })
        res.status(200).json({
            success:true,
            msg:"courses data fetched successfully",
            courses:courseData
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            msg:"Server Error"
        })
    }
}

async function getEnrolledCourses(req,res){
    try{
        const userId=req.user.id;
        let userDetails=await User.findOne({
            _id:userId, 
        }).populate({path:"courses",populate:{path:"CourseContent",populate:{path:"subSection"},},}).exec();

        userDetails=userDetails.toObject()
        var SubsectionLength=0
        for (var i = 0; i < userDetails.courses.length; i++){
            let totalDurationInSeconds=0
            SubsectionLength=0
            for(var j=0;j<userDetails.courses[i].courseContent.length;j++){
                totalDurationInSeconds+=userDetails.courses[i].courseContent[j].subSection.reduce((acc,curr)=>acc+parseInt(curr.timeDuration),0)
                userDetails[i].totalDuration=convertSecondsToDuration(totalDurationInSeconds)
                SubsectionLength=SubsectionLength+userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount=await CourseProgress.findOne({
                courseId:userDetails.courses[i]._id,
                userId:userId
            })
            courseProgressCount=courseProgressCount?.completedVideos.length
            if(SubsectionLength===0){
                userDetails.courses[i].progressPercentage=100
            }
            else{
                const multiplier=Math.pow(10,2)
                userDetails.courses[i].progressPercentage=Math.round((courseProgressCount/SubsectionLength)*100*multiplier)/multiplier
            }
        }

        if(!userDetails){
            return res.status(400).json({
                success:false,
                message: `Could not find user with id: ${userDetails}`
            })
        }
        return res.status(200).json({
            success:true,
            msg:"Courses fetched successfully",
            data:userDetails.courses
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            msg:'Error in Fetching Enrolled Courses'
        })
    }
}

module.exports={
    deleteAccount,
    updateProfile,
    getAllUserDetails,
    updatedDisplayPicture,
    instructorDashboard,
    getEnrolledCourses
}