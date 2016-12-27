angular.module('app')
.controller('MenuItemsCtrl', ['$scope', '$rootScope', 'principal', '$localStorage', function($scope, $rootScope, principal, $localStorage) {
    $scope.showSideMenu = {}
    var vModule = principal.getModule();
    for (var i=0;i<vModule.length;i++){
        $scope.showSideMenu[vModule[i]] = false
    }
    var module = $localStorage.mediaDefault.module
    for (var key in $scope.showSideMenu){
        if (key == module) $scope.showSideMenu[key] = true
        else $scope.showSideMenu[key] = false
    }
    $scope.$watch('$root.currentModule', function(val) {
        if (val){
            for (var key in $scope.showSideMenu){
                if (key == val) $scope.showSideMenu[key] = true
                else $scope.showSideMenu[key] = false
            }
        }


    });


}
])
