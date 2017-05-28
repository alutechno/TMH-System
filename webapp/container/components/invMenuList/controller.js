
var userController = angular.module('app', []);
userController
.controller('InvMenuListCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

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

    var qstring = 'select a.id,a.outlet_id,b.name outlet_name,a.recipe_id,c.name recipe_name,c.product_cost,c.selling_price,a.created_by,d.status_value,d.status_name '+
        'from inv_outlet_menus a,mst_outlet b,mst_cuisine_recipe c, '+
        '(select id as status_id, value as status_value,name as status_name '+
        'from table_ref  '+
        'where table_name = \'ref_product_category\' and column_name=\'status\')d '+
        'where a.outlet_id=b.id '+
        'and a.recipe_id=c.id '+
        'and a.status = d.status_value '+
        'and a.status!=2 '
    var qwhere = ""

    $scope.rowdata = {}
    $scope.field = {
        id: '',
        category_id: '',
        name: '',
        description: '',
        status: ''
    }

    $scope.selected = {
        status: {},
        outlet: {},
        menu: {}
    }

    $scope.arr = {
        status: [],
        outlet: [],
        menu: []
    }

    $scope.arr.status = []
    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name',undefined)
    .then(function(data){
        $scope.arr.status = data.data
        $scope.selected.status['selected'] = data.data[0]

    })

    $scope.arr.outlet = []
    queryService.get('select id,name from mst_outlet order by name',undefined)
    .then(function(data){
        $scope.arr.outlet = data.data
    })
    $scope.arr.menu = []
    queryService.get('select id,name from mst_cuisine_recipe order by name limit 10',undefined)
    .then(function(data){
        $scope.arr.menu = data.data
    })
    $scope.menuUp = function(text) {
        queryService.post('select id,name from mst_cuisine_recipe where name like \''+text.toLowerCase()+'%\' order by name limit 10',undefined)
        .then(function(data){
            $scope.arr.menu = data.data
        })
    };


    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.rowdata[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(rowdata[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(rowdata[\'' + data + '\'])" )"="">' +
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
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstring + qwhere;
        }
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withPaginationType('full_numbers')
    .withDisplayLength(10)
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('id'),
        DTColumnBuilder.newColumn('outlet_name').withTitle('outlet'),
        DTColumnBuilder.newColumn('recipe_name').withTitle('menu'),
        DTColumnBuilder.newColumn('product_cost').withTitle('Cost'),
        DTColumnBuilder.newColumn('selling_price').withTitle('Selling Price')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) {
                    qwhere += ' and (lower(b.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(c.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        //' or b.name like "%'+$scope.filterVal.search+'%" '+
                        ')'
                }else{
                    qwhere = ''
                }
                console.log(qwhere)
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
            }
        }
        else {
            $scope.dtInstance.reloadData(function(obj){
                // console.log(obj)
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

    $scope.submit = function(){
        if ($scope.field.id.length==0){
            //exec creation
            var param = {
                outlet_id:$scope.selected.outlet.selected.id,
                recipe_id:$scope.selected.menu.selected.id,
                status:$scope.selected.status.selected.id,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
            }


            queryService.post('insert into inv_outlet_menus SET ?',param)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Added '+$scope.selected.menu.selected.name+ ' to '+$scope.selected.outlet.selected.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
            },
            function (err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })

        }
        else {
            //exec update
            var param = {
                outlet_id:$scope.selected.outlet.selected.id,
                recipe_id:$scope.selected.menu.selected.id,
                status:$scope.selected.status.selected.id,
                modified_by: $localStorage.currentUser.name.id,
                modified_date: globalFunction.currentDate()
            }

            queryService.post('update inv_outlet_menus SET ? WHERE id='+$scope.field.id ,param)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.selected.menu.selected.name+ ' to '+$scope.selected.outlet.selected.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear();
            },
            function (err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Update: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        $scope.field.id = obj.id

        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)


            $scope.selected.outlet['selected'] = {
                id: result.data[0].outlet_id,
                name: result.data[0].outlet_name
            }
            $scope.selected.menu['selected'] = {
                id: result.data[0].recipe_id,
                name: result.data[0].recipe_name
            }
            $scope.selected.status['selected'] = {
                id: result.data[0].status_value,
                name: result.data[0].status_name
            }
        })
    }

    $scope.delete = function(obj){
        $scope.field.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.field.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update inv_outlet_menus set status=2, '+
        ' modified_by='+$localStorage.currentUser.name.id+
        ' ,modified_date=\''+globalFunction.currentDate()+'\''+
        ' where id='+$scope.field.id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.field.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear
        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Delete: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.clear = function(){
        $scope.field = {
            id: '',
            category_id: '',
            name: '',
            description: '',
            status: ''
        }

        $scope.selected = {
            status: {
                selected: $scope.arr.status[0]
            },
            outlet: {},
            menu: {}
        }
    }

})
