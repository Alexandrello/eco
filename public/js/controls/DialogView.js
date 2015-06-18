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
    close: function(){
        this.element.addClass('hide');
        this.app.mainController.closeDialog();
        this.element.html('');
        this.destroy();
    },
    '.close click': function (el, ev) {
        this.close();
    },
    '.chatInput keypress': function (el, ev) {
        if (ev.keyCode == 13) {
            this.app.mainController.sendMessage(this.room._id, el.val());
            el.val('');
            return false;
        }
    },
    '.send-message click': function(el, ev){
        this.app.mainController.sendMessage(this.room._id, this.messageInput.val());
        this.messageInput.val('');
    }
});