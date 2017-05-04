angular.module('app')
    .controller('LoginCtrl', ['$scope', '$state', 'principal', function($scope, $state, principal) {
        $scope.user = {
            username: '',
            password: '',
            keepSignedIn: false
        };
        $scope.errLogin = false;
        $scope.signin = function() {
            // call authentication factory
            principal.authenticate($scope.user)
            .then(function(data){
                //Handle empty token
                $state.go(data.default_menu.state)
            },
            function(error){
                //Reject Promise for invalid user
                //Go To login page
                $scope.errLogin = true;
                $scope.errMessage = 'Invalid username or password'
            });
        };
    }
])
