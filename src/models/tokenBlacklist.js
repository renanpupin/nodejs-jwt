const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

let schema = new Schema({
	token: {type: String, required: true, unique: true},
	user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	created_at: {type: Date, required: true, default: Date.now}
});

module.exports = mongoose.model('TokenBlacklist', schema);
