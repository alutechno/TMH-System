
var userController = angular.module('app', ['ui.select']);
userController
.controller('UserCtrl',
function($scope, $state, $sce, roleService, queryService,userService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.focusinControl = {};
    $scope.fileName = "List User";
    $scope.exportExcel = function(){
        var sqlstr = 'select a.password,a.name as username, full_name as fullname, b.name as roles, a.id , GROUP_CONCAT(b.id) as rolesid '+
        'from user a, role b, role_user c '+
        'where a.id = c.user_id '+
        'and b.id = c.role_id ' +
        ' group by a.name ';

        queryService.post('select username,fullname,roles from('+sqlstr+')aa',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["User Name", "Full Name", "Roles"]);
            //Data
            for(var i=0;i<data.data.length;i++){
                var arr = []
                for (var key in data.data[i]){
                    arr.push(data.data[i][key])
                }
                $scope.exportData.push(arr)
            }
            $scope.focusinControl.downloadExcel()
        })
    }

    $scope.roles = []
    $scope.users = []
    $scope.rolesFilter = []
    $scope.id = '';
    $scope.user = {
        id: '',
        username: '',
        fullname: '',
        password: '',
        roles: '',
        mobile: '',
        email: '',
        default_menu: '',
        default_module: ''
    }
    $scope.modules = []
    $scope.menus = []
    $scope.selected= {
        //department: {selected:{}},
        module: {selected:{}},
        menu: {selected:{}}
    }
    $scope.filterVal = {
        search: '',
        role: {
            selected: { id: '', name: 'Select Role..'}
        }
    }


    roleService.getRole()
    .then(function(data){
        console.log(data)
        $scope.roles = data.data
        $scope.rolesFilter = data.data
    })

    $scope.setRolesFilter = function(a){
        $scope.filter.role = a
    }

    $scope.getModule = function(){
        console.log($scope.role.selected)
        var rid = []
        for (var i=0;i<$scope.role.selected.length;i++){
            rid.push($scope.role.selected[i].id)
        }
        var qStrModule = 'select e.id, e.name '+
            'from user a, role_user b, role_menu c, menu f, group_menu d, module e '+
            'where a.id = b.user_id '+
            'and b.role_id = c.role_id '+
            'and c.menu_id = f.id '+
            'and f.group_id = d.id '+
            'and d.module_id = e.id '+
            'and b.role_id in('+rid.join(',')+') '+
            //'and a.name = \''+$localStorage.currentUser.name.name+'\' '+
            'group by e.id, e.name order by e.name asc'
        console.log(qStrModule)
        queryService.get(qStrModule,undefined)
        .then(function(result){
            $scope.modules = result.data
            console.log($scope.user.default_module)
            console.log($scope.modules)
            if ($scope.user.default_module == undefined || $scope.user.default_module.length==0){
                console.log('aaa')
                $scope.selected.module['selected'] = $scope.modules[0]
            }
            else {
                console.log('bbb:'+$scope.user.default_module)
                for (var i=0;i<$scope.modules.length;i++){
                    if ($scope.user.default_module == $scope.modules[i].id){
                        console.log('ketemu')
                        $scope.selected.module['selected'] = $scope.modules[i]
                        $scope.getMenu($scope.selected.module['selected'].id,$scope.user.default_menu)
                    }
                }
            }
            console.log($scope.selected.module['selected'] )
        },function(err){
            console.log(err)
        })
    }



    $scope.getMenu = function(module_id,menu_id){
        console.log(module_id)
        console.log(menu_id)
        var rid = []
        for (var i=0;i<$scope.role.selected.length;i++){
            rid.push($scope.role.selected[i].id)
        }
        var qStrMenu = 'select f.id,concat(d.name,\' - \',f.name) as name '+
            'from user a, role_user b, role_menu c, menu f, group_menu d, module e '+
            'where a.id = b.user_id '+
            'and b.role_id = c.role_id '+
            'and c.menu_id = f.id '+
            'and f.group_id = d.id '+
            'and d.module_id = e.id '+
            'and parent > 0 '+
            'and e.id = '+ module_id + ' ' +
            'and b.role_id in('+rid.join(',')+') '+
            //'and a.name = \''+$localStorage.currentUser.name.name+'\' '+
            'group by f.id, f.name,d.name order by d.name,f.name'
            console.log(qStrMenu)

        queryService.get(qStrMenu,undefined)
        .then(function(result){
            $scope.menus = result.data
            if (menu_id!=undefined){
                for (var i=0;i<$scope.menus.length;i++){
                    if($scope.menus[i].id==menu_id){
                        $scope.selected.menu.selected = {id:$scope.menus[i].id,name:$scope.menus[i].name}
                        break
                    }
                }
            }
            else $scope.selected.menu.selected = {id:$scope.menus[0].id,name:$scope.menus[0].name}
        },function(err){
            console.log(err)
        })
    }

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        console.log(data)
        $scope.users[data.id] = data;
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(\'' + data + '\')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(\'' + data + '\')" )">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';
            }
            html += '</div>'
        }
        return html
    }

    $scope.createdRow = function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/api/getUsers',
        type: 'GET',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.customSearch = $scope.filterVal.search;
            data.customRole = $scope.filterVal.role.selected['id'];
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

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '15%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('username').withTitle('User Name'),
        DTColumnBuilder.newColumn('fullname').withTitle('Full Name'),
        DTColumnBuilder.newColumn('roles').withTitle('Roles')
    );


    $scope.dtParam = function(aoData){
        aoData.push({name: "includeUsuallyIgnored", value: "includeUsuallyIgnored"});
    }

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }
        else {
            $scope.dtInstance.reloadData(function(obj){
                console.log(obj)
            }, false)
        }
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
        console.log($scope.user)
        if ($scope.user.id.length==0){
            //exec creation
            $scope.user.roles = ''
            var r = []
            for (var i=0;i<$scope.role.selected.length;i++){
                r.push($scope.role.selected[i].id)
            }
            $scope.user.roles = r.toString()
            $scope.user.default_module = $scope.selected.module.selected.id
            $scope.user.default_menu = $scope.selected.menu.selected.id
            userService.createUser($scope.user)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Insert')
                    $('#form-input').modal('hide')
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
            var arrRole = []
            for (var i=0;i<$scope.role.selected.length;i++){
                arrRole.push($scope.role.selected[i].id)
            }
            $scope.user.rolesid = arrRole.toString()
            userService.updateUser($scope.user)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Update')
                    $('#form-input').modal('hide')
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
        console.log(obj)
        $('#form-input').modal('show');
        userService.getUser(obj)
        .then(function(result){
            console.log(result)
            $scope.user = result.data.data[0]
            $scope.role.selected = []
            $scope.roles = []
            roleService.getRole()
            .then(function(data){
                console.log(data)
                $scope.roles = data.data
                var xx = []
                for (var i=0;i<result.data.data[0].roles.split(',').length;i++){
                    xx.push({
                        id:result.data.data[0].rolesid.split(',')[i],
                        name:result.data.data[0].roles.split(',')[i]
                    })
                }
                console.log(xx)
                $scope.role.selected = xx
                $scope.getModule();
            })

        })
    }

    $scope.delete = function(obj){
        $scope.user.id = obj;

        userService.getUser(obj)
        .then(function(result){
            console.log(result)
            //$scope.user.name = obj.username;
            $scope.user = result.data.data[0]


        })
        $('#modalDelete').modal('show')
    }

    $scope.execDelete = function(){
        userService.deleteUser($scope.user)
        .then(function (result){
            if (result.status = "200"){
                console.log('Success Delete')
                //Re-init $scope.user
                $scope.user = {
                    id: '',
                    username: '',
                    fullname: '',
                    password: '',
                    roles: ''
                }
                $scope.role.selected = []
                $scope.clear()
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
        $scope.user = {
            id: '',
            username: '',
            fullname: '',
            password: '',
            roles: '',
            mobile: '',
            email: '',
            default_menu: '',
            default_module: ''
        }
        $scope.role.selected = ''
        $scope.selected= {
            //department: {selected:{}},
            module: {selected:{}},
            menu: {selected:{}}
        }
        $scope.modules = []
        $scope.menus = []
    }



})
