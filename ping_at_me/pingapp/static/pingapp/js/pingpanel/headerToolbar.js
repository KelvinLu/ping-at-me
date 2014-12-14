(function(){
    var app = angular.module('headerToolbar', ['pingClient']);

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

    app.controller('toolbarController', ['friendsService', 'requestsService', 'logoutService', 'firebaseService', function(friendsService, requestsService, loginService, firebaseService){
        this.logout = function(){
            loginService.logout().
                success(function(data){
                    firebaseService.firebaseRef.unauth();
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
        var ctrl = this;

        this.serviceData = friendsService.serviceData;

        this.searchQuery = "";
        this.page = 0;

        this.friendMessage = "";

        this.searchUsers = function(){
            friendsService.searchUsers(ctrl.searchQuery, ctrl.page);
        }

        this.prevUsers = function(){
            ctrl.page = ((ctrl.page > 0) ? ctrl.page - 1 : ctrl.page);
            friendsService.searchUsers(ctrl.searchQuery, ctrl.page);
        }

        this.nextUsers = function(){
            ctrl.page = ((ctrl.serviceData.remainingCount > 0) ? ctrl.page + 1 : ctrl.page);
            friendsService.searchUsers(ctrl.searchQuery, ctrl.page);
        }

        this.removeFriend = function(friend){
            friendsService.removeFriend(friend).
                success(function(data){
                    ctrl.friendMessage = friend.username + " removed from friends";

                    friends = friendsService.serviceData.friends;
                    if ((index = friends.indexOf(friend)) > -1) friends.splice(index, 1);
                }).
                error(function(data){ 
                    alert("Error removing friend.");
                });
        }
    }]);

    app.controller('requestsListController', ['$scope', 'requestsService', function($scope, requestsService){
        var ctrl = this;

        this.serviceData = requestsService.serviceData;

        this.searchQuery = "";
        this.searchPage = 0;
        this.requestPage = 0;

        this.requestMessage = "";

        this.searchUsers = function(){
            requestsService.searchUsers(ctrl.searchQuery, ctrl.searchPage);
        }

        this.prevSearchUsers = function(){
            ctrl.searchPage = ((ctrl.searchPage > 0) ? ctrl.searchPage - 1 : ctrl.searchPage);
            requestsService.searchUsers(ctrl.searchQuery, ctrl.searchPage);
        }

        this.nextSearchUsers = function(){
            ctrl.searchPage = ((ctrl.serviceData.searchRemainingCount > 0) ? ctrl.searchPage + 1 : ctrl.searchPage);
            requestsService.searchUsers(ctrl.searchQuery, ctrl.searchPage);
        }

        this.prevRequests = function(){
            ctrl.requestPage = ((ctrl.requestPage > 0) ? ctrl.requestPage - 1 : ctrl.requestPage);
            requestsService.getRequestsData(ctrl.requestPage);
        }

        this.nextRequests = function(){
            ctrl.requestPage = ((ctrl.serviceData.requestsRemainingCount > 0) ? ctrl.requestPage + 1 : ctrl.requestPage);
            requestsService.getRequestsData(ctrl.requestPage);
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
            requestsService.acceptRequest(friend).
                success(function(data){
                    ctrl.requestMessage = "friend request accepted for " + friend.username;

                    requests = requestsService.serviceData.requests;
                    if ((index = requests.indexOf(friend)) > -1) requests.splice(index, 1);
                }).
                error(function(data){
                    alert('Couldn\'t respond to request.');
                });
        };

        this.denyRequest = function(friend){
            requestsService.denyRequest(friend).
                success(function(data){
                    ctrl.requestMessage = "friend request denied for " + friend.username;

                    requests = requestsService.serviceData.requests;
                    if ((index = requests.indexOf(friend)) > -1) requests.splice(index, 1);
                }).
                error(function(data){
                    alert('Couldn\'t respond to request.');
                });
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
        var serv = this;

        var serviceData = {
            visible: false,
            requests: [],
            requestsRemainingCount: null,
            searchResults: [],
            searchRemainingCount: null,
        };

        this.toggle = function() {
            if (visible = !serviceData.visible) serv.getRequestsData(0);
            serviceData.visible = !serviceData.visible;
        };

        this.hide = function() {
            serviceData.visible = false;            
        };

        this.searchUsers = function(query, page){
            $http.get('/api/users/search', {
                params: {q: query, page: page},
            }).
                success(function(data){
                    serviceData.searchResults = data.users;
                    serviceData.searchRemainingCount = data.remaining_count;
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

        this.getRequestsData = function(page){
            $http.get('/api/users/self/requests', {
                params: {page: page},
            }).
                success(function(data){
                    serviceData.requests = data.users;
                    serviceData.requestsRemainingCount = data.remaining_count;
                }).
                error(function(data){
                    alert('Couldn\'t load your requests!');
                });
        };

        this.acceptRequest = function(friend){
            return $http.put('/api/users/self/requests', {
                id: friend.id, 
                action: 'accept',
            });
        };

        this.denyRequest = function(friend){
            return $http.put('/api/users/self/requests', {
                id: friend.id, 
                action: 'deny',
            });
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
        var serv = this;

        var serviceData = {
            visible: false,
            friends: [],
        };

        this.toggle = function() {
            if (visible = !serviceData.visible) serv.searchUsers('', 0);
            serviceData.visible = visible;
        }

        this.hide = function() {
            serviceData.visible = false;            
        }

        this.searchUsers = function(query, page){
            $http.get('/api/users/self/friends', {
                params: {q: query, page: page},
            }).
                success(function(data){
                    serviceData.friends = data.users;
                }).
                error(function(data){
                    alert('Couldn\'t load your friends!');
                });
        };

        this.removeFriend = function(friend){
            return $http.put('/api/users/self/friends', {
                id: friend.id, 
                action: 'remove',
            });
        };

        return {
            serviceData: serviceData,
            toggle: this.toggle,
            hide: this.hide,
            searchUsers: this.searchUsers,
            removeFriend: this.removeFriend,
        };
    }]);
})();