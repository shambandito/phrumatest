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

		.when('/result', {
			templateUrl: 'views/movie_result.html',
			controller: 'MainController'
		})

		.when('/compare', {
			templateUrl: 'views/compare.html',
			controller: 'MainController'
		});

	$locationProvider.html5Mode(true);

}])
.config(function ($httpProvider) {
  	$httpProvider.interceptors.push('authInterceptor');
});