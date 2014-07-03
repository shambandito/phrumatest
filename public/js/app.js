var app = angular.module('phruma', ['ngRoute', 'appRoutes', 'controllers', 'factory', 'ngProgress', 'highcharts-ng', 'ui.bootstrap', 'ngTouch', 'angularSmoothscroll']);

app.directive('knob', function() {
    return {
        restrict: 'C',
        require: 'ngModel',
        scope: { model: '=ngModel' },
        controller: function($scope, $element, $timeout) {
                var el = $($element);
                $scope.$watch('model', function(v) {
                    var el = $($element);
                    el.val(v).trigger('change');
                });
        },

        link: function($scope, $element, $attrs,$ngModel) {
                    var el = $($element);
                    el.val($scope.value).knob(
                        {
                            'change' : function (v) {
                                $scope.$apply(function () {
                                  $ngModel.$setViewValue(v);
                                });
                            },
                            'readOnly':true,
                            'min':0,
                            'max':100,
                            'angleOffset': -125,
                            'angleArc': 250
                        }
                    );
        }
    }

});

//this is used to parse the profile
function url_base64_decode(str) {
  var output = str.replace('-', '+').replace('_', '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw 'Illegal base64url string!';
  }
  return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}