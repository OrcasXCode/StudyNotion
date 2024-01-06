const express=require("express")
const app=express();
const userRoutes=require("../backend/routes/user")


app.use(express.json())



app.use("/api/v1/auth",userRoutes)



app.listen(4000,()=>{
    console.log("Server is running on port 4000");
})