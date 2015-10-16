/**
* When the user clicks on the Login button
*/
$(document).on('click', '.index-btn', function(evt) {
      evt.preventDefault();
      var url;
      var form = {};
      // grab the data from the form
      $.each($('.login-form').serializeArray(), function(i, field) {
          form[field.name] = field.value;
      });

      // find the correct url
      if ($(this).hasClass('login')) url = '/users/login';
      else url = '/users/signup';

      // send the post request
      $.post(
          url,
          {username: form.username,
          password: form.password}
      ).done(function(response) {
          // redirect to the home page
          window.location = '/';
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.alert').text(response.error);
          $('.alert').removeClass('hidden');
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
          // redirect to the login page
          window.location = '/users/';
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.alert').text(response.error);
          $('.alert').removeClass('hidden');
      });
  });