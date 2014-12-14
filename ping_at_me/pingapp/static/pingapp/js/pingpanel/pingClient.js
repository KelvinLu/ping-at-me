(function(){
    var app = angular.module('pingClient', []);

    app.directive('pingOutbox', function(){
        return {
            restrict: 'E',
            templateUrl: '/static/pingapp/html/pingoutbox.html',
            controller: 'pingOutboxController',
            controllerAs: 'pingOutboxCtrl',
        };
    });

    app.controller('pingInboxController', ['firebaseService', function(firebaseService){
        var ctrl = this;

        this.firebaseRef = firebaseService.firebaseRef;
        this.initPromise = firebaseService.initPromise;
    }]);

    app.controller('pingOutboxController', ['pingOutbox', 'friendsSearchService', 'locatorService', function(pingOutbox, friendsSearchService, locatorService){
        var ctrl = this;

        this.outboxData = {
            longitude: null,
            latitude: null,
            message: '',
            recipients: [],
        };

        this.searchQuery = '';
        this.currentLocationMapSrc = '';

        this.displayLocation = function() {
            map = new GMaps({
                div: '#currentLocationMap',
                lng: ctrl.outboxData.longitude,
                lat: ctrl.outboxData.latitude,
                disableDefaultUI: true,
                zoomControl: true,
                panControl: true,
                streetViewControl: true,
            });

            map.addMarker({
                lng: ctrl.outboxData.longitude,
                lat: ctrl.outboxData.latitude,
            });
        };

        this.updateLocation = function() {
            locatorService.updateLocation(function(position){
                ctrl.outboxData.longitude = position.coords.longitude;
                ctrl.outboxData.latitude = position.coords.latitude;
                ctrl.displayLocation();
            }, function(error){
                alert('Could not get geolocation');
            });
        };

        this.sendPing = function() {

        };
    }]);

    app.factory('locatorService', ['$http', function($http){
        var serv = this;

        this.updateLocation = function(locatePingSuccess, locatePingFailure) {
            if (Modernizr.geolocation) {
                navigator.geolocation.getCurrentPosition(locatePingSuccess, locatePingFailure);
            } else {
                locatePingFailure();
            }
        };

        return {
            updateLocation: this.updateLocation,
        };
    }]);

    app.factory('pingOutbox', ['$http', function($http){
        var serv = this;

        this.sendPing = function(recipients, latitude, longitude, message) {

        };

        return {
            sendPing: this.sendPing,
        };
    }]);

    app.factory('pingInbox', ['firebaseService', function(firebaseService){
        return {

        };
    }]);

    app.factory('firebaseService', ['$http', '$q', function($http, $q){
        var serv = this;

        this.service = {
            'firebaseRef': null,
            'initPromise': null,
        };

        this.apiEndpoints = {
            'firebaseUrl': '/api/ping/firebase/url',
            'firebaseAuth': '/api/ping/firebase/auth',
        };

        this.service.initPromise = (function(){
            var deferred = $q.defer();

            $q.all([$http.get(serv.apiEndpoints.firebaseUrl), $http.get(serv.apiEndpoints.firebaseAuth)]).
                then(
                    function(response){
                        firebaseUrl = response[0].data.url;
                        firebaseToken = response[1].data.token;
                        firebaseRef = new Firebase(firebaseUrl);
                        firebaseRef.authWithCustomToken(firebaseToken, function(error, authData){
                            if (error) {
                                alert('Could not connect to Firebase.');
                                deferred.reject();
                            } else {
                                serv.service.firebaseRef = firebaseRef;
                                console.log('Firebase auth OK');
                                deferred.resolve();
                            }
                        });
                    }, 
                    function(error){
                        deferred.reject();
                        alert('Could not connect to the backend.');
                    }
                );

            return deferred.promise;
        })();

        return this.service;
    }]);

    app.factory('friendsSearchService', ['$http', function($http){
        var serv = this;

        var serviceData = {
            searchResults: [],
        };

        this.searchUsers = function(query, page){
            $http.get('/api/users/self/friends', {
                params: {q: query, page: page},
            }).
                success(function(data){
                    serviceData.searchResults = data.users;
                }).
                error(function(data){
                    alert('Couldn\'t search!');
                });
        };

        return {
            searchUsers: this.searchUsers,
        };
    }]);
})();