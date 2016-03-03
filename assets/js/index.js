require('jquery');
require('velocity-animate');
require('velocity-animate/velocity.ui');

var App = function() {
  $('document').ready(function(){
    $('h2.tagline').addClass('animate');

    var twttr = window.twttr;

    twttr.ready(function (twttr) {
      var ga = window.ga;
      twttr.events.bind('click', function(ev){
        if (!ev){
          return;
        }
          
        if (ev.type === 'click' && $(ev.target).hasClass('twitter-follow-button')) {
          ga('send', 'event', 'button', 'click', 'feathers follow button');
        }
      });

      twttr.events.bind('follow', function(ev){
        if (!ev){
          return;
        }
        ga('send', 'event', 'button', 'click', 'twitter follow button');
      });
    });
  });
};

module.exports = App();