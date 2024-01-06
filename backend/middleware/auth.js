const jwt=require("jsonwebtoken")
const dotenv=require("dotenv")
const User=require("../models/User")

dotenv.config();


async function auth(req,res,next){
    try{
        const token=req.cookiestoken || req.body.token || req.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.status(401).json({
                msg:"No token provided"
            })
        }

        try{
            const decode=await jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode)
            req.user = decode;
        }
        catch(error){
            return res.status(401).json({
                success:false,
                msg:"Invalid Token"
            })
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            msg:"Something went wrong while validating the token"
        })
    }
}



async function isStudent(req,res,next){
    try{
        const userDetails=await User.findOne({
            email:req.user.email
        })
        console.log(userDetails)
        if(userDetails.accountType !== "Student"){
            return res.status(403).json({
                success:false,
                msg:"You are not authorized to perform this action"
            })
        }
        next()
    }
    catch(error){
        return res.status(500).json({
            success:false,
            msg:"User Role cannot be verified"
        })
    }
}


async function isAdmin(req,res,next){
    try{
        const userDetails=await User.findOne({
            email:req.user.email
        })
        console.log(userDetails)
        if(userDetails.accountType !== "Admin"){
            return res.status(403).json({
                success:false,
                msg:"You are not authorized to perform this action"
            })
        }
        next()
    }
    catch(error){
        return res.status(500).json({
            success:false,
            msg:"User Role cannot be verified"
        })
    }
}


async function isInstructor(req,res,next){
    try{
        const userDetails=await User.findOne({
            email:req.user.email
        })
        console.log(userDetails)
        if(userDetails.accountType !== "Instructor"){
            return res.status(403).json({
                success:false,
                msg:"You are not authorized to perform this action"
            })
        }
        next()
    }
    catch(error){
        return res.status(500).json({
            success:false,
            msg:"User Role cannot be verified"
        })
    }
}

module.exports={
    auth,
    isAdmin,
    isInstructor,
    isStudent
}