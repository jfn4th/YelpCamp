const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// Landing Page
router.get('/', (req, res) => {
	res.render('landing');
});

// ==================
// AUTH ROUTES
// ==================

// show register form
router.get('/register', (req, res) => {
	res.render('register', { page: 'register' });
});

// handle signup logic
router.post('/register', (req, res) => {
	const newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		avatar: req.body.avatar,
		email: req.body.email
	});
	if (req.body.adminCode === process.env.ADMIN_CODE) {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password)
		.then((user) => {
			passport.authenticate('local')(req, res, () => {
				req.flash('success', `Welcome to YelpCamp, ${user.username}!`);
				res.redirect('/campgrounds');
			});
		})
		.catch((err) => {
			req.flash('error', err.message);
			res.redirect('register');
		});
});

// show login form
router.get('/login', (req, res) => {
	res.render('login', { page: 'login' });
});

// handle login logic
router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/campgrounds',
		failureRedirect: '/login'
	})
);

// logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/campgrounds');
});

module.exports = router;
