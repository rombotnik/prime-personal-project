var express = require('express');
var router = express.Router();

var express = require('express');
var router = express.Router();

var seraphUrl = require('url').parse('http://app37253375:kxv7jzEcAWTYeLyyzuqs@app37253375.sb05.stations.graphenedb.com:24789');
var db = require("seraph")({
    server: seraphUrl.protocol + '//' + seraphUrl.host,
    user: seraphUrl.auth.split(':')[0],
    pass: seraphUrl.auth.split(':')[1]
});

var game = require('../models/game');

/*          Game-specific Functions          */

// Gets a scene and associated choices by ID
// TODO: Get all choices and values/statistic references and the values those could be in the scene, rather than the scene directly
var getScene = function(id, cb) {
    // Gets the current scene, then updates any data as necessary
    game.scene.read(id, function(err, data){
        if (err) throw err;
        cb(data);
    });
};

// GET scene
router.get('/', function(req, res, next) {
    res.render('edit', { title: 'Harmony | Edit' });
});

// GET scene
router.get('/scene/*', function(req, res, next) {
    try {
        getScene(req.params[0], function(data){
            // Send down the requested scene
            res.send(data);
        });
    }
    catch(err) {
        console.log(err);
        getScene(7, function(data){
            res.send(data);
        });
    }
});

module.exports = router;