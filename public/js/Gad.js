var Gad = Controller.extend({
    dependencies: [
        'controllers.Loader',
        'controllers.MainController'
    ],
    init: function () {
        this._super();
        var app = this;
        app.socket = io();
        app.socket.on('hello', function (data) {
            app.user = data;
            app.initDependencies(function () {
                app.loader = new Loader(app);
                app.mainController = new MainController(app);
                app.loader.hide();
            });
        }).on('disconnect', function(){
            if (app.mainController){
                app.mainController.disconnect();
            }
        });
    }
});