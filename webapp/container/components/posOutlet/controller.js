
var userController = angular.module('app', []);
userController
.controller('PosOutletCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

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

    $scope.table = 'mst_outlet'

    var qstring = "select a.*,d.status_name,b.name as outlet_type_name,c.name as cost_center_name,e.name as tax_name "+
                    "from "+ $scope.table +" a "+
                    "left join ref_outlet_type b on a.outlet_type_id = b.id "+
                    "left join mst_cost_center c on a.cost_center_id = c.id "+
                    "left join mst_pos_taxes e on a.tax_id = e.id "+
                    "left join (select id as status_id, value as status_value,name as status_name from table_ref "+
                    "where table_name = 'ref_product_category' and column_name='status' and value in (0,1)) d on a.status = d.status_value "+
                    "where a.status!=2 "
    var qwhere = ""

    $scope.rowdata = {}
    $scope.field = {
        id: '',
        code: '',
        name: '',
        address: '',
        status: '',
        bill_footer: '',
        outlet_type_id: '',
        cost_center_id: '',
        tax_id: '',
        delivery_bill_footer: '',
        no_of_seats: '',
        m2: '',
        last_meal_period: '',
        curr_meal_period: '',
        list_number: '',
        num_of_employee: '',
        is_allow_cancel_tax: '',
        fo_gl_journal_code: '',
        bill_image_uri: '',
        bill_image_path: '',
        small_bill_image_uri: '',
        small_bill_image_path: '',
        printed_bill_image_uri: '',
        printed_bill_image_path: '',
        small_printed_bill_image_uri: '',
        small_printed_bill_image_path: ''
    }

    $scope.selected = {
        status: {},
        outlet_type_id: {},
        cost_center_id: {},
        tax_id: {},
        is_allow_cancel_tax: {}
    }

    $scope.arr = {
        status: [],
        outlet_type_id: [],
        cost_center_id: [],
        tax_id: [],
        is_allow_cancel_tax: []
    }

    $scope.arr.status = []
    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name',undefined)
    .then(function(data){
        $scope.arr.status = data.data
    })

    $scope.arr.outlet_type_id = []
    queryService.get('select id,name from ref_outlet_type where status = 1 order by name',undefined)
    .then(function(data){
        $scope.arr.outlet_type_id = data.data
    })

    $scope.arr.cost_center_id = []
    queryService.get('select id,name from mst_cost_center where status = 1',undefined)
    .then(function(data){
        $scope.arr.cost_center_id = data.data
    })

    $scope.arr.tax_id = []
    queryService.get('select id,name from mst_pos_taxes where status = 1',undefined)
    .then(function(data){
        $scope.arr.tax_id = data.data
    })

    $scope.arr.is_allow_cancel_tax = [
        {id: 'Y', name: 'Yes'},
        {id: 'N', name: 'No'}
    ]

    $scope.focusinControl = {};
    $scope.fileName = "Tax";
    $scope.exportExcel = function(){

        queryService.post('select code,name,description,tax_percent,status_name from('+qstring + qwhere+')aa order by code',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code", "Name", 'Description','Tax Percent','Status']);
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
    .withOption('order', [1, 'desc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '8%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '6%'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '10%'),
        DTColumnBuilder.newColumn('outlet_type_name').withTitle('Outlet Type'),
        DTColumnBuilder.newColumn('cost_center_name').withTitle('Cost Center'),
        DTColumnBuilder.newColumn('tax_name').withTitle('Tax'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '10%')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) {
                    qwhere = ' and (lower(a.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(d.status_name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(a.code) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
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
		$scope.disableAction = true;
        if ($scope.field.id.length==0){
            //exec creation

            $scope.field.status = $scope.selected.status.selected.id;
            $scope.field.outlet_type_id = $scope.selected.outlet_type_id.selected.id;
            $scope.field.cost_center_id = $scope.selected.cost_center_id.selected.id;
            $scope.field.tax_id = $scope.selected.tax_id.selected.id;
            $scope.field.is_allow_cancel_tax = $scope.selected.is_allow_cancel_tax.selected.id;
            $scope.field['created_by'] = $localStorage.currentUser.name.id;
            $scope.field['created_date'] = globalFunction.currentDate();

            queryService.post('insert into '+ $scope.table +' SET ?',$scope.field)
            .then(function (result){
				$scope.disableAction = false;
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
				$scope.disableAction = false;
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
            $scope.field.outlet_type_id = $scope.selected.outlet_type_id.selected.id;
            $scope.field.cost_center_id = $scope.selected.cost_center_id.selected.id;
            $scope.field.tax_id = $scope.selected.tax_id.selected.id;
            $scope.field.is_allow_cancel_tax = $scope.selected.is_allow_cancel_tax.selected.id;
            $scope.field['modified_by'] = $localStorage.currentUser.name.id;
            $scope.field['modified_date'] = globalFunction.currentDate();

            console.log($scope.field);

            queryService.post('update '+ $scope.table +' SET ? WHERE id='+$scope.field.id ,$scope.field)
            .then(function (result){
				$scope.disableAction = false;
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
				$scope.disableAction = false;
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
            $scope.field.code = result.data[0].code
            $scope.field.address = result.data[0].address
            $scope.field.status = result.data[0].status
            $scope.field.bill_footer = result.data[0].bill_footer
            $scope.field.outlet_type_id = result.data[0].outlet_type_id
            $scope.field.cost_center_id = result.data[0].cost_center_id
            $scope.field.tax_id = result.data[0].tax_id
            $scope.field.delivery_bill_footer = result.data[0].delivery_bill_footer
            $scope.field.no_of_seats = result.data[0].no_of_seats
            $scope.field.m2 = result.data[0].m2
            $scope.field.last_meal_period = result.data[0].last_meal_period
            $scope.field.curr_meal_period = result.data[0].curr_meal_period
            $scope.field.list_number = result.data[0].list_number
            $scope.field.num_of_employee = result.data[0].num_of_employee
            $scope.field.is_allow_cancel_tax = result.data[0].is_allow_cancel_tax
            $scope.field.fo_gl_journal_code = result.data[0].fo_gl_journal_code
            $scope.field.bill_image_uri = result.data[0].bill_image_uri
            $scope.field.bill_image_path = result.data[0].bill_image_path
            $scope.field.small_bill_image_uri = result.data[0].small_bill_image_uri
            $scope.field.small_bill_image_path = result.data[0].small_bill_image_path
            $scope.field.printed_bill_image_uri = result.data[0].printed_bill_image_uri
            $scope.field.printed_bill_image_path = result.data[0].printed_bill_image_path
            $scope.field.small_printed_bill_image_uri = result.data[0].small_printed_bill_image_uri
            $scope.field.small_printed_bill_image_path = result.data[0].small_printed_bill_image_path
            for (var i = $scope.arr.status.length - 1; i >= 0; i--) {
                if ($scope.arr.status[i].id == result.data[0].status){
                    $scope.selected.status.selected = {name: $scope.arr.status[i].name, id: $scope.arr.status[i].id}
                }
            }
            for (var i = $scope.arr.outlet_type_id.length - 1; i >= 0; i--) {
                if ($scope.arr.outlet_type_id[i].id == result.data[0].outlet_type_id){
                    $scope.selected.outlet_type_id.selected = {name: $scope.arr.outlet_type_id[i].name, id: $scope.arr.outlet_type_id[i].id}
                }
            }
            for (var i = $scope.arr.cost_center_id.length - 1; i >= 0; i--) {
                if ($scope.arr.cost_center_id[i].id == result.data[0].cost_center_id){
                    $scope.selected.cost_center_id.selected = {name: $scope.arr.cost_center_id[i].name, id: $scope.arr.cost_center_id[i].id}
                }
            }
            for (var i = $scope.arr.tax_id.length - 1; i >= 0; i--) {
                if ($scope.arr.tax_id[i].id == result.data[0].tax_id){
                    $scope.selected.tax_id.selected = {name: $scope.arr.tax_id[i].name, id: $scope.arr.tax_id[i].id}
                }
            }
            for (var i = $scope.arr.is_allow_cancel_tax.length - 1; i >= 0; i--) {
                if ($scope.arr.is_allow_cancel_tax[i].id == result.data[0].is_allow_cancel_tax){
                    $scope.selected.is_allow_cancel_tax.selected = {name: $scope.arr.is_allow_cancel_tax[i].name, id: $scope.arr.is_allow_cancel_tax[i].id}
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
                $scope.clear()
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
            address: '',
            status: '',
            bill_footer: '',
            outlet_type_id: '',
            cost_center_id: '',
            tax_id: '',
            delivery_bill_footer: '',
            no_of_seats: '',
            m2: '',
            last_meal_period: '',
            curr_meal_period: '',
            list_number: '',
            num_of_employee: '',
            is_allow_cancel_tax: '',
            fo_gl_journal_code: '',
            bill_image_uri: '',
            bill_image_path: '',
            small_bill_image_uri: '',
            small_bill_image_path: '',
            printed_bill_image_uri: '',
            printed_bill_image_path: '',
            small_printed_bill_image_uri: '',
            small_printed_bill_image_path: ''
        }

        $scope.selected = {
            status: {selected: $scope.arr.status[0]},
            outlet_type_id: {selected: $scope.arr.outlet_type_id[0]},
            cost_center_id: {selected: $scope.arr.cost_center_id[0]},
            tax_id: {selected: $scope.arr.tax_id[0]},
            is_allow_cancel_tax: {selected: $scope.arr.is_allow_cancel_tax[0]}
        }
    }

})
