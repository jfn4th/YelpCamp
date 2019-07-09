const express = require('express'),
	app = express(),
	campgroundRoutes = require('./routes/campgrounds'),
	commentRoutes = require('./routes/comments'),
	methodOverride = require('method-override'),
	LocalStrategy = require('passport-local'),
	indexRoutes = require('./routes/index'),
	bodyParser = require('body-parser'),
	flash = require('connect-flash'),
	User = require('./models/user'),
	mongoose = require('mongoose'),
	passport = require('passport');
// seedDB = require('./seeds');

// dotenv
require('dotenv').config();

// mongoDB connection
mongoose
	.connect(
		process.env.DATABASEURL,
		{
			useNewUrlParser: true,
			useCreateIndex: true
		}
	)
	.then(() => {
		console.log('Connection successful!');
	})
	.catch((err) => {
		console.log('ERROR: ', err.message);
	});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');
mongoose.set('useFindAndModify', false);
// seedDB();

// PASSPORT CONFIGURATION
app.use(
	require('express-session')({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// load currentUser into other files
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});
// Load flash message across files
app.use((req, res, next) => {
	res.locals.error = req.flash('error');
	next();
});
app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	next();
});

// requiring routes
app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.listen(process.env.PORT, process.env.IP, () => {
	console.log('The YelpCamp Server has started!');
});
