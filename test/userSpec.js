var assert = require("assert");

var User = require('../models/user.js');
var expect = require("chai").expect;

describe('User', function() {

  var generateNotes = function(username, n, month){
    var notes = [];
    for (var i = 0; i < n; i += 1){
      notes.push({
        author: username,
        text: 'hey'+i,
        createdAt: (new Date(2015, month, i)),
        id: (new Date(2015, month, i)).valueOf()
      })
    }
    return notes
  }

  beforeEach(function() {
    User.clearAll()
  });

  describe('#createOrLogin', function () {
    it('adds a new user when user doesn\'t exist', function () {
      User.createOrLogin('paul')
      expect(User.get('paul')).to.be.ok;
      expect(User.get('annie')).to.not.be.ok;
    });

    it('does nothing when user exists', function () {
      User.createOrLogin('paul')
      expect(User.get('paul')).to.be.ok;
      User.createOrLogin('paul')
      expect(User.get('paul')).to.be.ok;
    });

  }); 

  describe('#addTweet', function () {
    it('adds a new tweet correctly when there are no tweets', function () {
      User.createOrLogin('paul');
      notes = generateNotes('paul', 1, 1);
      User.addTweet('paul', notes[0].text, notes[0].createdAt);
      expect(User.get('paul').tweets).to.have.length(1)
    });

    it('adds a new tweet correctly when there are tweets', function () {
      User.createOrLogin('paul');
      notes = generateNotes('paul', 3, 1);
      User.get('paul').tweets = notes.slice(0,2);
      User.addTweet('paul', notes[0].text, notes[0].createdAt)
      expect(User.get('paul').tweets).to.have.length(3)
    });
  });


  describe('#deleteTweet', function () {
    it('deletes the tweet correctly when the tweet exists', function () {
      User.createOrLogin('paul');
      notes = generateNotes('paul', 3, 1);
      User.get('paul').tweets = notes
      expect(User.deleteTweet('paul', notes[0].id)).to.be.true;
      expect(User.get('paul').tweets).to.have.length(2)
    });

    it('does nothing and returns false when the tweet doesn\'t exist', function () {
     User.createOrLogin('paul');
      notes = generateNotes('paul', 3, 1);
      User.get('paul').tweets = notes
      expect(User.deleteTweet('paul', 1)).to.be.false;
      expect(User.get('paul').tweets).to.have.length(3)
    });
  });  

  describe('#getTweets', function () {
    it('returns an empty array when there are no tweets', function () {
      User.createOrLogin('paul');
      expect(User.getTweets('paul')).to.have.length(0)
    });

    it('returns all tweets sorted when there are any', function () {
      User.createOrLogin('paul');
      User.get('paul').tweets = generateNotes('paul', 3, 1);
      tweets = User.getTweets('paul')
      expect(tweets).to.have.length(3)
      expect(tweets[0].createdAt > tweets[1].createdAt).to.be.true;
      expect(tweets[1].createdAt > tweets[2].createdAt).to.be.true;
    });
  });  

  describe('#getAllTweets', function () {
    it('returns an empty array when there are no users', function () {
      expect(User.getAllTweets()).to.have.length(0)
    });

    it('returns all tweets sorted when there are any', function () {
      User.createOrLogin('paul');
      User.get('paul').tweets = generateNotes('paul', 3, 1);
      User.createOrLogin('annie');
      User.get('annie').tweets = generateNotes('annie', 2, 2);
      
      tweets = User.getAllTweets()
      expect(tweets).to.have.length(5)
      expect(tweets[0].createdAt > tweets[1].createdAt).to.be.true;
      expect(tweets[1].createdAt > tweets[2].createdAt).to.be.true;
    });
  });  

}); 
