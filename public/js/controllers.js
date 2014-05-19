var ctrl = angular.module('controllers', [])
    .controller('MainController', MainController)
    .controller('LoginController', LoginController);


function MainController($scope, $http, $location, $rootScope) {
	var show = false;


	$scope.doSearch = function() {

		$location.path("/search");
		$scope.searchInit();	
	}

	$scope.searchInit = function() {
		var query = $rootScope.userTitle;
		var url = 'http://www.omdbapi.com/?t=' + encodeURI(query) + '&tomatoes=true&callback=JSON_CALLBACK';
		var RTsearchurl = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=4nktdb9q9p54q9krkmagc7u3&q=' + encodeURI(query) + '&page_limit=1&callback=JSON_CALLBACK';


		$http.jsonp(url).then(function (result) {

			var IMDBmovie = result.data;


    		$scope.movieTitle = IMDBmovie.Title;
    		$scope.moviePlot = IMDBmovie.Plot;
    		$scope.movieRating = IMDBmovie.imdbRating;
    		$scope.movieDirectors = IMDBmovie.Director;
    		$scope.movieSite = IMDBmovie.Website;
    		$scope.movieProduction = movie.Production;
    		$scope.imdbLink = "http://www.imdb.com/title/" + movie.imdbID;

		});	

		$http.jsonp(RTsearchurl).then(function (result) {

			var RTsearchresult = result.data;

			$scope.searchresult = RTsearchresult;

			var RTmovieurl = RTsearchresult.movies[0].links.self + '?apikey=4nktdb9q9p54q9krkmagc7u3&callback=JSON_CALLBACK';

			$http.jsonp(RTmovieurl).then(function (result) {

				var RTmovie = result.data;

				$scope.concensus = RTmovie.critics_consensus;
				$scope.movieStudio = RTmovie.studio;
				$scope.rtLink = RTmovie.links.alternate;
				$scope.moviePoster = RTmovie.posters.detailed;


			});	

		});	


	}

	$scope.websiteBool = function(){
     	return show;
   	}

}

function LoginController($scope, $http, $location) {
	$scope.doLogin = function() {
		$http.get('/api/login').success(function (result) {

			if($scope.username == result.username && $scope.password == result.password) {
				$location.path('/logged');
			} else {
				$scope.loginFail = "Wrong details. Please try again.";
			}

		});
	}

}
