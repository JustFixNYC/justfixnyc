'use strict';

angular.module('onboarding').directive('problemsChecklist', ['Authentication', 'Problems', '$modal',
  function(Authentication, Problems, $modal) {
    return {
      templateUrl: '/modules/problems/partials/problems-list.client.view.html',
      restrict: 'E',
      scope: false,
      link: function postLink(scope, element, attrs) {
					var ourUserCurrentProblem;

          // get problems from service
          Problems.getLocalFile().then(function (data) {
            scope.problems = data;
          });


					// problemAssembler
					var newProblem = function(problem) {
						
						var newProb = {};

						newProb.startDate = new Date();
				    newProb.createdDate = new Date();
				   	newProb.key = problem.key;
				    newProb.title = problem.title;
				    newProb.description = '';
				    newProb.issues = [];
				    newProb.photos = [];
				    newProb.relatedActivities = [];

				    return newProb;
					} 


          // inherit newUser.problems or user.problems
          if(attrs.onboarding === 'true') {
          	var ourUserProblems = scope.$parent.newUser.problems = [];
          } else {
          	var ourUserProblems = Authentication.user.problems;
          } 

          // modal opening/closing
          // passing scopes
					scope.open = function(problem) {

						scope.currentProblem = problem;

						// check if user has already filled out the problem
						if(ourUserProblems !== []) {
							ourUserProblems.map(function(curr, idx, arr){
								if(curr.key == problem.key) {
									ourUserCurrentProblem = curr;
									arr.splice(idx, 1);
								}
							});
						}

						// If we didn't set the current problem
						if(!ourUserCurrentProblem) {
							ourUserCurrentProblem = newProblem(problem);
						}

						// Open modal
						var modalInstance = $modal.open({
				      animation: 'true',
				      templateUrl: 'modules/problems/partials/problem-modal.client.view.html',
				      controller: 'ModalProblemController',
				      size: 'md',
				      resolve: {
				      	issues: function() {
				      		return scope.currentProblem.issues;
				      	},
				      	userProblem: function() {
				      		return ourUserCurrentProblem;
				      	}
				      }
				    });

				   	modalInstance.result.then(function(selectedIssues){
				   		if(selectedIssues){
				   			ourUserCurrentProblem.issues = selectedIssues;
				   			ourUserProblems.push(ourUserCurrentProblem);
				   		} else {
				   			console.log('whoops');
				   		}
				   	});
					};




      }
    };
}]);