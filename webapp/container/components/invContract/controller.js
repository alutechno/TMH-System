
var userController = angular.module('app', []);
userController
.controller('InvContractCtrl',
function($scope, $state, $sce, supplierContractService, supplierService, productService, otherService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

    $scope.el = [];
    console.log('asd')
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
        supplier: {},
        product: {},
        status: {},
        supplier_flag: {}
    }

    $scope.arrActive = [
        {id: 1, name: 'Yes'},
        {id: 0, name: 'No'}
    ]

    $scope.suppliers = []
    supplierService.get()
    .then(function(data){
        $scope.suppliers = data.data
    })

    $scope.products = []
    productService.get()
    .then(function(data){
        $scope.products = data.data
    })

    $scope.contract_status = []
    otherService.getTableRef('inv_prod_price_contract','contract_status')
    .then(function(data){
        $scope.contract_status = data.data
    })

    $scope.supplier_flags = []
    otherService.getTableRef('inv_prod_price_contract','default_supplier_flag')
    .then(function(data){
        $scope.supplier_flags = data.data
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

    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apiinv/getContracts',
        type: 'GET',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.customSearch = $scope.filterVal.search;
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
        DTColumnBuilder.newColumn('contract_supp_flag').withTitle('Default')
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
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
        console.log('submit')
        if ($scope.contract.id.length==0){
            //exec creation
            $scope.contract.supplier_id = $scope.selected.supplier.selected.id;
            $scope.contract.product_id = $scope.selected.product.selected.id;
            $scope.contract.contract_status = $scope.selected.status.selected.id;
            $scope.contract.default_supplier_flag = $scope.selected.supplier_flag.selected.id;

            supplierContractService.create($scope.contract)
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
            $scope.contract.supplier_id = $scope.selected.supplier.selected.id;
            $scope.contract.product_id = $scope.selected.product.selected.id;
            $scope.contract.contract_status = $scope.selected.status.selected.id;
            $scope.contract.default_supplier_flag = $scope.selected.supplier_flag.selected.id;

            supplierContractService.update($scope.contract)
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
        supplierContractService.get(obj.id)
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

            for (var i = $scope.suppliers.length - 1; i >= 0; i--) {
                if ($scope.suppliers[i].id == result.data[0].supplier_id){
                    $scope.selected.supplier.selected = {name: $scope.suppliers[i].name, id: $scope.suppliers[i].id}
                }
            };
            for (var i = $scope.products.length - 1; i >= 0; i--) {
                if ($scope.products[i].id == result.data[0].product_id){
                    $scope.selected.product.selected = {name: $scope.products[i].name, id: $scope.products[i].id}
                }
            };
            for (var i = $scope.contract_status.length - 1; i >= 0; i--) {
                if ($scope.contract_status[i].id == result.data[0].contract_status){
                    $scope.selected.status.selected = {name: $scope.contract_status[i].name, id: $scope.contract_status[i].id}
                }
            };
            for (var i = $scope.supplier_flags.length - 1; i >= 0; i--) {
                if ($scope.supplier_flags[i].id == result.data[0].default_supplier_flag){
                    $scope.selected.supplier_flag.selected = {name: $scope.supplier_flags[i].name, id: $scope.supplier_flags[i].id}
                }
            };

        })
    }

    $scope.delete = function(obj){
        $scope.contract.id = obj.id;
        supplierContractService.get(obj.id)
        .then(function(result){
            $scope.contract.code = result.data[0].code;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        supplierContractService.delete($scope.contract)
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
