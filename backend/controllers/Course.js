const {User}= require("../models/User")




async function createCourse(req,res){
    try{
        const userId=req.user.id;
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag: _tag,
            category,
            status,
            instructions: _instructions,
        } = req.body
        const thumbnail=req.body.thumbnailImage;
        const tag=JSON.parse(_tag);
        const instructions=JSON.parse(_instructions)

        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || !thumbnail || !category || !instructions.length){
            return res.status(400).json({
              success: false,
              message: "All Fields are Mandatory",
            })
        }

        if(!status || status == undefined){
            status="Draft"
        }

        const instructorDetails=await User.findById(userId,{
            accountType:"Instructor"
        })

        if(!instructorDetails){
            re
        }
    }
    catch(error){
        console.log("Error in creating course: ", error);
        return res.status(500).json({
            success:false,
            msg:"Failed to create course",
        })
    }
}