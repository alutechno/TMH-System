
var userController = angular.module('app', []);
userController
.controller('FinAssetCtrl',
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

    $scope.table = 'mst_asset'

    var qstring = "select a.*,concat(b.code,'-',b.name) as asset_type_name, "+
                    "concat(c.code,'-',c.name) as asset_loc_name, "+
                    "concat(e.code,'-',e.name) as asset_dept_name, "+
                    "d.status_name "+
                    "from "+ $scope.table +" a "+
                    "left join ref_asset_type b on a.asset_type_id=b.id "+
                    "left join ref_asset_location c on a.asset_loc_id=c.id "+
                    "left join ref_asset_department e on a.asset_dept_id=e.id "+
                    "left join (select id as status_id, value as status_value,name as status_name from table_ref "+
                    "where table_name = 'ref_product_category' and column_name='status' and value in (0,1)) d on a.status = d.status_value "+
                    "where a.status!=2 "
    var qwhere = ""

    $scope.rowdata = {}
    $scope.field = {
        id: '',
        code: '',
        name: '',
        short_name: '',
        description: '',
        status: '',
        asset_type_id: '',
        asset_loc_id: '',
        asset_dept_id: '',
        initial_qty: '',
        current_qty: '',
        initial_value: '',
        book_value: ''
    }

    $scope.selected = {
        status: {},
        asset_type_id: {},
        asset_loc_id: {},
        asset_dept_id: {}
    }

    $scope.arr = {
        status: [],
        asset_type_id: [],
        asset_loc_id: [],
        asset_dept_id: []
    }

    $scope.arr.status = []
    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1)',undefined)
    .then(function(data){
        $scope.arr.status = data.data
    })

    $scope.arr.asset_type_id = []
    queryService.get('select id,concat(code,\'-\',name) as name from ref_asset_type where status != 2',undefined)
    .then(function(data){
        $scope.arr.asset_type_id = data.data
    })

    $scope.arr.asset_loc_id = []
    queryService.get('select id,concat(code,\'-\',name) as name from ref_asset_location where status != 2',undefined)
    .then(function(data){
        $scope.arr.asset_loc_id = data.data
    })

    $scope.arr.asset_dept_id = []
    queryService.get('select id,concat(code,\'-\',name) as name from ref_asset_department where status != 2',undefined)
    .then(function(data){
        $scope.arr.asset_dept_id = data.data
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
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name'),
        DTColumnBuilder.newColumn('description').withTitle('Description'),
        DTColumnBuilder.newColumn('asset_type_name').withTitle('Type'),
        DTColumnBuilder.newColumn('asset_loc_name').withTitle('Location'),
        DTColumnBuilder.newColumn('asset_dept_name').withTitle('Department'),
        DTColumnBuilder.newColumn('initial_qty').withTitle('Initial Qty'),
        DTColumnBuilder.newColumn('current_qty').withTitle('Current Qty'),
        DTColumnBuilder.newColumn('initial_value').withTitle('Initial Value'),
        DTColumnBuilder.newColumn('book_value').withTitle('Book Value'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) {
                    qwhere += ' and (lower(a.code) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(a.short_name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(a.description) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(a.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(b.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(c.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(e.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ')'
                }else{
                    qwhere = ''
                }
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
            $scope.field.status = $scope.selected.status.selected.id;
            $scope.field['created_by'] = $localStorage.currentUser.name.id;
            $scope.field['created_date'] = globalFunction.currentDate();
            $scope.field.asset_type_id = $scope.selected.asset_type_id.selected.id;
            $scope.field.asset_loc_id = $scope.selected.asset_loc_id.selected.id;
            $scope.field.asset_dept_id = $scope.selected.asset_dept_id.selected.id;

            queryService.post('insert into '+ $scope.table +' SET ?',$scope.field)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.field.name,
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
            $scope.field.status = $scope.selected.status.selected.id;
            $scope.field['modified_by'] = $localStorage.currentUser.name.id;
            $scope.field['modified_date'] = globalFunction.currentDate();
            $scope.field.asset_type_id = $scope.selected.asset_type_id.selected.id;
            $scope.field.asset_loc_id = $scope.selected.asset_loc_id.selected.id;
            $scope.field.asset_dept_id = $scope.selected.asset_dept_id.selected.id;

            queryService.post('update '+ $scope.table +' SET ? WHERE id='+$scope.field.id ,$scope.field)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.field.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear()
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

            $scope.field.name = result.data[0].name
            $scope.field.description = result.data[0].description
            $scope.field.status = result.data[0].status
            $scope.field.code = result.data[0].code
            $scope.field.short_name = result.data[0].short_name
            $scope.field.asset_type_id = result.data[0].asset_type_id
            $scope.field.asset_loc_id = result.data[0].asset_loc_id
            $scope.field.asset_dept_id = result.data[0].asset_dept_id
            $scope.field.initial_qty = result.data[0].initial_qty
            $scope.field.current_qty = result.data[0].current_qty
            $scope.field.initial_value = result.data[0].initial_value
            $scope.field.book_value = result.data[0].book_value
            for (var i = $scope.arr.status.length - 1; i >= 0; i--) {
                if ($scope.arr.status[i].id == result.data[0].status){
                    $scope.selected.status.selected = {name: $scope.arr.status[i].name, id: $scope.arr.status[i].id}
                }
            }
            for (var i = $scope.arr.asset_type_id.length - 1; i >= 0; i--) {
                if ($scope.arr.asset_type_id[i].id == result.data[0].asset_type_id){
                    $scope.selected.asset_type_id.selected = {name: $scope.arr.asset_type_id[i].name, id: $scope.arr.asset_type_id[i].id}
                }
            }
            for (var i = $scope.arr.asset_loc_id.length - 1; i >= 0; i--) {
                if ($scope.arr.asset_loc_id[i].id == result.data[0].asset_loc_id){
                    $scope.selected.asset_loc_id.selected = {name: $scope.arr.asset_loc_id[i].name, id: $scope.arr.asset_loc_id[i].id}
                }
            }
            for (var i = $scope.arr.asset_dept_id.length - 1; i >= 0; i--) {
                if ($scope.arr.asset_dept_id[i].id == result.data[0].asset_dept_id){
                    $scope.selected.asset_dept_id.selected = {name: $scope.arr.asset_dept_id[i].name, id: $scope.arr.asset_dept_id[i].id}
                }
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
        queryService.post('update '+ $scope.table +' set status=2, '+
        ' modified_by='+$localStorage.currentUser.name.id+
        ' ,modified_date=\''+globalFunction.currentDate()+'\''+
        '  where id='+$scope.field.id,undefined)
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
            code: '',
            name: '',
            short_name: '',
            description: '',
            status: '',
            asset_type_id: '',
            asset_loc_id: '',
            asset_dept_id: '',
            initial_qty: '',
            current_qty: '',
            initial_value: '',
            book_value: ''
        }

        $scope.selected = {
            status: {},
            asset_type_id: {},
            asset_loc_id: {},
            asset_dept_id: {}
        }
    }

})
