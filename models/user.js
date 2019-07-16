const mongoose = require('mongoose'),
	passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatar: { type: String, default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7cWypDlC9A7aDtMmoErO944V_Us9WYSXhPEjrquHy9CWsAdbdyw" },
	firstName: String,
	lastName: String,
	email: String,
	isAdmin: { type: Boolean, default: false }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
