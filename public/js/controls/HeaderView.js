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
    hideSearch: function(){
        this.element.find('.ion-search').addClass('hide');
    },
    showSearch: function(){
        this.element.find('.ion-search').removeClass('hide');
    },
    showCancel: function(){
        this.element.find('.cancel').removeClass('hide');
    },
    hideCancel: function(){
        this.element.find('.cancel').addClass('hide');
    },
    '#search keyup': function(el, ev){
        this.app.mainController.search(el.val());
    },
    '.search-toggle click': function(el, ev){
        this.toggleSearch();
        if (el.is('.ion-close') && !el.is(':visible')){
            this.element.find('#search').val('');
            this.app.mainController.search('');
        } else {
            this.element.find('#search').focus();
        }
    },
    '.cancel click': function(){
        if (this.app.mainController.listView.cancelAction && typeof this.app.mainController.listView.cancelAction == 'function'){
            this.app.mainController.listView.cancelAction();
            this.app.mainController.listView.cancelAction = null;
        }
        this.app.mainController.listView.element.find('.dialog').removeClass('hide');
        this.hideCancel();
    }
});