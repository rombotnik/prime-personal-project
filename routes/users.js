var express = require('express');
var router = express.Router();

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Harmony | Please Log In' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Harmony | Welcome to Harmony' });
});

module.exports = router;