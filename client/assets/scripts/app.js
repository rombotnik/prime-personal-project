var app = angular.module('app', ['ngMaterial'])

    .config(['$mdThemingProvider', function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('deep-purple').accentPalette('purple').dark();
}]);

app.controller('MainController', ['$scope', '$http', '$mdSidenav', '$mdUtil', function($scope, $http, $mdSidenav, $mdUtil){
    $scope.toggleLeft = buildToggler('left');

    $scope.closeLeft = function () {
        $mdSidenav('left').close()
            .then(function () {
                $log.debug("close LEFT is done");
            });
    };

    function buildToggler(navID) {
        return $mdUtil.debounce(function(){
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        },300);
    }
}]);

app.controller('PlayController', ['$scope', '$http', function($scope, $http){
    $scope.game = {};
    $scope.scene = {};
    $scope.user = {};

    $http.get('/users/me').success(function (user) {
        console.log("Logged in user: ", user);
        $scope.user = user;
    });

    $scope.getScene = function(id) {
        $http.get('/play/scene/' + id).success(function(data){
            console.log(data);
            $scope.scene = data;
        });
    };

    $scope.makeChoice = function(id) {
        $http.post('/play/choice/' + id).success(function(data){
            console.log(data);
            $scope.getScene(data.id);
        });
    };

    $scope.continue = function(choice) {
        if (choice.direct) {
            $scope.getScene(choice.id);
        }
        else {
            $scope.makeChoice(choice.id);
        }
    };

    $scope.getScene();
}]);

app.controller('EditController', ['$scope', '$http', function($scope, $http){
    $scope.scene = {};

    $scope.getScene = function(id) {
        $http.get('/edit/scene/' + id).success(function(data){
            console.log(data);
            $scope.scene = data;
        });
    };

    $scope.getScene(9);
}]);

app.controller('BrowseController', ['$scope', '$http', function($scope, $http){
    $scope.games = [];

    $scope.getGames = function() {
        $http.get('/browse/games').success(function(data){
            console.log(data);
            $scope.games = data;
        });
    };

    $scope.getGames();
}]);