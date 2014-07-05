var ctrl = angular.module('controllers', [])
    .controller('MainController', MainController)
    .controller('ModalInstanceController', ModalInstanceController);




function MainController($scope, $location, $rootScope, MainFactory, ngProgress, $timeout, $modal , $window,$http) {
	
	

	var show = false;
	$scope.showPlot = false;

	ngProgress.height("5px");
	ngProgress.color("#0096C4");

	//TOGGLE FOR MENU COLLAPSE
	$scope.isCollapsed = true;

	//OPEN MODAL FUNCTION
	$scope.openModal = function (size,modalziel) {
		if(modalziel == 'login'){
		    var modalInstance = $modal.open({
		      templateUrl: 'myLoginModal.html',
		      controller: ModalInstanceController,
		      size: size,
		      resolve: {
		        items: function () {
		          return $scope.items;
		        }
		      }
		    });
	    }
	    else if(modalziel == 'signup'){
	    	var modalInstance = $modal.open({
	      		templateUrl: 'mySignUpModal.html',
	      		controller: ModalInstanceController,
	      		size: size,
	      		resolve: {
	        		items: function () {
	          			return $scope.items;
	        		}
	      		}
	    	});
	    }
	    else if(modalziel == 'notloggedin'){
	    	var modalInstance = $modal.open({
	      		templateUrl: 'myNotLoggedInModal.html',
	      		controller: ModalInstanceController,
	      		size: size,
	      		resolve: {
	        		items: function () {
	          			return $scope.items;
	        		}
	      		}
	    	});
	    }
	    else if(modalziel == 'logout'){
	    	var modalInstance = $modal.open({
	      		templateUrl: 'confirmLogoutModal.html',
	      		controller: ModalInstanceController,
	      		size: size,
	      		resolve: {
	        		items: function () {
	          			return $scope.items;
	        		}
	      		}
	    	});
	    }
	};

	// PRESS ENTER TO SEARCH FUNCTION
	$scope.pressEnter = function(event, query, search_type) {


		if(event.which == 13 && search_type == 'search') {
			$scope.doSearch(query);
		}

		if(event.which == 13 && search_type == 'compare') {
			$scope.doCompareSearch(query);
		}
	}

	//START SEARCH FUNCTION
	$scope.doSearch = function(query) {

		if(typeof query !== 'undefined') {

			MainFactory.setQuery(query);

			if($location.path() == "/search") {
				$scope.searchInit();
			} else {
				$location.path("/search");
			}
		}
	}

	// SEARCH IS DONE HERE
	$scope.searchInit = function() {

		ngProgress.reset();

		//MAKE SEARCH CONTAINER FULL HEIGHT OF WINDOW
	    function fullheight() {
	        jQuery('.search_container').css({
	            height: jQuery(window).height()-75
	        });
	    };

	    //CHECK FOR WINDOW RESIZE AND RESIZE ELEMENTS
	    jQuery(window).resize(function() {
	        fullheight();         
	    });

	    // RUN FULLHEIGHT ONCE ON INIT
	    fullheight();

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
									alert("Unfortunatley the OMDBAPI hasn't responded. Please try again later.");
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

		ngProgress.reset();

/*		//MAKE RESULT PAGE "PAGES" FULLSCREEN
	    function fullheight() {
	        jQuery('#movie_info').css({
	            height: jQuery(window).height()-50
	        });

	        jQuery('#moviedata-container').css({
	            height: jQuery(window).height()-50
	        });
	    };

	    //CHECK FOR WINDOW RESIZE AND RESIZE ELEMENTS
	    jQuery(window).resize(function() {
	        fullheight();         
	    });

	    // RUN FULLHEIGHT ONCE ON INIT
	    fullheight();*/



		$scope.movieQuery = MainFactory.getQuery();
		$scope.movieType = MainFactory.getType();

		$scope.errorMessage = "Search for a movie or TV show to get results";

		$scope.isMovie = false;

		if($scope.movieQuery != "") {

			$scope.errorMessage = "";

			document.getElementById("result_container").style.display = 'none';
			document.getElementById("result_container").style.opacity = '0';
			window.scrollTo(0, 0);
			ngProgress.start();

			if($scope.movieType == "movie") {	

				$scope.isMovie = true;

				//GET ROTTEN TOMATOES MOVIE JSON
				MainFactory.getRTmovie(MainFactory.getIMDBid()).success(function (res) {
					$scope.rtMovieID = res.id;

			   		//CHECK IF THERE IS ACTUALLY A CRITICS RATING
			   		$scope.hasRTrating = false;

					if(typeof res.ratings !== 'undefined') {
			   			$scope.movieCriticsRating = res.ratings.critics_score;
			   			$scope.movieUsersRating = res.ratings.audience_score;
			   			$scope.hasRTrating = true;
			   		}
			   		
			   		$scope.movieSite = res.Website;
			   		$scope.movieStudio = res.studio;
			   		$scope.movieConsensus = res.critics_consensus;
			   		$scope.movieRTlink = res.links.alternate;


			   		//GET SIMILAR MOVIES
					MainFactory.getRTsimilar($scope.rtMovieID).success(function (res) {
						$scope.similarMovies = res.movies;
						$scope.hasSimilar = true;
						if($scope.similarMovies == "") {
							$scope.hasSimilar = false;
						}
					}).error(function(data, status, ers, config) {
									alert("Unfortunately the Rotten Tomatoes API hasn't responded. Please try again later.");
									ngProgress.reset();
					});;

			   		//GET TOP CRITICS REVIEWS
					MainFactory.getRTreviews_top($scope.rtMovieID).success(function (res) {
						$scope.criticReviews = res.reviews;
						$scope.hasReviews = true;
						if($scope.criticReviews == "") {
							$scope.hasReviews = false;
						}

						document.getElementById("result_container").style.display = 'block';
					}).error(function(data, status, headers, config) {
									alert("Unfortunately the Rotten Tomatoes API hasn't responded. Please try again later.");
									ngProgress.reset();
					});

				}).error(function(data, status, headers, config) {
									alert("Unfortunately the Rotten Tomatoes API hasn't responded. Please try again later.");
									ngProgress.reset();
				});;
			}

		    //GET CLASS FUNCTION
		    $scope.getClass = function() {
		    		
					if($scope.hasRTrating == false) {
						return "series_knob"
					} else {
						return "";
					}
			}

			//GET IMDB MOVIE JSON
			MainFactory.getIMDBmovie(MainFactory.getIMDBid()).success(function (res) {

					$scope.countries = res.countries;
					$scope.movieIMDBid = MainFactory.getIMDBid();
					$scope.movieActors = res.actors;
					$scope.moviePlot = res.simplePlot;
					$scope.moviePlotFull = res.plot;
					$scope.movieYear = res.year;
					$scope.movieRuntime = res.runtime[0];
					$scope.IMDBRating = res.rating * 10;
					$scope.poster = res.urlPoster;
					$scope.movieTitle = res.title;
					$scope.genres = res.genres;
					$scope.movieDirectors = res.directors;

					$scope.hasDirectors = true;
					if($scope.movieDirectors == "") {
						$scope.hasDirectors = false;
					}				

					$scope.movieWriters = res.writers;

					$scope.hasWriters = true;
					if($scope.movieWriters == "") {
						$scope.hasWriters = false;
					}

					$scope.movieIMDBurl = res.urlIMDB;
					$scope.movieLocations = res.filmingLocations;
					$scope.movieAgeRating = res.rated;

					//TRIVIA STUFF
					$scope.hasTrivia = false;
					$scope.movieTrivia = res.movieTrivia;
					if($scope.movieTrivia.length > 0) {
						$scope.hasTrivia = true;
					}
					$scope.maxSize = 5;
					$scope.currentPage = 1;
					$scope.totalItems = 0;


				if(typeof res.trailer !== 'undefined' ) {
					$scope.trailerURL = res.trailer.videoURL;
				}

					//GET SEASONS & EPISODES IF QUERY IS A SERIES
					if(MainFactory.getType() == "series") {
						$scope.seriesSeasons = res.seasons;
					}


					// MOVIE GROSS CHART STUFF
					if($scope.movieType == "movie") {
						if(typeof res.business.budget !== 'undefined' && res.business.budget.money.charAt(0) == '$') {
							$scope.movieBudget = res.business.budget.money;
						} else if (typeof res.business.budget !== 'undefined' && res.business.budget.money.charAt(0) !== '$') {
							$scope.movieBudget = res.business.budget.remarks + res.business.budget.money;
						}

						$scope.hasGross = false;

						var movieGross = res.business.gross;
						var array = [];

			    		if(typeof movieGross !== 'undefined') {
			    			$scope.hasGross = true;
				    		for (var i = 0; i < movieGross.length; i++) {
				    			if(movieGross[i].country == "USA"){
				    				array[array.length] = movieGross[i];
				    			}
				    		};

				    		$scope.movieUSGross = array;

				    		if($scope.movieUSGross.length < 1) {
				    			$scope.hasGross = false;
				    		}

				    		array.reverse();
				    		var dataForChartY = [];
				    		var dataForChartX = [];
				    		var largest = 0;


							
							for (var i = 0; i < array.length; i++) {
								if(parseFloat(array[i].money.substr(1).replace(/[^\d\.\-\ ]/g, '')) < largest) {

								} else {
									largest = parseFloat(array[i].money.substr(1).replace(/[^\d\.\-\ ]/g, ''));
									dataForChartY[dataForChartY.length] = [array[i].day + "." + array[i].month + "." + array[i].year, parseFloat(array[i].money.substr(1).replace(/[^\d\.\-\ ]/g, ''))];
									dataForChartX[dataForChartX.length] = [array[i].day + "." + array[i].month + "." + array[i].year]	
								}		
							}

						    $scope.chartConfig = {
						        options: {
						            chart: {
						                type: 'spline',
						                backgroundColor: null,
										borderWidth: 0,
										borderRadius: 0,
										plotBackgroundColor: null,
										plotShadow: false,
										plotBorderWidth: 0,
										style: {
											fontFamily: 'Lato'
										}
						            },
						            tooltip: {
										backgroundColor: '#FFF',
										borderWidth: 0,
										style: {
											color: '#000'
										},
										formatter: function() {
									        return this.x + '<br>' + '<strong>$' + Highcharts.numberFormat(this.y, 0) + '</strong>'
									    }
									},
									legend: {
	            						enabled: false
	        						}
						        },
						        
						        xAxis: {
						        	categories: dataForChartX
								},        
								yAxis: {           
						            title: {
						                text: null
						            },
						            min: 0
						        },
						        series: [{
						        	name: "Gross",
						            data: dataForChartY,
						            color: '#0096C4',
						            lineWidth: 3
						        }],

						        title: {
						            text: 'US Box Office Gross'
						        }



						    };

						}
					}

					//SET RT LINK VIA SERIES TITLE
					if(MainFactory.getType() == "series") {					
						$scope.movieRTlink = "http://www.rottentomatoes.com/tv/" + res.title.replace(/\s+/g, '-').toLowerCase();
					}

					ngProgress.complete();
					$scope.movieOnWatchlist();
					document.getElementById("result_container").style.display = 'block';
					document.getElementById("result_container").style.opacity = '1';					
					ngProgress.reset();





			});
		}

	}

	$scope.openCompareSearch = function() {
		document.getElementById("compare_search_overlay").style.display = 'block';
		document.getElementById("result_container").style.display = 'none';		
		document.getElementById("result_container").style.opacity = '0';
		document.getElementById("ngProgress-container").style.top = '0';
	}

	$scope.closeCompareSearch = function() {
				document.getElementById("compare_search_overlay").style.display = 'none';	
				document.getElementById("result_container").style.display = 'block';
				document.getElementById("result_container").style.opacity = '1';
				document.getElementById("ngProgress-container").style.top = '60px';
	}

	$scope.doCompareSearch = function() {
		var query = $scope.compareSearchQuery;
		$scope.errorMessage = "";

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


	$scope.showFullPlot = function() {

		if($scope.showPlot == false) {
			$scope.showPlot = true;	
		}
		else {
			$scope.showPlot = false;
		}
	}


	//START SETTING UP COMPARE PAGE
	$scope.doCompare = function(id, type) {

		//MainFactory.setRTurl(url);
		MainFactory.setType_movie2(type);
		MainFactory.setIMDBid_movie2(id);

		if($location.path() == "/compare") {
			$scope.compareInit();
		} else {
			$location.path("/compare");
		}

	}

	//COMPARE PAGE IS GENERATED HERE
	$scope.compareInit = function() {

		var movieGross_movie1;
		var array_movie1;
		var array_movie2;
		var dataForChartY_movie1 = [];
		var dataForChartX_movie1 = [];
		var movie1_title;
		var movie2_title;
		var hasRTrating = false;
		var hasRTrating_compare = false;

		$scope.loadStatus = 0;

		document.getElementById("ngProgress-container").style.top = '60px';
		ngProgress.reset();

		$scope.movieQuery = MainFactory.getQuery();

		$scope.errorMessage = "Search for a movie or TV show to get results";

		$scope.isMovie = false;

		if($scope.movieQuery != "") {

			$scope.errorMessage = "";

			document.getElementById("result_container").style.display = 'none';
			window.scrollTo(0, 0);
			ngProgress.start();

			if(MainFactory.getType() == "movie") {	

				$scope.isMovie = true;

				//GET ROTTEN TOMATOES JSON DATA FOR MOVIE 1
				MainFactory.getRTmovie(MainFactory.getIMDBid()).success(function (res) {
					$scope.rtMovieID = res.id;

			   		//CHECK IF THERE IS ACTUALLY A CRITICS RATING

					if(typeof res.ratings !== 'undefined') {
			   			$scope.movieCriticsRating = res.ratings.critics_score;
			   			$scope.movieUsersRating = res.ratings.audience_score;
			   			hasRTrating = true;
			   		}
			   		
			   		$scope.movieSite = res.Website;
			   		$scope.movieStudio = res.studio;
			   		$scope.movieConsensus = res.critics_consensus;
			   		$scope.movieRTlink = res.links.alternate;

			   		//GET TOP CRITICS REVIEWS
					MainFactory.getRTreviews_top($scope.rtMovieID).success(function (res) {
						$scope.criticReviews = res.reviews;
						$scope.hasReviews = true;
						if($scope.criticReviews == "") {
							$scope.hasReviews = false;
						}

					}).error(function(data, status, headers, config) {
									alert("Unfortunately the Rotten Tomatoes API hasn't responded. Please try again later.");
									ngProgress.reset();
					});

				}).error(function(data, status, headers, config) {
									alert("Unfortunately the Rotten Tomatoes API hasn't responded. Please try again later.");
									ngProgress.reset();
				});;

				//GET ROTTEN TOMATOES JSON DATA FOR MOVIE 2 (COMPARE MOVIE)
				MainFactory.getRTmovie(MainFactory.getIMDBid_movie2()).success(function (res) {
					$scope.rtMovieID_compare = res.id;

			   		//CHECK IF THERE IS ACTUALLY A CRITICS RATING

					if(typeof res.ratings !== 'undefined') {
			   			$scope.movieCriticsRating_compare = res.ratings.critics_score;
			   			$scope.movieUsersRating_compare = res.ratings.audience_score;
			   			hasRTrating_compare = true;
			   		}
			   		
			   		$scope.movieSite_compare = res.Website;
			   		$scope.movieStudio_compare = res.studio_compare;
			   		$scope.movieConsensus_compare = res.critics_consensus;
			   		$scope.movieRTlink_compare = res.links.alternate;

			   		//GET TOP CRITICS REVIEWS
					MainFactory.getRTreviews_top($scope.rtMovieID_compare).success(function (res) {
						$scope.criticReviews_compare = res.reviews;
						$scope.hasReviews_compare = true;
						if($scope.criticReviews_compare == "") {
							$scope.hasReviews_compare = false;
						}

					}).error(function(data, status, headers, config) {
									alert("Unfortunately the Rotten Tomatoes API hasn't responded. Please try again later.");
									ngProgress.reset();
					});

				}).error(function(data, status, headers, config) {
									alert("Unfortunately the Rotten Tomatoes API hasn't responded. Please try again later.");
									ngProgress.reset();
				});;
			
			}		//END RT HTTP BLOCK	




			//GET IMDB JSON FOR MOVIE 1
			MainFactory.getIMDBmovie(MainFactory.getIMDBid()).success(function (res) {

					$scope.countries = res.countries;
					$scope.movieIMDBid = MainFactory.getIMDBid();
					$scope.movieActors = res.actors;
					$scope.moviePlot = res.simplePlot;
					$scope.moviePlotFull = res.plot;
					$scope.movieYear = res.year;
					$scope.movieRuntime = res.runtime[0];
					$scope.IMDBRating = res.rating * 10;
					$scope.poster = res.urlPoster;
					$scope.movieTitle = res.title;
					movie1_title = res.title;
					$scope.genres = res.genres;
					$scope.movieDirectors = res.directors;

					$scope.hasDirectors = true;
					if($scope.movieDirectors == "") {
						$scope.hasDirectors = false;
					}				

					$scope.movieWriters = res.writers;

					$scope.hasWriters = true;
					if($scope.movieWriters == "") {
						$scope.hasWriters = false;
					}

					$scope.movieIMDBurl = res.urlIMDB;
					$scope.movieLocations = res.filmingLocations;
					$scope.movieTrivia = res.movieTrivia;
					$scope.movieAgeRating = res.rated;

					//TRIVIA STUFF
					$scope.maxSize = 5;
					$scope.currentPage = 1;
					$scope.totalItems = 0;


				if(typeof res.trailer !== 'undefined' ) {
					$scope.trailerURL = res.trailer.videoURL;
				}

				//GET SEASONS & EPISODES IF QUERY IS A SERIES
				if(MainFactory.getType() == "series") {
					$scope.seriesSeasons = res.seasons;
				}


				//SET RT LINK VIA SERIES TITLE
				if(MainFactory.getType() == "series") {					
					$scope.movieRTlink = "http://www.rottentomatoes.com/tv/" + res.title.replace(/\s+/g, '-').toLowerCase();
				}

				// MOVIE GROSS CHART STUFF
				if(MainFactory.getType() == "movie") {
					if(typeof res.business.budget !== 'undefined' && res.business.budget.money.charAt(0) == '$') {
						$scope.movieBudget = res.business.budget.money;
					} else if (typeof res.business.budget !== 'undefined' && res.business.budget.money.charAt(0) !== '$') {
						$scope.movieBudget = res.business.budget.remarks + res.business.budget.money;
					}
					$scope.hasGross = false;

					movieGross_movie1 = res.business.gross;
					array_movie1 = [];

			    	if(typeof movieGross_movie1 !== 'undefined') {
			    		$scope.hasGross = true;
				    	for (var i = 0; i < movieGross_movie1.length; i++) {
				    		if(movieGross_movie1[i].country == "USA"){
				    			array_movie1[array_movie1.length] = movieGross_movie1[i];
				    		}
				    	};
					}

					array_movie1.reverse();
					var largest = 0;

					for (var i = 0; i < array_movie1.length; i++) {
						if(parseFloat(array_movie1[i].money.substr(1).replace(/[^\d\.\-\ ]/g, '')) < largest) { 
										//nothing	
						} else {
							largest = parseFloat(array_movie1[i].money.substr(1).replace(/[^\d\.\-\ ]/g, ''));						
							dataForChartY_movie1[dataForChartY_movie1.length] = [array_movie1[i].day + "." + array_movie1[i].month + "." + array_movie1[i].year, parseFloat(array_movie1[i].money.substr(1).replace(/[^\d\.\-\ ]/g, ''))];
							dataForChartX_movie1[dataForChartX_movie1.length] = [array_movie1[i].day + "." + array_movie1[i].month + "." + array_movie1[i].year];
						}			
					}


				}

				$scope.loadStatus = $scope.loadStatus + 1;
				$scope.movieOnWatchlist();

			});

			//GET IMDB JSON FOR MOVIE 2 (COMPARE)
			MainFactory.getIMDBmovie(MainFactory.getIMDBid_movie2()).success(function (res) {

					$scope.countries_compare = res.countries;
					$scope.movieIMDBid_compare = MainFactory.getIMDBid();
					$scope.movieActors_compare = res.actors;
					$scope.moviePlot_compare = res.simplePlot;
					$scope.moviePlotFull_compare = res.plot;
					$scope.movieYear_compare = res.year;
					$scope.movieRuntime_compare = res.runtime[0];
					$scope.IMDBRating_compare = res.rating * 10;
					$scope.poster_compare = res.urlPoster;
					$scope.movieTitle_compare = res.title;
					movie2_title = res.title;
					$scope.genres_compare = res.genres;
					$scope.movieDirectors_compare = res.directors;

					$scope.hasDirectors_compare = true;
					if($scope.movieDirectors_compare == "") {
						$scope.hasDirectors_compare = false;
					}				

					$scope.movieWriters_compare = res.writers;

					$scope.hasWriters_compare = true;
					if($scope.movieWriters_compare == "") {
						$scope.hasWriters_compare = false;
					}

					$scope.movieIMDBurl_compare = res.urlIMDB;
					$scope.movieLocations_compare = res.filmingLocations;
					$scope.movieTrivia_compare = res.movieTrivia;
					$scope.movieAgeRating_compare = res.rated;

					//TRIVIA STUFF
					$scope.maxSize = 5;
					$scope.currentPage = 1;
					$scope.totalItems = 0;


				if(typeof res.trailer !== 'undefined' ) {
					$scope.trailerURL_compare = res.trailer.videoURL;
				}

				//GET SEASONS & EPISODES IF QUERY IS A SERIES
				if(MainFactory.getType_movie2() == "series") {
					$scope.seriesSeasons_compare = res.seasons;
				}


				//SET RT LINK VIA SERIES TITLE
				if(MainFactory.getType_movie2() == "series") {					
					$scope.movieRTlink_compare = "http://www.rottentomatoes.com/tv/" + res.title.replace(/\s+/g, '-').toLowerCase();
				}

					// MOVIE GROSS CHART STUFF
					if(MainFactory.getType_movie2() == "movie") {
						if(typeof res.business.budget !== 'undefined' && res.business.budget.money.charAt(0) == '$') {
							$scope.movieBudget_compare = res.business.budget.money;
						} else if (typeof res.business.budget !== 'undefined' && res.business.budget.money.charAt(0) !== '$') {
							$scope.movieBudget_compare = res.business.budget.remarks + res.business.budget.money;
						}
						$scope.hasGross_compare = false;

						var movieGross_movie2 = res.business.gross;
						//console.log(movieGross_movie2);
						array_movie2 = [];

			    		if(typeof movieGross_movie2 !== 'undefined') {
			    			$scope.hasGross_compare = true;
				    		for (var i = 0; i < movieGross_movie2.length; i++) {
				    			if(movieGross_movie2[i].country == "USA"){
				    				array_movie2[array_movie2.length] = movieGross_movie2[i];
				    			}
				    		};

				    		$scope.movieUSGross_compare = array_movie2;
				    		$scope.movieUSGross = array_movie1;

				    		if($scope.movieUSGross_compare.length < 1) {
				    			$scope.hasGross_compare = false;
				    		}	

				    		array_movie2.reverse();		    	


				    		var dataForChartY_movie2 = [];
				    		var dataForChartX_movie2 = [];	
				    		var largest = 0;		

							for (var i = 0; i < array_movie2.length; i++) {
								if(parseFloat(array_movie2[i].money.substr(1).replace(/[^\d\.\-\ ]/g, '')) < largest) { 
										//nothing	
								} else {
									largest = parseFloat(array_movie2[i].money.substr(1).replace(/[^\d\.\-\ ]/g, ''));
									dataForChartY_movie2[dataForChartY_movie2.length] = [array_movie2[i].day + "." + array_movie2[i].month + "." + array_movie2[i].year, parseFloat(array_movie2[i].money.substr(1).replace(/[^\d\.\-\ ]/g, ''))];
									dataForChartX_movie2[dataForChartX_movie2.length] = [array_movie2[i].day + "." + array_movie2[i].month + "." + array_movie2[i].year]
								}		
							}

						    $scope.chartConfig = {
						        options: {
						            chart: {
						                type: 'spline',
						                backgroundColor: null,
										borderWidth: 0,
										borderRadius: 0,
										plotBackgroundColor: null,
										plotShadow: false,
										plotBorderWidth: 0,
										style: {
											fontFamily: 'Lato'
										}
						            },
						            tooltip: {
										backgroundColor: '#FFF',
										borderWidth: 0,
										style: {
											color: '#000'
										},
										formatter: function() {
									        return '<strong>$' + Highcharts.numberFormat(this.y, 0) + '</strong>'
									    }
									},
									legend: {
	            						enabled: true
	        						}
						        },
						        
						        xAxis: {
						            labels: {
						                enabled: false
						            }						        	
								},        
								yAxis: {           
						            title: {
						                text: null
						            },
						            min: 0
						        },
						        series: [{
						        	name: movie1_title,
						            data: dataForChartY_movie1,
						            color: '#0096C4',
						            lineWidth: 3
						        },{
						        	name: movie2_title,
						            data: dataForChartY_movie2,
						            color: '#444',
						            lineWidth: 3
						        }],

						        title: {
						            text: 'US Box Office Gross'
						        }



						    };

						}
					}


				$scope.oneHasGross = false;
				if($scope.hasGross || $scope.hasGross_compare) {
					$scope.oneHasGross = true;
				}			

				$scope.loadStatus = $scope.loadStatus + 1;
			});
		
		 	$scope.$watch('loadStatus', function() {

		 		$scope.bothHaveRTrating = false;
/*				console.log("1 " + hasRTrating);
				console.log("2 " + hasRTrating_compare);*/
				if(hasRTrating && hasRTrating_compare) {
					$scope.bothHaveRTrating = true;
				}	


				if($scope.loadStatus == 2) {
					ngProgress.complete();
					$scope.movieOnWatchlist();
					document.getElementById("result_container").style.display = 'block';
					document.getElementById("result_container").style.opacity = '1';
					ngProgress.reset();
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

	$scope.getAuthen =function(){
		if($window.sessionStorage.token != null){
			var encodedProfile = $window.sessionStorage.token.split('.')[1];
    		var profile = JSON.parse(url_base64_decode(encodedProfile));
			$scope.message = "Welcome " + profile.username;
        	return true;
		}else{
			return false;
		}

	};



  	 $scope.callRestricted = function () {
    	$http({url: '/api/restricted', method: 'GET'})
    	.success(function (data, status, headers, config) {
      		$scope.message = $scope.message + ' ' + data.name; // Should log 'foo'
    	})
    	.error(function (data, status, headers, config) {
    		alert(data);
    	});
  	};

  	//WATCHLIST

  	$scope.addToWatchList = function(){
  		if($window.sessionStorage.token != null){
	  		var encodedProfile = $window.sessionStorage.token.split('.')[1];
	    	var profile = JSON.parse(url_base64_decode(encodedProfile));
			var imdbid = MainFactory.getIMDBid();
			if(MainFactory.getMovieOnWatchlist() == false){
				MainFactory.setMovieOnWatchlist(true);

		  		$http({url: '/api/userwatchlist',
		  			   method : 'POST',
		  				data: {userid : profile.id,
		  					   imdbid : imdbid,
		  					   movieltitle : $scope.movieTitle}
		  				}).success(function(){
		  					$scope.successmessage = "movie was added to the watchlist";
						});
			}
		}
		else{
			$scope.openModal('lg','notloggedin');
		}
  	};

  	$scope.checkbutton =  function(){
  		return MainFactory.getMovieOnWatchlist();
  	}

  	$scope.goToWatchList = function(){
  		$location.path("/watchlist");
  	};

  	$scope.movieOnWatchlist = function(){
  		
  		if($window.sessionStorage.token != null){
  		var encodedProfile = $window.sessionStorage.token.split('.')[1];
    	var profile = JSON.parse(url_base64_decode(encodedProfile));

  		$http({url: '/api/userwatchlist/'+profile.id,
  			   method:'Get'
  			})
  		.success(function(data, status, headers, config){
  			
  				if(data.length == 0){
  					MainFactory.setMovieOnWatchlist(false);
  				}else{
  					for(var i = 0 ; i < data.length ; i++){
  						if(data[i].imdbid == MainFactory.getIMDBid()){
  							MainFactory.setMovieOnWatchlist(true);
  							break;
  						}else{
  							MainFactory.setMovieOnWatchlist(false);
  						}
  					}
  					
  				}
  			});
  		}else{
  			MainFactory.setMovieOnWatchlist(false);
  		}
  	}

  	$scope.removeFromWatchList = function(imdbID){
  		var encodedProfile = $window.sessionStorage.token.split('.')[1];
    	var profile = JSON.parse(url_base64_decode(encodedProfile));

			$http({
				url: '/api/removeuserwatchlist/'+profile.id +'/'+imdbID,
				method: "delete"
			}).success(function(data){
				MainFactory.setMovieOnWatchlist(false);
				$scope.watchlistInit();
			});
		
  	}

  	$scope.watchlistInit =  function(){
  			var encodedProfile = $window.sessionStorage.token.split('.')[1];
    		var profile = JSON.parse(url_base64_decode(encodedProfile));
    		var watchlistdata = [];
    		var array = [];
    		var i = 0;
  			$http({url: '/api/userwatchlist/'+profile.id ,
  			   	   method : 'Get',
  				}).success(function(data){
  					watchlistdata = data;
  						for(i = 0 ; i < watchlistdata.length; i++){
  							MainFactory.getIMDBmovie_omdb(watchlistdata[i].imdbid).success(function (res) {
	    					
	    							var movies = res;
		    						if(movies.Type !== "episode"){
					    				if(movies.Type !== "game") {
							    			array[array.length] = res;
					    				}
					   				}
								})
						}
						$scope.watchlist = array;
				});
	  	}

	  	$scope.singleMovieSearchWatchlist = function(id, type,query) {
		
		MainFactory.setType(type);
		MainFactory.setIMDBid(id);
		MainFactory.setQuery(query);

		if($location.path() == "/result") {
			$scope.singleMovieInit();
		} else {
			$location.path("/result");
		}

	}
}

//CONTROLLER FOR MODAL OBJECTS
function ModalInstanceController($scope, $modalInstance,$http,$window,MainFactory,$modal) {

	$scope.openModal = function (size,modalziel) {

		$modalInstance.dismiss('cancel');
		
		if(modalziel == 'login'){
		    var modalInstance = $modal.open({
		      templateUrl: 'myLoginModal.html',
		      controller: ModalInstanceController,
		      size: size,
		      resolve: {
		        items: function () {
		          return $scope.items;
		        }
		      }
		    });
	    }
	    else if(modalziel == 'signup'){
	    	var modalInstance = $modal.open({
	      		templateUrl: 'mySignUpModal.html',
	      		controller: ModalInstanceController,
	      		size: size,
	      		resolve: {
	        		items: function () {
	          			return $scope.items;
	        		}
	      		}
	    	});
	    }
	    else if(modalziel == 'notloggedin'){
	    	var modalInstance = $modal.open({
	      		templateUrl: 'myNotLoggedInModal.html',
	      		controller: ModalInstanceController,
	      		size: size,
	      		resolve: {
	        		items: function () {
	          			return $scope.items;
	        		}
	      		}
	    	});
	    }
	};
  
  	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.signup = function(user){
  		var newuser =  {username : user.username , email: user.email , password : user.password};
  		$scope.message ='';

  		if(newuser.password  == user.passwordconfirm){
  			newuser.password = window.btoa(user.password);
  		$http.post('/newuser',newuser)
  			.success(function(data, status, headers, config){
  				$modalInstance.dismiss('cancel');
  			})
  			.error(function(data, status, headers, config){
  				if(data == 'User already exists'){
  					$scope.message = data;
  				}else{
  					$scope.messageemail = data;
  				}
  			});
  		}
  		else{
  			$scope.message = 'Error : Passwort stimmt nicht überein';
  		}

  		
  	}

  	$scope.login = function(username,password){
  		console.log(username);

  		if(typeof username !== 'undefined' && typeof password !== 'undefined') {
	  		var user = {username : username, password : password };
			var message = '';
			user.password = window.btoa(user.password);
			
			    $http.post('/authenticate', user)
	      		.success(function (data, status, headers, config) {
	        		
	        		$window.sessionStorage.token = data.token;
	        		$modalInstance.dismiss('cancel');
	        		$scope.movieOnWatchlist();
	      		})
	      		.error(function (data, status, headers, config) {
	        	// Erase the token if the user fails to log in
	        		delete $window.sessionStorage.token;

	        		// Handle login errors here
	        		$scope.message = 'Error: Invalid Username/E-Mail or Password';
	      		});
      	} else {
      		$scope.message = 'Error: Invalid Username/E-Mail or Password';
      	}
	}

	$scope.movieOnWatchlist = function(){
  		
  		if($window.sessionStorage.token != null){
  		var encodedProfile = $window.sessionStorage.token.split('.')[1];
    	var profile = JSON.parse(url_base64_decode(encodedProfile));

  		$http({url: '/api/userwatchlist/'+profile.id,
  			   method:'Get'
  			})
  		.success(function(data, status, headers, config){
  			
  				if(data.length == 0){
  					MainFactory.setMovieOnWatchlist(false);
  				}else{
  					for(var i = 0 ; i < data.length ; i++){
  						if(data[i].imdbid == MainFactory.getIMDBid()){
  							MainFactory.setMovieOnWatchlist(true);
  							break;
  						}else{
  							MainFactory.setMovieOnWatchlist(false);
  						}
  					}
  					
  				}
  			});
  		}else{
  			MainFactory.setMovieOnWatchlist(false);
  		}
  	}

 	$scope.logout = function () {
    	$scope.welcome = '';
    	$scope.message = '';
    	delete $window.sessionStorage.token; 
    	$scope.movieOnWatchlist();
    	$modalInstance.dismiss('cancel');
  	};
};