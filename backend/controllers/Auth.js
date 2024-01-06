const jwt = require("jsonwebtoken")
const brcypt=require("bcrypt");
const { User } = require("../models/User");
const otpGenerator=require("otp-generator");
const { OTP } = require("../models/OTP");
const Profile = require("../models/Profile")
const mailSender = require("../utils/mailSender")
const {passwordUpdated} = require("../mail/templates/passwordUpdate")
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
            console.log(user)
            return res.status(401).json({
                success:false,
                msg:"Invalid credentials!"
            });
        }

        const pass=await brcypt.compare(password,user.password)
        if(pass){
            const token = jwt.sign(
                {
                  email: user.email,
                  id: user._id,
                  role: user.role,
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: '24h',
                }
              );
              
            user.token=token
            user.password=undefined
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                // httpOnly: This property is set to true, indicating that the cookie should only be accessible through HTTP requests and
                // not via client-side scripts. This is a security measure to help prevent cross-site scripting (XSS) attacks.
                httpOnly:true,
            }


            // Assuming 'res' is the response object
            // res.cookie('yourCookieName', 'cookieValue', options);
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
        // If the database query (result) returns a non-null value (meaning the OTP already exists), 
        // the while loop is entered. Inside the loop, a new OTP is generated, and the loop continues until 
        // a unique OTP is generated (i.e., until the database query returns null, indicating that the generated OTP is not already in use).
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


async function changePassword(req,res){
    try{
        // const userDetails=await User.findById(req.user.id)
        const userDetails = await User.findById({_id:req.user.id} );
        const oldPassword=req.body.oldPassword;
        const newPassword=req.body.newPassword;
        const isPasswordMatch=await brcypt.compare(oldPassword,userDetails.password)
        if(!isPasswordMatch){
            return res.status(401).json({
                success:false,
                msg:'Old password does not match'
            })
        }

        const encryptedPassword=await brcypt.hash(newPassword,10)
        // { new: true }: This option ensures that the updated document is returned. Without this option, the method would return the document before the update.
        const updatedUserDetails=await User.findByIdAndUpdate({_id:req.user.id},{password:encryptedPassword},{new:true})

        try{
            const emailResponse=await mailSender(updatedUserDetails.email,"Password for you account has been updated",
            passwordUpdated(
                updatedUserDetails.email,`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            ))
        }
        catch(error){
            console.log("Error occured while sending email:",error)
            return res.status(500).json({
                succes:false,
                msg:"Error occured while sending mail",
                error:error.message
            })
        }
        return res.status(200).json({
            succes:true,
            msg:"Password updated successfully"
        })
    }
    catch(error){
        console.error("Error occcured while updating password: ",error)
        return res.status(500).json({
            success: false,
            msg: "Server error",
            error:error.message
        })
    }
}

module.exports={
    signup,
    sendotp,
    login,
    changePassword
}

