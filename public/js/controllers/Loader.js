var Loader = Controller.extend({
    init: function(){
        this.view = $('#content .loading');
    },
    show: function(){
        this.view.show();
    },
    hide: function(){
        this.view.hide();
    }
});