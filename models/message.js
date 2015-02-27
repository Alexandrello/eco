var mongoose = require('mongoose');

var MessageSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.ObjectId, ref: 'User'},
    roomId: {type: mongoose.Schema.ObjectId, ref: 'Room'},
    timestamp: Number,
    text: String
}, {
    collection: 'messages'
});

module.exports = mongoose.model('Message', MessageSchema);