
var roleController = angular.module('app', []);
roleController
.controller('MenuCtrl',
    function($scope, $state, $sce, menuService,
        DTOptionsBuilder, DTColumnBuilder, $compile, $localStorage) {

        $scope.id = '';
        $scope.menuData = {
            id: ''
        }
        $scope.menus = {}

        /*Authorize Element*/
        $scope.el = [];
        $scope.el = $state.current.data;
        console.log($scope.el)
        $scope.buttonCreate = false;
        $scope.buttonUpdate = false;
        $scope.buttonDelete = false;
        for (var i=0;i<$scope.el.length;i++){
            $scope[$scope.el[i]] = true;
        }

        $scope.modules = []
        $scope.groups = []
        $scope.parents = []
        $scope.menus = []
        $scope.module = {
            selected: ''
        }
        $scope.group = {
            selected: ''
        }
        $scope.parent = {
            selected: ''
        }
        $scope.menu = {
            selected: ''
        }


        menuService.getMenuModule()
        .then(function(data){
            $scope.modules = data.data
        })

        $scope.getGroupModule = function(selectItem){
            console.log('getGroupModule')
            console.log(selectItem)
            menuService.getMenuGroup(selectItem.id)
            .then(function(data){
                $scope.groups = data.data
            })
        }
        $scope.getParent = function(selectItem){
            console.log('getParent')
            console.log(selectItem)
            menuService.getMenu(undefined,selectItem.id,undefined)
            .then(function(data){
                $scope.parents = data.data
                $scope.menus = data.data
            })

        }

        /*START AD ServerSide*/
        $scope.dtInstance = {} //Use for reloadData
        $scope.actionsHtml = function(data, type, full, meta) {
            console.log($scope.el)
            console.log(data)
            $scope.menuData[data.id] = data;
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
            /*$scope.roles[data.id] = data;
            return '<button class="btn btn-warning" ng-click="update(roles[' + data.id + '])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' +
                '<button class="btn btn-danger" ng-click="delete(roles[' + data.id + '])" )"="">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';*/
        }

        $scope.createdRow = function(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
             url: '/api/getMenus',
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
            DTColumnBuilder.newColumn('module').withTitle('Module'),
            DTColumnBuilder.newColumn('group_name').withTitle('Group'),
            DTColumnBuilder.newColumn('parent').withTitle('Parent'),
            DTColumnBuilder.newColumn('name').withTitle('Name'),
            DTColumnBuilder.newColumn('state').withTitle('State'),
            DTColumnBuilder.newColumn('sequence').withTitle('Seq')

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
            if ($scope.menuData.id.length==0){
                //exec creation
                console.log('Start Create')

                var obj = $scope.menuData;
                obj['group'] = $scope.group.selected.id;
                obj['parent'] = $scope.parent.selected.id;
                obj['menu'] = $scope.menu.selected.id;
                console.log(obj)
                /*roleService.createRole($scope.role)
                .then(function (result){
                    if (result.status = "200"){
                        console.log('Success Insert')
                        $scope.dtInstance.reloadData(function(obj){
                            console.log(obj)
                        }, false)
                    }
                    else {
                        console.log('Failed Insert')
                    }
                })*/
            }
            else {
                //exec update
                console.log('Update')
                console.log($scope.menuData)
                /*roleService.updateRole($scope.role)
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
                })*/
            }
        }

        $scope.update = function(obj){
            console.log('exec Update:'+JSON.stringify(obj))
            $('#form-input').addClass('open');
            /*menuService.getMenu(obj.id)
            .then(function(result){
                console.log(JSON.stringify(result))
                $scope.menuData = result.data[0]
            })*/
        }

        $scope.delete = function(obj){
            console.log(obj)
            $scope.menuData.id = obj.id;
            $scope.menuData.name = obj.name;
            $('#modalDelete').modal('show')
        }

        $scope.execDelete = function(){
            console.log($scope.role.id)

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
            $scope.menuData = {
                id: '',
                name: ''
            }
            $scope.module = {
                selected: ''
            }
            $scope.group = {
                selected: ''
            }
            $scope.parent = {
                selected: ''
            }
            $scope.menu = {
                selected: ''
            }
        }
    }
)
