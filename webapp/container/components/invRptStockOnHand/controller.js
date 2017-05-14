
var userController = angular.module('app', []);
userController
.controller('InvRptStockOnHand',
function($scope, $state, $sce, globalFunction,BIRT_URL) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    $scope.filter = {
        period: globalFunction.currentDate().split(' ')[0]
    }
    $scope.setFilter = function(){
        var param = []
        for (var key in $scope.filter){
            param.push(key+'='+$scope.filter[key])
        }
        $scope.urlReport = $sce.trustAsResourceUrl(BIRT_URL+'/frameset?__report=report/inv/stockOnHand.rptdesign&'+param.join('&'))
    }
    $scope.setFilter()

})
