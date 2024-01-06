const express=require("express")
const router=express.Router()
const {contactUsController} = require("../controllers/ContactUs")

router.post("/contact",contactUsController)



// By exporting router directly, you ensure that when you import this 
// module elsewhere (like in your main app.js file), you'll get the router instance rather than an object with a router property.
module.exports=router
