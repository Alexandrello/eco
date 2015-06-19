var DialogView = can.Control({
    defaults: {
        view: '/ejs/chat_window'
    }
}, {
    init: function (el, options) {
        this.app = options.app;
        this.room = options.room;
        this.element.html(can.view(this.options.view, {
            room: options.room
        }));
        this.messageList = this.element.find('.content .list');
        this.messageInput = this.element.find('.chatInput');

        this.messageList.slimScroll({
            start: "bottom",
            railVisible: true,
            height: '100%'
        }).bind('slimscroll', function (e, pos) {
            // load oldest
        });

        this.element.removeClass('hide');

        this.update(options.room.messages);
    },
    update: function (messages) {
        for (i in messages) {
            this.addMessage(messages[i]);
        }
    },
    addMessage: function (message) {
        var template = this.app.user._id == message.userId ? 'im_out' : 'im_income';
        this.messageList.append(can.view('/ejs/' + template, message));

        var scrollTo = this.messageList.prop('scrollHeight') + 'px';
        this.messageList.slimScroll({scrollTo: scrollTo});
    },
    getUserList: function () {
        var userIds = [];

        for (var u in this.room.users) {
            if (this.room.users[u]._id != this.app.user._id) {
                userIds.push(this.room.users[u]._id);
            }
        }
        return userIds;
    },
    close: function () {
        this.element.addClass('hide');
        this.app.mainController.closeDialog();
        this.element.html('');
        this.destroy();
    },
    hide: function () {
        this.element.addClass('hide');
    },
    show: function () {
        this.element.removeClass('hide');
    },
    '.close click': function (el, ev) {
        this.close();
    },
    '.invite click': function (el, ev) {
        var self = this;
        this.app.mainController.header.hideSearch();
        this.app.mainController.listView.hideUsers(this.getUserList());
        this.app.mainController.listView.hideConferences();
        this.app.mainController.header.showCancel();
        this.app.mainController.listView.selectAction = function (userId) {
            self.app.mainController.header.showSearch();
            self.app.socket.emit('room invite', {roomId: self.room._id, userId: userId});
        }
        this.app.mainController.listView.cancelAction = function(){
            self.app.mainController.header.showSearch();
            self.show();
        }
        self.hide();
    },
    '.chatInput keypress': function (el, ev) {
        if (ev.keyCode == 13) {
            this.app.socket.emit('message', {roomId: this.room._id, text: el.val()});
            el.val('');
            return false;
        }
    },
    '.send-message click': function (el, ev) {
        this.app.socket.emit('message', {roomId: this.room._id, text: this.messageInput.val()});
        this.messageInput.val('');
    }
});