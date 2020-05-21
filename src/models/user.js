const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

let schema = new Schema({
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true, select: false},
	reauth: {type: Boolean, default: false}
});

schema.pre('save',function(next){
	if(this.isModified('password')){
		this.password = bcrypt.hashSync(this.password);
	}
	next();
});

schema.methods.checkPassword = function(passwd){
	return bcrypt.compareSync(passwd,this.password);
};

module.exports = mongoose.model('User', schema);
