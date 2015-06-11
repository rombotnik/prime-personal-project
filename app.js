var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var session = require('express-session');
var bcrypt = require('bcrypt');
var User = require('./models/user');

var routes = require('./routes/index');
var users = require('./routes/users');
var play = require('./routes/play');
var edit = require('./routes/edit');
var browse = require('./routes/browse');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport setup
// Passport setup
app.use(session({
    secret: 'secret',
    key: 'user',
    resave: true,
    saveUninitialized: false,
    cookie: {maxAge: 60000000000, secure: false}
}));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Lets user information be stored and retrieved from session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.read(id, function(err,user){
        if(err) done(err);
        done(null,user);
    });
});

// Local strategy: user/pass names stored in our own database
passport.use('local', new localStrategy({
        passReqToCallback: true,
        usernameField: 'username'
    },
    function(req, username, password, done) {
        console.log('Attempting to authenticate user: ', username);
        // Looks for a user that matches the username; sends an error message if there is no match
        console.log(User);

        User.where({username: username}, function (err, user) {
            if (err) throw err;
            if (!user)
                return done(null, false, {message: 'Incorrect username or password.'});
            // Tests the entered password for the given username and returns a match or "null, false" with an error message
            bcrypt.compare(password, user[0].password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch)
                    return done(null, user[0]);
                else
                    done(null, false, {message: 'Incorrect username or password.'});
            });
        });
    }));

// routing
app.use('/', routes);
app.use('/users', users);
app.use('/play', play);
app.use('/edit', edit);
app.use('/browse', browse);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
