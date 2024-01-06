const mongoose=require("mongoose")


mongoose.connect("mongodb+srv://userdb:1234@cluster0.fqpdeka.mongodb.net/Study-Notion")

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:60*5,
    }
})



const OTP=mongoose.model("OTP",OTPSchema);
module.exports={
    OTP
}