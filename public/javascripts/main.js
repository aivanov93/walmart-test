$( document ).ready(function() {
	$('.ui.rating').rating('disable');

	$('.submit-id').click(function(){
		var id = $('#id').val()
		console.log('IND ID', id)
		window.location = 'product/' + id
	})
});