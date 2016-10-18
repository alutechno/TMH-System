angular.module('app', [])
.controller('MenuCtrl',
    function($scope, $state, $sce, menuService,
        DTOptionsBuilder, DTColumnBuilder, $compile, $localStorage) {

        $scope.id = '';
        $scope.menu = {
            id: '',
            name: ''
        }
        $scope.menus = {}

        $scope.modules = [
        {
            name: 'GENERAL',
            description: 'General Module'
        },
        {
            name: 'USERMGT',
            description: 'User and Role Management'
        },
        {
            name: 'FO',
            description: 'Front Office'
        },
        {
            name: 'INV',
            description: 'Inventory'
        },
        {
            name: 'ACC',
            description: 'Finance and Accounting'
        }]

        $scope.module = {
            selected: {
                name: '',
                description: ''
            }
        }

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
            $scope.menus[data.id] = data;
            return '<button class="btn btn-warning" ng-click="update(menus[' + data.id + '])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' +
                '<button class="btn btn-danger" ng-click="delete(menus[' + data.id + '])" )"="">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';
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
            DTColumnBuilder.newColumn('name').withTitle('Name'),
            DTColumnBuilder.newColumn('state').withTitle('State'),
            DTColumnBuilder.newColumn('module').withTitle('Module'),
            DTColumnBuilder.newColumn(null).withTitle('Action').notSortable()
                .renderWith($scope.actionsHtml)
        ];
        /*END AD ServerSide*/

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        $scope.submit = function(){
            if ($scope.menu.id.length==0){
                //exec creation
                console.log('Start Create')
                console.log($scope.menu)
                console.log($scope.modules)
                console.log($scope.module)
                menuService.createMenu($scope.menu)
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
                })
            }
            else {
                //exec update
                $scope.menu.module = $scope.module.selected['name']
                menuService.updateMenu($scope.menu)
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
            console.log('exec Update:'+JSON.stringify(obj))
            $scope.module.selected = {}
            menuService.getMenu(obj.id)
            .then(function(result){
                console.log(JSON.stringify(result))
                console.log(result.data[0].module)
                $scope.menu = result.data[0]
                $scope.module.selected['name'] = result.data[0].module
                for (var i=0;i<$scope.modules.length;i++){
                    if ($scope.modules[i].name == result.data[0].module){
                        $scope.module.selected['description'] = $scope.modules[i].description
                    }
                }

            })
        }

        $scope.delete = function(obj){
            console.log(obj)
            $scope.menu.id = obj.id;
            $scope.menu.name = obj.name;
            $('#modalDelete').modal('show')
        }

        $scope.execDelete = function(){
            console.log($scope.menu.id)

            menuService.deleteMenu($scope.menu)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Delete')
                    //Re-init $scope.role
                    $scope.menu = {
                        id: '',
                        name: '',
                        state: '',
                        module: ''
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
    }
)
