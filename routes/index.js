const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Campground = require('../models/campground');
const async = require("async");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

//forgot password
router.get('/forgot', (req, res) => {
	res.render('forgot');
});

// find lost user, create token, send token link
router.post('/forgot', (req, res, next) => {
	async.waterfall([
		done => {
			crypto.randomBytes(20, function (err, buf) {
				const token = buf.toString('hex');
				done(err, token);
			});
		},
		(token, done) => {
			User.findOne({ email: req.body.email }, (err, user) => {
				if (!user) {
					req.flash('error', 'No account with that email address exists.');
					return res.redirect('/forgot');
				}

				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

				user.save(err => {
					done(err, token, user);
				});
			});
		},
		(token, user, done) => {
			const smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'jfn4th@gmail.com',
					pass: process.env.GMAILPW
				}
			});
			const mailOptions = {
				to: user.email,
				from: 'jfn4th@gmail.com',
				subject: 'YelpCamp Password Reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/reset/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions, err => {
				console.log('mail sent');
				req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
				done(err, 'done');
			});
		}
	], err => {
		if (err) return next(err);
		res.redirect('/forgot');
	});
});

// enter new password
router.get('/reset/:token', (req, res) => {
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }).then(() => {
		res.render('reset', { token: req.params.token });
	}).catch(() => {
		req.flash('error', 'Password reset link is invalid or has expired.');
		res.redirect('/forgot');
	});
});

// set new password
router.post('/reset/:token', function (req, res) {
	async.waterfall([
		function (done) {
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
				if (!user) {
					req.flash('error', 'Password reset token is invalid or has expired.');
					return res.redirect('back');
				}
				if (req.body.password === req.body.confirm) {
					user.setPassword(req.body.password, function (err) {
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function (err) {
							req.logIn(user, function (err) {
								done(err, user);
							});
						});
					})
				} else {
					req.flash("error", "Passwords do not match.");
					return res.redirect('back');
				}
			});
		},
		function (user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'learntocodeinfo@gmail.com',
					pass: process.env.GMAILPW
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'learntocodeinfo@mail.com',
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' +
					'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			};
			smtpTransport.sendMail(mailOptions, function (err) {
				req.flash('success', 'Success! Your password has been changed.');
				done(err);
			});
		}
	], function (err) {
		res.redirect('/campgrounds');
	});
});

// USER PROFILES

// SHOW
router.get('/users/:id', (req, res) => {
	User.findById(req.params.id).then(user => {
		Campground.find().where('author.id').equals(user._id).then(campgrounds => {
			res.render('users/show', { user: user, campgrounds: campgrounds });
		})
	}).catch(() => {
		req.flash('error', "User Not Found!");
		res.redirect('/');
	});
});

module.exports = router;
