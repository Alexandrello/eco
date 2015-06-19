var User = require('../models/user');
var crypto = require('crypto');

var auth = {
    loginAction: function (req, res) {
        auth.getAuth(req, function (auth) {
            if (auth) {
                res.redirect('/');
            } else {
                res.render('login', {title: 'GAD'});
            }
        });
    },
    registerAction: function (req, res) {
        auth.getAuth(req, function (auth) {
            if (auth) {
                res.redirect('/');
            } else {
                res.render('register', {title: 'GAD'});
            }
        });
    },
    login: function (req, res) {
        var loginData = req.body;
        if (!loginData.email || !loginData.password) {
            res.json({
                success: false,
                error: 'Введите логин и пароль'
            });
        } else {
            loginData.password = crypto.createHash('sha256').update(loginData.password).digest('base64');
            User.findOne({
                email: loginData.email
            }, function (err, user) {
                if (user) {
                    if (user.password == loginData.password) {
                        user.sessionId = auth.generateSessionId();
                        user.save(function () {
                            res.json({
                                success: true,
                                sessionId: user.sessionId
                            });
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        error: 'Пользователь не найден'
                    });
                }
            });
        }
    },
    register: function (req, res) {
        var loginData = req.body;
        if (!loginData.email || !loginData.password || !loginData.name) {
            res.json({
                success: false,
                error: 'Заполните все поля'
            });
        } else {
            loginData.password = crypto.createHash('sha256').update(loginData.password).digest('base64');
            User.findOne({
                email: loginData.email
            }, function (err, user) {
                if (user) {
                    res.json({
                        success: false,
                        error: 'Пользователь с таким email уже зарегистрирован'
                    });
                } else {
                    var user = new User(loginData);
                    user.sessionId = auth.generateSessionId();
                    user.avatar = '/img/150x150.png';

                    user.save(function () {
                        res.json({
                            success: true,
                            sessionId: user.sessionId
                        });
                    });
                }
            });
        }
    },
    init: function (app) {
        app.get('/login/', auth.loginAction);
        app.get('/register/', auth.registerAction);
        app.post("/login/", auth.login);
        app.post("/register/", auth.register);

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

        User.findOne({
            sessionId: sessionId
        }, function (err, user) {
            callback(user);
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