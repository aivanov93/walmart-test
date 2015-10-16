/**
* When a new tweet is submitted 
*/
$(document).on('click', '.post', function(evt) {
  evt.preventDefault();
  // grab the new tweet data
  var createdAt = new Date();
  var text = $('input.message').val();

  // send the request
  $.post(
    '/tweets/create',
    {
      text: text,
      createdAt: createdAt,
    }
  ).done(function(response) {
    $('.alert').addClass('hidden');
    // add the tweet to the page
    var tweet = response.content.tweet;
    $('input.message').val('');
    $('.your-tweets').prepend(
      '<div class="panel panel-default">' +
      '<div class="panel-heading" data-id="'+ tweet.id +'">'+
      '  <button type="button" class="delete close pull-right" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
      '<div> You tweeted: </div></div>'+
      '<div class="panel-body">'+
      ' <div>' + tweet.text + '</div>'+
      '</div></div>'
    )
  }).fail(function(responseObject) {
    var response = $.parseJSON(responseObject.responseText);
    $('.alert').text(response.error);
    $('.alert').removeClass('hidden');
  });
});


/**
* When the user clicks to delete a tweet
*/
$(document).on('click', '.delete', function(evt) {
  evt.preventDefault();
  var tweet = $(this).parent();
  var id = tweet.data('id');
  $.ajax({
    url: '/tweets/' + id,
    type: 'DELETE',
  }).done(function(response) {
    $('.alert').addClass('hidden');
    tweet.parent().remove();
  }).fail(function(responseObject) {
    var response = $.parseJSON(responseObject.responseText);
    $('.alert').text(response.error);
    $('.alert').removeClass('hidden');
  });
});

/**
* When the user clicks to follow a user
*/
$(document).on('click', '.follow', function(evt) {
  evt.preventDefault();
  var username = $(this).parent().parent().data('username');
  $.post(
    '/users/follow/',
    {username: username}
  ).done(function(response) {
    $('.alert').addClass('hidden');
    $('.follow').replaceWith('<span class="label label-info">Following</span>')
  }).fail(function(responseObject) {
    var response = $.parseJSON(responseObject.responseText);
    $('.alert').text(response.error);
    $('.alert').removeClass('hidden');
  });
});


/**
* When the user clicks to retweet a tweet
*/
$(document).on('click', '.retweet', function(evt) {
  evt.preventDefault();
  var tweet = $(this).parent().parent();
  var div = $(this).parent();
  var id = tweet.data('id');
  $.post(
    '/tweets/retweet/',
    {
      id: id,
      createdAt: new Date(),
    }
  ).done(function(response) {
    $('.alert').addClass('hidden');
    div.prepend('<span class= "glyphicon glyphicon-check"></span>');
  }).fail(function(responseObject) {
    var response = $.parseJSON(responseObject.responseText);
    $('.alert').text(response.error);
    $('.alert').removeClass('hidden');
  });
});


/**
* nav bar clicks
*/
$(document).on('click', '.homepage', function(evt) {
  window.location = '/';
});

$(document).on('click', '.all', function(evt) {
  window.location = '/all';
});

$(document).on('click', '.followees', function(evt) {
  window.location = '/followees';
});


