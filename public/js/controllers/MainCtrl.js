angular.module('MainCtrl', []).controller('MainController', function($scope, $http) {

	var plot;

	$scope.results = function() {
		url = 'http://www.myapifilms.com/search?title=' + $scope.userTitle + '&format=JSON&aka=0&business=0&seasons=0&technical=0&filter=M&exactFilter=0&limit=1&lang=en-us&actors=N&biography=0'
		$http.get(url).success(function (result) {

    		$scope.movieTitle = result[0].title;
    		$scope.moviePlot = result[0].plot;
    		$scope.movieRating = result[0].rating;
    		$scope.movieDirectors = result[0].directors;
    		$scope.moviePoster = result[0].urlPoster;
		});		
	};

	$scope.tagline = 'LOLOLOLOL';	


});