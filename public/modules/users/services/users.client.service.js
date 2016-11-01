'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('UpdateUserInterceptor', ['Authentication',
	function (Authentication) {
    //Code
    return {
        response: function(res) {
					Authentication.user = res.resource;
          // console.log(res);
        }
		};
	}
]);


angular.module('users').factory('Users', ['$resource', 'UpdateUserInterceptor',
	function($resource, UpdateUserInterceptor) {
		return $resource('api/users', {}, {
			update: {
				method: 'PUT',
				interceptor: UpdateUserInterceptor
			},
			toggleSharing: {
				method: 'GET',
				url: 'api/users/public'
			},
			updateChecklist: {
				method: 'PUT',
				url: 'api/users/checklist',
				interceptor: UpdateUserInterceptor
			}
      // ,
      // getIssues: {
      //   method: 'GET'
      // }
		});
	}
]);
