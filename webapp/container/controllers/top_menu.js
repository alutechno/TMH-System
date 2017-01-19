angular.module('app')
.controller('TopMenuCtrl', ['$scope', '$rootScope', 'principal', '$localStorage', function($scope, $rootScope, principal, $localStorage) {
    $scope.showMenu = {}
    var vModule = principal.getModule();
    for (var i=0;i<vModule.length;i++){
        $scope.showMenu[vModule[i]] = false
    }
    var module = $localStorage.mediaDefault.module
    for (var key in $scope.showMenu){
        if (key == module) $scope.showMenu[key] = true
        else $scope.showMenu[key] = false
    }
    $scope.currentModule = module
    $scope.$watch('$root.currentModule', function(val) {
        if (val){
            $scope.currentModule = val
            for (var key in $scope.showMenu){
                if (key == val) $scope.showMenu[key] = true
                else $scope.showMenu[key] = false
            }
        }


    });


}
])
