var Header = Controller.extend({
    run: function () {
        document.getElementById('content').appendChild(can.view('ejs/header', {}));
    }
});