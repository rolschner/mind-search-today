var mongoose = require("mongoose");

// SETUP SCHEMA
var providerSchema = mongoose.Schema({
	providerName: String,
	address: String,
	city: String,
	state: String,
	zipcode: String,
	phoneNumber: String,
	hours: String,
	servicesProvided: String,
	insuranceAccepted: String,
	url: String
});

module.exports = mongoose.model("Provider", providerSchema);
