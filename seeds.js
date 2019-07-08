// const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');

const data = [
	{
		name: "Cloud's Rest",
		image: 'https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
	},
	{
		name: 'Desert Mesa',
		image: 'https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
	},
	{
		name: 'Canyon Floor',
		image: 'https://farm1.staticflickr.com/189/493046463_841a18169e.jpg',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
	},
	{
		name: 'Diglett',
		image: 'https://cdn.bulbagarden.net/upload/thumb/3/31/050Diglett.png/250px-050Diglett.png',
		description: 'Good'
	}
];

function seedDB() {
	//Remove all campgrounds
	Campground.deleteMany({})
		.then(() => {
			console.log('removed campgrounds!');
			Comment.deleteMany({}).then(() => {
				console.log('removed comments!');
				//add a few campgrounds
				data.forEach((seed) => {
					Campground.create(seed).then((campground) => {
						console.log('added a campground');
						//create a comment
						Comment.create({
							text: 'This place is great, but I wish there was internet',
							author: 'Homer'
						}).then((comment) => {
							campground.comments.push(comment);
							campground.save();
							console.log('Created new comment');
						});
					});
				});
			});
		})
		.catch((err) => {
			console.log(err);
		});
}

module.exports = seedDB;
