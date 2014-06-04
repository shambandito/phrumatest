var app = angular.module('phruma', ['ngRoute', 'appRoutes', 'controllers', 'factory', 'ngProgress', 'highcharts-ng']);

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

app.directive('barchart', function() {

    return {

        // required to make it work as an element
        restrict: 'E',
        template: '<div></div>',
        replace: true,
        // observe and manipulate the DOM
        link: function($scope, element, attrs) {

            var data = $scope[attrs.data],
                xkey = $scope[attrs.xkey],
                ykeys= $scope[attrs.ykeys],
                labels= $scope[attrs.labels];

            Morris.Bar({
                    element: element,
                    data: data,
                    xkey: xkey,
                    ykeys: ykeys,
                    labels: labels
                });
        }

    };

});

