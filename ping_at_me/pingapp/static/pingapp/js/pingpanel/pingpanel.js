(function(){
    var app = angular.module('pingpanel', ['headerToolbar']);

    app.config(['$httpProvider', '$interpolateProvider', function($httpProvider, $interpolateProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    }]);
})();