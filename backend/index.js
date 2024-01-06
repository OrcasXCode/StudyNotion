const express=require("express")
const app=express();
const userRoutes=require("../backend/routes/user")
const dotenv=require("dotenv");
const database=require("./config/database")

app.use(express.json())
const PORT = process.env.PORT || 4000;

// Loading environment variables from .env file
dotenv.config();

// Connecting to database
database.connect();
 


app.use("/api/v1/auth",userRoutes)



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})