var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	provider_id		: {type: String, unique: true},
	name			: String,
	photo			: String,
	createdAt		: {type: Date, default: Date.now}
});

var User = mongoose.model('User', UserSchema);