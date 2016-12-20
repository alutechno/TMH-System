
var userController = angular.module('app', []);
userController
.controller('UserProfileCtrl',
function($scope, $state, $sce, profileService, queryService, $localStorage, $compile, $rootScope, API_URL) {
    $scope.user = {
        name: '',
        full_name: '',
        password: '',
        department_id: '',
        default_module: '',
        default_menu: ''
    }
    $scope.departments = []
    $scope.modules = []
    $scope.menus = []
    $scope.selected= {
        department: {selected:{}},
        module: {selected:{}},
        menu: {selected:{}}
    }
    $scope.dz
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };
    var qstring = 'select a.id, a.name, a.full_name, a.password, a.image,a.mobile,a.email, a.department_id, b.name as department_name, '+
        	'a.default_module, c.name as module_name, a.default_menu, d.name as menu_name '+
        'from user a, mst_department b, module c, menu d '+
        'where a.department_id = b.id '+
        'and a.default_module = c.id '+
        'and a.default_menu = d.id '+
        'and a.name = \''+$localStorage.currentUser.name.name + '\''

    queryService.get(qstring,undefined)
    .then(function(result){
        $scope.user = result.data[0]
        $scope.selected.department.selected = {id:result.data[0].department_id,name:result.data[0].department_name}
        $scope.selected.module.selected = {id:result.data[0].default_module,name:result.data[0].module_name}
        $scope.getMenu(result.data[0].default_module,result.data[0].default_menu)
    },function(err){
        $('body').pgNotification({
            style: 'flip',
            message: 'Failed Fetch Data: '+err.code,
            position: 'top-right',
            timeout: 2000,
            type: 'danger'
        }).show();
    })

    queryService.get('select id, name from mst_department order by name asc',undefined)
    .then(function(result){
        $scope.departments = result.data
    },function(err){
        console.log(err)
    })
    var qStrModule = 'select e.id, e.name '+
        'from user a, role_user b, role_menu c, menu f, group_menu d, module e '+
        'where a.id = b.user_id '+
        'and b.id = c.role_id '+
        'and c.menu_id = f.id '+
        'and f.group_id = d.id '+
        'and d.module_id = e.id '+
        'and a.name = \''+$localStorage.currentUser.name.name+'\' '+
        'group by e.id, e.name order by e.name asc'
    queryService.get(qStrModule,undefined)
    .then(function(result){
        $scope.modules = result.data
    },function(err){
        console.log(err)
    })

    $scope.getMenu = function(module_id,menu_id){
        console.log(module_id)
        console.log(menu_id)
        var qStrMenu = 'select f.id,concat(d.name,\' - \',f.name) as name '+
            'from user a, role_user b, role_menu c, menu f, group_menu d, module e '+
            'where a.id = b.user_id '+
            'and b.id = c.role_id '+
            'and c.menu_id = f.id '+
            'and f.group_id = d.id '+
            'and d.module_id = e.id '+
            'and parent > 0 '+
            'and e.id = '+ module_id + ' ' +
            'and a.name = \''+$localStorage.currentUser.name.name+'\' '+
            'group by f.id, f.name,d.name order by d.name,f.name'
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

    $scope.dropzoneConfigImage = {
        parallelUploads: 1,
        maxFileSize: 10,
        url: '/upload',
        paramName: 'image',
        autoProcessQueue : true
    };
    $scope.dzCallbacks = {
        'addedfile' : function(file){
            console.log(file);
        },
        'success' : function(file, xhr){
            $scope.user.image = xhr.pth
            $scope.$apply();

        }
    };
    $scope.submit = function(){
        profileService.save($scope.user)
        .then(function (result){
            $('body').pgNotification({
                style: 'flip',
                message: 'Successfully Update Your Profile ',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
        },
        function (err){
            $('#body').pgNotification({
                style: 'flip',
                message: 'Error Update: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }
})
