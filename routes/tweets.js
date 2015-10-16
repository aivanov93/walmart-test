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
  if (!req.currentUser){
    utils.sendError(res, 403, 'You mustBeLoggedIn');
  } else {
    next()
  }
}

router.all('*', mustBeLoggedIn);

/**
* Creates a new tweet for the current user 
* 
* POST /tweets/create
* Request :
*   - text: the text of the new tweet
*   - createdAt: the timestamp of the tweet
* Response:
*   - success: true if the tweet succesfully created; false otherwise
*   - err: on error, an error message
*/
router.post('/create', function(req, res, next) {
  req.currentUser.addTweet(req.body.text, new Date(req.body.createdAt), function(err, tweet){
    if (err){
        if (err.name = 'ValidatorError') return utils.sendError(res, 400, 'Invalid message.');
        return utils.sendUnknownError(res);
      }
    utils.sendSuccess(res, {tweet: tweet});
  });
});

/**
* Deletes the given tweet 
* 
* DELETE /tweets/
* Request :
*   - tweet_id: the id of the tweet
* Response:
*   - success: true if the tweet succesfully deleted; false otherwise
*   - err: on error, an error message
*/
router.delete('/:tweet_id', function(req, res) {
  req.currentUser.deleteTweet(req.params.tweet_id, function(err, success){
    if (err) return utils.sendUnknownError(res);
    if (! success) return utils.sendError(res, 400, 'No such tweet for this user.')
    utils.sendSuccess(res);
  }); 
});


/**
* Retweets the given tweet by the current user 
* 
* POST /tweets/retweet
* Request :
*   - id: the id of the tweet to be retweeted
*   - createdAt: the date of the retweet
* Response:
*   - success: true if the user succesfully followed; false otherwise
*   - err: on error, an error message
*/
router.post('/retweet', function(req, res, next) {
  req.currentUser.retweet(req.body.id, new Date(req.body.createdAt), function(err, retweet){
    if (err) return utils.sendUnknownError(res);
    if (! retweet) return utils.sendError(res, 400, 'Invalid tweet to retweet.')
    utils.sendSuccess(res);
  });
});

module.exports = router;
