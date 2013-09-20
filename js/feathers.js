$(document).ready(function(){

  $('a[href^="#"').click(function(ev){
    var position = $(ev.target.hash).offset();
    
    $("html, body").animate({ scrollTop: position.top - 100 }, 600);
  });
});