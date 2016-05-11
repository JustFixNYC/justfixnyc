'use strict';

angular.module('core')
  .directive('smsMessage', ['deviceDetector', 'Authentication', 'Messages',
  function (deviceDetector, Authentication, Messages) {
    return {
      restrict: 'A',
      scope: false,
      link: function (scope, element, attrs) {

        var isIOS8 = function() {
          var deviceAgent = deviceDetector.raw.userAgent.toLowerCase();
          return /(iphone|ipod|ipad).* os [8-9]_/.test(deviceAgent);
        };


        // ios ;
        // ios8 &
        // android ?

        var href = 'sms:';
        var type = attrs.type;
        var msg = Messages.getSMSMessage(type);

        href += Authentication.user.referral.phone;

        if(deviceDetector.os === 'ios') {
          if(isIOS8()) href += '&';
          else href += ';';
          href = href + 'body=' + msg;
          console.log('href', href);
          attrs.$set('href', href);
        } else if(deviceDetector.os === 'android') {
          href = href + '?body=' + msg;
          attrs.$set('href', href);
        } else {
          console.log(href);
          console.log('If you were using a phone, the message would be: \n\n' + msg);
        }



        element.on('click', function (event) {

          // var href = '';
          // if(type === 'sms') href = generateURL();

          //if(href.length) window.location.href = href;
        });
        // scope.$watch(scope.superphone, function() {
        //
        //   console.log('y');
        //   generateURL();
        // });

       // element.bind('click', function (event) { console.log('generate'); smsHref = generateURL();  });

      }
    };

  }]);