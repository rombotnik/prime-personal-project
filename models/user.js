// TODO: Update URL to point to new database
var seraphUrl = require('url').parse('http://app37253375:kxv7jzEcAWTYeLyyzuqs@app37253375.sb05.stations.graphenedb.com:24789');
var db = require("seraph")({
    server: seraphUrl.protocol + '//' + seraphUrl.host,
    user: seraphUrl.auth.split(':')[0],
    pass: seraphUrl.auth.split(':')[1]
});
var model = require('seraph-model');

var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var user = model(db, 'User');

user.schema = {
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true}
};

user.setUniqueKey('username');

user.on('prepare', function(object, cb){
    // TODO: Figure out how to check if password is modified, then handle password encryption
});

//// Pre will run before the user object is saved to Mongo
//userSchema.pre('save', function(next) {
//    var user = this;
//    // Skip hashing if the password hasn't changed
//    if (!user.isModified('password')) return next();
//    // Generate salt
//    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//        if (err) return next(err);
//        // Hash the password and salt
//        bcrypt.hash(user.password, salt, function(err, hash) {
//            if (err) return next(err);
//            // Save the hashed password
//            user.password = hash;
//            next();
//        });
//    });
//});
//
//// Compares the user's password with an entered password, then returns the result to the callback
//userSchema.methods.comparePassword = function(candidatePassword, cb) {
//    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//        if (err) return cb(err);
//        cb(null, isMatch);
//    });
//};

module.exports = user;