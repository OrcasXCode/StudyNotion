const mongoose = require("mongoose");



mongoose.connect("mongodb+srv://userdb:1234@cluster0.fqpdeka.mongodb.net/Study-Notion")

// Define the Profile schema
const profileSchema = new mongoose.Schema({
	gender: {
		type: String,
	},
	dateOfBirth: {
		type: String,
	},
	about: {
		type: String,
		trim: true,
	},
	contactNumber: {
		type: Number,
		trim: true,
	},
});

// Export the Profile model
module.exports = mongoose.model("Profile", profileSchema);
