(function(){
    var app = angular.module('homepage', ['register', 'login']);

    app.config(['$httpProvider', '$interpolateProvider', function($httpProvider, $interpolateProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    }]);

    $('#goToBottom').click(function(){
	    $('html, body').animate({
	        scrollTop: $('#bottom').offset().top,
	    }, 500);
    	return false;
	});
})();