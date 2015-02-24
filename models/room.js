var mongoose = require('mongoose');

var RoomSchema = mongoose.Schema({
    name: String,
    users: [{type: mongoose.Schema.ObjectId, ref: 'User'}]
}, {
    collection: 'rooms'
});

module.exports = mongoose.model('Room', RoomSchema);