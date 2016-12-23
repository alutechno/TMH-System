
var userController = angular.module('app', []);
userController
.controller('InvContractCtrl',
function($scope, $state, $sce, queryService, supplierContractService, supplierService, productService, otherService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

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

    $scope.contracts = {}
    $scope.id = '';
    $scope.contract = {
        id: '',
        code: '',
        supplier_id: '',
        product_id: '',
        description: '',
        contract_status: '',
        contract_start_date: '',
        contract_end_date: '',
        price: '',
        previous_price: '',
        default_supplier_flag: ''
    }

    $scope.selected = {
        supplier_id: {},
        product_id: {},
        contract_status: {},
        default_supplier_flag: {}
    }

    $scope.arrActive = [
        {id: 1, name: 'Yes'},
        {id: 0, name: 'No'}
    ]

    $scope.opt_supplier_id = []
    queryService.post('select id,name, id as value from mst_supplier order by name',undefined)
    .then(function(data){
        $scope.opt_supplier_id = data.data
    })

    $scope.opt_product_id = []
    queryService.post('select id,name,last_order_price from mst_product order by name',undefined)
    .then(function(data){
        $scope.opt_product_id = data.data
    })

    $scope.opt_contract_status = []
    otherService.getTableRef('inv_prod_price_contract','contract_status')
    .then(function(data){
        $scope.opt_contract_status = data.data
    })

    $scope.opt_default_supplier_flag = []
    otherService.getTableRef('inv_prod_price_contract','default_supplier_flag')
    .then(function(data){
        $scope.opt_default_supplier_flag = data.data
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
        $scope.contracts[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(contracts[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(contracts[\'' + data + '\'])" )"="">' +
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

    var qstring = "select a.*, "+
                    "case  "+
                    "when a.contract_status = 0 then 'Waiting Approval' "+
                    "when a.contract_status = 1 then 'Active' "+
                    "when a.contract_status = 2 then 'Expired' "+
                    "when a.contract_status = 3 then 'Suspended' "+
                    "when a.contract_status = 4 then 'Terminated' "+
                    "end as contract_status_name, "+
                    "b.name as supplier_name,c.name as product_name from  "+
                    "inv_prod_price_contract a, mst_supplier b, mst_product c "+
                    "where a.supplier_id = b.id and a.product_id = c.id"
    var qwhere = ''


    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'GET',
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

    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier'),
        DTColumnBuilder.newColumn('product_name').withTitle('Product'),
        DTColumnBuilder.newColumn('contract_status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('contract_start_date').withTitle('Start'),
        DTColumnBuilder.newColumn('contract_end_date').withTitle('End'),
        DTColumnBuilder.newColumn('price').withTitle('Price'),
        DTColumnBuilder.newColumn('default_supplier_flag').withTitle('Default')
    );

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
        console.log($scope.opt_supplier_id)
        // console.log($scope.opt_contract_status)
        // console.log($scope.opt_default_supplier_flag)
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
        console.log('submit')
        if ($scope.contract.id.length==0){
            //exec creation
            $scope.contract.supplier_id = $scope.selected.supplier_id.selected.id;
            $scope.contract.product_id = $scope.selected.product_id.selected.id;
            $scope.contract.contract_status = $scope.selected.contract_status.selected.id;
            $scope.contract.default_supplier_flag = $scope.selected.default_supplier_flag.selected.id;

            var query = "insert into inv_prod_price_contract set ?";

            queryService.post(query,$scope.contract)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.contract.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();

            },
            function (err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.desc.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })

        }
        else {
            //exec update
            $scope.contract.supplier_id = $scope.selected.supplier_id.selected.id;
            $scope.contract.product_id = $scope.selected.product_id.selected.id;
            $scope.contract.contract_status = $scope.selected.contract_status.selected.id;
            $scope.contract.default_supplier_flag = $scope.selected.default_supplier_flag.selected.id;

            var query = "update inv_prod_price_contract set ? where id = "+scope.contract.id;

            queryService.post(query,$scope.contract)
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
        // console.log(obj)
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.contract.id = result.data[0].id
            $scope.contract.code = result.data[0].code
            $scope.contract.supplier_id = result.data[0].supplier_id
            $scope.contract.product_id = result.data[0].product_id
            $scope.contract.description = result.data[0].description
            $scope.contract.contract_status = result.data[0].contract_status
            $scope.contract.contract_start_date = result.data[0].contract_start_date
            $scope.contract.contract_end_date = result.data[0].contract_end_date
            $scope.contract.price = result.data[0].price
            $scope.contract.previous_price = result.data[0].previous_price
            $scope.contract.default_supplier_flag = result.data[0].default_supplier_flag

            for (var i = $scope.opt_supplier_id.length - 1; i >= 0; i--) {
                if ($scope.opt_supplier_id[i].id == result.data[0].supplier_id){
                    $scope.selected.supplier_id.selected = {name: $scope.opt_supplier_id[i].name, id: $scope.opt_supplier_id[i].id}
                }
            };
            for (var i = $scope.opt_product_id.length - 1; i >= 0; i--) {
                if ($scope.opt_product_id[i].id == result.data[0].product_id){
                    $scope.selected.product_id.selected = {name: $scope.opt_product_id[i].name, id: $scope.opt_product_id[i].id}
                }
            };
            for (var i = $scope.opt_contract_status.length - 1; i >= 0; i--) {
                if ($scope.opt_contract_status[i].id == result.data[0].contract_status){
                    $scope.selected.contract_status.selected = {name: $scope.opt_contract_status[i].name, id: $scope.opt_contract_status[i].id}
                }
            };
            for (var i = $scope.opt_default_supplier_flag.length - 1; i >= 0; i--) {
                if ($scope.opt_default_supplier_flag[i].id == result.data[0].default_supplier_flag){
                    $scope.selected.default_supplier_flag.selected = {name: $scope.opt_default_supplier_flag[i].name, id: $scope.opt_default_supplier_flag[i].id}
                }
            };

        })
    }

    $scope.delete = function(obj){
        $scope.contract.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.contract.code = result.data[0].code;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update inv_prod_price_contract set status=4 where id='+$scope.contract.id,undefined)
        .then(function (result){
            if (result.status = "200"){
                console.log('Success Delete')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
            }
            else {
                console.log('Delete Failed')
            }
        })
    }

    $scope.clear = function(){
        $scope.contract = {
            id: '',
            code: '',
            supplier_id: '',
            product_id: '',
            description: '',
            contract_status: '',
            contract_start_date: '',
            contract_end_date: '',
            price: '',
            previous_price: '',
            default_supplier_flag: ''
        }
    }



})
