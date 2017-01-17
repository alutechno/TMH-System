var userController = angular.module('app', ["xeditable"]);

userController.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});
userController
.controller('InvWarehouseStockOpnameCtrl',
function($scope, $state, $sce, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction, API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []
    var qstringCostCenter = 'select cast(concat(\'W-\',a.id) as char) _id,a.id,a.name,a.modified_date last_stock_opname,count(b.product_id) items,sum(b.stock_qty*c.price_per_unit) amount '+
        'from mst_cost_center a,inv_cost_center_stock b,mst_product c '+
        'where a.id=b.cost_center_id '+
        'and b.product_id=c.id '+
        'group by a.id,a.name,a.modified_date '
    var qstringWarehouse = 'select cast(concat(\'W-\',a.id) as char) _id,a.id,a.name,a.modified_date last_stock_opname,count(b.product_id) items,sum(b.stock_qty*c.price_per_unit) amount '+
        'from mst_warehouse a,inv_warehouse_stock b,mst_product c '+
        'where a.id=b.warehouse_id '+
        'and b.product_id=c.id '+
        'group by a.id,a.name,a.modified_date '
    var qstring = []
    qstring.push(qstringWarehouse,qstringCostCenter)
    var qwhere = ''

    $scope.child = {}
    $scope.items = []

    $scope.warehouse = []
    queryService.get('select id,name from mst_warehouse order by name',undefined)
    .then(function(data){
        $scope.warehouse = data.data
    })
    $scope.cost_center = []
    queryService.get('select id,name from mst_cost_center order by name',undefined)
    .then(function(data){
        $scope.cost_center = data.data
    })

    $scope.filterVal = {
        warehouse: {},
        cost_center: {}
    }

    $scope.selected = {
        warehouse: {},
        cost_center: {}
    }
    $scope.so = {}

    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonOpname')>-1){
                html +=
                '<button class="btn btn-default" ng-click="opname(\'' + data + '\')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
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

            data.query = qstring.join(' union ') + qwhere;
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
        $scope.dtColumns.push(DTColumnBuilder.newColumn('_id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('id'),
        DTColumnBuilder.newColumn('name').withTitle('Warehouse'),
        DTColumnBuilder.newColumn('last_stock_opname').withTitle('last stock opname date'),
        DTColumnBuilder.newColumn('amount').withTitle('amount')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere += ' where name="'+$scope.filterVal.search+'"'
                else qwhere = ''
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }
        else {
            if (filterVal.warehouse['selected']){
                qstring.push(qstringWarehouse)
            }
            if (filterVal.cost_center['selected']){
                qstring.push(qstringCostCenter)
            }
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

    $scope.opname = function(_ids){
        $scope.so.id = _ids.split('-')[1]
        $scope.so._id = _ids
        var q = ''
        if (_ids.indexOf('C')>-1){
            q = 'select * from ('+qstringCostCenter+')x where id='+$scope.so.id
        }
        else if (_ids.indexOf('W')>-1){
            q = 'select * from ('+qstringWarehouse+')x where id='+$scope.so.id
        }
        console.log(q)
        queryService.post(q,undefined)
        .then(function(data){
            $scope.so = data.data[0]
            $scope.so.id = _ids.split('-')[1]
            $scope.so._id = _ids
            if (_ids.indexOf('C')>-1){
                $scope.costCenterDetail = [{id:$scope.so.id,name:$scope.so.name}]
                $scope.selected.cost_center['selected']={id:$scope.so.id,name:$scope.so.name}
            }
            else if (_ids.indexOf('W')>-1){
                $scope.warehouseDetail = [{id:$scope.so.id,name:$scope.so.name}]
                $scope.selected.warehouse['selected']={id:$scope.so.id,name:$scope.so.name}
            }
            console.log(data)
        })
        //$('#form-input').modal('show')
        $('#modalOpname').modal('show')
    }
    $scope.cancelOpname = function(_ids){
        $scope.so.id = null
        $scope.so._id = null
        //$('#modalOpname').modal('show')
    }
    $scope.execOpname = function(_ids){
        $('#modalOpname').modal({show:false})
        var q = ''
        var warehouse_id = null;
        var cost_center_id = null;
        console.log($scope.so)
        if($scope.so._id.indexOf('C')>-1){
            q = 'update mst_cost_center set status=3 where id='+$scope.so.id
            cost_center_id = $scope.so.id
        }
        else if($scope.so._id.indexOf('W')>-1){
            q = 'update mst_warehouse set status=3 where id='+$scope.so.id
            warehouse_id = $scope.so.id
        }
        queryService.post(q,undefined)
        .then(function (result){
            var q2 = 'insert into inv_stock_opname set ?'
            $scope.so.code = $scope.so._id + globalFunction.currentDate()
            var param2 = {
                    code: $scope.so.code,
                    warehouse_id: warehouse_id,
                    cost_center_id: cost_center_id,
                    status: 0,
                    created_by: $localStorage.currentUser.name.id
                }
            queryService.post(q2,param2)
            .then(function (result2){
                $scope.so.stock_id=result2.data.insertId
                $('#form-input').modal('show')
                $scope.items = []
                if ($scope.so._id.indexOf('C')>-1){
                    qdetail = 'select a.id w_id,b.name item,a.stock_qty,c.name stock_unit,a.stock_qty_in_recipe_unit,d.name stock_unit2,b.recipe_unit_conversion unit_conversion,b.unit_type_id unit_id,b.recipe_unit_type_id unit_id2,b.price_per_unit,b.id product_id '+
                        'from inv_cost_center_stock a,mst_product b,ref_product_unit c,ref_product_unit d '+
                        'where a.cost_center_id= '+$scope.so.id+' '+
                        'and a.product_id=b.id '+
                        'and b.unit_type_id=c.id '+
                        'and b.recipe_unit_type_id=d.id ';
                }
                else if($scope.so._id.indexOf('W')>-1){
                    qdetail = 'select a.id w_id,b.name item,a.stock_qty,c.name stock_unit,a.stock_qty_l,d.name stock_unit2,b.lowest_unit_conversion unit_conversion,b.unit_type_id unit_id,b.lowest_unit_type_id unit_id2,b.price_per_unit,b.id product_id '+
                        'from inv_warehouse_stock a,mst_product b,ref_product_unit c,ref_product_unit d '+
                        'where a.warehouse_id= '+$scope.so.id+ ' ' +
                        'and a.product_id=b.id '+
                        'and b.unit_type_id=c.id '+
                        'and b.lowest_unit_type_id=d.id ';
                }
                console.log(qdetail)
                console.log($scope.so)
                queryService.post(qdetail,undefined)
                .then(function (result){
                    for (var i=0;i<result.data.length;i++){
                        result.data[i]['id'] = i+1
                        result.data[i]['real_stock'] = null
                        result.data[i]['real_stock_l'] = null
                        $scope.items.push(result.data[i])
                    }
                        //$scope.items = result.data;
                        console.log($scope.items)
                },
                function (err){
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Getting Items: '+err.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            },
            function (err2){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Add Opname: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Locking Warehouse: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
        var q = $scope.child.saveTable(0)
        console.log(q)
        queryService.post(q.join(';'),undefined)
        .then(function (result){
            console.log(result)
                /*$('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.cat.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();*/
                var q2 = ''
                if ($scope.so._id.indexOf('C')>-1){
                    q2 = 'update mst_cost_center set status=1 where id='+$scope.so.id+';'+
                    'update inv_stock_opname set status=1 where id='+$scope.so.stock_id
                }
                else if ($scope.so._id.indexOf('W')>-1){
                    q2 = 'update mst_warehouse set status=1 where id='+$scope.so.id+';'+
                    'update inv_stock_opname set status=1 where id='+$scope.so.stock_id
                }
                console.log(q2)
                queryService.post(q2,undefined)
                .then(function (result2){
                    console.log(result2)
                },
                function (err2){
                    console.log(err2)
                    /*$('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Delete: '+err.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();*/
                })
        },
        function (err){
            console.log(err)
            /*$('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Delete: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();*/
        })
    }

    $scope.update = function(obj){
        queryService.get(qstring+ ' and id='+obj.id,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.cat.id = obj.id
            $scope.cat.name = result.data[0].name
            $scope.cat.description = result.data[0].description
            $scope.cat.status = result.data[0].status

            for (var i=0;i<$scope.arrStatus.length;i++){
                if (result.data[0].status == $scope.arrStatus[i].id){
                    $scope.selected.status.selected = $scope.arrStatus[i]
                }
            }

        },function(err){
            $('body').pgNotification({
                style: 'flip',
                message: 'Failed Fetch Data: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.delete = function(obj){
        $scope.cat.id = obj.id;
        //$scope.customer.name = obj.name;
        productCategoryService.get(obj.id)
        .then(function(result){
            $scope.cat.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update ref_product_category set status=2 where id='+$scope.cat.id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.cat.name,
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
        $scope.cat = {
            id: '',
            name: '',
            description: '',
            status: ''
        }
    }

})
.controller('EditableTableSoCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    var qdetail = ''

    $scope.item = {
        product_id:'',
        product_name:'',
        qty: '',
        price: '',
        amount: '',
        supplier_id: '',
        supplier_name: '',
        old_price: '',
        new_price: ''
    };

    $scope.checkName = function(data, id) {
        if (id === 2 && data !== 'awesome') {
            return "Username 2 should be `awesome`";
        }
    };

    // filter users to show
    $scope.filterUser = function(user) {
        return user.isDeleted !== true;
    };

    $scope.updaterl = function(e,d,p,t){
        if (t=='rs') $scope.items[d-1].real_stock = p
        else if (t=='rsl') $scope.items[d-1].real_stock_l = p
    }

    // cancel all changes
    $scope.cancel = function() {
        console.log($scope.items)
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
            // undelete
            if (user.isDeleted) {
                delete user.isDeleted;
            }
            // remove new
            if (user.isNew) {
                $scope.items.splice(i, 1);
            }
        };
    };

    // save edits
    $scope.child.saveTable = function(pr_id) {
        console.log('asd')
        var results = [];


        console.log(JSON.stringify($scope.items,null,2))
        var sqlitem = []
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
            console.log(user)
            var qs = []
            console.log(user)
            if ($scope.so._id.indexOf('W')>-1){
                qs.push('update inv_warehouse_stock set stock_qty='+(user.real_stock!=null?user.real_stock:(user.real_stock_l/user.unit_conversion))+
                ' ,stock_qty_l='+(user.real_stock!=null?(user.real_stock*user.unit_conversion):user.real_stock_l)+
                ' ,modified_date=\''+globalFunction.currentDate()+ '\',modified_by='+$localStorage.currentUser.name.id+
                ' where id='+$scope.items[i].w_id)
                qs.push('insert into inv_wh_stock_move(transc_type,stock_opname_id,origin_warehouse_id,product_id,qty,unit_type_id,qty_l,lowest_unit_type_id,created_by) '+
                'values(\'SO\','+$scope.so.stock_id+','+$scope.so.id+','+user.product_id+','+(user.real_stock!=null?user.real_stock:(user.real_stock_l/user.unit_conversion))+
                ','+user.unit_id+','+(user.real_stock!=null?(user.real_stock*user.unit_conversion):user.real_stock_l)+','+user.unit_id2+','+$localStorage.currentUser.name.id+')')
            }
            else if ($scope.so._id.indexOf('C')>-1){
                qs.push('update inv_cost_center_stock set stock_qty='+(user.real_stock!=null?user.real_stock:(user.real_stock_l/user.unit_conversion))+
                ' ,stock_qty_l='+(user.real_stock!=null?(user.real_stock*user.unit_conversion):user.real_stock_l)+
                ' ,modified_date=\''+globalFunction.currentDate()+ '\',modified_by='+$localStorage.currentUser.name.id+
                ' where id='+$scope.items[i].w_id)
                qs.push('insert into inv_cs_stock_move(transc_type,stock_opname_id,origin_warehouse_id,product_id,qty,unit_type_id,qty_l,lowest_unit_type_id,created_by) '+
                'values(\'SO\','+$scope.so.stock_id+','+$scope.so.id+','+user.product_id+','+(user.real_stock!=null?user.real_stock:(user.real_stock_l/user.unit_conversion))+
                ','+user.unit_id+','+(user.real_stock!=null?(user.real_stock*user.unit_conversion):user.real_stock_l)+','+user.unit_id2+','+$localStorage.currentUser.name.id+')')
            }
            // actually delete user
            /*if (user.isDeleted) {
                $scope.items.splice(i, 1);
            }*/
            // mark as not new
            /*if (user.isNew) {
                user.isNew = false;
            }*/

            // send on server
            //results.push($http.post('/saveUser', user));


        }
        console.log($scope.items)
        console.log(qs)
        console.log(sqlitem.join(';'))
        return qs
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.products = []

    queryService.get('select id,name,last_order_price from mst_product order by id limit 50 ',undefined)
    .then(function(data){
        $scope.products = data.data
    })
    $scope.productUp = function(text) {
        queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
        .then(function(data){
            $scope.products = data.data
        })
    }
    $scope.supplierUp = function(text,d) {
        var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
            'from mst_supplier a '+
            'left join inv_prod_price_contract b '+
            'on a.id = b.supplier_id  '+
            'and a.status=1  '+
            'and b.product_id ='+$scope.items[d-1].product_id + ' '
            'and lower(a.name) like \''+text.toLowerCase()+'%\'' +
            ' order by price desc limit 50'
        //queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
        queryService.post(sqlCtr,undefined)
        .then(function(data){
            $scope.products = data.data
        })
    }

    $scope.getProductPrice = function(e,d){
        console.log(e)
        $scope.items[d-1].product_id = e.id
        $scope.items[d-1].product_name = e.name
        $scope.items[d-1].price = e.last_order_price
        $scope.items[d-1].amount = e.last_order_price * $scope.items[d-1].qty
        var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
            'from mst_supplier a '+
            'left join inv_prod_price_contract b '+
            'on a.id = b.supplier_id  '+
            'and a.status=1  '+
            'and b.product_id ='+e.id+' order by price desc limit 50'
        queryService.get(sqlCtr,undefined)
        .then(function(data){
            $scope.suppliers = data.data
        })
    }
    $scope.getProductPriceSupplier = function(e,d){
        console.log(e)
        $scope.items[d-1].supplier_id = e.id
        $scope.items[d-1].supplier_name = e.name
        $scope.items[d-1].price = e.price
        $scope.items[d-1].amount = e.price * $scope.items[d-1].qty
    }
    $scope.updatePrice = function(e,d,p){
        $scope.items[d-1].price = p
        $scope.items[d-1].amount = p * $scope.items[d-1].qty
    }
    $scope.updatePriceQty = function(e,d,q){
        $scope.items[d-1].qty = q
        $scope.items[d-1].amount = q * $scope.items[d-1].price
    }

});
