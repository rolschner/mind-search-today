var express = require("express");
var app = express();
var bp = require("body-parser");
var mongoose = require("mongoose");

console.log(process.env.MONGODBURI);
mongoose.connect(process.env.MONGODBURI, 
		{
			useNewUrlParser: true, 
			useUnifiedTopology: true
		});
app.use(bp.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));


// SETUP SCHEMA
var providerSchema = new mongoose.Schema({
	lineNumber: Number,
	providerName: String,
	address: String,
	city: String,
	state: String,
	zipcode: String,
	hours: String,
	phoneNumber: String,
	servicesProvided: String,
	insuranceAccepted: String,
	url: String
});

// Make a model
var Provider = mongoose.model("Provider", providerSchema);

// ROUTES
app.get("/", (req, res) => {
	res.render("landing");
});
app.get("/about", (req, res) => {
	res.render("about");
});
app.get("/signup", (req, res) => {
	res.render("signup");
});

// INDEX - show all campgrounds
app.get("/providers", (req, res) => {
	var foundStates = "";
	var foundCities = "";
	Provider.distinct("state", (err, states) => {
		if(err) {
			console.log("ERROR");
			console.log(err);
		} else {
			foundStates = states;
		}
	});
	Provider.distinct("city", (err, cities) => {
		if(err) {
			console.log("ERROR");
			console.log(err);
		} else {
			foundCities = cities;
		}
	});
			console.log(foundStates);
			console.log(foundCities);

	// Get all from the db
	Provider.find({}, (err, providers) => {
		if(err) {
			console.log(err);
		} else {
			res.render("providers", { providers: providers });
		}
	});
});

app.listen(process.env.PORT, process.env.IP, () => {
	console.log("MST server started");
});