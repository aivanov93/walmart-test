var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
    createdAt: Date,
    text: {
      type: String,
      minlength: 1,
    },
    author: String, // the original author of the tweet
    poster: String, // the user that posted the tweet
});

TweetSchema.set('toJSON', { getters: true, virtuals: true });

TweetSchema.virtual('retweeted').get(function () {
  return this.author != this.poster;
});

/**
* Creates a new tweet, which is a retweet of the tweet with the given
* id by the given poster at createdAt time.
**/
TweetSchema.statics.retweet = function(id, poster, createdAt, cb){
	var self = this;
	// find the tweet with the given id
	this.find({_id:id}, function(err, tweets){
		if (err) return cb(err);
		// if no tweet exists return no retweet
		if (tweets.length == 0) return cb(null, null);

		var tweet = tweets[0];
		// can't retweet yourself
		if (tweet.author == poster) return cb(null, null);
		// initialize a new retweet
		var retweet = new self({
			createdAt: createdAt,
			text: tweet.text,
			author: tweet.author,
			poster: poster,	
		});

		// save it
		retweet.save(function(err, retweet){
			if (err) return cb(err);
			return cb(null, retweet);
		})
	})
}

/**
* Returns a presenter for the Tweet object
* given the viewer (user that looks at it)
**/
TweetSchema.statics.presenter = function(viewer){
  return function(tweet) {
    return {
      id: tweet.id,
      createdAt: tweet.createdAt,
      text: tweet.text,
      viewer_is_author: tweet.author == viewer.username,
      viewer_is_poster: tweet.poster == viewer.username,
      author: tweet.author,
      poster: tweet.poster,
      retweeted: tweet.retweeted,
      retweetable: (tweet.author != viewer.username) 
                    && (tweet.poster != viewer.username),
    };
  };
};

module.exports = mongoose.model('Tweet', TweetSchema);
