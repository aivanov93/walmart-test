var _storage = { };

var User = (function User(_storage) {

  var that = Object.create(User.prototype);

  /**
  * Helper function for comparing two tweets by date
  */
  var inverseSortByDate = function(a,b){
      return b.createdAt - a.createdAt
    }

  /**
  * Returns the user object associated with the given username
  * Retuns undefined if such user doesn't exist
  **/
  that.get = function(username) {
    return _storage[username];
  }

  /**
  * If a user with the given username doesn't exist
  * creates one
  */
  that.createOrLogin = function(username) {
    if (!that.get(username)){
      _storage[username] = {username: username,
        tweets: []};
    }
  }

  /**
  * Adds a tweet to the user with the given username
  */
  that.addTweet = function(username, text, createdAt) {
    var createdAtDate = new Date(Date.parse(createdAt))
    that.get(username).tweets.push({
      id: createdAtDate.valueOf(),
      author: username,
      text: text,
      createdAt: createdAtDate,
    })
  }

  /**
  * Removes the tweet with the given id from the given username
  * If no such tweet exists, returns false.
  * Otherwise returns true
  */
  that.deleteTweet = function(username, id) {
    var tweets = that.get(username).tweets 
    var index = tweets.findIndex(function(tweet){
      return tweet.id == id
    })
    if (index >= 0) {
      tweets.splice(index, 1)
      return true
    } else return false
  }

  /**
  * Returns all tweets for the given username sorted by createdAt 
  * in descending order
  */
  that.getTweets = function(username){
    return _storage[username].tweets.sort(inverseSortByDate)
  }

  /**
  * Returns all tweets for all users sorted by createdAt 
  * in descending order
  */
  that.getAllTweets = function(){
    var tweets = Object.keys(_storage).reduce(function(tweetsArray, user){
      return tweetsArray.concat(_storage[user].tweets)
    }, [])
    return tweets.sort(inverseSortByDate)
  }

  /**
  * Clears all users from the storage
  */
  that.clearAll = function(){
    _storage = {}
  }

  Object.freeze(that);
  return that;
})(_storage);

module.exports = User;
