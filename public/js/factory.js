angular.module('factory', []).factory('MainFactory', function($rootScope, $http){
    
 	var movie = {};
 	var RTurl = "";
 	var query = "";
 	var IMDBid = "";


    movie.setQuery = function(value) {

    	query=value;

    } 

    movie.getQuery = function() {

    	return query;

    }  

    movie.getRTmovies_list = function(query) {
      return $http({
        method: 'JSONP', 
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=4nktdb9q9p54q9krkmagc7u3&q=' + encodeURI(query) + '&page_limit=5&callback=JSON_CALLBACK'
      });
    }

    movie.setRTurl = function(value) {

    	RTurl=value;

    } 

    movie.getRTurl = function() {

    	return RTurl;

    }  

    movie.getRTmovie = function(url) {
      return $http({
        method: 'JSONP', 
        url: url + '?apikey=4nktdb9q9p54q9krkmagc7u3&callback=JSON_CALLBACK'
      });
    }

    movie.getIMDBmovies_list = function(query) {
      return $http({
        method: 'JSONP', 
        url: 'http://www.omdbapi.com/?s=' + encodeURI(query) + '&callback=JSON_CALLBACK'
      });
    }  

    movie.setIMDBid = function(value) {

    	IMDBid=value;

    } 

    movie.getIMDBid = function() {

    	return IMDBid;

    } 

    movie.getIMDBmovie = function(id) {
      return $http({
        method: 'JSONP', 
        url: 'http://www.omdbapi.com/?i=tt' + id + '&plot=full&callback=JSON_CALLBACK'
      });
    }  







    return movie;           
});