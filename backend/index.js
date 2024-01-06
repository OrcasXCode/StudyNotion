const express=require("express")
const app=express();
const userRoutes=require("../backend/routes/user")
const dotenv=require("dotenv");
const database=require("./config/database");
const contactUsRoute = require("./routes/Contact")
const cookieParser=require("cookie-parser")

app.use(express.json())
app.use(cookieParser())
const PORT = process.env.PORT || 4000;

// Loading environment variables from .env file
dotenv.config();

// Connecting to database
database.connect();
 



app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/reach",contactUsRoute);


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})