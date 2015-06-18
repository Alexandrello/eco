var RoomListView = can.Control({
    defaults: {
        view: '/ejs/dialog_item'
    }
}, {
    init: function (el, options) {
        this.app = options.app;
        this.element.html(can.view(this.options.view, {
            rooms: options.rooms
        }));
    },
    update: function (rooms) {
        this.element.html(can.view(this.options.view, {
            rooms: rooms
        }));
    },
    searchResult: function (results) {
        this.element.html(can.view('/ejs/search_results', {
            results: results
        }));
    },
    '.room click': function (el, ev) {
        this.app.socket.emit('room info', el.attr('data-value'));
    },
    '.search-result click': function (el, ev) {
        this.app.socket.emit('room create', el.attr('data-value'));
    }
});