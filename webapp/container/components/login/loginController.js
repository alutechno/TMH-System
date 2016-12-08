
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
            console.log('LoginCtrl:'+JSON.stringify($scope.user))
            principal.authenticate($scope.user)
            .then(function(data){
                console.log('LoginCtrl:'+JSON.stringify(data))
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
