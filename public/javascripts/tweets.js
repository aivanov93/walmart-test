/**
* When a new tweet is submitted 
*/
$(document).on('submit', '.tweet-form', function(evt) {
  evt.preventDefault();
  var createdAt = new Date();
  var text = $('textarea.message').val();
  var id = createdAt.valueOf();
  $.post(
      '/tweets/create',
      {
        text: text,
        createdAt: createdAt,
        author: currentUser
      }
  ).done(function(response) {
    $('.your-tweets').prepend(
      '<div class="your-tweet" data-id='+ id +'>' +
      '  <div class="your-text" >' + text + '</div>' + 
      '  <button class="delete"> Delete </button>' +
      '</div>'
    )
  }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
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
      tweet.remove();
  }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
  });
});


/**
* nav bar clicks
*/
$(document).on('click', '.your-page', function(evt) {
  window.location = '/tweets/';
  window.reload();
});

$(document).on('click', '.all-page', function(evt) {
  window.location = '/tweets/all';
  window.reload();
});