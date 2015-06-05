var express = require('express');
var router = express.Router();

router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Log In'});
});

router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Register'});
});

router.post('/update', function(req, res, next) {
    // Find user in database

    // If password has a new value:
    // Compare hashed pass to req.body.user.password

    // If modified: hash the new one and save it
});

module.exports = router;