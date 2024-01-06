const jwt = require("jsonwebtoken")
const brcypt=require("bcrypt");
const { User } = require("../models/User");
const otpGenerator=require("otp-generator");
const { OTP } = require("../models/OTP");
const Profile = require("../models/Profile")
require("dotenv").config()

async function signup(req,res){
    try{
    const firstName=req.body.firstName;
    const lastName=req.body.lastName;
    const email=req.body.email;
    const password=req.body.password;
    const confirmPassword=req.body.confirmPassword;
    const accountType=req.body.accountType;
    const contactNumber=req.body.contactNumber;
    const otp=req.body.otp;

    if(!firstName||!lastName||!email||!password||!confirmPassword||!otp){
        return res.status(403).send({
            success:false,
            message:"All Fields are required",
        })
    }

    if(password!==confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password and confirm password does not match"
        })
    }

    const existingUser=await User.findOne({
        email
    })
    if(existingUser){
        res.status(400).json({
            success:false,
            message:"User already exists"
        })
    }

    const response=await OTP.find({
        email
    }).sort({
        createdAt:-1
    })
    .limit(1)
    console.log(response)
    if(response.length===0){
        return res.status(402).json({
            success: false,
            message: "Invalid OTP"
        })
    }
    else if(otp!==response[0].otp){
        return res.status(402).json({
            success: false,
            message: "Invalid OTP"
        })
    }

    const hashedPassword=await brcypt.hash(password,10);

    let approved = "Instructor";
    approved === "Instructor" ? (approved = false) : (approved = true);

    const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
    })

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType: accountType,
        approved: approved,
        additionalDetails: profileDetails._id,
        image: "",
    })

    return res.status(200).json({
        success:true,
        user,
        msg:"User registered successfully",
    })
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            success:false,
            msg:"User cannot be registered"
        })
    }
}


async function login (req,res){
    try{
        const email=req.body.email;
        const password=req.body.password;

        if(!email || !password){
            return res.status(400).json({
                success: false,
                msg:'Please provide an email and a password'
            })
        }

        const user= await User.findOne({
            email
        }).populate("additionalDetails")
        if(!user){
            // console.log(user)
            return res.status(401).json({
                success:false,
                msg:"Invalid credentials!"
            });
        }

        const pass=await brcypt.compare(password,user.password)
        if(pass){
            const token=jwt.sign({email:user.email,id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'24h'})
            user.token=token
            user.password=undefined
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success: true,
                token,
                user,
                msg:"User login success"
            })
        }
        else{
            return res.status(401).json({
                succes:false,
                msg:"Password is incorrect!"
            })
        }
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            success:false,
            msg:"Login failure Please try again"

        })
    }
}

async function sendotp(req,res){
    try{
        const email=req.body.email;
        let checkUserPresen=await User.findOne({
            email
        })
        if(checkUserPresen){
            return res.status(401).json({
                success:false,
                msg:"User is already registered"
            })
        }

        let otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
            numbersOnly: true
        })
        const result=await OTP.findOne({
            otp
        })
        while(result){
            otp=otpGenerator.generate(6,{
                upperCaseAlphabets:false,
            });
        }
        const otpPayload={email,otp}
        const otpBody=await OTP.create(otpPayload)
        res.status(200).json({
            success:true,
            msg:"OTP sent successfully",
            otp,
        })
    }
    catch(e){
        return res.status(500).json({
            success:false,
            msg:"OTP failed to sent"
        })
    }
}


module.exports={
    signup,
    sendotp,
    login
}

