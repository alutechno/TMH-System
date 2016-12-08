
var userController = angular.module('app', ['ui.select']);
userController
.controller('UserCtrl',
function($scope, $state, $sce, roleService, userService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

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

    $scope.roles = []
    $scope.users = []
    $scope.rolesFilter = []
    $scope.id = '';
    $scope.user = {
        id: '',
        username: '',
        fullname: '',
        password: '',
        roles: ''
    }
    $scope.filterVal = {
        search: '',
        role: {
            selected: { id: '', name: 'Select Role..'}
        }
    }


    roleService.getRole()
    .then(function(data){
        $scope.roles = data.data
        $scope.rolesFilter = data.data
    })

    $scope.setRolesFilter = function(a){
        $scope.filter.role = a
    }

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.users[data.id] = data;
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(users[' + data.id + '])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(users[' + data.id + '])" )"="">' +
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
        $scope.dtColumns.push(DTColumnBuilder.newColumn('username').withTitle('Action').notSortable()
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
        if ($scope.user.id.length==0){
            //exec creation
            $scope.user.roles = ''
            var r = []
            for (var i=0;i<$scope.role.selected.length;i++){
                r.push($scope.role.selected[i].id)
            }
            $scope.user.roles = r.toString()
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
        $('#form-input').modal('show');
        userService.getUser(obj.id)
        .then(function(result){
            $scope.user = result.data.data[0]
            $scope.role.selected = []
            $scope.roles = []
            roleService.getRole()
            .then(function(data){
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
            })

        })
    }

    $scope.delete = function(obj){
        $scope.user.id = obj.id;
        $scope.user.name = obj.username;
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
            roles: ''
        }
        $scope.role.selected = ''
    }



})
