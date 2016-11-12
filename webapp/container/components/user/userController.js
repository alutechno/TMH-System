
var userController = angular.module('app', []);
userController
.controller('UserCtrl',
function($scope, $state, $sce, roleService, userService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []

    $scope.filter = function(event) {
        table.dataTable().fnFilter($(event.currentTarget).val());
    }

    $scope.role = {
        selected: []
    };

    $scope.roles = []
    $scope.id = '';
    $scope.user = {
        id: '',
        username: '',
        fullname: '',
        password: '',
        roles: ''
    }

    roleService.getRole()
    .then(function(data){
        $scope.roles = data.data
    })

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
        }
        return html
    }

    $scope.createdRow = function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: '/api/getUsers',
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
        DTColumnBuilder.newColumn('username').withTitle('User Name'),
        DTColumnBuilder.newColumn('fullname').withTitle('Full Name'),
        DTColumnBuilder.newColumn('roles').withTitle('Roles')

    ];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn(null).withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml))
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
        userService.getUsers(obj.id)
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

    //Handle DataTables
    /*$scope.col = 'username,fullname,rolename';
    var html =
    '<table class="table " id="detail-tables">' +
    '<thead>' +
    '<tr>'
    for (var i in $scope.col.split(',')) {
    html += '<th>'+$scope.col.split(',')[i]+'</th>'
}
html +='<th style="width:1%">'+
'<button class="btn" ng-click="delete()"><i class="pg-trash"></i>'+
'</button>'+
'</th>';
html += '</tr></thead><tbody></tbody></table>'
$('#tableData' ).html(html);
$scope.requery = function() {
//console.log('button click+' + $scope.startDate + ' until '+$scope.endDate)
//$scope.f = $.Query.search_collect($scope.col,$scope.startDate,$scope.endDate,$scope.msisdn)
buildTable()
}

//$scope.f = $.Query.search_collect($scope.col,$scope.startDate,$scope.endDate,$scope.msisdn)
buildTable()*/

function buildTable(){
    console.log($scope.f)
    $scope.table = $('#detail-tables').dataTable();
    try {
        $scope.table.fnDestroy()
        $scope.table = $('#detail-tables').dataTable({
            "processing": true,
            "serverSide": true,
            "searching": false,
            "scrollY": "500px",
            "scrollX": true,
            "scrollCollapse": true,
            "bLengthChange" : false,
            "columnDefs": [],
            //"fixedColumns": true,

            "ajax": {
                type : "POST",
                url : "http://localhost:3000/getUsers",
                contentType: 'application/json; charset=UTF-8',
                headers : {
                    'Content-Type': 'application/json'
                },
                "data": function ( d ) {
                    console.log(d)
                    //d = {}
                    return JSON.stringify( d );
                },
                dataType : "json",
            }
        });
    } catch(e) {
        console.log(e);
    }
}
}
)
