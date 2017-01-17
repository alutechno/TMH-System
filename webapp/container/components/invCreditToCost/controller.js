
var userController = angular.module('app', []);
userController
.controller('InvCreditToCostCtrl',
function($scope, $state, $sce, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []
    var qstring = 'select a.id,a.code,a.request_status,b.name request_status_name,a.transc_date,a.credit_to_cost_center_id,d.name cost_orig_name,a.debt_to_cost_center_id,e.name cost_dest_name,a.total_amount '+
        'from inv_credit_to_cost a,(select value,name from table_ref where table_name=\'interlocation\' and column_name=\'request_status\') b,mst_cost_center d,mst_cost_center e '+
        'where a.request_status=b.value '+
        'and a.credit_to_cost_center_id=d.id '+
        'and a.debt_to_cost_center_id=e.id '
    var qstringdetail = 'select a.id,a.product_id ,d.stock_qty_l stock_in_hand,a.qty,e.name unit_name,b.unit_type_id unit_id,b.lowest_unit_type_id unit_id2,b.lowest_unit_conversion unit_conversion,d.id warehouse_item_id '+
        'from inv_ctc_line_item  a,mst_product b,inv_credit_to_cost c,inv_cost_center_stock d,ref_product_unit e,(select value,name from table_ref where table_name=\'inv_store_req_line_item\')f '+
        'where a.product_id=b.id '+
        'and a.ctc_id=c.id '+
        'and c.credit_to_cost_center_id=d.cost_center_id '+
        'and a.product_id=d.product_id '+
        'and b.lowest_unit_type_id=e.id '
    var qwhere = ''

    $scope.role = {
        selected: []
    };
    $scope.child = {}
    $scope.items = []
    $scope.itemsOri = []

    $scope.cats = {}
    $scope.id = '';
    $scope.it = {
        id: '',
        code: '',
        origin_cc_id: '',
        dest_cc_id: '',
        request_status: '',
        transfer_date: '',
        notes: ''
    }

    $scope.selected = {
        request_status: {},
        cc_origin: {},
        cc_dest: {}
    }

    $scope.cc_origin = []
    $scope.cc_dest = []
    queryService.get('select id,code, name from mst_cost_center order by name',undefined)
    .then(function(data){
        $scope.cc_origin = data.data
        $scope.cc_dest = data.data
    })
    $scope.request_status = []
    queryService.get('select value,name from table_ref where table_name=\'store_request\' and column_name=\'request_status\' ',undefined)
    .then(function(data){
        $scope.request_status = data.data
        $scope.selected.request_status['selected'] = $scope.request_status[0]
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
        $scope.cats[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(' + data + ')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(cats[\'' + data + '\'])" )"="">' +
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
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('id'),
        DTColumnBuilder.newColumn('code').withTitle('code'),
        DTColumnBuilder.newColumn('request_status_name').withTitle('status'),
        DTColumnBuilder.newColumn('transfer_date').withTitle('date'),
        DTColumnBuilder.newColumn('cost_orig_name').withTitle('Origin'),
        DTColumnBuilder.newColumn('cost_dest_name').withTitle('Destination'),
        DTColumnBuilder.newColumn('total_amount').withTitle('amount')
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
        if ($scope.it.id.length==0){
            //exec creation
            var param = {
                code: $scope.it.code,
                transc_date: $scope.it.date,
                request_status: $scope.selected.request_status.selected.id,
                transc_note: $scope.it.request_notes,
                credit_to_cost_center_id: $scope.selected.cc_origin.selected.id,
                debt_to_cost_center_id: $scope.selected.cc_dest.selected.id,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate(),
            }
            queryService.post('insert into inv_credit_to_cost set ?',param)
            .then(function (result){
                var qstr = $scope.child.saveTable(result.data.insertId)
                console.log(qstr)
                queryService.post(qstr.join(';'),undefined)
                .then(function (result2){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){}, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.it.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                },
                function (err2){
                    console.log(err2)
                })

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
                code: $scope.it.code,
                transc_date: $scope.it.date,
                request_status: $scope.selected.request_status.selected.id,
                transc_note: $scope.it.request_notes,
                credit_to_cost_center_id: $scope.selected.warehouse_origin.selected.id,
                debt_to_cost_center_id: $scope.selected.warehouse_dest.selected.id,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate(),
            }
            queryService.post('update inv_credit_to_cost set ? where id='+$scope.it.id,param)
            .then(function (result){
                var qstr = $scope.child.saveTable($scope.it.id)
                console.log(qstr)
                queryService.post(qstr.join(';'),undefined)
                .then(function (result2){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){}, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.it.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                },
                function (err2){
                    console.log(err2)
                })

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
    }

    $scope.update = function(ids){
        queryService.post(qstring+ ' and a.id='+ids,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            console.log(result.data)
            $scope.it = result.data[0]
            $scope.it.date = $scope.it.transfer_date
            $scope.selected.cc_origin['selected'] = {id:$scope.it.credit_to_cost_center_id,name:$scope.it.cost_orig_name}
            $scope.selected.cc_dest['selected'] = {id:$scope.it.debt_to_cost_center_id,name:$scope.it.cost_dest_name}
            $scope.selected.request_status['selected'] = {id:$scope.it.request_status,name:$scope.it.request_status_name}

            queryService.post(qstringdetail+ ' and c.id='+ids,undefined)
            .then(function(result2){
                $('#form-input').modal('show');
                $scope.items = []
                console.log(result2.data)
                for (var i=0;i<result2.data.length;i++){
                    result2.data[i]['id'] = i+1
                    result2.data[i]['issued_qty_n'] = 0
                    $scope.items.push(result2.data[i])
                }
                //$scope.items = result2.data
                $scope.itemsOri = angular.copy($scope.items)
                //$scope.sr = result.data[0]
            },function(err2){
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Failed Fetch Data: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
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
        console.log('delete')
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

.controller('EditableTableCcCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    $scope.item = {
        id: '',
        p_id: '',
        product_id:'',
        product_name:'',
        stock_in_hand: '',
        request_qty: '',
        unit_id: '',
        unit_name: '',
        issued_qty_n: '',
        issued_qty: '',
        issued_id: '',
        issued_status: ''
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

    // mark user as deleted
    $scope.deleteUser = function(id) {
        console.log(id)
        var filtered = $filter('filter')($scope.items, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

    // add user
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.items.length+1),
            p_id: '',
            product_id:'',
            product_name:'',
            stock_in_hand: '',
            request_qty: '',
            unit_id: '',
            unit_name: '',
            issued_qty_n: '',
            issued_qty: '',
            issued_id: '',
            issued_status: '',
            price_per_unit: '',
            amount: '',
            isNew: true
        };
        $scope.items.push($scope.item)
        console.log($scope.items)

        var ss = 'select a.id,a.product_id,b.name product_name,a.stock_qty_l,b.lowest_unit_type_id unit_id,c.name unit_name,b.price_per_unit '+
            'from inv_cost_center_stock a,mst_product b,ref_product_unit c '+
            'where a.product_id=b.id '+
            'and b.lowest_unit_type_id=c.id '+
            'and cost_center_id='+$scope.selected.cc_origin.selected.id +
            //' and lower(b.name) like \''+text.toLowerCase()+'%\' '+
            ' order by id limit 50 '
        queryService.post(ss,undefined)
        .then(function(data){
            console.log(data.data)
            $scope.products = data.data
        })
    };

    // cancel all changes
    $scope.cancel = function() {
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
    $scope.child.saveTable = function(transfer_id) {
        console.log('asd')
        var results = [];
        console.log($scope.itemsOri)

        console.log(JSON.stringify($scope.items,null,2))
        var sqlitem = []
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
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
            if (user.isNew && !user.isDeleted){
                sqlitem.push('insert into inv_ctc_line_item(ctc_id,product_id,price,amount,request_qty,unit_type_id,created_by) values '+
                    '( '+transfer_id+', '+user.product_id+','+user.price_per_unit+','+(user.price_per_unit*user.request_qty)+','+user.request_qty+','+user.unit_id+', '+$localStorage.currentUser.name.id+' )')
                //sqlitem.push('insert into inv_pr_line_item (pr_id,product_id,'+(user.supplier_id.length>0?'supplier_id,':'')+'order_qty,net_price,order_amount,created_by,created_date) values('+
                //pr_id+','+user.product_id+','+(user.supplier_id.length>0?user.supplier_id+',':'')+''+user.qty+','+user.price+','+user.amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from inv_inter_loc_trans_line_item where id='+user.p_id)
            }
            else if(!user.isNew){
                console.log(user)
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri[j].p_id+$scope.itemsOri[j].product_id+$scope.itemsOri[j].request_qty+$scope.itemsOri[j].issued_qty_n
                        var d2 = user.p_id+user.product_id+user.request_qty+user.issued_qty_n
                        if(d1 != d2){
                            var sql2 = 'insert into inv_wh_stock_move(transc_type,inter_loc_trans_id,origin_warehouse_id,dest_warehouse_id,product_id,qty,unit_type_id,qty_l,lowest_unit_type_id,created_by) values '+
                                '( \'IL\','+transfer_id+','+$scope.selected.warehouse_origin.selected.id+','+$scope.selected.warehouse_dest.selected.id+','+
                                ' '+user.product_id+', '+(user.issued_qty_n*user.unit_conversion)+', '+user.unit_id+','+user.issued_qty_n+','+user.unit_id2+', '+$localStorage.currentUser.name.id+' )'
                            var sql3 = 'update inv_warehouse_stock set '+
                                'warehouse_id = '+$scope.selected.warehouse_origin.selected.id+','+
                                'product_id = '+user.product_id+','+
                                'stock_qty = '+(user.stock_qty-(parseInt(user.issued_qty_n)*user.unit_conversion))+','+
                                'stock_qty_l = '+(user.stock_in_hand-user.issued_qty_n)+','+
                                ' modified_by = '+$localStorage.currentUser.name.id+',' +
                                ' modified_date = \''+globalFunction.currentDate()+'\'' +
                                ' where id='+user.warehouse_item_id

                            /*var sql4 = 'INSERT INTO inv_cost_center_stock(cost_center_id,product_id,stock_qty,stock_qty_l,stock_qty_in_recipe_unit,created_by) '+
                                ' values('+$scope.selected.cost_center.selected.id+','+user.product_id+','+(user.stock_qty+(user.issued_qty_n*used.unit_conversion))+
                                ','+(user.stock_qty_l+user.issued_qty_n)+', '+(user.stock_qty_in_recipe_unit+(user.issued_qty_n*user.recipe_unit_conversion))+','+$localStorage.currentUser.name.id+') ' +
                                'ON DUPLICATE KEY UPDATE '+
                                ' stock_qty = '+(user.stock_qty+(user.issued_qty_n*used.unit_conversion))+
                                ' ,stock_qty_l = '+(user.stock_qty_l+user.issued_qty_n)
                                ' ,stock_qty_in_recipe_unit = '+(user.stock_qty_in_recipe_unit+(user.issued_qty_n*user.recipe_unit_conversion))
                                ' ,modified_by = '+$localStorage.currentUser.name.id+',' +
                                ' modified_date = \''+globalFunction.currentDate()+'\''*/

                            sqlitem.push(sql2)
                            sqlitem.push(sql3)
                            //sqlitem.push(sql4)
                        }
                    }
                }
            }

        }
        console.log($scope.items)
        console.log(sqlitem.join(';'))
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.products = []


    $scope.productUp = function(text) {
        var ss = 'select a.id,a.product_id,b.name product_name,a.stock_qty_l,b.lowest_unit_type_id unit_id,c.name unit_name,b.price_per_unit '+
            'from inv_cost_center_stock a,mst_product b,ref_product_unit c '+
            'where a.product_id=b.id '+
            'and b.lowest_unit_type_id=c.id '+
            'and cost_center_id='+$scope.selected.cc_origin.selected.id +
            ' and lower(b.name) like \''+text.toLowerCase()+'%\' '+
            ' order by id limit 50 '
        queryService.post(ss,undefined)
        .then(function(data){
            console.log(data.data)
            $scope.products = data.data
        })
    }


    $scope.getProductPrice = function(e,d){
        console.log(e)
        $scope.items[d-1].product_id = e.product_id
        $scope.items[d-1].product_name = e.product_name
        $scope.items[d-1].stock_in_hand = e.stock_qty_l
        $scope.items[d-1].unit_id = e.unit_id
        $scope.items[d-1].unit_name = e.unit_name
        $scope.items[d-1].price_per_unit = e.price_per_unit
        $scope.items[d-1].amount = e.price_per_unit*$scope.items[d-1].request_qty
        console.log($scope.items)
    }
    $scope.updaterl = function(e,d,f,g){
        console.log(f)
        if (g=='rq') {
            $scope.items[d-1].request_qty = f
            $scope.items[d-1].amount = f*$scope.items[d-1].price_per_unit
        }
        else if (g=='iq') {
            $scope.items[d-1].issued_qty_n = f
        }

    }


});
