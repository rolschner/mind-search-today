var express 				= require("express"),
	mongoose 				= require("mongoose"),
	passport				= require("passport"),
	LocalStrategy			= require("passport-local"),
	passportLocalMongoose	= require("passport-local-mongoose"),
	Provider				= require("./models/provider"),
	User					= require("./models/user");

const 	PNF					= require('google-libphonenumber').PhoneNumberFormat,
		phoneUtil			= require('google-libphonenumber').PhoneNumberUtil.getInstance();


console.log(process.env.MONGODBURI);
mongoose.connect(process.env.MONGODBURI, 
		{
			useNewUrlParser: true, 
			useUnifiedTopology: true,
			useFindAndModify: false
		});
var app = express();
app.set("view engine", "ejs");
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(require("express-session")({
	secret: "Zezo is the word of the day",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(__dirname + '/public'));

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

// sign-up complete POST route
app.post("/register", (req, res)=>{
	console.log(req.body);
	var newUser = new User({
		username: req.body.username,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		email: req.body.email
	});
	User.register(newUser, req.body.password, function(err, user){
		if(err) {
			console.log(err);
			res.redirect("/");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/providers");
		});
	});
});

// GET providers
app.get("/providers", (req, res) => {
	var providers = [];
	Provider.distinct("state", (err, states) => {
		if(err) {
			console.log(err);
		} else {
			states = states.sort();
			res.render("providers", { providers: providers, states: states, curstate: null, curcity: null});
		}
	});
});

// POST post providers
app.post("/providers", (req, res) => {
	var providers = [];
	var state = req.body.state;
	var city = req.body.city;
	console.log("State: "+req.body.state+", City: "+ city)
	Provider.distinct("state", (err, states) => {
		if(err) {
			console.log(err);
		} else {
			states = states.sort();
			Provider.find({"state": state, city: city}, (err, providers) => {
				if(err) {
					console.log(err);
				} else {
					providers.forEach(function(provider){
						const phoneNumber = phoneUtil.parse(provider.phoneNumber, 'US');
						provider.phoneNumber = phoneUtil.format(phoneNumber, PNF.NATIONAL);
					});
					res.render("providers", { providers: providers, states: states, curstate: state, curcity: city });
				}
			});
		}
	});
});


app.get("/providers/:state", function(req, res){

	console.log("Searching state: " + req.params.state);
	Provider.distinct("city", { "state": req.params.state }, (err, cities) => {
		if(err) {
			console.log(err);
		} else {
			res.json(cities.sort());
		}
	});
 });

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

app.listen(process.env.PORT, process.env.IP, () => {
	console.log("MST server started");
});