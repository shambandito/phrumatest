	angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainController'
		})

				// home page
		.when('/search', {
			templateUrl: 'views/search.html',
			controller: 'MainController'
		})



	$locationProvider.html5Mode(true);

}]);