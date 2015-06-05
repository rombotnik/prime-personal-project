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
    game.scene.read(id, function(err, data){
        if (err) throw err;
        // Checks if there's any text to be shown/hide/replaced in the scene; returns updated scene
        getData(data, function(s){
            scene = s;
            console.log(scene);
            // If there aren't any choices, create a Continue button that connects to the next scene
            if (!scene.choices) {
                db.relationships(id, 'out', 'LEADS TO', function(err, rel){
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
var makeChoice = function(id, cb) {
    game.choice.read(id, function(err, choice){
        if (err) throw err;

        if (choice.statistics) {
            choice.statistics.forEach(function (stat) {
                switch (stat._rel.mode) {
                    case 'set':
                    default:
                        db.save({id: stat.id}, 'value', stat._rel.value, function (err, node) {
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
    res.render('play', { title: 'Play' });
});

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

router.post('/choice/:id', function(req, res, next){
    makeChoice(req.params.id, function(data){
        // Send down the ID of the next scene after processing the choice
        res.send(data);
    });
});

module.exports = router;