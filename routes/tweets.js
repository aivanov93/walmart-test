var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');
var User = require('../models/User');

router.get('/login', function(req, res, next) {
  res.render('login');
});

/**
* Check that a user is logged in for each request
*/
var mustBeLoggedIn = function(req, res, next) {
  var user = User.get(req.session.username)
  if (!user){
    res.render('error', {
      message: "You must be logged in."
    });
  } else {
    next()
  }
}

router.all('*', mustBeLoggedIn);

/**
* GET /tweets/
* Get the user's page
*/
router.get('/', function(req, res, next) {
  res.render('homepage', {
    user: req.session.username, 
    userTweets: User.getTweets(req.session.username),
    yours: true
  });
});


/**
* GET /tweets/all
* Get the page with all the tweets
*/
router.get('/all', function(req, res, next) {
  res.render('all_tweets', {
    user: req.session.username, 
    tweets: User.getAllTweets(), 
    yours: false
  });
});


/**
* Creates a new tweet for the given user 
* 
* POST /tweets/create
* Request :
*   - text: the text of the new tweet
*   - createdAt: the timestamp of the tweet
* Response:
*   - success: true if the note succesfully created succeeded; false otherwise
*   - err: on error, an error message
*/
router.post('/create', function(req, res, next) {
  User.addTweet(req.session.username, req.body.text, req.body.createdAt);
  utils.sendSuccess(res);
});

router.delete('/:tweet_id', function(req, res) {
  if (User.deleteTweet(req.session.username, req.params.tweet_id)){
    utils.sendSuccess(res);
  } else {
    utils.sendError(res, 500, 'An error ocurred.');
  }
});


module.exports = router;
