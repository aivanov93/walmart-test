var express = require('express');
var router = express.Router();

var fuzzy = require('fuzzy');
var walmart = require('walmart')('x9p8zcb4kfcktapzwmgdr4rv')


router.get('/', function(req, res, next) {
  res.render('index', {error: req.body.error});
});


router.get('/product/:id', function(req, res, next) {
  var id = req.params.id;
  var text = req.query.text;
  walmart.getItem(id).then(function(item) {

    var options = {
        pre: '<'
      , post: '>'
      , extract: function(el) { return el.reviewTitle + el.reviewText; }
    };
    var reviews = fuzzy.filter(text, item.product.reviewData.customerReviews, options);
    res.render('product', {
      product: item.product,
      reviews: reviews.map(function(r){return r.original})
    })
  }, function(error) {
    req.body = {error : true}
    res.redirect('/');
  });
});




module.exports = router;
