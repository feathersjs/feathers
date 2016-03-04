require('jquery');
require('velocity-animate');
require('velocity-animate/velocity.ui');
require('./jquery.waypoints.min.js');
// require('scrollmagic/scrollmagic/uncompressed/plugins/animation.velocity');

// var ScrollMagic = require('scrollmagic');
var typewriter = require('typewriter-js');

jQuery.fn.reverse = [].reverse;

var App = function() {
  $('document').ready(function(){
    var $tagline = $('h2.tagline');
    var $mainCTA = $('.hero .button-primary');
    var $navLinks = $('.navbar a');
    typewriter.prepare('.typewriter');

    // $user1.velocity('transition.fadeIn', {
    //   loop: true,
    //   duration: 250,
    //   complete: function() {
    //     $user2.velocity('transition.fadeIn', {
    //       duration: 250,
    //       complete: function() {
    //         $user3.velocity('transition.fadeIn', {
    //           duration: 250
    //         });
    //       }
    //     });
    //   }
    // });
    // $message1.velocity('transition.fadeIn', {
    //   loop: true,
    //   duration: 250,
    //   complete: function() {
    //     $message2.velocity('transition.fadeIn', {
    //       duration: 250,
    //       complete: function() {
    //         $message3.velocity('transition.fadeIn', {
    //           duration: 250,
    //           complete: function(){
    //             $message4.velocity('transition.fadeIn', {
    //               duration: 250
    //             });    
    //           }
    //         });
    //       }
    //     });
    //   }
    // });
    // $user1.velocity('transition.slideLeftBigIn');
    // $message1.velocity('transition.slideLeftBigIn');

    // $user2.velocity('transition.slideRightBigIn');
    // $message2.velocity('transition.slideRightBigIn');

    // $user3.velocity('transition.slideLeftBigIn');
    // $message3.velocity('transition.slideLeftBigIn');
    // $message4.velocity('transition.slideLeftBigIn');

    // var controller = new ScrollMagic.Controller();

    // // build scene
    // var scene = new ScrollMagic.Scene({triggerElement: ".features"})
    //   // trigger a velocity opaticy animation
    //   .setVelocity(".feature", {opacity: 0}, {duration: 400})
    //   .addIndicators() // add indicators (requires plugin)
    //   .addTo(controller);

    // Animate the hero items and nav bar
    $navLinks.velocity('transition.slideDownIn', {
      stagger: 100,
      visibility: 'visible',
      complete: function(){
        $tagline.velocity('transition.fadeIn', {
          visibility: 'visible',
          duration: 1000,
          complete: function(){
            $mainCTA.velocity('transition.fadeIn', {
              duration: 1000,
              display: 'block',
              visibility: 'visible'
            });
          }
        });
      }
    });

    var productWaypoint = new Waypoint({
      element: $('section.product')[0],
      offset: 50,
      handler: function(direction) {
        if (direction === 'down') {
          var $user1 = $('svg .user-1');
          var $user2 = $('svg .user-2');
          var $user3 = $('svg .user-3');

          var $message1 = $('svg .message-1');
          var $message2 = $('svg .message-2');
          var $message3 = $('svg .message-3');
          var $message4 = $('svg .message-4');

          var TIME = 1000;

          $user1.velocity('transition.fadeIn', {
            loop: true,
            duration: TIME,
          });

          $user2.velocity('transition.fadeIn', {
            loop: true,
            delay: TIME,
            duration: TIME
          });

          $user3.velocity('transition.fadeIn', {
            loop: true,
            delay: TIME * 2,
            duration: TIME,
          });

          $message1.velocity('transition.fadeIn', {
            loop: true,
            duration: TIME
          });

          $message2.velocity('transition.fadeIn', {
            loop: true,
            delay: TIME,
            duration: TIME
          });

          $message3.velocity('transition.fadeIn', {
            loop: true,
            delay: TIME * 2,
            duration: TIME
          });

          $message4.velocity('transition.fadeIn', {
            loop: true,
            delay: TIME * 3,
            duration: TIME
          });


          if (productWaypoint) {
            productWaypoint.disable();
          }
        }
      }
    });

    var quickStartWaypoint = new Waypoint({
      element: $('section.quick-start')[0],
      offset: 50,
      handler: function(direction) {
        if (direction === 'down') {
          typewriter.type('.typewriter', { delay: 40});

          if (quickStartWaypoint) {
            quickStartWaypoint.disable();
          }
        }
      }
    });

    var exampleWaypoint = new Waypoint({
      element: $('section.example')[0],
      offset: 50,
      handler: function(direction) {
        if (direction === 'down') {
          var gistId = $('.example .side-nav li.active button').data('target');
          $('#' + gistId).addClass('active').velocity('transition.expandIn');

          if (exampleWaypoint) {
            exampleWaypoint.disable();
          }
        }
      }
    });

    var featuresWaypoint = new Waypoint({
      element: $('section.features')[0],
      offset: 100,
      handler: function(direction) {
        var $features = $('.feature');

        if (direction === 'down') {
          // Animate features
          $features.velocity('transition.swoopIn', {
            stagger: 500,
            visibility: 'visible'
          });

          if (featuresWaypoint) {
            featuresWaypoint.disable();
          }
        }
      }
    });
    
    $mainCTA.on('touchstart mousedown', function(ev){
      ev.preventDefault();

      $('.quick-start').velocity("scroll", {
        container: $('body'),
        duration: 1000,
        easing: "easeInBack",
        offset: 1
      });
    });

    $('.example .side-nav button').on('touchstart mousedown', function(ev){
      ev.preventDefault();

      var $el = $(ev.currentTarget);
      
      // If we clicked the same button just ignore it.
      if ($el.parent('li').hasClass('active')) {
        return;
      }

      $el.parent('li').siblings('li').removeClass('active');
      $el.parent('li').addClass('active');

      var id = $el.data('target');
      $gist = $('#' + id);

      $('.gist.active').removeClass('active').velocity('transition.expandOut', {
        complete: function(){
          $gist.addClass('active').velocity('transition.expandIn');
        }
      });
    });

    // var twttr = window.twttr;

    // twttr.ready(function (twttr) {
    //   var ga = window.ga;
    //   twttr.events.bind('click', function(ev){
    //     if (!ev){
    //       return;
    //     }

    //     if (ev.type === 'click' && $(ev.target).hasClass('twitter-follow-button')) {
    //       ga('send', 'event', 'button', 'click', 'feathers follow button');
    //     }
    //   });

    //   twttr.events.bind('follow', function(ev){
    //     if (!ev){
    //       return;
    //     }
    //     ga('send', 'event', 'button', 'click', 'twitter follow button');
    //   });
    // });
  });
};

module.exports = App();