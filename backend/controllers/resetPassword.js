const {User} = require("../models/User")
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt")
const crypto=require("crypto")


async function resetPasswordToken(req,res){
    try{
        const email=req.body.email;
        const user=await User.findOne({email:email})
        if(!user){
            return res.status(401).json({
                success:false,
                msg:"Email not found"
            })
        }

        const token=crypto.randomBytes(20).toString("hex")

        const updatedDetails=await User.findOneAndUpdate(
            {email},
            {token:token,resetPasswordExpires:Date.now()+3600000},
            {new:true}
        )
        console.log("DETAILS",updatedDetails)

        const url = `http://localhost:3000/update-password/${token}`

        await mailSender(email,"Password Reset",`Your Link for email verification is ${url}. Please click this url to reset your password.`)

        res.json({
            success:true,
            msg:"Email Sent Successfully, Please Check Your Email to Continue Further"
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            error:error.message,
            success:false,
            msg:"Some error in sending the reset message"
        })
    }
}


async function resetPassword(req,res){
    try{
        const password=req.body.password;
        const confirmPassword=req.body.confirmPassword;
        const token=req.body.token;

        if(confirmPassword!==password){
            return res.json({
                success:false,
                msg:"Password and confirm password does not match"
            })
        }

        const userDetails=await User.findOne({
            token:token
        })
        if(!userDetails){
            return res.json({
                success:false,
                msg:"Token is invalid"
            })
        }
        if(!(userDetails.resetPasswordExpires > Date.now())){
            return res.json({
                success:false,
                msg:`Link has been expired`
            })
        }

        const encryptedPassword=await bcrypt.hash(password,10)
        await User.findOneAndUpdate(
            {token:token},
            {password:encryptedPassword},
            {new:true}
        )
        res,json({
            success:true,
            msg:"Password Reset Successfull"
        })
    }
    catch(error){
        return res.json({
            error:error.message,
            success:false,
            msg:"Some error in updating the password"
        })
    }
}

module.exports={
    resetPassword,resetPasswordToken
}