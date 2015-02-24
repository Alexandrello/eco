var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    id: Number,
    name: String,
    email: String,
    avatar: String,
    password: String,
    sessionId: String
}, {
    collection: 'users'
});

module.exports = mongoose.model('User', UserSchema);