var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcrypt');
var User = require('../models/user');

router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Log In'});
});

router.get('/me', function (req, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.user);
        res.send(req.user);
    } else {
        res.redirect('/users/login');
    }
});

router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Register'});
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'})
);

router.post('/register', function (req, res, next) {
    console.log(req.body);
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
                res.send(node);
            });
        });
    });
});

module.exports = router;