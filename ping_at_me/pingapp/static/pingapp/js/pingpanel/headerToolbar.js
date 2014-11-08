(function(){
    var app = angular.module('headerToolbar', []);

    app.directive('headerToolbar', function(){
        return {
            restrict: 'E',
            templateUrl: '/static/pingapp/html/headertoolbar.html',
            controller: 'toolbarController',
            controllerAs: 'toolbarCtrl',
        };
    });

    app.directive('friendsList', function(){
        return {
            restrict: 'E',
            templateUrl: '/static/pingapp/html/friendslist.html',
            controller: 'friendsListController',
            controllerAs: 'friendsListCtrl',
        };
    });

    app.directive('requestsList', function(){
        return {
            restrict: 'E',
            templateUrl: '/static/pingapp/html/requestslist.html',
            controller: 'requestsListController',
            controllerAs: 'requestsListCtrl',
        };
    });

    app.controller('toolbarController', ['friendsService', 'requestsService', 'logoutService', function(friendsService, requestsService, loginService){
        this.logout = function(){
            loginService.logout().
                success(function(data){
                    window.location.href = '/';
                }).
                error(function(data){
                    alert('Something went wrong; we couldn\'t log you out!');
                });
        };

        this.toggleFriends = function(){
            requestsService.hide();
            friendsService.toggle();
        };

        this.toggleRequests = function(){
            friendsService.hide();
            requestsService.toggle();
        };
    }]);

    app.controller('friendsListController', ['friendsService', function(friendsService){
        this.serviceData = friendsService.serviceData;

        this.removeFriend = function(friend){
            friendsService.removeFriend(friend);
        }
    }]);

    app.controller('requestsListController', ['$scope', 'requestsService', function($scope, requestsService){
        this.serviceData = requestsService.serviceData;

        this.searchQuery = "";

        this.requestMessage = "";

        var ctrl = this;

        this.searchUsers = function(){
            requestsService.searchUsers(ctrl.searchQuery);
        }

        this.sendRequest = function(friend){
            requestsService.sendRequest(friend).
                success(function(data){
                    ctrl.requestMessage = "friend request sent to " + friend.username;

                    searchResults = requestsService.serviceData.searchResults;
                    if ((index = searchResults.indexOf(friend)) > -1) searchResults.splice(index, 1);
                }).
                error(function(data){ 
                    alert("Error sending friend request!");
                });
        };

        this.acceptRequest = function(friend){
            requestsService.acceptRequest(friend);
        };

        this.denyRequest = function(friend){
            requestsService.denyRequest(friend);
        };
    }]);

    app.factory('logoutService', ['$http', function($http){
        this.logout = function(){
            return $http.get('/api/auth/logout');
        };

        return {
            logout: this.logout,
        };
    }]);

    app.factory('requestsService', ['$http', function($http){
        var serviceData = {
            visible: false,
            requests: [],
            searchResults: [],
        };

        var serv = this;

        this.toggle = function() {
            if (visible = !serviceData.visible) serv.getRequestsData();
            serviceData.visible = !serviceData.visible;
        };

        this.hide = function() {
            serviceData.visible = false;            
        };

        this.searchUsers = function(query){
            $http.get('/api/users/search', {
                params: {q: query},
            }).
                success(function(data){
                    serviceData.searchResults = data;
                }).
                error(function(data){
                    alert('Couldn\'t search!');
                });
        };

        this.sendRequest = function(friend){
            return $http.post('/api/users/self/requests', {
                id: friend.id, 
                action: 'request',
            });
        };

        this.getRequestsData = function(){
            $http.get('/api/users/self/requests').
                success(function(data){
                    serviceData.requests = data;
                }).
                error(function(data){
                    alert('Couldn\'t load your requests!');
                });
        };

        this.acceptRequest = function(friend){

        };

        this.denyRequest = function(friend){

        };

        return {
            serviceData: serviceData,
            toggle: this.toggle,
            hide: this.hide,
            searchUsers: this.searchUsers,
            sendRequest: this.sendRequest,
            getRequestData: this.getRequestData,
            acceptRequest: this.acceptRequest,
            denyRequest: this.denyRequest,
        };
    }]);

    app.factory('friendsService', ['$http', function($http){
        var serviceData = {
            visible: false,
            friends: [],
        };

        var serv = this;

        this.toggle = function() {
            if (visible = !serviceData.visible) serv.getFriendsData();
            serviceData.visible = visible;
        }

        this.hide = function() {
            serviceData.visible = false;            
        }

        this.getFriendsData = function(){
            $http.get('/api/users/self/friends').
                success(function(data){
                    serviceData.friends = data;
                }).
                error(function(data){
                    alert('Couldn\'t load your friends!');
                });
        };

        this.removeFriend = function(friend){

        };

        return {
            serviceData: serviceData,
            toggle: this.toggle,
            hide: this.hide,
            getFriendsData: this.getFriendsData,
            removeFriend: this.removeFriend,
        };
    }]);
})();