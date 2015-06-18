var HeaderView = can.Control({
    defaults: {
        view: '/ejs/header'
    }
}, {
    init: function (el, options) {
        this.app = options.app;
        this.element.html(can.view(this.options.view, {}));
        this.element.find('#search');
    },
    toggleSearch: function(){
        this.element.find('h1.title').toggleClass('hide');
        this.element.find('.search-toggle').toggleClass('hide');
        this.element.find('#search-wrapper').toggleClass('hide');
    },
    '#search keyup': function(el, ev){
        this.app.mainController.search(el.val());
    },
    '.search-toggle click': function(el, ev){
        this.toggleSearch();
    }
});