var express = require('express');
var router = express.Router();

var seraphUrl = require('url').parse('http://app37253375:kxv7jzEcAWTYeLyyzuqs@app37253375.sb05.stations.graphenedb.com:24789');
var db = require("seraph")({
    server: seraphUrl.protocol + '//' + seraphUrl.host,
    user: seraphUrl.auth.split(':')[0],
    pass: seraphUrl.auth.split(':')[1]
});

var Game = require('../models/game');
var User = require('../models/user');

/*          Game-specific Functions          */

// Gets data for a scene based on the references it makes to other variables
var getData = function(scene, cb) {
    db.relationships(scene.id, 'out', 'REFERENCES', function(err, rels){
        if (err) throw err;
        var processed = 0;
        if (rels.length == 0) {
            cb(scene);
        }
        else {
            rels.forEach(function (rel) {
                db.read(rel.end, function (err, node) {
                    // Gets the value of a variable by its name, then replaces occurrences of [[variable]] in scene text
                    // with the RELATIONSHIP'S property of that same name
                    scene.content = scene.content.replace('[[' + node.name + ']]', rel.properties[node.value]);
                    processed++;
                    if (processed == rels.length) {
                        cb(scene);
                    }
                });
            });
        }
    });
};

var imp = {
    onSceneRead: function(err, data){
        // implementation
    },
    onDataReceived: function(s){
        // more stuff
    }
};

// Gets a scene and associated choices by ID
var getScene = function(id, cb) {
    var scene;
    // Gets the current scene, then updates any data as necessary
    Game.scene.read(id, function(err, data){
        if (err) throw err;
        // Checks if there's any text to be shown/hide/replaced in the scene; returns updated scene
        getData(data, function(s){
            scene = s;
            console.log(scene);
            // If there aren't any choices, create a Continue button that connects to the next scene
            if (!scene.choices) {
                db.relationships(id, 'out', 'LEADS_TO', function(err, rel){
                    if (err) throw err;
                    scene.choices = [{title: 'Continue', id: rel[0].end, direct: true}];
                    cb(scene);
                });
            }
            else {
                cb(scene);
            }
        });
    });
};

// Updates the value of a variable in the DB based on the choice made
var makeChoice = function(id, user, cb) {
    Game.choice.read(id, function(err, choice){
        if (err) throw err;

        if (choice.statistics) {
            // Loop through stats that the choice affects
            choice.statistics.forEach(function (stat) {
                // Do something based on the choice mode
                switch (stat._rel.mode) {
                    case 'set':
                    default:
                        // Set the relationship of the current user to the user's current game to have the appropriate value for each statistic
                        user.currentGame._rel[stat.name] = stat._rel.value;
                        console.log("Statistic object", stat);
                        // Save the user
                        console.log("Attempting to save user", user);
                        User.save(user, function (err, node) {
                            if (err) throw err;
                            console.log("Updated node:", node);
                        });
                        break;
                }
            });
        }

        // If there's a scene linked to a choice: send back the ID of that scene - otherwise, send back 7 (the root scene, hardcoded)
        // TODO: Account for last scenes / finishing a story
        if (choice.scenes) {
            cb({id: choice.scenes[0].id});
        } else {
            cb({id: 7});
        }
    });
};

/*          Router Functions          */

router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.render('play', { title: 'Play' });
    }
    else {
        res.redirect('/users/login');
    }
});

router.get('/scene/:id', function(req, res, next) {
    if (req.isAuthenticated()) {
        var scene = req.params.id;
        if (scene == 'undefined' || !scene) {
            scene = req.user.currentGame._rel.current_scene;
        }
        getScene(scene, function(data){
            // Send down the requested scene
            res.send(data);
        });
    } else {
        res.redirect('/users/login');
    }
});

router.get('/game/:id', function(req, res, next) {
    if (req.isAuthenticated()) {
        Game.game.read(req.params.id, function(err, data){
            if (err) next(err);
            res.send(data);
        });
    }
});

router.post('/choice/:id', function(req, res, next){
    if (req.isAuthenticated()){
        makeChoice(req.params.id, req.user, function(data){
            // Send down the ID of the next scene after processing the choice
            res.send(data);
        });
    } else {
        res.redirect('/users/login');
    }
});

module.exports = router;