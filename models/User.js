
var mongoose = require('mongoose');
var Tweet = require('./Tweet')

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {
      type: String,
      minlength: 1,
    },
    password: {
      type: String,
      minlength: 1,
    },
    followees: [
      {type: Schema.Types.ObjectId, ref: 'User'}
    ],
    tweets:[
      {type: Schema.Types.ObjectId, ref: 'Tweet'}
    ]
});

/**
* Creates a new user in the db with the given username
* and password. 
* If credentials are inalid or such user already exists
* returns success = false
**/
UserSchema.statics.createUser = function (username, password, cb) {
  var self = this;
  // check if the username exists
  this.find({username: username}, function(err, users){
    if (err) return cb(err);
    // if exists then success = false
    if (users.length > 0) return cb(null, true);
    // initialize new user object
    var user = new self({
      username: username,
      password: password,
      followees: [],
      tweets: [],
    });
    // save it
    user.save(function(err, user){
      if (err) return cb(err);
      return cb(null, false);
    })
  });
  
}

/**
* Verifies the correctness of the given password for the given username
* If no such user exists and password is incorrect returns success = false
**/
UserSchema.statics.verifyPassword = function (username, password, cb) {
  this.find({username: username}, function(err, users){
    if (err) return cb(err);
    if (users.length == 0) return cb(null, false);
    if (users[0].password != password) return cb(null, false);
    return cb(null, true);
  });
}

/**
* Follows the user with the given username.
* If no such user exists or the user is already being followed
* returns success = false
**/
UserSchema.methods.follow = function(username, cb) {
  var self = this;
  this.model('User').find({username: username}, function(err, users){
    if (err) return cb(err);
    // if no user with such username return
    if (users.length == 0) return cb(null, false);
    var user = users[0];

    var following = self.followees.indexOf(user._id) != -1;
    // if  already following this user return
    if (following) return cb(null, false);
    // add the user to the followee's list and save
    self.followees.push(user._id)
    self.save(function(err){
      if (err) return cb(err);
      return cb(null, true)
    })    
  });
}

/**
* Creates a new tweet with the given text and createdAt date 
* and adds it to the user
**/
UserSchema.methods.addTweet = function (text, createdAt, cb) {
  var self = this;
  // initialize a new tweet
  var tweet = new Tweet({
    text: text,
    createdAt: createdAt,
    author: this.username,
    poster: this.username,
  });
  // save it
  tweet.save(function(err, tweet){
    if (err) return cb(err);
    // add the tweet to user's list of tweets and save the user
    self.tweets.push(tweet._id);
    self.save(function(err, user){
      if (err) return cb(err);
      cb(null, Tweet.presenter(self)(tweet));
    });
  });
}

/**
* Creates a new tweet that is a retweet of the the tweet with
* the given id. Adds this retweet to the user tweets.
* If no tweet with the given id exists, returns success = false
**/
UserSchema.methods.retweet = function(id, createdAt, cb){
  var self = this;
  Tweet.retweet(id, self.username, createdAt, function(err, retweet){
    if (err) return cb(err);
    // if no retweet was created return success = false
    if (! retweet) return cb(null, null);

    // add the new retweet to the list of user tweets and save
    self.tweets.push(retweet._id);
    self.save(function(err){
      if (err) return cb(err);
      return cb(null, retweet);
    })
  })
}

/**
* Deletes the tweet with the given id. Also removes it from user's
* list of tweets.
* If no tweet with the given id exists, or the user doesn't own this tweet
* returns success = false
**/
UserSchema.methods.deleteTweet = function (id, cb) {
  var index = this.tweets.indexOf(id);
  // if the user doesn't own this tweet return success = false
  if (index == -1) return cb(null, false);
  // remove the tweet from user's list 
  this.tweets.splice(index, 1);
  // find the tweet object
  Tweet.find({_id: id}, function(err, tweets){
    if (err) return cb(err);
    // delete the tweet object
    tweets[0].remove(function(err, tweet) {
      if (err) return cb(err);
      return cb(null, true);
    });
  });
}

/**
* Helper function for comparing two tweets by date
*/
var inverseSortByDate = function(a,b){
  return b.createdAt - a.createdAt
}

/**
* Returns the list of user tweets formatted using the Tweet 
* presenter
**/
UserSchema.methods.getTweets = function (cb) {
  var self = this;
  this.populate({path: 'tweets'}, function(err, thisUser){
    if (err) return cb(err);
    cb(null, self.tweets.map(Tweet.presenter(self)).sort(inverseSortByDate));
  });
}

/**
* Returns the list of tweets for the user with the given username
* formatted using the Tweet presenter to be viewed by the current user
**/
UserSchema.methods.getUserTweets = function(username, cb) {
  var self = this;
  // find the user with the given username
  this.model('User').find({username: username})
    .populate({path: 'tweets'}).exec(function(err, users){
    if (err) return cb(err);
    // if no such user exists return no tweets
    if (users.length == 0) return cb(null, null);

    var user = users[0];
    var following = self.followees.indexOf(user._id) != -1
    var data = {
      username: user.username,
      tweets: user.tweets.map(Tweet.presenter(self))
                .sort(inverseSortByDate),
      following: following,
    }
    return cb(null, data);
  });
}

/**
* Returns the list of all tweets for user's followees.
* Tweets are formatted using the Tweet presenter to be viewed by 
* the current user.
**/
UserSchema.methods.getFolloweeTweets = function(cb) {
  var self = this;
  this.populate({path: 'followees'}, function(err, user){
    if (err) return cb(err);
    Tweet.populate(user, {path: 'followees.tweets'}, function(err, user){
        if (err) return cb(err);
        var allTweets = user.followees.reduce(function(tweets, user){
          return tweets.concat(user.tweets.map(Tweet.presenter(self)));
        }, []);
        // return the tweets sorted by date
        return cb(null, allTweets.sort(inverseSortByDate));
      })
  })
}

/**
* Returns the list of all tweets for all users.
* Tweets are formatted using the Tweet presenter to be viewed by 
* the current user.
**/
UserSchema.methods.getAllTweets = function(cb) {
  var self = this;
  // find all users
  this.model('User').find({}).populate({path: 'tweets'}).exec(function(err, users){
    if (err) return cb(err);
    // combine all tweets
    var allTweets = users.reduce(function(tweets, user){
      return tweets.concat(user.tweets.map(Tweet.presenter(self)));
    }, []);
    // return the tweets sorted by date
    return cb(null, allTweets.sort(inverseSortByDate));
  })
}


module.exports = mongoose.model('User', UserSchema);

