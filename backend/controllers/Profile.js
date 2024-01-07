const {User} = require("../models/User")
const {Profile} = require("../models/Profile");
const {Course}= require("../models/Course")
const {CourseProgress} = require("../models/CourseProgress")
const { default: mongoose } = require("mongoose");



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


module.exports={
    deleteAccount
}