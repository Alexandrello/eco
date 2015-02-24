var mongoose = require('mongoose');

var MessageSchema = mongoose.Schema({
    userId: mongoose.Schema.ObjectId,
    userName: String,
    userAvatar: String,
    roomId: mongoose.Schema.ObjectId,
    timestamp: Number,
    text: String
}, {
    collection: 'messages'
});

module.exports = mongoose.model('Message', MessageSchema);