var express = require('express');
var router = express.Router();
var request = require('request');

var http = require('http')
var walmart = require('walmart')('x9p8zcb4kfcktapzwmgdr4rv')


router.get('/', function(req, res, next) {
  walmart.getItem(47309584).then(function(item) {
    res.render('index')
  });
});
/** 
* Gets the homepage
*
* GET / 
* Request: empty. */
router.get('/product/:id', function(req, res, next) {
  var id = req.params.id;
  walmart.getItem(id).then(function(item) {
    console.log(item);
    res.render('product', {
      product: item.product
    })
  }, function(error) {
    res.redirect('/')
  });
});




module.exports = router;
