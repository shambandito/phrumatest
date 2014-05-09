angular.module('factory', []).factory('MainFactory', function($rootScope, $http){

	var movie;
    
    return {
        sayHello: function(text){
            return "Factory says \"Hello " + text + "\"";
        }  

 //        getQuery: function(query) {
 //        	return query;
 //        }

 //        results: function() {
	// 		var url = 'http://www.omdbapi.com/?t=' + encodeURI(getQuery) + '&tomatoes=true&callback=JSON_CALLBACK'
	// 		$http.jsonp(url).then(function (result) {

	// 			//$scope.moviebla = result;
	//     		$scope.movieTitle = result.data.Title;
	//     		$scope.moviePlot = result.data.Plot;
	//     		$scope.movieRating = result.data.imdbRating;
	//     		$scope.movieDirectors = result.data.Director;
	//     		$scope.moviePoster = result.data.Poster;

	//     		movie = result.data;

	// 		});

	// 		return movie;
	// 	}		
	// };




 //    }               
});