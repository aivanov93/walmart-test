var currentUser = null

/**
* When the user clicks on the Login button
*/
$(document).on('click', '.login-btn', function() {
	window.location = '/users/login';
	window.reload();
});
