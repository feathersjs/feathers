(function($, undefined){
  $.fn.gistPills = function(gistId) {
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
  };

  $(document).ready(function(){
    $('#rapidstart').gistPills(6644854);
  });
})(jQuery);