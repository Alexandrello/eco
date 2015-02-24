var User = require('../models/user');
var Room = require('../models/room');
var Message = require('../models/message');

module.exports = function (app, socket) {
    var connection = this;
    app.auth.getAuth(socket.handshake, function (auth) {
        if (!auth) {
            return;
        }
        connection.auth = auth;

        socket.emit('hello', {
            _id: auth._id,
            avatar: auth.avatar,
            name: auth.name
        });

        connection.roomList = function () {
            Room.find({users: {$all: auth._id}}).populate('users').exec(function (err, rooms) {
                for (var r in rooms) {
                    var room = rooms[r];
                    socket.join('room ' + room._id);

                    if (room.users.length == 2){
                        for(var u = 0; u < room.users.length; u++){
                            if (!room.users[u]._id.equals(auth._id)){
                                room.name = room.users[u].name;
                            }
                        }
                    }
                }
                socket.emit('room list', rooms);
            });
        }

        connection.roomInfo = function (roomId) {
            Room.findById(roomId).populate('users').exec(function (err, room) {
                if (!room) {
                    return;
                }
                socket.join('room ' + room._id);

                if (room.users.length == 2){
                    for(var u = 0; u < room.users.length; u++){
                        if (!room.users[u]._id.equals(auth._id)){
                            room.name = room.users[u].name;
                        }
                    }
                }

                room = room.toObject();

                Message.find({roomId: room._id}, {}, {sort: {timestamp: 1}, limit: 10}, function (err, messages) {
                    room.messages = messages;
                    socket.emit('room info', room);
                });
            });
        };

        connection.roomCreate = function (userId) {
            Room.findOne({
                users: {
                    $in: [userId, auth._id],
                    $size: 2
                }
            }, function (err, room) {
                if (room) {
                    return;
                }
                var room = new Room({
                    name: 'Conf',
                    users: [userId, auth._id]
                });
                room.save(function () {
                    socket.join('room ' + room._id);
                    socket.emit('room info', room);

                    for (var c in app.connections) {
                        if (app.connections[c].auth._id.equals(userId)) {
                            app.connections[c].roomList();
                            //app.connections[c].roomInfo(room._id.toString());
                        }
                    }
                });
            });
        };

        connection.sendMessage = function (msg) {
            msg.text = msg.text.trim();
            if (!msg.text) {
                return;
            }

            var message = new Message(msg);
            message.userId = auth._id;
            message.userName = auth.name || auth.email;
            message.userAvatar = auth.avatar || '/img/150x150.png';
            message.timestamp = new Date().getTime();

            message.save();

            socket.emit('message', message);
            socket.broadcast.to('room ' + message.roomId).emit('message', message);
        }

        connection.searchUsers = function (query) {
            User.find({
                name: query
            }, function (err, users) {
                var results = [];
                for (var u in users) {
                    if (!users[u]._id.equals(connection.auth._id)) {
                        results.push({
                            _id: users[u]._id,
                            name: users[u].name,
                            avatar: users[u].avatar
                        });
                    }
                }
                socket.emit('search', results);
            });
        }

        socket.on('room list', connection.roomList);
        socket.on('room info', connection.roomInfo);
        socket.on('room create', connection.roomCreate);
        socket.on('message', connection.sendMessage);
        socket.on('search', connection.searchUsers);
    });
    return connection;
}