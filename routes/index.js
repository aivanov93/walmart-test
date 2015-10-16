var express = require('express');
var router = express.Router();
var User = require('../models/User');



/**
* Check that a user is logged in for each request. If
* no user is logged in redirect to the login/signup page
*/
var checkIfLoggedIn = function(req, res, next) {
  if (!req.currentUser){
    res.redirect('/users');
  } else {
    next();
  }
}

router.all('/', checkIfLoggedIn);
router.all('/all', checkIfLoggedIn);
router.all('/followees', checkIfLoggedIn);
router.all('/user/:username', checkIfLoggedIn);
/** 
* Gets the homepage
*
* GET / 
* Request: empty. */
router.get('/', function(req, res, next) {
  req.currentUser.getTweets(function(err, tweets){
    if (err) return utils.renderUnknownError(res);
    res.render('homepage', {
      user: req.currentUser.username, 
      userTweets: tweets,
      yours: true
    });
  });
});

/*
  Returns the given user's page with their tweets

  GET /users/logout
  Request:
    - username 
*/
router.get('/user/:username', function(req, res) {
  req.currentUser.getUserTweets(req.params.username, function(err, data){
    if (err) return res.render('error', {
      message: "An unknown error has ocurred."
    });
    if (! data) return res.render('error', {
      message: "No such user exists."
    });
    res.render('user_tweets', {
      user: req.currentUser.username,
      user_page: data.username, 
      userTweets: data.tweets,
      following: data.following,
    });
  }); 
});


/**
* Get the page with all users and their tweets
*
* GET /all
* Request: empty
*/
router.get('/all', function(req, res, next) {
  req.currentUser.getAllTweets( function(err, tweets){
    if (err) return utils.renderUnknownError(res);
    res.render('all_tweets', {
      user: req.currentUser.username, 
      userTweets: tweets,
      title: 'All tweets',
    });
  });
});


/**
* Get the page with followees and their tweets
*
* GET /all
* Request: empty
*/
router.get('/followees', function(req, res) {
  req.currentUser.getFolloweeTweets(function(err, tweets){
    if (err) return res.render('error', {
      message: "An unknown error has ocurred."
    });
    res.render('all_tweets', {
      user: req.currentUser.username, 
      userTweets: tweets,
      title: 'Tweets by people you follow',
    });
  }); 
});


module.exports = router;
