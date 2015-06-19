var User = require('../models/user');
var Room = require('../models/room');
var Message = require('../models/message');

function timeStamp(timestamp) {
    var now = new Date(timestamp);

    var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
    var time = [now.getHours(), now.getMinutes(), now.getSeconds()];

    for (var i = 1; i < 3; i++) {
        if (time[i] < 10) {
            time[i] = "0" + time[i];
        }
    }
    return date.join(".") + " " + time.join(":");
}

function userVars(user) {
    return {
        _id: user._id,
        avatar: user.avatar,
        email: user.email,
        name: user.name
    };
}

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

                    for (var u = 0; u < room.users.length; u++) {
                        if (!room.users[u]._id.equals(auth._id) && room.users.length == 2) {
                            room.name = room.users[u].name;
                        }

                        room.users[u] = userVars(room.users[u]);
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

                for (var u = 0; u < room.users.length; u++) {
                    if (!room.users[u]._id.equals(auth._id) && room.users.length == 2) {
                        room.name = room.users[u].name;
                    }

                    room.users[u] = userVars(room.users[u]);
                }

                room = room.toObject();

                Message.find({roomId: room._id}, {}, {
                    sort: {timestamp: 1},
                    limit: 10
                }).populate('userId').exec(function (err, messages) {
                    room.messages = [];
                    for (var m = 0; m < messages.length; m++) {
                        room.messages.push({
                            timestamp: timeStamp(messages[m].timestamp),
                            text: messages[m].text,
                            userId: messages[m].userId._id,
                            userName: messages[m].userId.name,
                            userAvatar: messages[m].userId.avatar
                        });
                    }
                    socket.emit('room info', room);
                });
            });
        };

        connection.roomCreate = function (userId) {
            Room.findOne({
                users: {
                    $all: [userId, auth._id],
                    $size: 2
                }
            }, function (err, room) {
                if (room) {
                    return;
                }
                var room = new Room({name: 'Conf', users: [userId, auth._id]});
                room.save(function () {
                    socket.join('room ' + room._id);
                    connection.roomInfo(room._id);

                    for (var c in app.connections) {
                        if (app.connections[c].auth._id.equals(userId) || app.connections[c].auth._id.equals(auth._id)) {
                            app.connections[c].roomList();
                        }
                    }
                });
            });
        };

        connection.roomInvite = function (invite) {
            Room.findById(invite.roomId).exec(function (err, room) {
                if (!room || room.users.indexOf(invite.userId) >= 0) {
                    return;
                }

                room.users.push(invite.userId);
                room.save(function () {
                    connection.roomInfo(invite.roomId);
                    connection.roomList();
                });
            });
        }

        connection.sendMessage = function (msg) {
            msg.text = msg.text.trim();
            if (!msg.text) {
                return;
            }

            var message = new Message(msg);
            message.userId = auth._id;
            message.timestamp = new Date().getTime();

            message.save();

            message = message.toObject();
            message.userName = auth.name || auth.email;
            message.userAvatar = auth.avatar || '/img/150x150.png';
            message.timestamp = timeStamp(message.timestamp);

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
        socket.on('room invite', connection.roomInvite);
        socket.on('message', connection.sendMessage);
        socket.on('search', connection.searchUsers);
    });
    return connection;
}