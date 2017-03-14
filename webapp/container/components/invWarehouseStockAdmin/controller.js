
var userController = angular.module('app', []);
userController
.controller('InvWarehouseStockAdminCtrl',
function($scope, $state, $sce, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope,globalFunction, API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []
    var qstring = 'select a.id,b.name warehouse,a.product_id,c.name product,format(a.stock_qty,0)stock_qty,d.name stock_unit,format(a.stock_qty_l,0)stock_qty_l,e.name lowest_stock_unit,format(a.stock_qty_l*c.price_per_lowest_unit,0) amount '+
        'from inv_warehouse_stock a,mst_warehouse b, mst_product c,ref_product_unit d,ref_product_unit e '+
        'where a.warehouse_id=b.id '+
        'and a.product_id=c.id '+
        'and c.unit_type_id=d.id '+
        'and c.lowest_unit_type_id=e.id '
        //'order by id desc '
    var qwhere = ''

    $scope.role = {
        selected: []
    };

    $scope.cats = {}
    $scope.id = '';
    $scope.ws = {
        id: '',
        product_id: null,
        warehouse_id: null,
        stock_qty: null,
        stock_qty_l: null
    }

    $scope.selected = {
        warehouse: {},
        product: {}
    }

    $scope.warehouse = []
    queryService.get('select id,name from mst_warehouse where status!=2 order by name',undefined)
    .then(function(data){
        $scope.warehouse = data.data
    })
    $scope.product = []
    queryService.get('select id,name,lowest_unit_conversion from mst_product where status!=2 order by id limit 50',undefined)
    .then(function(data){
        $scope.product = data.data
    })
    $scope.productUp = function(text) {
        queryService.post('select id,name,lowest_unit_conversion from mst_product where status!=2 and lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
        .then(function(data){
            $scope.product = data.data
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
        $scope.cats[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(cats[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete('+data+')" >' +
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
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('id').withOption('width', '5%'),
        DTColumnBuilder.newColumn('warehouse').withTitle('Warehouse'),
        DTColumnBuilder.newColumn('product_id').withTitle('Product Id'),
        DTColumnBuilder.newColumn('product').withTitle('Product Name').withOption('width', '20%'),
        DTColumnBuilder.newColumn('stock_qty').withTitle('Stock Qty').withClass('text-right'),
        DTColumnBuilder.newColumn('stock_unit').withTitle('Stock Unit'),
        DTColumnBuilder.newColumn('stock_qty_l').withTitle('stock qty lowest').withClass('text-right'),
        DTColumnBuilder.newColumn('lowest_stock_unit').withTitle('lowest unit'),
        DTColumnBuilder.newColumn('amount').withTitle('Amount').withClass('text-right')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' and (b.name like "%'+$scope.filterVal.search+'%" or c.name like "%'+$scope.filterVal.search+'%")'
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
        if ($scope.ws.id.length==0){
            //exec creation
            $scope.selected.product_id = $scope.selected.product.selected.id;
            //delete $scope.cat.id
            var param = {
                product_id:$scope.selected.product.selected.id,
                warehouse_id:$scope.selected.warehouse.selected.id,
                stock_qty:$scope.ws.stock_qty,
                stock_qty_l:$scope.ws.stock_qty*$scope.selected.product.selected.lowest_unit_conversion,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
            }

            queryService.post('insert into inv_warehouse_stock set ?',param)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.ws.id,
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
                product_id:$scope.selected.product.selected.id,
                warehouse_id:$scope.selected.warehouse.selected.id,
                stock_qty:$scope.ws.stock_qty,
                stock_qty_l:$scope.ws.stock_qty*$scope.selected.product.selected.lowest_unit_conversion,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
            }
            queryService.post('update inv_warehouse_stock SET ? WHERE id='+$scope.ws.id ,param)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.ws.id,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
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

    $scope.delete = function(ids){
        $scope.ws.id = ids;
        $('#modalDelete').modal('show')
    }

    $scope.execDelete = function(){
        console.log('exec delete:'+'delete inv_warehouse_stock where id='+$scope.ws.id)


        queryService.post('delete from inv_warehouse_stock where id='+$scope.ws.id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.ws.id,
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
        $scope.ws = {
            id: '',
            product_id: null,
            warehouse_id: null,
            stock_qty: null,
            stock_qty_l: null
        }

        $scope.selected = {
            warehouse: {},
            product: {}
        }
    }

})
