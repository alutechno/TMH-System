
angular.module('app')
    .controller('DashboardCtrl', ['$scope', '$state', 'principal', function($scope, $state, principal) {
        $scope.el = [];
        $scope.el = $state.current.data;
        console.log($scope.el)
        $scope.buttonCreate = false;
        $scope.buttonUpdate = false;
        $scope.buttonDelete = false;
        for (var i=0;i<$scope.el.length;i++){
            $scope[$scope.el[i]] = true;
        }


        console.log('DashboardCtrl')
        console.log(principal)
        console.log($state)
        console.log($state.current)
        console.log($state.current.data)

        $scope.create = function(){
            console.log('exec Create')
        }

        $scope.update = function(){
            console.log('exec Update')
        }

        $scope.delete = function(){
            console.log('exec Delete')
        }
    }
])
