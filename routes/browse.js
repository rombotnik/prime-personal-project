var express = require('express');
var router = express.Router();
var Game = require('../models/game').game;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('browse', { title: 'Browse' });
});

router.get('/games', function(req, res, next) {
    Game.where({template: false}, function(err, games){
        if (err) next(err);
        res.send(games);
    });
});

module.exports = router;