var dbURI    = 'mongodb://localhost/test'
  , expect   = require('chai').expect
  , mongoose = require('mongoose')
  , clearDB  = require('mocha-mongoose')(dbURI, {noClear: true})
  , User = require('../models/User.js')
  , Tweet = require('../models/Tweet.js');


var createUsers = function(n){
  users = []
  for (var i = 0; i < n; i += 1){
    users.push({
      username: 'user'+i,
      password: 'pass'+i,
      followees: [],
      tweets: [],
    });
  }
  return users;
}

var createTweets = function(n, author, poster){
  tweets = []
  for (var i = 0; i < n; i += 1){
    tweets.push({
      text: 'text'+i,
      createdAt: new Date(2015,0,i),
      author: author,
      poster: poster,
    });
  }
  return tweets;
}

describe('User', function() {

  before(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  beforeEach(function(done) {
    clearDB(done);
  });

  describe('Authorization', function(){
    beforeEach(function(done) {
      User.create(createUsers(3), done);
    });

    describe('#createUser', function(){
      it('creates a new user when no such user exists', function(done){
        User.createUser('user3', 'pass3', function(err, taken){
          expect(err).to.not.exist;
          expect(taken).to.be.false;
          User.find({username:'user3'}, function(err, users){
            expect(users).to.have.length(1);
            done();
          });
        });
      });

      it('fails when such user exists', function(done){
        User.createUser('user1', 'pass10', function(err, taken){
          expect(err).to.not.exist;
          expect(taken).to.be.true;
          done();
        });
      });

      it('fails when username is invalid', function(done){
        User.createUser('', 'pass', function(err, taken){
          expect(err).to.exist;
          expect(err.name).to.equal('ValidationError');
          done();
        });
      });

      it('fails when password is invalid', function(done){
        User.createUser('user4', '', function(err, taken){
          expect(err).to.exist;
          expect(err.name).to.equal('ValidationError');
          done();
        });
      });

    });


    describe('#verifyPassword', function(){
      it('returns success when there exists such user', function(done){
        User.verifyPassword('user1', 'pass1', function(err, success){
          expect(err).to.not.exist;
          expect(success).to.be.true;
          done();
        });
      });

      it('fails when wrong password for existing user', function(done){
        User.verifyPassword('user0', 'pass10', function(err, success){
          expect(err).to.not.exist;
          expect(success).to.be.false;
          done();
        });
      });

      it('fails when non-existing username', function(done){
        User.verifyPassword('user10', 'pass', function(err, success){
          expect(err).to.not.exist;
          expect(success).to.be.false;
          done();
        });
      });

      it('fails when username empty', function(done){
        User.verifyPassword('', 'p', function(err, success){
          expect(err).to.not.exist;
          expect(success).to.be.false;
          done();
        });
      });

    });
  });

  describe('Tweet manipulations', function(){
    var user, user2, tweet1, tweet3;

    // initialize a user with two tweets
    beforeEach(function(done) {
      User.create(createUsers(2), function(err, users){
        if (err) return done(err);
        user = users[0];
        user2 =  users[1];
        Tweet.create(createTweets(3, 'user0', 'user0'), function(err, tweets){
          if (err) return done(err);
          tweet1 = tweets[0];
          tweet3 = tweets[2];
          user.tweets = [tweets[0]._id, tweets[1]._id]
          user.save(function(err, user){
            if (err) return done(err);
            return done();
          })
        })
      });
    });

    describe('#addTweet', function(){
      it('successfully adds a new tweet', function(done){
        var date = new Date(2015, 0, 3);
        var text = 'tweet3'
        user.addTweet(text, date, function(err, tweet){
          expect(err).to.not.exist;
          expect(tweet).to.be.ok;
          expect(user.tweets).to.have.length(3);
          expect(tweet.text).to.equal(text);
          expect(tweet.createdAt).to.equal(date);
          expect(tweet.author).to.equal(user.username);
          done();
        });
      });

      it('fails when text is empty', function(done){
        var date = new Date(2015, 0, 3);
        var text = ''
        user.addTweet(text, date, function(err, tweet){
          expect(err).to.exist;
          expect(err.name).to.equal('ValidationError');
          done();
        });
      });
    });

    describe('#deleteTweet', function(){
      it('successfully deletes the tweet when such exists', function(done){
        user.deleteTweet(tweet1.id, function(err, success){
          expect(err).to.not.exist;
          expect(success).to.be.true;
          done();
        });
      });

      it('fails when no such tweet belongs to the user', function(done){
        user.deleteTweet(tweet3.id, function(err, success){
          expect(err).to.not.exist;
          expect(success).to.be.false;
          done();
        });
      });
    });

    describe('#retweet', function(){
      var date = new Date(2015, 0, 3);

      it('successfully retweets if such tweet exists', function(done){
        user2.retweet(tweet1.id, date, function(err, retweet){
          expect(err).to.not.exist;
          expect(retweet).to.be.ok;
          expect(retweet.poster).to.equal(user2.username);
          expect(retweet.text).to.equal(tweet1.text);
          expect(retweet.createdAt).to.equal(date);
          done();
        });
      });

      it('fails when no such tweet belongs to the user', function(done){
        user2.retweet('1', date, function(err, success){
          expect(err).to.exist;
          done();
        });
      });

      it('fails when trying to retweet own tweet', function(done){
        user.retweet(tweet1.id, date, function(err, retweet){
          expect(err).to.not.exist;
          expect(retweet).to.not.be.ok;
          done();
        });
      });
    });
  });

  describe('Tweets getters', function(){
    var users, tweets;

    // initialize users
    beforeEach(function(done) {
      var user_tweets = createTweets(4, 'user0', 'user0');
      user_tweets[0].author = 'user1';
      user_tweets[1].author = 'user1';
      user_tweets[2].author = 'user1';
      user_tweets[2].poster = 'user1';
      User.create(createUsers(3), function(err, new_users){
        if (err) return done(err);
        users = new_users;
        Tweet.create(user_tweets, function(err, new_tweets){
          if (err) return done(err);
          tweets = new_tweets;
          users[0].tweets = [tweets[0]._id, tweets[1]._id, tweets[3]._id];
          users[1].tweets = [tweets[2]._id];
          users[0].followees = [users[1]._id];
          users[2].followees = [users[0]._id, users[1]._id];
          users[0].save(function(err, user){
            if (err) return done(err);
            users[1].save(function(err, user){
              if (err) return done(err);
              users[2].save(function(err, user){
                if (err) return done(err);
                done();
              })
            })
          })
        })
      });
    });

    describe('#getTweets', function(){
      it('returns the list of tweets sorted by date', function(done){
        users[0].getTweets(function(err, this_tweets){
          expect(err).to.not.exist;
          expect(this_tweets).to.have.length(3);
          expect(this_tweets[0].id).to.equal(tweets[3].id);
          expect(this_tweets[2].id).to.equal(tweets[0].id);
          done();
        });
      });

      it('returns an empty list when the user has no tweets', function(done){
        users[2].getTweets(function(err, this_tweets){
          expect(err).to.not.exist;
          expect(this_tweets).to.have.length(0);
          done();
        });
      });
    });

    describe('#getUserTweets', function(){
      it('returns the list of tweets sorted by date', function(done){
        users[0].getUserTweets(users[1].username, function(err, data){
          expect(err).to.not.exist;
          expect(data).to.be.ok;
          expect(data.username).to.equal(users[1].username);
          expect(data.following).to.be.true;
          expect(data.tweets).to.have.length(1);
          expect(data.tweets[0].id).to.equal(tweets[2].id);
          done();
        });
      });

      it('returns an empty list when the user has no tweets', function(done){
        users[1].getUserTweets(users[2].username, function(err, data){
          expect(err).to.not.exist;
          expect(data).to.be.ok;
          expect(data.username).to.equal(users[2].username);
          expect(data.following).to.be.false;
          expect(data.tweets).to.have.length(0);
          done();
        });
      });
    });

    describe('#getFolloweeTweets', function(){
      it('returns the list of tweets sorted by date', function(done){
        users[0].getFolloweeTweets(function(err, ftweets){
          expect(err).to.not.exist;
          expect(ftweets).to.have.length(1);
          expect(ftweets[0].id).to.equal(tweets[2].id);
          done();
        });
      });

      it('returns an empty list when user has no followees', function(done){
        users[1].getFolloweeTweets(function(err, ftweets){
          expect(err).to.not.exist;
          expect(ftweets).to.have.length(0);
          done();
        });
      });
    });

    describe('#getAllTweets', function(){
      it('returns the list of all tweets sorted by date', function(done){
        users[0].getAllTweets(function(err, ftweets){
          expect(err).to.not.exist;
          expect(ftweets).to.have.length(4);
          expect(ftweets[0].id).to.equal(tweets[3].id);
          expect(ftweets[3].id).to.equal(tweets[0].id);
          done();
        });
      });
    });
  });
  
});
