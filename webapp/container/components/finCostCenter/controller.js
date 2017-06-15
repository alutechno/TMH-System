
var userController = angular.module('app', []);
userController
.controller('FinCostCenterCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction, API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
	$scope.disableAction = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.ccs = {}
    $scope.id = '';
    $scope.cc = {
        id: '',
        code: '',
        name: '',
        category_id: '',
        description: '',
        account_id: '',
        status: ''
    }

    $scope.selected = {
        status: {},
        category: {},
        account_id: {},
        department: {},
        warehouse: {}
    }

    $scope.arrActive = [
        {
            id: 1,
            name: 'Yes'
        },
        {
            id: 0,
            name: 'No'
        }
    ]

    $scope.opt_account_id = []
    queryService.post('select id,name from mst_ledger_account order by name',undefined)
    .then(function(data){
        $scope.opt_account_id = data.data
    })

    $scope.ccTypes = []
    queryService.post('select id,name from ref_cost_center_type where status != 2 order by name',undefined)
    .then(function(data){
        $scope.ccTypes = data.data
    })

    $scope.warehouse = []
    queryService.post('select id,name from mst_warehouse where status != 2 order by name',undefined)
    .then(function(data){
        $scope.warehouse = data.data
    })

    $scope.department = []
    queryService.post('select id,name from mst_department where status != 2 order by name',undefined)
    .then(function(data){
        $scope.department = data.data
    })

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.ccs[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(ccs[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(ccs[\'' + data + '\'])" )"="">' +
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

    var qstring = "select a.*, b.name category_name,c.name status_name,d.name department_name,e.name warehouse_name, f.code account_code, f.name account_name "+
        "from mst_cost_center a "+
        "left join ref_cost_center_type b on a.category_id = b.id "+
        "left join (select * from table_ref where table_name = 'ref_product_category' and column_name = 'status') c on a.status = c.value "+
        "left join mst_department d on a.department_id = d.id "+
        "left join mst_warehouse e on a.warehouse_id = e.id "+
        "left join mst_ledger_account f on a.account_id = f.id "+
        "where a.status !=2"
    var qwhere = ''

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
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('department_name').withTitle('Department'),
        DTColumnBuilder.newColumn('category_name').withTitle('Category'),
        DTColumnBuilder.newColumn('account_name').withTitle('Account'),
        DTColumnBuilder.newColumn('warehouse_name').withTitle('Warehouse'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' and lower(a.name) like "%'+$scope.filterVal.search.toLowerCase()+'%"'
                else qwhere = ''
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

    $scope.submit = function(){
        $scope.disableAction = true;
        if ($scope.cc.id.length==0){
            //exec creation

            /*$scope.cc.category_id = $scope.selected.category.selected.id;
            $scope.cc.status = $scope.selected.status.selected.id;
            $scope.cc.account_id = $scope.selected.account_id.selected.id;*/
            var param = {
                code: $scope.cc.code,
                name: $scope.cc.name,
                short_name: $scope.cc.short_name,
                description: $scope.cc.description,
                status: $scope.selected.status.selected.id,
                department_id: $scope.selected.department.selected.id,
                warehouse_id: ($scope.selected.warehouse.selected?$scope.selected.warehouse.selected.id:null),
                account_id: $scope.selected.account_id.selected.id,
                category_id: $scope.selected.category.selected.id,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }

            var query = "insert into mst_cost_center set ?";

            queryService.post(query,param)
            .then(function (result){
				$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.cc.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();

            },
            function (err){
				$scope.disableAction = false;
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+JSON.stringify(err),
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })

        }
        else {
            //exec update
            $scope.cc.category_id = $scope.selected.category.selected.id;
            $scope.cc.status = $scope.selected.status.selected.id;
            $scope.cc.account_id = $scope.selected.account_id.selected.id;
            var param = {
                code: $scope.cc.code,
                name: $scope.cc.name,
                short_name: $scope.cc.short_name,
                description: $scope.cc.description,
                status: $scope.selected.status.selected.id,
                department_id: $scope.selected.department.selected.id,
                warehouse_id: $scope.selected.warehouse.selected.id,
                account_id: $scope.selected.account_id.selected.id,
                category_id: $scope.selected.category.selected.id,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            var query = "update mst_cost_center set ? where id = "+$scope.cc.id;

            queryService.post(query,param)
            .then(function (result){
				$scope.disableAction = false;
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

        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){

            $scope.cc.id = result.data[0].id
            $scope.cc.code = result.data[0].code
            $scope.cc.name = result.data[0].name
            $scope.cc.description = result.data[0].description
            $scope.cc.status = result.data[0].status
            $scope.cc.category_id = result.data[0].category_id
            $scope.cc.account_id = result.data[0].account_id
            $scope.selected.status.selected = {name: result.data[0].status == 1 ? 'Yes' : 'No' , id: result.data[0].status}
            $scope.selected.department['selected'] = {
                id: result.data[0].department_id,
                name: result.data[0].department_name
            }
            $scope.selected.warehouse['selected'] = {
                id: result.data[0].warehouse_id,
                name: result.data[0].warehouse_name
            }

            for (var i = $scope.ccTypes.length - 1; i >= 0; i--) {
                if ($scope.ccTypes[i].id == result.data[0].category_id){
                    $scope.selected.category.selected = {name: $scope.ccTypes[i].name, id: $scope.ccTypes[i].id}
                }
            };

            for (var i = $scope.opt_account_id.length - 1; i >= 0; i--) {
                if ($scope.opt_account_id[i].id == result.data[0].account_id){
                    $scope.selected.account_id.selected = {name: $scope.opt_account_id[i].name, id: $scope.opt_account_id[i].id}
                }
            };

        })

    }

    $scope.delete = function(obj){
        $scope.cc.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.cc.code = result.data[0].code;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        var query = "update mst_cost_center set status=2, "+
        " modified_by="+$localStorage.currentUser.name.id+", "+
        " modified_date='"+globalFunction.currentDate()+"' "+
        " where id = "+$scope.cc.id;

        queryService.post(query,$scope.cc)
        .then(function (result){
            if (result.status = "200"){
                // console.log('Success Update')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
            }
            else {
                // console.log('Failed Update')
            }
        })
    }

    $scope.clear = function(){
        $scope.cc = {
            id: '',
            code: '',
            name: '',
            account_id: '',
            category_id: '',
            description: '',
            status: ''
        }
    }

})
