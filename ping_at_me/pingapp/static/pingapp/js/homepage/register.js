(function(){
    var app = angular.module('register', []);

    app.directive('registerForm', function() {
        return {
            restrict: 'E',
            templateUrl: '/static/pingapp/html/registerform.html',
            controller: 'registerController',
            controllerAs: 'registerCtrl',
        };
    });

    app.controller('registerController', ['registerService' ,function(registerService){
        var ctrl = this;

        this.username = '';
        this.email = '';
        this.password = '';

        this.submit = function(){
            registerService.register(ctrl.username, ctrl.email, ctrl.password).
                success(function(data){
                    window.location.href = '/pingpanel';
                });
        };
    }]);

    app.factory('registerService', ['$http', function($http){
        this.register = function(username, email, password, controller){
            postData = {
                'username': username,
                'email': email,
                'password': password,
            };

            config = {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            };

            return $http.post('/api/register', $.param(postData), config);
        };

        return {
            register: this.register,
        };
    }]);

    app.directive('validatePasswordCharacters', function() {

        var REQUIRED_PATTERNS = [
            /\d+/,
            /[a-z]+/i,
            /^\S+$/
        ];

        return {
            require: 'ngModel',
            link: function($scope, element, attrs, ngModel) {
                ngModel.$validators.passwordCharacters = function(value) {
                    if (!value.length) return true;
                    var status = true;
                    angular.forEach(REQUIRED_PATTERNS, function(pattern) {
                        status = status && pattern.test(value);
                    });
                    return status;
                }; 
            }
        };
    });

    app.directive('validateUsernameAvailable', ['$http', function($http) {
        return {
            require: 'ngModel',
            link: function($scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.usernameAvailable = function(username) {
                    return $http.get('/api/register/availability?username=' + username);
                };
            },
        }
    }]);

    app.directive('validateEmailAvailable', ['$http', function($http) {
        return {
            require: 'ngModel',
            link: function($scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.emailAvailable = function(email) {
                    return $http.get('/api/register/availability?email=' + email);
                };
            },
        }
    }]);
})();