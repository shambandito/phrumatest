var ctrl = angular.module('controllers', [])
    .controller('MainController', MainController)
    .controller('LoginController', LoginController);




function MainController($scope, $location, $rootScope, MainFactory, ngProgress, $timeout) {

	var show = false;

	$scope.doSearch = function(query) {

		MainFactory.setQuery(query);

		if($location.path() == "/search") {
			$scope.searchInit();
		} else {
			$location.path("/search");
		}
	}

	$scope.pressEnter = function(event, query) {

		if(event.which == 13) {

			console.log("pressed enter");
			$scope.doSearch(query);
		}
	}

	$scope.searchInit = function() {

		var query = MainFactory.getQuery();

		ngProgress.start();

		//IMDB SEARCH
		MainFactory.getIMDBmovies_list(query).success(function (res) {
    		
    		var array = [];
    		var movies= res.Search;
    		
    		//FILL ARRAY WITH SEARCH RESULTS (ONLY MOVIES + TV SERIES)
    		if(movies != null) {
	    		for (var i = 0; i < movies.length; i++) {
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
			}
		});

	}

	$scope.singleMovieSearch = function(url, type) {

		MainFactory.setRTurl(url);

		MainFactory.setType(type);
		MainFactory.setIMDBid(url);

		if($location.path() == "/result") {
			$scope.singleMovieInit();
		} else {
			$location.path("/result");
		}

	}

	$scope.singleMovieInit = function() {
		document.getElementById("result_container").style.display = 'none';
		window.scrollTo(0, 0);
		ngProgress.start();

		if(MainFactory.getType() == "movie") {	

			//GET ROTTEN TOMATOES MOVIE JSON
			MainFactory.getRTmovie(MainFactory.getRTurl()).success(function (res) {
				$scope.rtMovieID = res.id;
		   		$scope.movieCriticsRating = res.ratings.critics_score;
		   		//$scope.movieDirectors = res.abridged_directors;
		   		$scope.movieSite = res.Website;
		   		$scope.moviePoster = res.posters.detailed;
		   		$scope.movieStudio = res.studio;
		   		$scope.movieConcensus = res.critics_consensus;
		   		//LINKS
		   		$scope.movieRTlink = res.links.alternate;
		   		console.log("This is a movie");


		   		//GET SIMILAR MOVIES
				MainFactory.getRTsimilar($scope.rtMovieID).success(function (res) {
					$scope.similarMovies = res.movies;
				});


			});


		} else { 
			console.log("This is NOT a movie"); 
		}

		//GET IMDB MOVIE JSON
		MainFactory.getIMDBmovie(MainFactory.getIMDBid()).success(function (res) {
				document.getElementById("result_container").style.display = 'block';
				$scope.movieActors = res.actors;
				$scope.moviePlot = res.simplePlot;
				$scope.movieRuntime = res.runtime[0];
				$scope.IMDBRating = res.rating * 10;
				$scope.poster = res.urlPoster;
				$scope.movieTitle = res.title;
				$scope.genres = res.genres;
				$scope.movieDirectors = res.directors;
				$scope.movieWriters = res.writers;
				$scope.movieIMDBurl = res.urlIMDB;
				$scope.movieLocations = res.filmingLocations;


				// MOVIE GROSS CHART STUFF
				var movieGross = res.business.gross;
				var array = [];

	    		if(movieGross != null) {
		    		for (var i = 0; i < movieGross.length; i++) {
		    			if(movieGross[i].country == "USA"){
		    				array[array.length] = movieGross[i];
		    			}
		    		};

		    		$scope.movieUSGross = array;

		    		var dataForChartY = [];
		    		var dataForChartX = [];
					
					for (var i = 0; i < array.length; i++) {
						dataForChartY[dataForChartY.length] = [array[i].day + "." + array[i].month + "." + array[i].year, parseFloat(array[i].money.substr(1).replace(/[^\d\.\-\ ]/g, ''))];
						dataForChartX[dataForChartX.length] = [array[i].day + "." + array[i].month + "." + array[i].year]
					}

					dataForChartY.reverse();
					dataForChartX.reverse();	

				    $scope.chartConfig = {
				        options: {
				            chart: {
				                type: 'spline'
				            }
				        },
				        xAxis: {
				        	categories: dataForChartX
						},
				        series: [{
				        	name: "Gross",
				            data: dataForChartY
				        }],
				        title: {
				            text: 'US Gross'
				        },
				    };

				}

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

