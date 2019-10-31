var mongoose = require("mongoose");

var Provider = require("../models/provider");
var Entry = require("../models/entry");

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
	console.log("connected");
	cleanProviders();
});

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log(' ...Mongoose disconnected on app termination');
    process.exit(0);
  });
});


console.log(process._getActiveRequests());

async function cleanProviders(){
	let entries = await Entry.find();

	console.log("Munging raw provider entries... " + entries.length + " entries found");
	// Clean up the incoming entries of strange junk from the spreadsheets.
	// Strip non-digits from the phone numbers.
	var digitsOnlyRegex = new RegExp("\\D+", 'g');
	// Strip double quotes wrapping some entries
	var noDblQuotesRegex = new RegExp("\"", 'g');
	for (entry of entries) {
		var provider = new Provider;
		
		provider.providerName		= entry.providerName.replace(noDblQuotesRegex, "").trim();
		provider.address			= entry.address.replace(noDblQuotesRegex, "").trim();
		provider.city				= entry.city.replace(noDblQuotesRegex, "").trim();
		provider.state				= entry.state.replace(noDblQuotesRegex, "").trim();
		provider.zipcode			= entry.zipcode.replace(noDblQuotesRegex, "").trim();
		provider.phoneNumber 		= entry.phoneNumber.replace(digitsOnlyRegex, "").trim();
		provider.hours				= entry.hours.replace(noDblQuotesRegex, "").trim();
		provider.servicesProvided	= entry.servicesProvided.replace(noDblQuotesRegex, "").trim();
		provider.insuranceAccepted	= entry.insuranceAccepted.replace(noDblQuotesRegex, "").trim();


		console.log(provider);
		let found = await Provider.create(provider);
	};
};
