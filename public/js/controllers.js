var ctrl = angular.module('controllers', [])
    .controller('MainController', MainController)
    .controller('LoginController', LoginController)
    .controller('ModalInstanceController', ModalInstanceController);




function MainController($scope, $location, $rootScope, MainFactory, ngProgress, $timeout, $modal) {

	var show = false;

	//TOGGLE FOR MENU COLLAPSE
	$scope.isCollapsed = true;

	//OPEN MODAL FUNCTION
	$scope.openModal = function (size) {

	    var modalInstance = $modal.open({
	      templateUrl: 'myModalContent.html',
	      controller: ModalInstanceController,
	      size: size,
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });
	};

	$scope.openModalCompareSearch = function (size) {

	    var modalInstance = $modal.open({
	      templateUrl: 'compareSearchModal.html',
	      controller: ModalInstanceController,
	      size: size,
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });
	};

	// PRESS ENTER TO SEARCH FUNCTION
	$scope.pressEnter = function(event, query) {

		if(event.which == 13) {

			console.log("pressed enter");
			$scope.doSearch(query);
		}
	}

	//START SEARCH FUNCTION
	$scope.doSearch = function(query) {

		MainFactory.setQuery(query);

		if($location.path() == "/search") {
			$scope.searchInit();
		} else {
			$location.path("/search");
		}
	}

	// SEARCH IS DONE HERE
	$scope.searchInit = function() {

		var query = MainFactory.getQuery();
		$scope.errorMessage = "";

		ngProgress.start();

		//IMDB SEARCH
		MainFactory.getIMDBmovies_list(query).success(function (res) {
    		
    		var array = [];
    		var movies= res.Search;

    		if(res.Response == "False") {
				$scope.errorMessage = "Sorry, no results could be found! Please try again.";
				ngProgress.reset();
				$scope.movies = null;
    		} else {	
	    		//FILL ARRAY WITH SEARCH RESULTS (ONLY MOVIES + TV SERIES)
	    		if(movies != null) {
		    		for (var i = 0; i < movies.length; i++) {
		    			if(movies[i].Type !== "episode"){
		    				if(movies[i].Type !== "game") {
				    			MainFactory.getIMDBmovie_omdb(movies[i].imdbID).success(function (res) {
				    				array[array.length] = res;
				    				ngProgress.complete();
				    			}).error(function(data, status, headers, config) {
									alert("error!");
									ngProgress.reset();
						    	});
			    			}
		    			}
		    		};
		    		
		    		$scope.movies = array;
				}
    		}

		}).error(function(data, status, headers, config) {
			alert("error!");
    	});

	}

	//START SETTING UP RESULT PAGE
	$scope.singleMovieSearch = function(id, type) {

		//MainFactory.setRTurl(url);
		MainFactory.setType(type);
		MainFactory.setIMDBid(id);

		if($location.path() == "/result") {
			$scope.singleMovieInit();
		} else {
			$location.path("/result");
		}

	}

	//RESULT PAGE IS GENERATED HERE
	$scope.singleMovieInit = function() {

		$scope.movieQuery = MainFactory.getQuery();
		$scope.movieType = MainFactory.getType();

		$scope.errorMessage = "Search for a movie or TV show to get results";

		$scope.isMovie = false;

		if($scope.movieQuery != "") {

			$scope.errorMessage = "";

			document.getElementById("result_container").style.display = 'none';
			window.scrollTo(0, 0);
			ngProgress.start();

			if($scope.movieType == "movie") {	

				$scope.isMovie = true;

				//GET ROTTEN TOMATOES MOVIE JSON
				MainFactory.getRTmovie(MainFactory.getIMDBid()).success(function (res) {
					$scope.rtMovieID = res.id;
			   		$scope.movieCriticsRating = res.ratings.critics_score;
			   		//$scope.movieDirectors = res.abridged_directors;
			   		$scope.movieSite = res.Website;
			   		$scope.moviePoster = res.posters.detailed;
			   		$scope.movieStudio = res.studio;
			   		$scope.movieConcensus = res.critics_consensus;
			   		//LINKS
			   		$scope.movieRTlink = res.links.alternate;


			   		//GET SIMILAR MOVIES
					MainFactory.getRTsimilar($scope.rtMovieID).success(function (res) {
						$scope.similarMovies = res.movies;
					});


				});
			}

			//GET IMDB MOVIE JSON
			MainFactory.getIMDBmovie(MainFactory.getIMDBid()).success(function (res) {
					document.getElementById("result_container").style.display = 'block';
					$scope.movieIMDBid = MainFactory.getIMDBid();
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

	}

	$scope.openCompareSearch = function() {
		document.getElementById("compare_search_overlay").style.display = 'block';
		document.body.style.overflow = "hidden";
	}

	$scope.closeCompareSearch = function() {
				document.getElementById("compare_search_overlay").style.display = 'none';	

				document.body.style.overflow = "auto";	
	}

	$scope.doCompareSearch = function() {
		var query = $scope.compareSearchQuery;
		$scope.errorMessage = "";
		console.log($scope.compareSearchQuery);
		console.log(query);

		//IMDB SEARCH
		MainFactory.getIMDBmovies_list(query).success(function (res) {
    		
    		var array = [];
    		var movies= res.Search;

    		if(res.Response == "False") {
				$scope.errorMessage = "Sorry, no results could be found! Please try again.";
				ngProgress.reset();
				$scope.movies = null;
    		} else {	
	    		//FILL ARRAY WITH SEARCH RESULTS (ONLY MOVIES + TV SERIES)
	    		if(movies != null) {
		    		for (var i = 0; i < movies.length; i++) {
		    			if(movies[i].Type !== "episode"){
		    				if(movies[i].Type !== "game") {
				    			MainFactory.getIMDBmovie_omdb(movies[i].imdbID).success(function (res) {
				    				array[array.length] = res;
				    				ngProgress.complete();
				    			}).error(function(data, status, headers, config) {
									alert("error!");
									ngProgress.reset();
						    	});
			    			}
		    			}
		    		};
		    		
		    		$scope.compareSearchMovies = array;
				}
    		}

		}).error(function(data, status, headers, config) {
			alert("error!");
    	});	
	}





	//START SETTING UP COMPARE PAGE
	$scope.doCompare = function(id, type) {

		//MainFactory.setRTurl(url);
		//MainFactory.setType(type);
		MainFactory.setIMDBid_movie2(id);
		console.log(type);
		console.log(MainFactory.getIMDBid());

		if($location.path() == "/compare") {
			$scope.compareInit();
		} else {
			$location.path("/compare");
		}

	}

	//COMPARE PAGE IS GENERATED HERE
	$scope.compareInit = function() {

		$scope.movieQuery = MainFactory.getQuery();
		console.log(MainFactory.getIMDBid());
		console.log(MainFactory.getIMDBid_movie2());

		$scope.errorMessage = "Search for a movie or TV show to get results";

		$scope.isMovie = false;

		if($scope.movieQuery != "") {

			$scope.errorMessage = "";

			document.getElementById("result_container").style.display = 'none';
			window.scrollTo(0, 0);
			ngProgress.start();

			if(MainFactory.getType() == "movie") {	

				$scope.isMovie = true;

				//GET ROTTEN TOMATOES MOVIE JSON FOR MOVIE 1
				MainFactory.getRTmovie(MainFactory.getIMDBid()).success(function (res) {
					$scope.rtMovieID = res.id;
			   		$scope.movieCriticsRating = res.ratings.critics_score;
			   		//$scope.movieDirectors = res.abridged_directors;
			   		$scope.movieSite = res.Website;
			   		$scope.moviePoster = res.posters.detailed;
			   		$scope.movieStudio = res.studio;
			   		$scope.movieConcensus = res.critics_consensus;
			   		//LINKS
			   		$scope.movieRTlink = res.links.alternate;


			   		//GET SIMILAR MOVIES
					MainFactory.getRTsimilar($scope.rtMovieID).success(function (res) {
						$scope.similarMovies = res.movies;
					});


				});

				//GET ROTTEN TOMATOES MOVIE JSON FOR MOVIE 2
				MainFactory.getRTmovie(MainFactory.getIMDBid_movie2()).success(function (res) {
					$scope.rtMovieID_compare = res.id;
			   		$scope.movieCriticsRating_compare = res.ratings.critics_score;
			   		//$scope.movieDirectors = res.abridged_directors;
			   		$scope.movieSite_compare = res.Website;
			   		$scope.moviePoster_compare = res.posters.detailed;
			   		$scope.movieStudio_compare = res.studio;
			   		$scope.movieConcensus_compare = res.critics_consensus;
			   		//LINKS
			   		$scope.movieRTlink_compare = res.links.alternate;


			   		//GET SIMILAR MOVIES
					MainFactory.getRTsimilar($scope.rtMovieID).success(function (res) {
						$scope.similarMovies_compare = res.movies;
					});


				});
			}

			//GET IMDB MOVIE JSON FOR MOVIE 1
			MainFactory.getIMDBmovie(MainFactory.getIMDBid()).success(function (res) {
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

			//GET IMDB MOVIE JSON FOR MOVIE 2
			MainFactory.getIMDBmovie(MainFactory.getIMDBid_movie2()).success(function (res) {
					document.getElementById("result_container").style.display = 'block';
					$scope.movieActors_compare = res.actors;
					$scope.moviePlot_compare = res.simplePlot;
					$scope.movieRuntime_compare = res.runtime[0];
					$scope.IMDBRating_compare = res.rating * 10;
					$scope.poster_compare = res.urlPoster;
					$scope.movieTitle_compare = res.title;
					$scope.genres_compare = res.genres;
					$scope.movieDirectors_compare = res.directors;
					$scope.movieWriters_compare = res.writers;
					$scope.movieIMDBurl_compare = res.urlIMDB;
					$scope.movieLocations_compare = res.filmingLocations;


					// MOVIE GROSS CHART STUFF
					var movieGross = res.business.gross;
					var array = [];

		    		if(movieGross != null) {
			    		for (var i = 0; i < movieGross.length; i++) {
			    			if(movieGross[i].country == "USA"){
			    				array[array.length] = movieGross[i];
			    			}
			    		};

			    		$scope.movieUSGross_compare = array;

			    		var dataForChartY = [];
			    		var dataForChartX = [];
						
						for (var i = 0; i < array.length; i++) {
							dataForChartY[dataForChartY.length] = [array[i].day + "." + array[i].month + "." + array[i].year, parseFloat(array[i].money.substr(1).replace(/[^\d\.\-\ ]/g, ''))];
							dataForChartX[dataForChartX.length] = [array[i].day + "." + array[i].month + "." + array[i].year]
						}

						dataForChartY.reverse();
						dataForChartX.reverse();	

					    $scope.chartConfig_compare = {
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
						$scope.movieRTlink_compare = "http://www.rottentomatoes.com/tv/" + res.title.replace(/\s+/g, '-').toLowerCase();
					}
			});
		}



	}

	//CHECK IF DATA HAS BEEN PROPERLY RETURNED
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

//CONTROLLER FOR MODAL OBJECTS
function ModalInstanceController($scope, $modalInstance) {
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};