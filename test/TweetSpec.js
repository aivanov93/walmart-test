var dbURI    = 'mongodb://localhost/test'
  , expect   = require('chai').expect
  , mongoose = require('mongoose')
  , clearDB  = require('mocha-mongoose')(dbURI, {noClear: true})
  , User = require('../models/User.js')
  , Tweet = require('../models/Tweet.js');


var createUser = function(){
  return {
      username: 'user',
      password: 'pass',
      followees: [],
      tweets: [],
  }
}

var date = new Date(2015, 0, 1);

var createTweet = function(author, poster){
  return {
    text: 'text',
    createdAt: date,
    author: author,
    poster: poster,
  }
}

describe('Tweet', function() {

  before(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  var user, tweets;


  beforeEach(function(done) {
    clearDB(function(){
      tweet1 = createTweet('user', 'user');
      tweet2 = createTweet('user', 'user1');
      tweet3 = createTweet('user1', 'user2');
      ts = [tweet1,tweet2, tweet3]
      User.create(createUser(), function(err, new_user){
        if (err) return done(err);
        user = new_user;
        Tweet.create(ts, function(err, new_tweets){
          if (err) return done(err);
          tweets = new_tweets;
          done();
        });
      });
    });
  });

  describe('#retweet', function(){
    var date1 = new Date(2015, 0, 2);
    it('successfully retweets if such tweet exists', function(done){
      Tweet.retweet(tweets[2].id, user.username, date1, function(err, retweet){
        expect(err).to.not.exist;
        expect(retweet).to.be.ok;
        expect(retweet.poster).to.equal(user.username);
        expect(retweet.text).to.equal(tweets[0].text);
        expect(retweet.createdAt).to.equal(date1);
        done();
      });
    });

    it('fails when no such tweet belongs to the user', function(done){
      Tweet.retweet('1', user.username, date, function(err, success){
        expect(err).to.exist;
        done();
      });
    });
  });

  describe('#presenter', function(){
    it('correctly renders the tweet authored by the viewer', function(){
      var presenter = Tweet.presenter(user);
      var tweet = presenter(tweets[0]);
      expect(tweet.id).to.equal(tweets[0].id);
      expect(tweet.viewer_is_author).to.be.true;
      expect(tweet.viewer_is_poster).to.be.true;
      expect(tweet.retweeted).to.be.false;
      expect(tweet.retweetable).to.be.false;
    });

    it('correctly renders the user\'s tweet retweeted by other user', function(){
      var presenter = Tweet.presenter(user);
      var tweet = presenter(tweets[1]);
      expect(tweet.id).to.equal(tweets[1].id);
      expect(tweet.viewer_is_author).to.be.true;
      expect(tweet.viewer_is_poster).to.be.false;
      expect(tweet.retweeted).to.be.true;
      expect(tweet.retweetable).to.be.false;
    });

    it('correctly renders the a tweet by other user', function(){
      var presenter = Tweet.presenter(user);
      var tweet = presenter(tweets[2]);
      expect(tweet.id).to.equal(tweets[2].id);
      expect(tweet.viewer_is_author).to.be.false;
      expect(tweet.viewer_is_poster).to.be.false;
      expect(tweet.retweeted).to.be.true;
      expect(tweet.retweetable).to.be.true;
    });
  });
});
