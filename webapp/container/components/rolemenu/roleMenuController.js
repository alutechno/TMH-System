angular.module('app', [])
.controller('RoleMenuCtrl',
    function($scope, $state, $sce, roleService,
        DTOptionsBuilder, DTColumnBuilder, $compile, $localStorage) {

        /*Authorize Element*/
        $scope.el = [];
        $scope.el = $state.current.data;
        $scope.buttonAssign = false;
        for (var i=0;i<$scope.el.length;i++){
            $scope[$scope.el[i]] = true;
        }

        /*START AD ServerSide*/
        $scope.dtInstance = {} //Use for reloadData
        $scope.actionsHtml = function(data, type, full, meta) {
            $scope.roles[data.id] = data;
            return '<button class="btn btn-warning" ng-click="update(roles[' + data.id + '])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' +
                '<button class="btn btn-danger" ng-click="delete(roles[' + data.id + '])" )"="">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';
        }

        $scope.createdRow = function(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
             url: '/api/getRoleMenus',
             type: 'GET',
             headers: {
                "authorization":  'Basic ' + $localStorage.mediaToken
            }
         })
         .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withPaginationType('full_numbers')
            .withOption('createdRow', $scope.createdRow);
        $scope.dtColumns = [
            DTColumnBuilder.newColumn('menuname').withTitle('Menu'),
            DTColumnBuilder.newColumn('module').withTitle('Module'),
            DTColumnBuilder.newColumn('name').withTitle('Role Name'),
            DTColumnBuilder.newColumn(null).withTitle('Action').notSortable()
                .renderWith($scope.actionsHtml)
        ];
        /*END AD ServerSide*/

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };
    }
)
