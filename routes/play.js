var express = require('express');
var router = express.Router();

var seraphUrl = require('url').parse('http://app37458637:gp9yfrsaA1uQD6a5pMZm@app37458637.sb05.stations.graphenedb.com:24789');
var db = require("seraph")({
    server: seraphUrl.protocol + '//' + seraphUrl.host,
    user: seraphUrl.auth.split(':')[0],
    pass: seraphUrl.auth.split(':')[1]
});

var Game = require('../models/game');
var User = require('../models/user');

/*          Game-specific Functions          */

// Gets data for a scene based on the references it makes to other variables
var getData = function(scene, user, cb) {
    console.log("Getting data for scene", scene);
    console.log("Scene user data", user);
    console.log("Scene statistics", scene.statistics);

    if (scene.statistics) {
        var processed = 0;
        scene.statistics.forEach(function(stat) {
            // Get user's value for the variable
            var userValue = user.currentGame._rel[stat.name];
            // Replace scene text
            scene.content = scene.content.replace('[[' + stat.name + ']]', stat._rel[userValue]);
            processed++;
            // Check if it's time to send the data back
            if (processed == scene.statistics.length) {
                cb(scene);
            }
        })
    } else {
        cb(scene);
    }
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
var getScene = function(id, user, cb) {
    var scene;
    console.log("Getting scene:", id);
    // Sets the user's current scene to this one
    user.currentGame._rel.current_scene = id;
    User.save(user, function(err, data){
        if (err) throw err;
        console.log("Updated user", data.username);
    });
    // Gets the current scene, then updates any data as necessary
    Game.scene.read(id, function(err, data){
        if (err) throw err;
        // Checks if there's any text to be shown/hide/replaced in the scene; returns updated scene
        getData(data, user, function(s){
            scene = s;
            console.log(scene);
            // If there aren't any choices create a Continue button that connects to the next scene
            if (!scene.choices) {
                db.relationships(id, 'out', 'LEADS_TO', function(err, rel){
                    if (err) throw err;
                    if (rel.length > 0) {
                        scene.choices = [{title: 'Continue', id: rel[0].end, direct: true}];
                    } else {
                        scene.choices = [{title: 'Play Again', id: user.currentGame.first_scene.id, direct: true}];
                    }
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
    console.log("User ", user, "made choice: ", id);
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
                            // Finally, CB after saving the user
                            if (choice.scenes) {
                                cb({id: choice.scenes[0].id});
                            } else {
                                cb({id: user.currentGame.first_scene.id});
                            }
                        });
                        break;
                }
            });
        }

        // If there's a scene linked to a choice: send back the ID of that scene - otherwise, send back 7 (the root scene, hardcoded)
        // TODO: Account for last scenes / finishing a story
        else {
            if (choice.scenes) {
                cb({id: choice.scenes[0].id});
            } else {
                cb({id: user.currentGame.first_scene.id});
            }
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
            scene = req.user.currentGame._rel.current_scene || req.user.currentGame.first_scene.id;
        }
        getScene(scene, req.user, function(data){
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