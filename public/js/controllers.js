var ctrl = angular.module('controllers', [])
    .controller('MainController', MainController)
    .controller('LoginController', LoginController);


function MainController($scope, $location, $rootScope, MainFactory, ngProgress) {
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
/*		MainFactory.getRTmovies_list(query).success(function (res) {
    		//$scope.movies = res.movies;
    		$scope.rtMovies = res.movies;
		});*/
		ngProgress.start();
		//IMDB SEARCH
		MainFactory.getIMDBmovies_list(query).success(function (res) {
    		//$scope.movies = res.Search;
    		var array = [];
    		var movies= res.Search;
    		//console.log(movies);
    		
    		if(movies != null) {
	    		for (var i = 0; i < movies.length; i++) {
	    			console.log(movies[i].Title)
	    			if(movies[i].Type !== "episode"){
	    				if(movies[i].Type !== "game") {
			    			MainFactory.getIMDBmovie_omdb(movies[i].imdbID).success(function (res) {
			    				array[array.length] = res;
			    				ngProgress.complete();
			    			});
		    			}
	    			}
	    		};
	    		
	    		$scope.movies = array;
	    		//console.log($scope.movies);
			}
		});

	}

	$scope.singleMovieSearch = function(url, type) {

		MainFactory.setRTurl(url);

		MainFactory.setType(type);
		MainFactory.setIMDBid(url)

		$location.path('/result');

	}

	$scope.singleMovieInit = function() {

		ngProgress.start();

	if(MainFactory.getType() == "movie") {	
		MainFactory.getRTmovie(MainFactory.getRTurl()).success(function (res) {
			//$scope.movieTitle = res.title;
	   		$scope.movieCriticsRating = res.ratings.critics_score;
	   		//$scope.movieDirectors = res.abridged_directors;
	   		$scope.movieSite = res.Website;
	   		$scope.moviePoster = res.posters.detailed;
	   		$scope.movieStudio = res.studio;
	   		$scope.movieConcensus = res.critics_consensus;
	   		//LINKS
	   		$scope.movieRTlink = res.links.alternate;
	   		console.log("This is a movie");
		});
	} else { 
		console.log("This is NOT a movie"); 
	}

		MainFactory.getIMDBmovie(MainFactory.getIMDBid()).success(function (res) {
				document.getElementById("result_container").style.display = 'block';
				$scope.movieActors = res.actors;
				$scope.moviePlot = res.simplePlot;
				$scope.movieRuntime = res.runtime[0];
				$scope.IMDBRating = res.rating;
				$scope.poster = res.urlPoster;
				$scope.movieTitle = res.title;
				$scope.genres = res.genres;
				$scope.movieDirectors = res.directors;
				$scope.movieWriters = res.writers;
				$scope.movieIMDBurl = res.urlIMDB;

				ngProgress.complete();

				//SET RT LINK VIA SERIES TITLE
				if(MainFactory.getType() == "series") {					
					$scope.movieRTlink = "http://www.rottentomatoes.com/tv/" + res.title.replace(/\s+/g, '-').toLowerCase();
				}
		});
	}


	$scope.check = function(data) {
		if(data == "N/A") {
			return false;
		}

		return true;
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
