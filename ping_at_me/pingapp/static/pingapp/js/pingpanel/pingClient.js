(function(){
    var app = angular.module('pingClient', ['firebase']);

    app.directive('pingOutbox', function(){
        return {
            restrict: 'E',
            templateUrl: '/static/pingapp/html/pingoutbox.html',
            controller: 'pingOutboxController',
            controllerAs: 'pingOutboxCtrl',
        };
    });

    app.directive('pingInbox', function(){
        return {
            restrict: 'E',
            templateUrl: '/static/pingapp/html/pinginbox.html',
            controller: 'pingInboxController',
            controllerAs: 'pingInboxCtrl',
        };
    });

    app.controller('pingInboxController', ['pingInbox', 'pingOutbox', function(pingInbox, pingOutbox){
        var ctrl = this;

        this.inboxData = pingInbox.inboxData;

        this.selectedPing = null;

        this.gmap = null;

        ctrl.msnry = null;

        this.initMap = function(){
            ctrl.gmap = new GMaps({
                div: '#pingInboxLocationMap',
                lng: -121.754824,
                lat: 38.537095,
                disableDefaultUI: true,
                zoomControl: true,
                panControl: true,
                streetViewControl: true,
            });
        };

        this.selectPing = function(ping){
            ctrl.selectedPing = ping;
            ctrl.changeLocation(ping.longitude, ping.latitude);
        };

        this.deletePing = function(ping){
            pingInbox.deletePing(ping);
        };

        this.replyPing = function(ping){
            pingOutbox.addRecipient(ping.sender);
        };

        this.changeLocation = function(longitude, latitude){
            ctrl.gmap.removeMarkers();
            ctrl.gmap.setCenter(latitude, longitude);
            ctrl.gmap.addMarker({
                lng: longitude,
                lat: latitude,
            });
        };
    }]);

    app.controller('pingOutboxController', ['pingOutbox', 'friendsSearchService', 'locatorService', function(pingOutbox, friendsSearchService, locatorService){
        var ctrl = this;

        this.pending = false;

        this.sendPingMessage = null;
        this.sendPingSuccess = null;

        this.friendsSearchServiceData = friendsSearchService.serviceData;
        this.outboxData = pingOutbox.outboxData;

        this.searchQuery = '';
        this.page = 0;

        this.gmap = null;

        this.searchUsers = function(){
            friendsSearchService.searchUsers(ctrl.searchQuery, ctrl.page);
        }

        this.prevUsers = function(){
            ctrl.page = ((ctrl.page > 0) ? ctrl.page - 1 : ctrl.page);
            friendsSearchService.searchUsers(ctrl.searchQuery, ctrl.page);
        }

        this.nextUsers = function(){
            ctrl.page = ((ctrl.serviceData.remainingCount > 0) ? ctrl.page + 1 : ctrl.page);
            friendsSearchService.searchUsers(ctrl.searchQuery, ctrl.page);
        }

        this.addRecipient = function(friend){
            pingOutbox.addRecipient(friend);
        }

        this.removeRecipient = function(friend){
            pingOutbox.removeRecipient(friend);
        }

        this.displayLocation = function(){
            ctrl.gmap = new GMaps({
                div: '#currentLocationMap',
                lng: pingOutbox.outboxData.longitude,
                lat: pingOutbox.outboxData.latitude,
                disableDefaultUI: true,
                zoomControl: true,
                panControl: true,
                streetViewControl: true,
            });

            ctrl.gmap.addMarker({
                lng: pingOutbox.outboxData.longitude,
                lat: pingOutbox.outboxData.latitude,
            });
        };

        this.updateLocation = function(){
            locatorService.updateLocation(function(position){
                pingOutbox.outboxData.longitude = position.coords.longitude;
                pingOutbox.outboxData.latitude = position.coords.latitude;
                ctrl.displayLocation();
            }, function(error){
                alert('Could not get geolocation');
            });
        };

        this.checkValid = function(){
            return (pingOutbox.outboxData.longitude !== null) && (pingOutbox.outboxData.latitude !== null) && (pingOutbox.outboxData.recipients.length) && (!ctrl.pending);
        };

        this.sendPing = function(){
            if (ctrl.checkValid()) {
                ctrl.pending = true;
                ctrl.sendPingSuccess = null;
                pingOutbox.sendPing(pingOutbox.outboxData).
                    success(function(data){
                        pingOutbox.outboxData.message = '';
                        pingOutbox.outboxData.recipients = [];
                        ctrl.pending = false;
                        ctrl.sendPingMessage = "ping sent!";
                        ctrl.sendPingSuccess = true;
                    }).
                    error(function(data){
                        ctrl.pending = false;
                        ctrl.sendPingMessage = "could not send ping.";
                        ctrl.sendPingSuccess = false;
                    });
            }
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

        this.outboxData = {
            longitude: null,
            latitude: null,
            message: '',
            recipients: [],
        };

        this.addRecipient = function(friend){
            if (serv.outboxData.recipients.indexOf(friend) == -1) serv.outboxData.recipients.push(friend);
        }

        this.removeRecipient = function(friend){
            recipients = serv.outboxData.recipients;
            if ((index = recipients.indexOf(friend)) > -1) recipients.splice(index, 1);
        }

        this.sendPing = function(outboxData) {
            return $http.post('/api/ping/outbox', {
                longitude: outboxData.longitude,
                latitude: outboxData.latitude,
                message: outboxData.message,
                recipients: outboxData.recipients.map(function(friend){ return friend.id }),
            });
        };

        return {
            outboxData: this.outboxData,
            addRecipient: this.addRecipient,
            removeRecipient: this.removeRecipient,
            sendPing: this.sendPing,
        };
    }]);

    app.factory('pingInbox', ['$firebase', 'firebaseService', function($firebase, firebaseService){
        var serv = this;

        this.inboxData = {
            inbox: [],
        };

        firebaseService.initPromise.then(function(){            
            inboxRefSync = $firebase(firebaseService.firebaseRef.child('pingInbox/' + firebaseService.userId.toString()));
            serv.inboxData.inbox = inboxRefSync.$asArray();
        });

        this.deletePing = function(ping) {
            serv.inboxData.inbox.$remove(ping);
        }

        return {
            inboxData: this.inboxData,
            deletePing: this.deletePing,
        };
    }]);

    app.factory('firebaseService', ['$http', '$q', function($http, $q){
        var serv = this;

        this.service = {
            'firebaseRef': null,
            'userId': null,
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
                        serv.service.userId = response[1].data.userId;
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

        this.serviceData = {
            searchResults: [],
            remainingCount: null,
        };

        this.searchUsers = function(query, page){
            $http.get('/api/users/self/friends', {
                params: {q: query, page: page},
            }).
                success(function(data){
                    serv.serviceData.searchResults = data.users;
                    serv.serviceData.remainingCount = data.remaining_count;
                }).
                error(function(data){
                    alert('Couldn\'t search!');
                });
        };

        return {
            searchUsers: this.searchUsers,
            serviceData: this.serviceData,
        };
    }]);
})();