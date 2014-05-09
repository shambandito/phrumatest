angular.module('controllers', []).controller('MainController', function($scope, $http, $location, $rootScope) {

	var show = false;

	$scope.doSearch = function() {

		$location.path("/search");
		$scope.searchInit();	
	}

	$scope.searchInit = function() {
		var query = $rootScope.userTitle;
		var url = 'http://www.omdbapi.com/?t=' + encodeURI(query) + '&tomatoes=true&callback=JSON_CALLBACK'
		$http.jsonp(url).then(function (result) {

			var movie = result.data;


    		$scope.movieTitle = movie.Title;
    		$scope.moviePlot = movie.Plot;
    		$scope.movieRating = movie.imdbRating;
    		$scope.movieDirectors = movie.Director;
    		$scope.moviePoster = movie.Poster;
    		$scope.movieSite = movie.Website;




    		$scope.movieProduction = movie.Production;
    		$scope.movieConsensus = movie.tomatoConsensus;
    		$scope.tomatoMeter = movie.tomatoMeter;
    		$scope.imdbLink = "http://www.imdb.com/title/" + movie.imdbID;

		});	
	}

	$scope.websiteBool = function(){
     	return show;
   	}


});