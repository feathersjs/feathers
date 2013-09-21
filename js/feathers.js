(function($, undefined){
  $.fn.gistPills = function(gistId, index) {
  	var gistFiles = $('#gist' + gistId).find('.gist-file');
  	var lis = this.find('li');
  	var parent = this;

  	gistFiles.hide();

  	// this.find('li:first').click();
  	this.on('click', 'li', function(ev) {
  		var el = $(this);
  		lis.removeClass('active');
  		el.addClass('active');
  		$(gistFiles.hide().get(el.index())).show();
  		ev.preventDefault();
  	});

    $(lis.get(index || 0)).click();
  };

  $(document).ready(function(){
  	$('a[href^="#"').click(function(ev){
  	  ev.preventDefault();

  	  var position = $(ev.target.hash).offset();
  	  
  	  if (position){
  	    $("html, body").animate({ scrollTop: position.top - 100 }, 600);
  	  }
  	});
  	
    $('#rapidstart').gistPills(6644854);
    $('#realtime-todos').gistPills(6651209, 1);
  });
})(jQuery);
