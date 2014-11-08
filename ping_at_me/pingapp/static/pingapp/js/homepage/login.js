(function(){
	var app = angular.module('login', []);

	app.directive('loginForm', function(){
		return {
			restrict: 'E',
			templateUrl: '/static/pingapp/html/loginform.html',
			controller: 'loginController',
			controllerAs: 'loginCtrl',
		};
	});

	app.controller('loginController', ['loginService', function(loginService){
		this.username = '';
		this.password = '';
		this.loginFailed = false;

		var controller = this;

		this.submit = function(){
			loginService.login(controller.username, controller.password).
				success(function(data){
					window.location.href = '/pingpanel';
				}).
                error(function(data){
                    controller.loginFailed = true;
                });
		};
	}]);

	app.factory('loginService', ['$http', function($http){
		this.login = function(username, password){
			postData = {
                'username': username,
                'password': password,
            };

            config = {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            };

            return $http.post('/api/auth/login', $.param(postData), config);
        };

        return {
            login: this.login,
        };
	}]);
})();