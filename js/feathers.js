$(document).ready(function(){

  $('a[href^="#"').click(function(ev){
    ev.preventDefault();

    var position = $(ev.target.hash).offset();
    
    if (position){
      $("html, body").animate({ scrollTop: position.top - 100 }, 600);
    }
  });
});