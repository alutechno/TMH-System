
angular.module('app')
    .controller('LoginCtrl', ['$scope', '$state', 'principal', function($scope, $state, principal) {
        $scope.user = {
            username: '',
            password: '',
            keepSignedIn: false
        };
        $scope.signin = function() {
            // call authentication factory
            console.log('LoginCtrl:'+JSON.stringify($scope.user))
            principal.authenticate($scope.user)
            .then(function(data){
                console.log('LoginCtrl:'+JSON.stringify(data))
                //Handle empty token
                $state.go('app.dashboard')
            },
            function(error){
                //Reject Promise for invalid user
                //Go To login page
                console.log(error)    
            });
            
            //if ($scope.returnToState) $state.go($scope.returnToState.name, $scope.returnToStateParams);
            //else $state.go('app.dashboard');
        };
        
    }
])