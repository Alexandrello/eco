var MainController = Controller.extend({
    dependencies: [
        'controls.RoomListView',
        'controls.DialogView',
        'controls.HeaderView'
    ],
    init: function (app) {
        this.app = app;
        var self = this;

        this.initDependencies(function () {
            self.listView = new RoomListView('.dialogBlock', {app: app});
            self.header = new HeaderView('.bar-header', {app: app});
            self.initActions(app);
        });
    },
    disconnect: function(){
        if (this.dialog){
            this.dialog.close();
        }
    },
    initActions: function (app) {
        var self = this;
        app.socket.emit('room list', {});

        app.socket.on('room list', function (rooms) {
            self.rooms = rooms;
            self.listView.update(rooms);
        });

        app.socket.on('room info', function (room) {
            self.dialog = new DialogView('.dialogContainer', {
                app: self.app,
                room: room
            });
        });

        app.socket.on('message', function (message) {
            if (self.dialog && self.dialog.room._id == message.roomId) {
                self.dialog.addMessage(message);
            } else {

            }
        });

        app.socket.on('search', function (results) {
            self.listView.searchResult(results);
        });
    },
    search: function (search) {
        var rooms = [];
        for (var r in this.rooms) {
            if (this.rooms[r].name.search(search) >= 0) {
                rooms.push(this.rooms[r]);
            }
        }

        this.listView.update(rooms);

        if (!rooms.length) {
            app.socket.emit('search', search);
        }
    },
    closeDialog: function () {
        this.dialog = null;
    },
    sendMessage: function (roomId, text) {
        app.socket.emit('message', {
            roomId: roomId,
            text: text
        });
    }
});