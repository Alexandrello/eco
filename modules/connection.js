var User = require('../models/user');
var Room = require('../models/room');
var Message = require('../models/message');

module.exports = function (app, socket) {
    var connection = this;
    app.auth.getAuth(socket.handshake, function (auth) {
        if (!auth) {
            return;
        }

        socket.emit('hello', {
            id: auth.id,
            name: auth.name
        });
        connection.user = auth;

        socket.on('room list', function () {
            Room.find({users: {$all: connection.user.id}}, function (err, rooms) {
                for (var r in rooms) {
                    socket.join('room ' + rooms[r].id);
                }
                socket.emit('room list', rooms);
            });
        });

        socket.on('room info', function (data) {
            Room.find({id: data.roomId}, function (err, rooms) {
                if (!rooms.length) {
                    return;
                }
                var room = rooms.pop().toObject();

                Message.find({roomId: data.roomId}, {}, {sort: {timestamp: 1}, limit: 10}, function (err, messages) {
                    room.messages = messages;
                    socket.emit('room info', room);
                });
            });
        });

        socket.on('message', function (msg) {
            msg.text = msg.text.trim();
            if (!msg.text) {
                return;
            }

            Message.count({}, function (count) {
                var message = new Message(msg);
                message.userId = auth.id;
                message.userName = auth.name || auth.email;
                message.userAvatar = auth.avatar || '/img/150x150.png';
                message.id = count + 1;
                message.timestamp = new Date().getTime();

                console.log('new message', message);

                message.save();

                socket.emit('message', message);
                socket.broadcast.to('room ' + message.roomId).emit('message', message);
            });
        });

        socket.on('search', function (search) {
            User.find({
                name: search.query
            }, function (err, users) {
                var results = [];
                for (var u in users) {
                    if (users[u].id != auth.id) {
                        results.push({
                            id: users[u].id,
                            name: users[u].name,
                            avatar: users[u].avatar
                        });
                    }
                }
                socket.emit('search', results);
            });
        });
    });
}