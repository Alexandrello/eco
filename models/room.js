var mongoose = require('mongoose');

var RoomSchema = mongoose.Schema({
    id: Number,
    name: String,
    users: [{type: Number, ref: 'User'}]
}, {
    collection: 'rooms'
});

module.exports = mongoose.model('Room', RoomSchema);