
var roleController = angular.module('app', []);
roleController
.controller('RoleCtrl',
function($scope, $state, $sce, roleService,
    DTOptionsBuilder, DTColumnBuilder, $compile, $localStorage, API_URL) {

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
            url: API_URL+'/api/getRoles',
            type: 'GET',
            headers: {
                "authorization":  'Basic ' + $localStorage.mediaToken
            }
        })
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('bLengthChange', false)
        .withOption('bFilter', false)
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
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
            $('#form-input').modal('show')
        }

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        $scope.submit = function(){
            if ($scope.role.id.length==0){
                //exec creation
                roleService.createRole($scope.role)
                .then(function (result){
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert '+$scope.role.name,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();

                },
                function (err){
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Insert: '+err.desc.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            }
            else {
                //exec update
                roleService.updateRole($scope.role)
                .then(function (result){
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Update '+$scope.role.name,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();

                },
                function (err){
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Insert: '+err.desc.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            }
        }

        $scope.update = function(obj){
            $('#form-input').modal('show')
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
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Delete '+$scope.role.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.role = {
                        id: '',
                        name: ''
                    }

            },
            function (err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.desc.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
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
