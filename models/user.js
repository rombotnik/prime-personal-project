var seraphUrl = require('url').parse('http://app37458637:gp9yfrsaA1uQD6a5pMZm@app37458637.sb05.stations.graphenedb.com:24789');
var db = require("seraph")({
    server: seraphUrl.protocol + '//' + seraphUrl.host,
    user: seraphUrl.auth.split(':')[0],
    pass: seraphUrl.auth.split(':')[1]
});
var model = require('seraph-model');
var game = require('./game');

var user = model(db, 'User');

user.schema = {
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true}
};

user.setUniqueKey('username');
user.compose(game.game, 'games', 'PLAYED', {many: true});
user.compose(game.game, 'currentGame', 'PLAYING');

module.exports = user;