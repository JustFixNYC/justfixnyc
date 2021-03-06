'use strict';

angular.module('onboarding').controller('OnboardingController', ['$rootScope', '$scope', '$location', '$timeout', '$filter', 'Users', 'Authentication', 'Advocates', '$http', '$modal', 'advocateData',
	function($rootScope, $scope, $location, $timeout, $filter, Users, Authentication, Advocates, $http, $modal, advocateData) {

		$scope.authentication = Authentication;
		$scope.newUser = {};
		// create newUser.problems only once (handles next/prev)
		$scope.newUser.problems = [];
		$scope.newUser.sharing = {
			enabled: false
		};

		$scope.accessCode = {
		  valid: false
		};


		/**
			*
			*   DEBUG STUFF
			*
			*/

		if(typeof DEBUG !== 'undefined' && DEBUG == true) {

			$scope.newUser = {
				firstName: 'Dan',
				lastName: "Stevenson",
				password: "password",
				borough: 'Brooklyn',
				address: '654 Park Place',
				unit: '1RF',
				phone: (Math.floor(Math.random() * 9999999999) + 1111111111).toString(),
				problems: [],
				sharing: {
					enabled: false
				}
			};

			$scope.accessCode = {
				// value: 'test5',
				value: '',
				valid: false
			};

		}


		/**
			*
			*   ORIENTATION / ADVOCATE CODE
			*
			*/

		$scope.hasAdvocateCode = false;

		$scope.openAdvocateCodeForm = function($event) {
			$scope.hasAdvocateCode = true;
			$scope.focusOnCodeEntry();
		};

		$scope.closeAdvocateCodeForm = function($event) {
			$event.stopPropagation();
			$event.preventDefault();
			$scope.hasAdvocateCode = false;
		};

		var onAdvocateSuccess = function(advocateData) {
			$scope.accessCode.valid = $rootScope.validated = true;
			$scope.accessCode.valueEntered = $scope.accessCode.value;
			$scope.newUser.advocate = advocateData.advocate;
			$scope.newUser.advocateRole = advocateData.advocateRole;
			$scope.referral = advocateData.referral;
			$scope.newUser.sharing.enabled = true;
		};

		// if advocate data has been passed from the ui-router resolve
		// angular.equals(x,{}) will tell you if its an empty object or not
		if(!angular.equals(advocateData, {})) {
			onAdvocateSuccess(advocateData);
		}

	  $scope.validateCode = function() {
			// handles back button
			if(!$scope.accessCode.valueEntered || $scope.accessCode.valueEntered !== $scope.accessCode.value) {

				Advocates.validateNewUser({ code: $scope.accessCode.value },
		      function(success) {
		        if(success.advocate) {
							onAdvocateSuccess(success);
							$location.path('/onboarding/success');
							$scope.codeError = false;
							$scope.codeWrong = false;
		        } else {
		         	$scope.codeError = false;
		         	$scope.codeWrong = true;
		        }
		      }, function(error) {
						$scope.codeErrorMessage = error.data.message;
		        $scope.codeError = true;
		        $scope.codeWrong = false;
		      });

			// account for canceled entry
			// could probably just use 'else' here but why take chances?
			} else if ($scope.accessCode.valueEntered == $scope.accessCode.value) {
				$scope.accessCode.valid = true;
				$location.path('/onboarding/success');
				$scope.codeError = false;
				$scope.codeWrong = false;
			}
	  };

		$scope.cancelAccessCode = function() {
			// $scope.accessCode.value = '';
			$scope.accessCode.valid = false;
			$location.path('/onboarding/get-started');
		};


		/**
			*
			*   SIGNUP
			*
			*/

		$scope.additionalInfo = function() {
			// Open modal
			var modalInstance = $modal.open({
				animation: 'true',
				templateUrl: 'modules/onboarding/partials/additional-info.client.view.html'
			});
		};

		$scope.userError = false;
		$scope.loaded = false;

		$scope.createAndNext = function (isValid) {

			if(typeof DEBUG !== 'undefined' && DEBUG == true) console.log('create account pre save', $scope.newUser);

			if(isValid) {

				$scope.newUser.firstName = $filter('titlecase')($scope.newUser.firstName);
				$scope.newUser.lastName = $filter('titlecase')($scope.newUser.lastName);
				$scope.newUser.address = $filter('titlecase')($scope.newUser.address);

				$scope.userError = false;
				$scope.error = undefined;
				$rootScope.loading = true;

				$http.post('/api/tenants/signup', $scope.newUser).success(function(response) {

					// If successful we assign the response to the global user model
					$scope.authentication.user = response;
					if(typeof DEBUG !== 'undefined' && DEBUG == true) console.log('create account post save', response);
					$rootScope.loading = false;
					$rootScope.takeActionAlert = true;

					// fire gtag to confirm acct signup
					gtag('event', 'conversion', {'send_to': 'AW-866926627/tkJ8CIqJkHsQo4CxnQM'});

					// try facebook pixel
					fbq('track', 'CompleteRegistration');

					// Advocate code user
					// if($rootScope.validated) {
					// 	$location.path('/home');
					// } else {
					// 	$location.path('/onboarding/consultation');
					// }

					// We're disabling consultations while winding down this version
					$location.path('/home');



				}).error(function(err) {

						// just gives a little fake load time, helps with user perception
						// users will just repeatedly try with the same errors
						$timeout(function () {
							$rootScope.loading = false;
		        	$scope.error = err;
						}, 1000);
				});

			} else {
				$scope.userError = true;
			}

		};


	}]);
