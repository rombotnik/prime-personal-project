// TODO: Update URL to point to new database
var seraphUrl = require('url').parse('http://app37253375:kxv7jzEcAWTYeLyyzuqs@app37253375.sb05.stations.graphenedb.com:24789');
var db = require("seraph")({
    server: seraphUrl.protocol + '//' + seraphUrl.host,
    user: seraphUrl.auth.split(':')[0],
    pass: seraphUrl.auth.split(':')[1]
});
var model = require('seraph-model');

var choice = model(db, 'Choice');
var scene = model(db, 'Scene');
var statistic = model(db, 'Statistic');

choice.schema = {
    title: {type: String, required: true}
};

scene.schema = {
    title: String,
    content: {type: String, required: true}
};

statistic.schema = {
    name: {type: String, required: true},
    value: {required: true}
};

// Composition: the scene contains an array of choices; each choice contains an array of scenes (without choices) that they lead to -- this reduces a lot of overhead in the server trying to traverse relationships. We also handle statistics here.
scene.compose(choice, 'choices', 'CONTAINS', {many: true});
scene.compose(statistic, 'statistics', 'REFERENCES', {many: true});
choice.compose(scene, 'scenes', 'LEADS TO', {many: true});
choice.compose(statistic, 'statistics', 'AFFECTS', {many: true});

module.exports.choice = choice;
module.exports.scene = scene;
module.exports.statistic = statistic;