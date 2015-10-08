/**
* When the user clicks on the Login button
*/
$(document).on('submit', '.login-form', function(evt) {
      evt.preventDefault();
      $.post(
          '/users/login',
          {username: this.username.value}
      ).done(function(response) {
          window.location = '/tweets/';
          window.reload();
          currentUser = response.content.username;
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });


/**
* When the user clicks on the Logout button
*/
$(document).on('click', '.logout', function(evt) {
      evt.preventDefault();
      $.post(
          '/users/logout'
      ).done(function(response) {
          window.location = '/';
          window.reload();
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });