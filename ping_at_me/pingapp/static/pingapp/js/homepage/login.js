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
		var ctrl = this;

		this.username = '';
		this.password = '';
		this.loginFailed = false;

		this.submit = function(){
			loginService.login(ctrl.username, ctrl.password).
				success(function(data){
					window.location.href = '/pingpanel';
				}).
                error(function(data){
                    ctrl.loginFailed = true;
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