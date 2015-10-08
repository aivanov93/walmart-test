var express = require('express');
var router = express.Router();
var User = require('../models/User');


/* GET home page. */
router.get('/', function(req, res, next) {
  var user = User.get(req.session.username)
  // if already logged in redirect to the user's page
  if (user) res.redirect('/tweets/')
  // otherwise show the login screen
  else res.render('index');
});

module.exports = router;
