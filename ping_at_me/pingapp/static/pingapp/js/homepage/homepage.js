(function(){
    var app = angular.module('homepage', ['register', 'login']);

    app.config(['$httpProvider', '$interpolateProvider', function($httpProvider, $interpolateProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    }]);

    $('#goToRegister').click(function(){
	    $('html, body').animate({
	        scrollTop: $('#register').offset().top,
	    }, 500);
    	return false;
	});

    colorPalette = ['#F7977A', '#F9AD81', '#FDC68A', '#FFF79A', '#C4DF9B', '#A2D39C', '#82CA9D', '#7BCDC8', '#6ECFF6', '#7EA7D8', '#8493CA', '#8882BE', '#A187BE', '#BC8DBF', '#F49AC2', '#F6989D'];
    color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

    $('body').css('background-color', color);

    setMapBackground = function(position) {
        var gmap = new GMaps({
            div: '#backgroundMap',
            lng: position.coords.longitude,
            lat: position.coords.latitude,
            disableDefaultUI: true,
        });
    }

    setNoMapBackground = function() {
        $('#backgroundMap').css('background-color', color);
    }

    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(setMapBackground, setNoMapBackground);
    } else {
        setNoMapBackground();
    }
})();