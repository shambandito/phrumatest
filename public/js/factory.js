angular.module('factory', [])
.factory('MainFactory', function($rootScope, $http){
    
    var movie = {};
    var RTurl = "";
    var query = "";
    var compareQuery = "";
    var IMDBid = "";
    var IMDBid_2 = "";
    var type = "";
    var message = "";
    var isAuthenticated = false;


    movie.setQuery = function(value) {

        query=value;

    } 

    movie.getQuery = function() {

        return query;

    }

    movie.setCompareQuery = function(value) {

        compareQuery=value;

    } 

    movie.getCompareQuery = function() {

        return compareQuery;

    } 

    movie.setType = function(value) {
        type=value;
    } 

    movie.getType = function() {
        return type;
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
        url=url.substr(2);
      return $http({
        method: 'JSONP', 
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movie_alias.json?apikey=4nktdb9q9p54q9krkmagc7u3&type=imdb&id=' + url + '&callback=JSON_CALLBACK'
      });
    }

    movie.getRTsimilar = function(id) {
      return $http({
        method: 'JSONP', 
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + id + '/similar.json?apikey=4nktdb9q9p54q9krkmagc7u3&limit=4&callback=JSON_CALLBACK'
      });        
    }

    movie.getRTreviews_top = function(id) {
      return $http({
        method: 'JSONP', 
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + id + '/reviews.json?apikey=4nktdb9q9p54q9krkmagc7u3&limit=4&review_type=top_critic&page_limit=10&callback=JSON_CALLBACK'
      });        
    }



    movie.getIMDBmovies_list = function(query) {
      return $http({
        method: 'JSONP', 
        url: 'http://www.omdbapi.com/?s=' + encodeURI(query) + '&callback=JSON_CALLBACK'
      });
    }  

    movie.getIMDBmovie_omdb = function(id) {
      return $http({
        method: 'JSONP', 
        url: 'http://www.omdbapi.com/?i=' + id + '&callback=JSON_CALLBACK'
      });
    }  

    movie.setIMDBid = function(value) {

        IMDBid=value;

    } 

    movie.getIMDBid = function() {

        return IMDBid;

    } 

    movie.setIMDBid_movie2 = function(value) {

        IMDBid_2=value;

    } 

    movie.getIMDBid_movie2 = function() {

        return IMDBid_2;

    } 

    movie.getIMDBmovie = function(id) {
      return $http({
        method: 'JSONP', 
        url: 'http://www.myapifilms.com/search?idIMDB=' + id + '&format=JSONP&aka=0&business=1&seasons=0&technical=0&lang=en-us&actors=S&biography=0&callback=JSON_CALLBACK'
      });
    }  

    movie.setMessage = function(messageauthen){
        message =  messageauthen;
    }

    movie.getMessage = function(){
        return message;
    }
    movie.setAuthen = function(authen){
        isAuthenticated = authen;
    }

    movie.getAuthen = function(){
        return isAuthenticated;
    }

    return movie;           
})
.factory('authInterceptor', function ($rootScope, $q, $window) {
return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },
    responseError: function (rejection) {
      if (rejection.status === 401) {
        // handle the case where the user is not authenticated
      }
      return $q.reject(rejection);
    }
  };
});