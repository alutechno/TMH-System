
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
        console.log(data)
        $scope.customers = data.data

    })

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.contracts[data.id] = data;
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(contracts[' + data.id + '])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(contracts[' + data.id + '])" )"="">' +
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
    }

    $scope.submit = function(){
        console.log($scope.contract)
        if ($scope.contract.id.length==0){
            //exec creation
        }
        else {
            //exec update
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
    }

    $scope.delete = function(obj){
        $scope.contract.id = obj.id;

        $('#modalDelete').modal('show')
    }

    $scope.execDelete = function(){
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
