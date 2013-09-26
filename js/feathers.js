(function($, undefined){
  $.fn.gistPills = function(gistId, index) {
  	var gistFiles = $('#gist' + gistId).find('.gist-file');
  	var lis = this.find('li');
  	var parent = this;

  	gistFiles.hide();

  	this.on('click', 'li', function(ev) {
  		var el = $(this);
  		lis.removeClass('active');
  		el.addClass('active');
  		$(gistFiles.hide().get(el.index())).show();
  		ev.preventDefault();
  	});

    $(lis.get(index || 0)).click();
  };

  $.fn.toc = function(target) {
    var idCounter = 0;
    var createMenu = function(headings, level) {
      var root = $('<ul>');
      var getId = function(el) {
        var id = el.attr('id');

        if(!id) {
          id = 'toc' + (++idCounter);
          el.attr('id', id);
        }

        return id;
      };

      if(level === 2) {
        root.addClass('nav');
      }

      headings.each(function() {
        var id = getId($(this));
        var link = $('<a>').attr('href', '#' + id).html($(this).html());
        var current = $('<li>').html(link);
        var headings = $(this).nextUntil('h' + level).filter('h' + (level + 1));

        if(headings.length) {
          current.append(createMenu(headings, level + 1));
        }

        root.append(current);
      });

      return root;
    };
    

    this.html(createMenu($(target).find('h2'), 2));
  };

  $(document).ready(function() {
    $('body').scrollspy({
      target: '.navbar-inverse, #toc',
      offset: $('.navbar-inverse').outerHeight()
    });

    $('#toc').toc('.documentation-content');
    $('#rapidstart').gistPills(6644854);
    $('#realtime-todos').gistPills(6665992, 1);

    $(window).on('resize', function(){
      $('[data-spy="scroll"]').each(function () {
        var $spy = $(this).scrollspy('refresh');
      });
    });
    
    $('#toc').affix({
      offset: {
        top: $('#toc').offset().top - $('.navbar').outerHeight()
      }
    });

    $('body').scrollspy('refresh');

    $('#todo-example').todos('http://tekhnotron.com');
  });
})(jQuery);
