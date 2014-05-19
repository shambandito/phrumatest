var ctrl = angular.module('controllers', [])
    .controller('MainController', MainController)
    .controller('LoginController', LoginController);


function MainController($scope, $location, $rootScope, MainFactory) {
	var show = false;


	$scope.doSearch = function(query) {

		MainFactory.setQuery(query);

		if($location.path() == "/search") {
			$scope.searchInit();
		} else {
			$location.path("/search");
		}

	}

	$scope.searchInit = function() {

		var query = MainFactory.getQuery();

		//ROTTEN TOMATOES SEARCH
		MainFactory.getRTmovies_list(query).success(function (res) {
    		$scope.movies = res.movies;
		});

		//IMDB SEARCH
/*		MainFactory.getIMDBmovies_list(query).success(function (res) {
    		$scope.movies = res.Search;
		});*/

	}

	$scope.singleMovieSearch = function(url) {

		MainFactory.setRTurl(url);
		$location.path('/result');

	}

	$scope.singleMovieInit = function() {
		MainFactory.getRTmovie(MainFactory.getRTurl()).success(function (res) {
			$scope.movieTitle = res.title;
	   		$scope.movieCriticsRating = res.ratings.critics_score;
	   		$scope.movieDirectors = res.abridged_directors;
	   		$scope.movieSite = res.Website;
	   		$scope.moviePoster = res.posters.detailed;
	   		$scope.movieStudio = res.studio;
	   		$scope.movieConcensus = res.critics_consensus;
	   		//LINKS
	   		$scope.movieRTlink = res.links.alternate;
	   		$scope.movieIMDBid = res.alternate_ids.imdb;	   		
	   		MainFactory.setIMDBid($scope.movieIMDBid);

			MainFactory.getIMDBmovie(MainFactory.getIMDBid()).success(function (res) {
				console.log(MainFactory.getIMDBid());
				console.log("IMDB Fetch !");
				$scope.moviePlot = res.Plot;
				$scope.movieRuntime = res.Runtime;
				$scope.IMDBRating = res.imdbRating;
			});
		});




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
