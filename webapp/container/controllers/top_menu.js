angular.module('app')
.controller('TopMenuCtrl', ['$scope', '$rootScope', 'principal', function($scope, $rootScope, principal) {
    $scope.showMenu = {}
    var vModule = principal.getModule();
    for (var i=0;i<vModule.length;i++){
        $scope.showMenu[vModule[i]] = false
    }
    $scope.$watch('$root.currentModule', function(val) {
        if (val){
            for (var key in $scope.showMenu){
                if (key == val) $scope.showMenu[key] = true
                else $scope.showMenu[key] = false
            }
        }


    });


}
])
