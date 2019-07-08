const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware/');

// ======================
// COMMENTS ROUTES
// ======================

// NEW - New comment page for campgrounds
router.get('/new', middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id)
		.then((foundCampground) => {
			res.render('comments/new', { campground: foundCampground });
		})
		.catch((err) => {
			console.log(err);
		});
});

// CREATE
router.post('/', middleware.isLoggedIn, (req, res) => {
	const newComment = req.body.comment;
	Comment.create(newComment)
		.then((comment) => {
			Campground.findById(req.params.id).then((foundCampground) => {
				// add username and id to comment
				comment.author.id = req.user._id;
				comment.author.username = req.user.username;
				comment.save();
				// save comment
				foundCampground.comments.push(comment);
				req.flash('success', 'Comment Posted!');
				foundCampground.save(() => {
					res.redirect('/campgrounds/' + foundCampground._id);
				});
			});
		})
		.catch((err) => {
			req.flash('error', 'Something went wrong.');
			console.log(err);
			res.redirect('/campgrounds');
		});
});

// EDIT
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id)
		.then((foundComment) => {
			res.render('comments/edit', { campground_id: req.params.id, comment: foundComment });
		})
		.catch((err) => {
			console.log(err);
			res.redirect('back');
		});
});

// UPDATE

router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment)
		.then(() => {
			req.flash('success', 'Comment Updated!');
			res.redirect(`/campgrounds/${req.params.id}`);
		})
		.catch((err) => {
			req.flash('error', 'Something went wrong.');
			console.log(err);
			res.redirect('back');
		});
});

// DESTROY
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id)
		.then(() => {
			req.flash('success', 'Comment Deleted!');
			res.redirect('back');
		})
		.catch(() => {
			req.flash('error', 'Something went wrong.');
			res.redirect('back');
		});
});

module.exports = router;
