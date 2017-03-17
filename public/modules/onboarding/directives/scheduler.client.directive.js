'use strict';

angular.module('onboarding').directive('scheduler', ['$sce', '$location', 'Authentication', 'Users', function scheduler($sce, $location, Authentication, Users) {
  return {
    template: '<iframe ng-src="{{trustSrc(acuity)}}" width="100%" height="800" frameBorder="0"></iframe>' +
              '<a ui-sref="home" ng-if="hasScheduled" class="btn btn-primary btn-block-full scheduler-done-btn">Continue</button>',
    restrict: 'E',
    link: function postLink(scope, element, attrs) {

      scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      };

      scope.hasScheduled = false;

      var currentLocation = $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '');


      scope.acuity = 'https://app.acuityscheduling.com/schedule.php?owner=13287615';

      if(Authentication.user) {
        scope.acuity += '&firstName=' + Authentication.user.firstName;
        scope.acuity += '&lastName=' + Authentication.user.lastName;
        scope.acuity += '&email=' + 'support@justfix.nyc';
        scope.acuity += '&phone=' + Authentication.user.phone;
        scope.acuity += '&field:2631340=' + currentLocation + '/share/' + Authentication.user.sharing.key;
      }


      window.addEventListener("message", function(e) {
        if (e.origin === 'https://app.acuityscheduling.com' && e.data.includes('sizing')) {
          var height = parseInt(e.data.split(':')[1], 10);
          if(height > 0) element.find('iframe').attr('height', height + 'px');
        } else if (e.origin === 'https://sandbox.acuityinnovation.com' && e.data.includes('custombooking')) {
          var bookingID = e.data.split(':')[1];

          // We could force update the user document post-webhook here
          // i.e. simply do Users.me();
          // (Instead we're doing it when the user leaves this view -
          //  see: line 11, public/modules/onboarding/config/onboarding.client.config.js)
          scope.hasScheduled = true;
          scope.$apply();
          console.log('scheduled', bookingID);
        }
      });
    }
  };
}]);
