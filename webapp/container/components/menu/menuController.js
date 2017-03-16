
var roleController = angular.module('app', []);
roleController
.controller('MenuCtrl',
    function($scope, $state, $sce, menuService,
        DTOptionsBuilder, DTColumnBuilder, $compile, $localStorage, API_URL) {

        $scope.sideMenu = {
            main: true,
            detail: false
        }
        $scope.setMenu = function(m){
            $scope.sideMenu = {
                main: (m=='main'?true:false),
                detail: (m=='detail'?true:false)
            }
        }
        $scope.id = '';
        $scope.menuData = {
            id: ''
        }
        $scope.menuDatas = []
        $scope.menus = {}

        /*Authorize Element*/
        $scope.el = [];
        $scope.el = $state.current.data;
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
            menuService.getMenuGroup(selectItem.id)
            .then(function(data){
                $scope.groups = data.data
            })
        }
        $scope.getParent = function(selectItem){
            menuService.getMenu(undefined,selectItem.id,undefined)
            .then(function(data){
                $scope.parents = data.data
                $scope.menus = data.data
            })
        }

        /*START AD ServerSide*/
        $scope.dtInstance = {} //Use for reloadData
        $scope.actionsHtml = function(data, type, full, meta) {
            $scope.menuDatas[data.id] = data;
            var html = ''
            if ($scope.el.length>0){
                html = '<div class="btn-group btn-group-xs">'
                if ($scope.el.indexOf('buttonUpdate')>-1){
                    html +=
                        '<button class="btn btn-default" ng-click="update(menuDatas[' + data.id + '])">' +
                        '   <i class="fa fa-edit"></i>' +
                        '</button>&nbsp;' ;
                }
                if ($scope.el.indexOf('buttonDelete')>-1){
                    html+='<button class="btn btn-default" ng-click="delete(menuDatas[' + data.id + '])" )"="">' +
                    '   <i class="fa fa-trash-o"></i>' +
                    '</button>';
                }
                html += '</div>'
                return html
            }
        }

        $scope.createdRow = function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
             url: API_URL+'/api/getMenus',
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
            $('#form-input').modal('show')
        }

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        $scope.submit = function(){
            if ($scope.menuData.id.length==0){
                //exec creation
                var obj = $scope.menuData;
                obj['group'] = $scope.group.selected.id;
                obj['parent'] = $scope.parent.selected.id;
                //obj['menu'] = $scope.menu.selected.id;
                menuService.createMenu(obj)
                .then(function (result){
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert '+$scope.menuData.menu,
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
                menuService.updateMenu($scope.menuData)
                .then(function (result){
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Update '+$scope.menuData.menu,
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
            $scope.menuData = obj
            $scope.menuData['menu'] = obj.name
            $scope.module.selected = {
                id: obj.module_id,
                name: obj.module,
                description: obj.module_desc
            }
            $scope.group.selected = {
                id: obj.group_id,
                name: obj.group_name
            }
            $scope.parent.selected = {
                id: obj.parent_id,
                name: obj.parent
            }
        }

        $scope.delete = function(obj){
            console.log(obj)
            $scope.menuData.id = obj.id;
            $scope.menuData.name = obj.name;
            $('#modalDelete').modal('show')
        }

        $scope.execDelete = function(){
            menuService.deleteMenu($scope.menuData)
            .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.menuData.menu,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.menuData = {
                    id: '',
                    name: '',
                    state: '',
                    sequence: ''
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
.controller('MenuDetailCtrl',
    function($scope, $state, $sce, menuService,
        DTOptionsBuilder, DTColumnBuilder, $compile, $localStorage,API_URL) {
        $scope.sideMenu = {
            main: true,
            detail: false
        }
        $scope.setMenu = function(m){
            $scope.sideMenu = {
                main: (m=='main'?true:false),
                detail: (m=='detail'?true:false)
            }
        }
        $scope.id = '';
        $scope.menuData = {
            id: ''
        }
        $scope.menuDatas = []
        $scope.menus = {}

        /*Authorize Element*/
        $scope.el = [];
        $scope.el = $state.current.data;
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
            menuService.getMenuGroup(selectItem.id)
            .then(function(data){
                $scope.groups = data.data
            })
        }
        $scope.getParent = function(selectItem){
            menuService.getMenu(undefined,selectItem.id,undefined)
            .then(function(data){
                $scope.parents = data.data
                $scope.menus = data.data
            })
        }

        /*START AD ServerSide*/
        $scope.dtInstance = {} //Use for reloadData
        $scope.actionsHtml = function(data, type, full, meta) {
            $scope.menuDatas[data.id] = data;
            var html = ''
            if ($scope.el.length>0){
                html = '<div class="btn-group btn-group-xs">'
                if ($scope.el.indexOf('buttonUpdate')>-1){
                    html +=
                        '<button class="btn btn-default" ng-click="update(menuDatas[' + data.id + '])">' +
                        '   <i class="fa fa-edit"></i>' +
                        '</button>&nbsp;' ;
                }
                if ($scope.el.indexOf('buttonDelete')>-1){
                    html+='<button class="btn btn-default" ng-click="delete(menuDatas[' + data.id + '])" )"="">' +
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
             url: API_URL+'/api/getMenus',
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
                var obj = $scope.menuData;
                obj['group'] = $scope.group.selected.id;
                obj['parent'] = $scope.parent.selected.id;
                //obj['menu'] = $scope.menu.selected.id;
                menuService.createMenu(obj)
                .then(function (result){
                    if (result.status = "200"){
                        $scope.dtInstance.reloadData(function(obj){
                        }, false)
                    }
                    else {
                        console.log('Failed Insert')
                    }
                })
            }
            else {
                menuService.updateMenu($scope.menuData)
                .then(function (result){
                    if (result.status = "200"){
                        $scope.dtInstance.reloadData(function(obj){
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
            $scope.menuData = obj
            $scope.menuData['menu'] = obj.name
            $scope.module.selected = {
                id: obj.module_id,
                name: obj.module,
                description: obj.module_desc
            }
            $scope.group.selected = {
                id: obj.group_id,
                name: obj.group_name
            }
            $scope.parent.selected = {
                id: obj.parent_id,
                name: obj.parent
            }
        }

        $scope.delete = function(obj){
            $scope.menuData.id = obj.id;
            $scope.menuData.name = obj.name;
            $('#modalDelete').modal('show')
        }

        $scope.execDelete = function(){
            menuService.deleteMenu($scope.menuData)
            .then(function (result){
                if (result.status = "200"){
                    //Re-init $scope.role
                    $scope.menuData = {
                        id: '',
                        name: '',
                        state: '',
                        sequence: ''
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
