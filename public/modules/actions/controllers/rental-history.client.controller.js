'use strict';

angular.module('actions').controller('RentalHistoryController', ['$scope','$modalInstance', 'Messages', 'newActivity',
  function ($scope, $modalInstance, Messages, newActivity) {

    $scope.newActivity = newActivity;
    $scope.emailContent = Messages.getRentalHistoryMessage();

    $scope.emailHref = 'mailto:' + encodeURI('rentinfo@nyshcr.org?subject=Request For Rental History&body=' + $scope.emailContent);

    $scope.done = function () {
      $modalInstance.close({ newActivity: $scope.newActivity });
      window.location.href = $scope.emailHref;
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}]);
