var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.render('index', { title: 'Dashboard' });
  }
  else {
    res.redirect('/users/login');
  }
});

module.exports = router;
