var Controller = Base.extend({
    app: null,
    dependencies: [],
    initDependencies: function (callback) {
        var self = this;
        if (self.dependencies.length == 0){
            callback();
        }
        var inited = 0;
        for (var c in self.dependencies) {
            this.require(self.dependencies[c], function(){
                inited++;
                if (inited == self.dependencies.length){
                    callback();
                }
            });
        }
    }
});