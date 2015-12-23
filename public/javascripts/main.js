$( document ).ready(function() {
	$('.ui.rating').rating('disable');

	$('.submit-id').click(function(){
		var id = $('#id').val()
		var text = $('#text').val()
		window.location = 'product/' + id + '?text='+text
	})

	$('.message .close')
	  .on('click', function() {
	    $(this)
	      .closest('.message')
	      .transition('fade')
	    ;
	  })
	;
});