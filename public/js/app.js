var app = angular.module('phruma', ['ngRoute', 'appRoutes', 'controllers', 'factory', 'ngProgress']);

app.directive('knob', function() {
  return {
      restrict: 'C',
      replace: 'true',
      link: function(scope, element, attrs) {
            $(element).knob({
              'readOnly':true,
              'min':0,
              'max':100,
              'angleOffset': -125,
              'angleArc': 250

            });

            $(element).trigger("change");
      }
  };
});

app.directive('knob2', function() {
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


