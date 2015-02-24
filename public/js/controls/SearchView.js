var SearchView = can.Control({
    defaults: {
        view: '/ejs/search'
    }
}, {
    init: function (el, options) {
        this.app = options.app;
        this.element.html(can.view(this.options.view, {
            rooms: options.rooms
        }));
    },
    '#search keyup': function(el, ev){
        this.app.mainController.search(el.val());
    }
});