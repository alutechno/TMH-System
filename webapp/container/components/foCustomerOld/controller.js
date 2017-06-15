
var userController = angular.module('app', []);
userController
.controller('FoCustomerCtrl',
function($scope, $state, $sce, customerService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

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

    $scope.customers = {}
    $scope.id = '';

    $scope.selected = {
        active: {},
        isCustomer: {},
        isSupplier: {}
    }
    $scope.arrActive = [
        {
            id: 0,
            name: 'Inactive'
        },
        {
            id: 1,
            name: 'Active'
        }
    ]
    $scope.arrType = [
        {
            id: 0,
            name: 'N'
        },
        {
            id: 1,
            name: 'Y'
        }
    ]

    $scope.customer = {
        id: '',
        code: '',
        name: '',
        type: '',
        address: '',
        city: '',
        postal: '',
        country: '',
        state: '',
        website: '',
        email: '',
        mobile: '',
        phone: '',
        fax: '',
        tax: '',
        active: 0,
        isCustomer: 0,
        isSupplier: 0
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
        console.log(data)
        $scope.customers[data] = {id:data};
        //console.log(data)
        console.log($scope.customers)
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(customers[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(customers[\'' + data + '\'])" )"="">' +
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
        url: API_URL+'/apifo/getCustomers',
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
        DTColumnBuilder.newColumn('name').withTitle('Customer Name'),
        DTColumnBuilder.newColumn('type').withTitle('Type'),
        DTColumnBuilder.newColumn('address').withTitle('Address'),
        DTColumnBuilder.newColumn('phone').withTitle('Phone'),
        DTColumnBuilder.newColumn('mobile').withTitle('Mobile'),
        DTColumnBuilder.newColumn('active').withTitle('Is Active')
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
        $scope.disableAction = true;
        if ($scope.customer.id.length==0){
            //exec creation

            console.log($scope.selected)
            $scope.customer.active = $scope.selected.active.selected.id;
            $scope.customer.isCustomer = $scope.selected.isCustomer.selected.id;
            $scope.customer.isSupplier = $scope.selected.isSupplier.selected.id;
            console.log($scope.customer)
            customerService.create($scope.customer)
            .then(function (result){
				$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.customer.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
            },
            function (err){
				$scope.disableAction = false;
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
            customerService.update($scope.customer)
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
        console.log(obj)
        customerService.get(obj.id)
        .then(function(result){
            $scope.customer = result.data[0]
            for (var i=0;i<$scope.arrActive.length;i++){
                if ($scope.arrActive[i].id == result.data[0].active){
                    $scope.selected.active['selected'] = $scope.arrActive[i]
                    break;
                }
            }
            for (var i=0;i<$scope.arrType.length;i++){
                if ($scope.arrType[i].id == result.data[0].isCustomer){
                    $scope.selected.isCustomer.selected = $scope.arrType[i]
                }
                if ($scope.arrType[i].id == result.data[0].isSupplier){
                    $scope.selected.isSupplier.selected = $scope.arrType[i]
                }
            }
        })
    }

    $scope.delete = function(obj){
        $scope.customer.id = obj.id;
        //$scope.customer.name = obj.name;
        customerService.get(obj.id)
        .then(function(result){
            $scope.customer.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        customerService.delete($scope.customer)
        .then(function (result){
            if (result.status = "200"){
                console.log('Success Delete')
                //Re-init $scope.user
                $scope.customer = {
                    code: '',
                    name: '',
                    type: '',
                    address: '',
                    city: '',
                    postal: '',
                    country: '',
                    state: '',
                    website: '',
                    email: '',
                    mobile: '',
                    phone: '',
                    fax: '',
                    tax: '',
                    active: ''
                }
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
        $scope.customer = {
            id: '',
            code: '',
            name: '',
            type: '',
            address: '',
            city: '',
            postal: '',
            country: '',
            state: '',
            website: '',
            email: '',
            mobile: '',
            phone: '',
            fax: '',
            tax: '',
            active: ''
        }
    }



})
