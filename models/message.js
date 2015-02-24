var mongoose = require('mongoose');

var MessageSchema = mongoose.Schema({
    id: Number,
    userId: Number,
    userName: String,
    userAvatar: String,
    roomId: Number,
    timestamp: Number,
    text: String
}, {
    collection: 'messages'
});

module.exports = mongoose.model('Message', MessageSchema);