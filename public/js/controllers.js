var ctrl = angular.module('controllers', [])
    .controller('MainController', MainController)
    .controller('ModalInstanceController', ModalInstanceController);




function MainController($scope, $location, $rootScope, MainFactory, ngProgress, $timeout, $modal , $window,$http) {
	
	

	var show = false;
	$scope.showPlot = false;

	ngProgress.height("8px");
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
					if(typeof res.ratings.critics_score !== 'undefined')
			   		$scope.movieCriticsRating = res.ratings.critics_score;

			   		//CHECK IF THERE IS ACTUALLY A CRITICS RATING
			   		$scope.hasRTrating = true;

			   		console.log($scope.movieCriticsRating);
			   		if($scope.movieCriticsRating == '-1') {
			   			$scope.hasRTrating = false;
			   		}

			   		$scope.movieUsersRating = res.ratings.audience_score;
			   		$scope.movieSite = res.Website;
			   		$scope.moviePoster = res.posters.detailed;
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
				if($scope.isMovie == false) {
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
					$scope.movieWriters = res.writers;
					$scope.movieIMDBurl = res.urlIMDB;
					$scope.movieLocations = res.filmingLocations;


				if(typeof res.trailer.videoURL !== 'undefined' ) {
					$scope.trailerURL = res.trailer.videoURL;
				}

					//GET SEASONS & EPISODES IF QUERY IS A SERIES
					if(MainFactory.getType() == "series") {
						$scope.seriesSeasons = res.seasons;
						console.log(res.seasons);
					}


					// MOVIE GROSS CHART STUFF
					if($scope.movieType == "movie") {
						if(typeof res.business.budget !== 'undefined' ) {
							$scope.movieBudget = res.business.budget.money;
						}
						$scope.hasGross = false;

						var movieGross = res.business.gross;
						console.log(movieGross);
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
						                type: 'spline',
						                backgroundColor: null,
										borderWidth: 0,
										borderRadius: 0,
										plotBackgroundColor: null,
										plotShadow: false,
										plotBorderWidth: 0
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
						        series: [{
						        	name: "Gross",
						            data: dataForChartY,
						            color: '#0096C4',
						            lineWidth: 3
						        }],

						        title: {
						            text: 'US Gross'
						        }



						    };

						}
					}

					//SET RT LINK VIA SERIES TITLE
					if(MainFactory.getType() == "series") {					
						$scope.movieRTlink = "http://www.rottentomatoes.com/tv/" + res.title.replace(/\s+/g, '-').toLowerCase();
					}

					ngProgress.complete();
					document.getElementById("result_container").style.opacity = '1';
					document.getElementById("result_container").style.display = 'block';




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
				document.getElementById("ngProgress-container").style.top = '50px';
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

		document.getElementById("ngProgress-container").style.top = '50px';
		ngProgress.reset();

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
					$scope.moviePlotFull = res.plot;
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

	$scope.logout = function () {
    	$scope.welcome = '';
    	$scope.message = '';
    	MainFactory.setAuthen(false);
    	delete $window.sessionStorage.token;
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

  	$scope.addToWatchList = function(){
  		if($window.sessionStorage.token != null){
  		var encodedProfile = $window.sessionStorage.token.split('.')[1];
    	var profile = JSON.parse(url_base64_decode(encodedProfile));
		var imdbid = MainFactory.getIMDBid();
		console.log($scope.movieTitle);

  		$http({url: '/api/userwatchlist',
  			   method : 'POST',
  				data: {userid : profile.id,
  					   imdbid : imdbid,
  					   movieltitle : $scope.movieTitle}
  				}).success(function(){
  					$scope.successmessage = "movie was added to the watchlist";
				});
		}
		else{
			alert("Sie sind nicht eingelogt");
		}
  		};
  	$scope.watchlistInit =  function(){
  			if($window.sessionStorage.token != null){
  			var encodedProfile = $window.sessionStorage.token.split('.')[1];
    		var profile = JSON.parse(url_base64_decode(encodedProfile));

  			$http({url: '/api/userwatchlist/'+profile.id ,
  			   	   method : 'Get',
  				}).success(function(data){
  					$scope.watchlist = data;
  					console.log(data);
				});
			}
			else{
				alert("Sie sind nicht eingelogt");
			}
	  	};	
}

//CONTROLLER FOR MODAL OBJECTS
function ModalInstanceController($scope, $modalInstance,$http,$window,MainFactory) {
  
  	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.signup = function(user){
  		var newuser =  {username : user.username , email: user.email , password : user.password};
  		$scope.message ='';

  		if(newuser.password  == user.passwordconfirm){
  		$http.post('/newuser',newuser)
  			.success(function(data, status, headers, config){
  				console.log("bin drin");
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
  		var user = {username : username, password : password };
		var message = '';

		    $http.post('/authenticate', user)
      		.success(function (data, status, headers, config) {
        		
        		$window.sessionStorage.token = data.token;

        		var encodedProfile = data.token.split('.')[1];
        		var profile = JSON.parse(url_base64_decode(encodedProfile));
        		//MainFactory.setToken(data.token);
        		console.log(profile);
        		$modalInstance.dismiss('cancel');
      		})
      		.error(function (data, status, headers, config) {
        	// Erase the token if the user fails to log in
        		delete $window.sessionStorage.token;

        		// Handle login errors here
        		$scope.message = 'Error: Invalid user or password';
      		});
	}
};