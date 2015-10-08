var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');
var User = require('../models/User');

router.get('/login', function(req, res, next) {
  res.render('login');
});

/*
  POST /users/login
  Request : 
    - username
  Response:
    - success: true if login succesfull; false otherwise
    - err: on error, an error message
*/
router.post('/login', function(req, res, next) {
  var user = User.get(req.session.username);
  if (user){
    utils.sendError(res, 403, 'A user is already logged in.');
  } else {
    var username = req.body.username;
    if (username){
      User.createOrLogin(username);
      req.session.username = username;
      utils.sendSuccess(res, {user: username});
    } else {
      utils.sendError(res, 403, 'Username is empty');
    }
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
  var user = User.get(req.session.username);
  if (user){
    req.session.destroy();
    utils.sendSuccess(res);
  } else {
    utils.sendError(res, 403, 'No user logged in.');
  }
});


module.exports = router;
