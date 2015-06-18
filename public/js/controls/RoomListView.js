var RoomListView = can.Control({
    defaults: {
        view: '/ejs/dialog_item'
    }
}, {
    selectAction: null,
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
    hideUsers: function(userIds){
        for(var u in userIds){
            this.element.find('.dialog[data-value="' + userIds[u] + '"]').addClass('hide');
        }
    },
    searchResult: function (results) {
        this.element.html(can.view('/ejs/search_results', {
            results: results
        }));
    },
    '.room click': function (el, ev) {
        if (this.selectAction && typeof this.selectAction == 'function'){
            this.selectAction(el.attr('data-value'));
            this.selectAction = null;
        } else {
            this.app.socket.emit('room info', el.attr('data-value'));
        }
    },
    '.search-result click': function (el, ev) {
        if (this.selectAction && typeof this.selectAction == 'function'){
            this.selectAction(el.attr('data-value'));
            this.selectAction = null;
        } else {
            this.app.socket.emit('room create', el.attr('data-value'));
        }
    }
});