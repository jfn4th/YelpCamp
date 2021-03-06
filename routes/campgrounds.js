const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware/');
const NodeGeocoder = require('node-geocoder');

require('dotenv').config();

const options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

const geocoder = NodeGeocoder(options);

// INDEX - Show all campgrounds
router.get('/', (req, res) => {
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({ "name": regex })
			.then(allCampgrounds => {
				res.render('campgrounds/index', { campgrounds: allCampgrounds, page: 'campgrounds' });
			})
			.catch(err => {
				console.log('ERROR:', err);
			});
	}
	else {
		Campground.find({})
			.then(allCampgrounds => {
				res.render('campgrounds/index', { campgrounds: allCampgrounds, page: 'campgrounds' });
			})
			.catch(err => {
				console.log('ERROR:', err);
			});
	}
	// Get all campgrounds from DB

});

// NEW - show form to create new campground
router.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

// CREATE - add new campground to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
	// get data from form and add to campgrounds array
	geocoder.geocode(req.body.campground.location).then(data => {
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		const newCampground = req.body.campground;
		// Create a new campground and save to database
		Campground.create(newCampground)
			.then(newlyCreated => {
				newlyCreated.author.id = req.user._id;
				newlyCreated.author.username = req.user.username;
				newlyCreated.save();
				req.flash('success', 'Created a new Campground!');
				res.redirect('/campgrounds');
			})
	}).catch(err => {
		req.flash('error', 'Something went wrong.');
		console.log('ERROR:', err);
		res.redirect('/campgrounds');
	});
});

// SHOW - Shows more info about one campground
router.get('/:id', (req, res) => {
	// find the campground with provided id
	Campground.findById(req.params.id)
		.populate('comments')
		.exec()
		.then(foundCampground => {
			// render show template with the campground
			res.render('campgrounds/show', { campground: foundCampground });
		})
		.catch(err => {
			console.log(err);
		});
});

// EDIT - Edit a campground
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id)
		.then(foundCampground => res.render('campgrounds/edit', { campground: foundCampground }))
		.catch(err => {
			console.log(err);
			res.redirect('/campgrounds');
		});
});

// UPDATE - Submit campground edit for update
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
	geocoder.geocode(req.body.campground.location).then(data => {
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		Campground.findByIdAndUpdate(req.params.id, req.body.campground)
			.then(() => {
				req.flash('success', 'Edits Saved!');
				res.redirect(`/campgrounds/${req.params.id}`);
			});
	})
		.catch(err => {
			req.flash('error', 'Something went wrong.');
			console.log(err);
			res.redirect('/campgrounds');
		});
});

// DESTROY - Delete a campground
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id)
		.then(() => {
			req.flash('success', 'Campground Deleted!');
			res.redirect('/campgrounds');
		})
		.catch(() => {
			req.flash('error', 'Something went wrong.');
			res.redirect('/campgrounds');
		});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
