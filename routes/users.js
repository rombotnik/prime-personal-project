var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcrypt');
var User = require('../models/user');

var seraphUrl = require('url').parse('http://app37458637:gp9yfrsaA1uQD6a5pMZm@app37458637.sb05.stations.graphenedb.com:24789');
var db = require("seraph")({
    server: seraphUrl.protocol + '//' + seraphUrl.host,
    user: seraphUrl.auth.split(':')[0],
    pass: seraphUrl.auth.split(':')[1]
});

router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Log In'});
});

router.get('/me', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.send(req.user);
    } else {
        res.redirect('/users/login');
    }
});

router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Register'});
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/play',
    failureRedirect: '/login'})
);

router.post('/register', function (req, res, next) {
    // Hash and save password
    bcrypt.genSalt(10, function(err, salt){
        if (err) return next(err);
        bcrypt.hash(req.body.password, salt, function(err, hash){
            if (err) return next(err);
            req.body.password = hash;
            // Save the user after the hash is complete
            User.save({username: req.body.username, password: req.body.password, email: req.body.email}, function(err, node){
                if (err) return next(err);
                console.log('Created new user: ', node.username);
                db.relate(node, 'PLAYING', 2, function(err, rel) {
                    if (err) return next(err);
                    console.log('New user is now playing!');
                });
                res.redirect('/users/login');
            });
        });
    });
});

module.exports = router;