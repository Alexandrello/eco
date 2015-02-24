var View = can.Control({}, {
    init: function (el, options) {
        this.element.html(can.view(this.options.view, this.options));
    },
    update: function (data) {
        this.element.html(can.view(this.options.view, data));
    }
});