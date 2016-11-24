
var roleController = angular.module('app', []);
roleController
.controller('RoleMenuCtrl',
function($scope, $state, $sce, roleService, menuService, roleMenuService,
    DTOptionsBuilder, DTColumnBuilder, $compile, $localStorage, API_URL) {
        $scope.id = '';
        /*Authorize Element*/
        $scope.el = [];
        $scope.el = $state.current.data;
        $scope.buttonCreate = false;
        $scope.buttonUpdate = false;
        $scope.buttonDelete = false;
        for (var i=0;i<$scope.el.length;i++){
            $scope[$scope.el[i]] = true;
        }

        $scope.roles = []
        $scope.role = {selected: ''}
        $scope.modules = []
        $scope.module = {selected: ''}
        $scope.tb = {isShow: false}
        $scope.listView = {}

        roleService.getRole()
        .then(function(data){
            $scope.roles = data.data
        })

        menuService.getMenuModule()
        .then(function(data){
            $scope.modules = data.data
        })

        $scope.searchRoleMenu = function(){
            if ($scope.role.selected.id && $scope.module.selected.id){
                $scope.runAd();
            }
        }

        $scope.runAd = function(){
            /*START AD ServerSide*/
            $scope.tb = {isShow: true}
            $scope.menuSelected = []
            $scope.accessSelected = []
            $scope.dtInstance = {} //Use for reloadData

            $scope.actionsHtml = function(data, type, full, meta) {
                console.log(data)
                $scope.roles[data.id] = data;
                var html = ''
                var checked = ''
                for (var i=0;i<data.detail.length;i++){
                    if (data.detail[i].roles.split(',').indexOf($scope.role.selected.id.toString())>-1){
                        checked = 'checked'
                        if ($scope.menuSelected.indexOf(data.id)<0){
                            $scope.menuSelected.push(data.id)
                        }
                        break
                    }
                }

                html = '<div class="btn-group btn-group-xs">'
                html +=
                '<div class="checkbox ">'+
                '<input type="checkbox" value="1" id="checkbox'+data.id+'" '+checked+' ng-click="updateSelection($event, '+data.id+')">'+
                '<label for="checkbox'+data.id+'"></label>'+
                '</div>' ;
                html += '</div>'
                return html
            }
            $scope.actionsHtmlAccess = function(data, type, full, meta) {
                console.log(data)
                $scope.roles[data.id] = data;
                var html = '<div class="btn-group btn-group-xs">'
                for (var i=0;i<data.detail.length;i++){
                    if ($scope.accessSelected.indexOf(data.group_id+'-'+data.id+'-'+data.detail[i].menu_detail_id)<0){
                        if (data.detail[i].roles.split(',').indexOf($scope.role.selected.id.toString())>-1){
                            //console.log(data.detail[i].roles+';'+$scope.role.selected.id.toString())
                            $scope.accessSelected.push(data.group_id+'-'+data.id+'-'+data.detail[i].menu_detail_id)
                        }

                    }
                    var d = data.group_id+'-'+data.id+'-'+data.detail[i].menu_detail_id
                    html +=
                    '<div class="checkbox ">'+
                    '<input type="checkbox" id="checkboxAcc'+data.detail[i].menu_detail_id+'" '+(data.detail[i].roles.split(',').indexOf($scope.role.selected.id.toString())>-1?'checked':'')+
                    ' ng-click="updateSelectionAccess($event, \''+d+'\')">'+
                    '<label for="checkboxAcc'+data.detail[i].menu_detail_id+'">'+data.detail[i].label+'</label>'+
                    '</div><br/>' ;

                }
                html += '</div>'
                return html
            }

            $scope.createdRow = function(row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: API_URL+'/api/getRoleMenus?module='+$scope.module.selected.id+'&role='+$scope.role.selected.id,
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
                DTColumnBuilder.newColumn('group_name').withTitle('Group Menu'),
                DTColumnBuilder.newColumn('parent').withTitle('Parent'),
                DTColumnBuilder.newColumn('name').withTitle('Menu Name')

            ];
            //if ($scope.el.length>0){
            $scope.dtColumns.push(
                DTColumnBuilder.newColumn(null).withTitle('View').notSortable()
                .renderWith($scope.actionsHtml)
            )
            $scope.dtColumns.push(
                DTColumnBuilder.newColumn(null).withTitle('Access').notSortable()
                .renderWith($scope.actionsHtmlAccess)
            )
            /*END AD ServerSide*/
        }

        $scope.updateSelection = function($event, id) {
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            if (action === 'add' && $scope.menuSelected.indexOf(id) === -1) {
                $scope.menuSelected.push(id);
            }
            if (action === 'remove' && $scope.menuSelected.indexOf(id) !== -1) {
                $scope.menuSelected.splice($scope.menuSelected.indexOf(id), 1);
            }
        };

        $scope.updateSelectionAccess = function($event, id) {
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            if (action === 'add' && $scope.accessSelected.indexOf(id) === -1) {
                $scope.accessSelected.push(id);
            }
            if (action === 'remove' && $scope.accessSelected.indexOf(id) !== -1) {
                $scope.accessSelected.splice($scope.accessSelected.indexOf(id), 1);
            }
        };

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        $scope.save = function(){
            var group = []
            var menu = []
            var insert = []
            var param = {}
            for (var i=0;i<$scope.accessSelected.length;i++){
                if (group.indexOf($scope.accessSelected[i].split('-')[0])<0){
                    group.push($scope.accessSelected[i].split('-')[0])
                }
                menu.push({
                    group_id: $scope.accessSelected[i].split('-')[0],
                    menu_id: $scope.accessSelected[i].split('-')[1],
                    menu_detail_id: $scope.accessSelected[i].split('-')[2]
                })
                insert.push([
                    $scope.role.selected.id,
                    $scope.accessSelected[i].split('-')[1],
                    $scope.accessSelected[i].split('-')[2]
                ])
            }
            param = {
                role: $scope.role.selected.id,
                group: group,
                menu: menu,
                insert: insert
            }
            roleMenuService.assignMenu(param)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Insert')
                }
                else {
                    console.log('Failed Insert')
                }
            })
        }
    }
)
