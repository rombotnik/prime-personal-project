var app = angular.module('app', []);

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
        $http.post('/play/choice/' + (id || '')).success(function(data){
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