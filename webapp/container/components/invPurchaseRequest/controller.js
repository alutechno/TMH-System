
var userController = angular.module('app', []);
userController
.controller('InvPurchaseRequestCtrl',
function($scope, $state, $sce, prService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    $scope.addItem = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.show = {
        prTable: true,
        itemTable:false
    }


    $scope.id = '';
    $scope.pr = {
        id: '',
        code: '',
        purchase_notes: '',
        delivery_date: ''
    }

    $scope.selected = {
        status: {}
    }

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/

            //define default option

            $scope.dtOptionsItem = DTOptionsBuilder.newOptions();
            //define colum
            $scope.dtColumnsItem = [

            ];
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('addDetail')>-1){
                html +=
                '<button class="btn btn-default" ng-click="addDetail(\'' + data + '\')">' +
                '   <i class="fa fa-shopping-basket"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(\'' + data + '\')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(\'' + data + '\')" )"="">' +
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
        url: API_URL+'/apiinv/getPrs',
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
        .renderWith($scope.actionsHtml).withOption('width', '12%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('doc_status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('delivery_date').withTitle('Expected At'),
        DTColumnBuilder.newColumn('department_name').withTitle('Department')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }

    }

    /*END AD ServerSide*/

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
    }
    $scope.openQuickViewItem = function(state){
        $scope.addDetail(1);
    }

    $scope.submit = function(){
        if ($scope.pr.id.length==0){
            //exec creation

            prService.create($scope.pr)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.pr.code,
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
            prService.update($scope.pr)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Update')
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.pr.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear();
                }
                else {
                    console.log('Failed Update')

                }
            },
            function (err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Update: '+err.desc.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }
    }

    $scope.addDetail = function(ids){
        $scope.show.prTable = false;
        $scope.show.itemTable = true;
        prService.get(ids)
        .then(function(result){
            console.log(result)
            $scope.pr = result.data[0]
            console.log($scope.pr)

            //$scope.dtInstanceItem = {} //Use for reloadData
            $scope.actionsHtmlItem = function(data, type, full, meta) {
                var html = ''
                if ($scope.el.length>0){
                    html = '<div class="btn-group btn-group-xs">'
                    if ($scope.el.indexOf('addDetail')>-1){
                        html +=
                        '<button class="btn btn-default" ng-click="addDetail(\'' + data + '\')">' +
                        '   <i class="fa fa-shopping-basket"></i>' +
                        '</button>&nbsp;' ;
                    }
                    if ($scope.el.indexOf('buttonUpdate')>-1){
                        html +=
                        '<button class="btn btn-default" ng-click="update(\'' + data + '\')">' +
                        '   <i class="fa fa-edit"></i>' +
                        '</button>&nbsp;' ;
                    }
                    if ($scope.el.indexOf('buttonDelete')>-1){
                        html+='<button class="btn btn-default" ng-click="delete(\'' + data + '\')" )"="">' +
                        '   <i class="fa fa-trash-o"></i>' +
                        '</button>';
                    }
                    html += '</div>'
                }
                return html
            }

            $scope.createdRowItem = function(row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            $scope.dtOptionsItem = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: API_URL+'/apiinv/getPrItems?ids='+ids,
                type: 'GET',
                headers: {
                    "authorization":  'Basic ' + $localStorage.mediaToken
                }
            })
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withOption('bLengthChange', false)
            .withOption('bFilter', false)
            .withPaginationType('full_numbers')
            .withDisplayLength(10)

            .withOption('createdRow', $scope.createdRowItem);

            $scope.dtColumns = [];
            if ($scope.el.length>0){
                $scope.dtColumns.push(DTColumnBuilder.newColumn('p_id').withTitle('Action').notSortable()
                .renderWith($scope.actionsHtmlItem).withOption('width', '12%'))
            }
            $scope.dtColumns.push(
                DTColumnBuilder.newColumn('product_name').withTitle('Product'),
                DTColumnBuilder.newColumn('order_qty').withTitle('Qty'),
                DTColumnBuilder.newColumn('warehouse_name').withTitle('Warehouse'),
                DTColumnBuilder.newColumn('delivery_status').withTitle('Status')
            );
            //$scope.dtInstance.reloadData();
            //$scope.dtInstanceItem.rerender();
        })
    }



    $scope.update = function(ids){
        $('#form-input').modal('show');
        $scope.pr.id = ids

        prService.get(ids)
        .then(function(result){
            $scope.pr = result.data[0]
        })
    }

    $scope.delete = function(ids){
        $scope.pr.id = ids;
        //$scope.customer.name = obj.name;
        prService.get(ids)
        .then(function(result){
            $scope.pr.code = result.data[0].code;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        pr.delete($scope.pr)
        .then(function (result){
            if (result.status = "200"){
                console.log('Success Delete')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.pr.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
            }
            else {
                console.log('Delete Failed')
            }
        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Update: '+err.desc.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.clear = function(){
        $scope.pr = {
            id: '',
            code: '',
            purchase_notes: '',
            delivery_date: ''
        }
    }

})
