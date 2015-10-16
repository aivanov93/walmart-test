var express = require('express');
var router = express.Router();
var utils = require('./../utils/utils');
var User = require('./../models/User');


router.get('/', function(req, res, next) {
  res.render('index');
});

/*
  POST /users/login
  Request : 
    - username
    - password
  Response:
    - success: true if login succesfull; false otherwise
    - err: on error, an error message
*/
router.post('/login', function(req, res, next) {
  if (req.currentUser){
    utils.sendError(res, 403, 'A user is already logged in.');
  } else {
    var username = req.body.username;
    var password = req.body.password;
    User.verifyPassword(username, password, function(err, success){
      if (err) return utils.sendUnknownError(res);
      if (! success) return utils.sendError(res, 400, 'Invalid username or password.');
      req.session.username = username;
      utils.sendSuccess(res);
    }); 
  }
});

/*
  POST /users/signup
  Request : 
    - username
    - password
  Response:
    - success: true if signup succesfull; false otherwise
    - err: on error, an error message
*/
router.post('/signup', function(req, res, next) {
  if (req.currentUser){
    utils.sendError(res, 403, 'A user is already logged in.');
  } else {
    var username = req.body.username;
    var password = req.body.password;
    User.createUser(username, password, function(err, taken){
      if (err) {
        if (err.name = 'ValidatorError') return utils.sendError(res, 400, 'Invalid credentials.');
        return utils.sendUnknownError(res);
      }
      if (taken) return utils.sendError(res, 400, 'Username already taken.');
      req.session.username = username;
      utils.sendSuccess(res);
    }); 
  }
});

/*
  POST /users/logout
  Request : empty
  Response:
    - success: true if logout succeeded; false otherwise
    - err: on error, an error message
*/
router.post('/logout', function(req, res) {
  if (req.currentUser){
    req.session.destroy();
    utils.sendSuccess(res);
  } else {
    utils.sendError(res, 403, 'No user logged in.');
  }
});


/**
* Follows the given user 
* 
* POST /tweets/follow
* Request :
*   - username: the user to be followed
* Response:
*   - success: true if the user succesfully followed; false otherwise
*   - err: on error, an error message
*/
router.post('/follow', function(req, res, next) {
  req.currentUser.follow(req.body.username, function(err, success){
    if (err) return utils.sendUnknownError(res);
    if (! success) return utils.sendError(res, 400, 'Invalid username to follow.')
    utils.sendSuccess(res);
  });
});







module.exports = router;
