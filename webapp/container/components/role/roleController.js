
var roleController = angular.module('app', []);
roleController
.controller('RoleCtrl',
function($scope, $state, $sce, roleService,
    DTOptionsBuilder, DTColumnBuilder, $compile, $localStorage) {

        $scope.id = '';
        $scope.role = {
            id: '',
            name: ''
        }
        $scope.roles = {}

        /*Authorize Element*/
        $scope.el = [];
        $scope.el = $state.current.data;
        $scope.buttonCreate = false;
        $scope.buttonUpdate = false;
        $scope.buttonDelete = false;
        for (var i=0;i<$scope.el.length;i++){
            $scope[$scope.el[i]] = true;
        }

        /*START AD ServerSide*/
        $scope.dtInstance = {} //Use for reloadData
        $scope.actionsHtml = function(data, type, full, meta) {
            $scope.roles[data.id] = data;
            var html = ''
            if ($scope.el.length>0){
                html = '<div class="btn-group btn-group-xs">'
                if ($scope.el.indexOf('buttonUpdate')>-1){
                    html +=
                    '<button class="btn btn-default" ng-click="update(roles[' + data.id + '])">' +
                    '   <i class="fa fa-edit"></i>' +
                    '</button>&nbsp;' ;
                }
                if ($scope.el.indexOf('buttonDelete')>-1){
                    html+='<button class="btn btn-default" ng-click="delete(roles[' + data.id + '])" )"="">' +
                    '   <i class="fa fa-trash-o"></i>' +
                    '</button>';
                }
                html += '</div>'
                return html
            }
        }

        $scope.createdRow = function(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: '/api/getRoles',
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
            DTColumnBuilder.newColumn('name').withTitle('Role Name')

        ];
        if ($scope.el.length>0){
            $scope.dtColumns.push(
                DTColumnBuilder.newColumn(null).withTitle('Action').notSortable()
                .renderWith($scope.actionsHtml)
            )
        }
        /*END AD ServerSide*/

        $scope.openQuickView = function(state){
            if (state == 'add'){
                $scope.clear()
            }
            $('#form-input').addClass('open');
        }

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        $scope.submit = function(){
            if ($scope.role.id.length==0){
                //exec creation
                roleService.createRole($scope.role)
                .then(function (result){
                    if (result.status = "200"){
                        $scope.dtInstance.reloadData(function(obj){
                            console.log(obj)
                        }, false)
                    }
                    else {
                        console.log('Failed Insert')
                    }
                })
            }
            else {
                //exec update
                roleService.updateRole($scope.role)
                .then(function (result){
                    if (result.status = "200"){
                        console.log('Success Update')
                        $scope.dtInstance.reloadData(function(obj){
                            console.log(obj)
                        }, false)
                    }
                    else {
                        console.log('Failed Update')
                    }
                })
            }
        }

        $scope.update = function(obj){
            $('#form-input').addClass('open');
            roleService.getRole(obj.id)
            .then(function(result){
                console.log(JSON.stringify(result))
                $scope.role = result.data[0]
            })
        }

        $scope.delete = function(obj){
            $scope.role.id = obj.id;
            $scope.role.name = obj.name;
            $('#modalDelete').modal('show')
        }

        $scope.execDelete = function(){
            roleService.deleteRole($scope.role)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Delete')
                    //Re-init $scope.role
                    $scope.role = {
                        id: '',
                        name: ''
                    }
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                }
                else {
                    console.log('Failed Update')
                }
            })
        }

        $scope.clear = function(){
            $scope.role = {
                id: '',
                name: ''
            }
        }
    }
)
