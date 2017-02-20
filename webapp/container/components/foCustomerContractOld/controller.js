
var userController = angular.module('app', []);
userController
.controller('FoCustomerContractCtrl',
function($scope, $state, $sce, customerService, customerContractService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope,API_URL) {

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

    $scope.contracts = []
    $scope.id = '';
    $scope.contract = {
        id: '',
        customerId: '',
        customerName: '',
        code: '',
        startDate: '',
        endDate: ''
    }
    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };
    $scope.selected = {
        customer: {}
    }

    $scope.customers = []
    customerService.get()
    .then(function(data){
        // console.log(data)
        $scope.customers = data.data

    })

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        // console.log(data)
        $scope.contracts[data] = {id:data};
        //console.log(data)
        // console.log($scope.customers)
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
        url: API_URL+'/apifo/getCustomerContracts',
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
        $scope.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Contract Code'),
        DTColumnBuilder.newColumn('customerName').withTitle('Customer'),
        DTColumnBuilder.newColumn('startDate').withTitle('Start Contract'),
        DTColumnBuilder.newColumn('endDate').withTitle('End Contract')
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
        $('#contract_code').prop('disabled', false)
    }

    $scope.submit = function(){
        // console.log($scope.contract)
        if ($scope.contract.id.length==0){
            //exec creation

            $scope.contract.customerId = $scope.selected.customer.selected.code;
            $scope.contract.code = $scope.contract.code;
            $scope.contract.startDate = $scope.contract.startDate;
            $scope.contract.endDate = $scope.contract.endDate;

            customerContractService.create($scope.contract)
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
            $scope.contract.customerId = $scope.selected.customer.selected.code;
            $scope.contract.code = $scope.contract.code;
            $scope.contract.startDate = $scope.contract.startDate;
            $scope.contract.endDate = $scope.contract.endDate;

            console.log($scope.contract)
            customerContractService.update($scope.contract)
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
        $('#contract_code').prop('disabled', true);

        // console.log(obj)
        customerContractService.get(obj.id)
        .then(function(result){
        console.log(result)
            $scope.contract.id = result.data[0].cust_contract_id
            $scope.contract.code = result.data[0].cust_contract_id
            $scope.contract.startDate = result.data[0].cust_contract_from
            $scope.contract.endDate = result.data[0].cust_contract_to
            $scope.contract.customerId = result.data[0].customer_id
            $scope.contract.customerName = result.data[0].customer_name
            $scope.selected.customer.selected = {name: result.data[0].customer_name, code: result.data[0].customer_id};
        })
    }

    $scope.delete = function(obj){
        console.log(obj)
        $scope.contract.id = obj.id;

        $('#modalDelete').modal('show')
    }

    $scope.execDelete = function(){
        console.log($scope.contract)
        customerContractService.delete($scope.contract)
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

    $scope.clear = function(){
        $scope.contract = {
            id: '',
            customerName: '',
            code: '',
            startDate: '',
            endDate: ''
        }
    }



})
