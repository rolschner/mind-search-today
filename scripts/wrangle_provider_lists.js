var mongoose = require("mongoose");

var Provider = require("../models/provider");

console.log("MONGODBURI = " + process.env.MONGODBURI);
mongoose.connect(process.env.MONGODBURI,
		{
			useNewUrlParser: true, 
			useUnifiedTopology: true,
			useFindAndModify: false
		});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});
console.log("connected");

fixProviders();

async function fixProviders(){
	let providers = await Provider.find();

	console.log("Munging provider list entries... " + entries.length + " entries found");
	// Fix up the incoming providers from the spreadsheets.

	// Regex to strip double quotes wrapping some entries
	var noDblQuotesRegex = new RegExp("\"", 'g');

	for (provider of providers) {
		var provider = new Provider;

		// Split up the strings that have array data
		provider.hours				= provider.hours.replace(noDblQuotesRegex, "").split(",");
		provider.hours.forEach(e => {
			e = e.trim();
		});

		provider.servicesProvided	= provider.servicesProvided.replace(noDblQuotesRegex, "").split(",");
		provider.servicesProvided.forEach(e => {
			e = e.trim();
		});

		provider.insuranceAccepted	= provider.insuranceAccepted.replace(noDblQuotesRegex, "").split(",");
		provider.insuranceAccepted.forEach(e => {
			e = e.trim();
		});

		console.log(provider);
		//let found = await Provider.create(provider);
	};
};