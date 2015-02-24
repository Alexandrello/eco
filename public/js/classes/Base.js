var Base = can.Construct.extend({
    require: function (className, callback) {
        var names = className.split('.');
        var className = names[1];
        var classType = names[0];

        if (window[className]){
            return callback(className, classType);
        }

        var fileName = '/js/' + names.join('/') + '.js';
        var script = document.createElement('script');
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", fileName);
        script.onload = function () {
            callback(className, classType);
        };
        document.getElementsByTagName("head")[0].appendChild(script);
        console.log('require ' + className);
    },
    requireCreate: function (className, callback) {
        var self = this;
        this.require(className, function (moduleName, moduleType) {
            callback(new window[moduleName](self), moduleName, moduleType);
        });
    }
});