var userController = angular.module('app', []);
userController
.controller('PosReports',
function($scope, $state, $sce, queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
	$scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;

    var qstring = `select * from mst_report_params where group_id=1 `
	var qwhere = ''

    queryService.get(qstring,undefined)
    .then(function(data){
        $scope.report = data.data
    })

    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.setActiveForm = function(a){
        $scope.activeForm = a
        for (var key in $scope.activeClass){
            $scope.activeClass[key] = ''
        }
        $scope.activeClass[a] = 'active'
        console.log($scope.activeForm)
    }

})
