var User = require('../models/user');
var SHA256 = require("crypto-js/sha256");

var auth = {
    init: function (app) {
        app.get('/login', function (req, res) {
            res.render('login', {title: 'GAD'});
        });

        app.post("/login/", function (req, res) {
            var loginData = req.body;
            if (loginData.email == undefined || loginData.email == '' ||
                loginData.password == undefined || loginData.password == '') {
                res.json({
                    success: false
                });
            } else {
                loginData.password = SHA256(loginData.password);
                User.find({
                    email: loginData.email
                }, function (err, users) {
                    if (users.length) {
                        var user = users.pop();
                        if (user.password == loginData.password) {
                            user.sessionId = auth.generateSessionId();
                            user.save();
                            res.json({
                                success: true,
                                sessionId: user.sessionId
                            });
                        } else {
                            res.json({
                                success: false
                            });
                        }
                    } else {
                        User.count({}, function (count) {
                            var user = new User(loginData);
                            user.sessionId = auth.generateSessionId();
                            user.avatar = '/img/150x150.png';
                            user.id = count + 1;

                            console.log(user);

                            user.save();
                            res.json({
                                success: true,
                                sessionId: user.sessionId
                            });
                        });
                    }
                });
            }
        });

        app.all('*', function (req, res, next) {
            auth.getAuth(req, function (auth) {
                if (auth) {
                    next();
                } else {
                    res.redirect('/login/');
                }
            });
        });
    },
    getAuth: function (request, callback) {
        var sessionId = null;
        var rc = request.headers.cookie;

        rc && rc.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            if (parts.shift().trim() == 'session_id') {
                sessionId = decodeURI(parts.join('='));
            }
        });

        User.find({
            sessionId: sessionId
        }, function (err, users) {
            callback(users.length ? users.pop() : null);
        });
    },
    generateSessionId: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid.toUpperCase();
    }
};

module.exports = auth;