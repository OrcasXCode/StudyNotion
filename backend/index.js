const express=require("express")
const app=express();
const userRoutes=require("../backend/routes/user")
const dotenv=require("dotenv");
const database=require("./config/database");
const contactUsRoutes = require("./routes/Contact")
const profileRoutes=require("../backend/routes/Profile")
const cookieParser=require("cookie-parser")
const courseRoutes=require("../backend/routes/Course")
const {cloudinaryConnect} = require("./config/cloudinary")
const fileUplaod=require("express-fileupload")

app.use(express.json())
app.use(cookieParser())
app.use(fileUplaod({useTempFiles:true,tempFileDir:"/tmp/"}))
const PORT = process.env.PORT || 4000;

// Loading environment variables from .env file
dotenv.config();

// Connecting to database
database.connect();
 

//Connecting to Cloudinary
cloudinaryConnect();



app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes)
app.use("/api/v1/reach",contactUsRoutes);
app.use("/api/v1/course",courseRoutes);


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})