var RoomListView = can.Control({
    defaults: {
        view: '/ejs/dialog_item'
    }
}, {
    rooms: [],
    selectAction: null,
    cancelAction: null,
    init: function (el, options) {
        this.app = options.app;
        this.rooms = options.rooms;
        this.element.html(can.view(this.options.view, {
            rooms: options.rooms
        }));
    },
    update: function (rooms) {
        this.rooms = rooms;
        this.element.html(can.view(this.options.view, {
            rooms: rooms
        }));
    },
    hideUsers: function (userIds) {
        for (var r in this.rooms) {
            for (var u in this.rooms[r].users) {
                if (userIds.indexOf(this.rooms[r].users[u]._id) >= 0) {
                    this.element.find('.dialog[data-value="' + this.rooms[r]._id + '"]').addClass('hide');
                }
            }
        }
    },
    hideConferences: function () {
        for (var r in this.rooms) {
            if (this.rooms[r].users.length > 2) {
                this.element.find('.dialog[data-value="' + this.rooms[r]._id + '"]').addClass('hide');
            }
        }
    },
    searchResult: function (results) {
        this.element.html(can.view('/ejs/search_results', {
            results: results
        }));
    },
    '.dialog click': function (el, ev) {
        var isRoom = el.hasClass('room');
        if (this.selectAction && typeof this.selectAction == 'function') {
            for (var r in this.rooms) {
                if (this.rooms[r]._id == el.attr('data-value')) {
                    for (var u in this.rooms[r].users) {
                        if (this.rooms[r].users[u]._id != this.app.user._id) {
                            this.selectAction(this.rooms[r].users[u]._id);
                            break;
                        }
                    }
                }
            }
            this.app.mainController.header.hideCancel();
            this.selectAction = null;
            this.element.find('.dialog').removeClass('hide');
        } else {
            var method = isRoom ? 'info' : 'create';
            this.app.socket.emit('room ' + method, el.attr('data-value'));
        }

        if (!isRoom) {
            this.app.mainController.header.toggleSearch();
        }
    }
});