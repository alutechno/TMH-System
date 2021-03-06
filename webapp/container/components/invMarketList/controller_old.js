
var userController = angular.module('app', []);
userController
.controller('InvMarketListCtrl',
function($scope, $state, $sce, globalFunction,queryService, $q,prService, DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, $localStorage, $compile, $rootScope, API_URL,
    warehouseService) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    $scope.addItem = false;
    $scope.approveState = false;
    //$scope.role = false;
    $scope.rejectState = false;
    $scope.viewMode = false;
    console.log($scope.el)
    for (var i=0;i<$scope.el.length;i++){

        if ($scope.el[i]=='approvalDeptHead'){
            $scope.approveState = true;
            $scope.rejectState = true;
        }
        else if ($scope.el[i]=='approvalPoManager'){
            $scope.approveState = true;
            $scope.rejectState = true;
        }
        else if ($scope.el[i]=='approvalCostControl'){
            $scope.approveState = true;
            $scope.rejectState = true;
        }
        else if ($scope.el[i]=='approvalFinance'){
            $scope.approveState = true;
            $scope.rejectState = false;
        }
        else if ($scope.el[i]=='approvalGm'){
            $scope.approveState = true;
            $scope.rejectState = false;
        }
        else $scope[$scope.el[i]] = true;

    }
    /*var qstring = 'select a.id,a.code,a.purchase_notes, '+
    	'a.doc_status_id,d.name as doc_status_name,  '+
    	'DATE_FORMAT(a.delivery_date,\'%Y-%m-%d\') as delivery_date, cost_center_id,c.name as cost_center_name, '+
        'revision_counter, warehouse_id, c.name as warehouse_name '+
    'from inv_purchase_request a, mst_warehouse b, mst_cost_center c, ref_pr_document_status d  '+
    'where a.warehouse_id = b.id '+
    'and a.cost_center_id = c.id  '+
    'and a.warehouse_id = b.id '+
    'and a.doc_status_id = d.id';*/
    var qstring = 'select a.id,a.code,a.ml_notes,a.doc_status_id, a.approval_status,a.revision_counter, '+
    	'b.name as doc_status_name,a.created_date, '+
        'DATE_FORMAT(a.delivery_date,\'%Y-%m-%d\') as delivery_date, '+
        'a.cost_center_id,c.name cost_center_name, '+
    	'a.warehouse_id,d.name warehouse_name, '+
    '(SELECT SUM(order_amount) FROM inv_ml_line_item item WHERE item.ml_id = a.id) AS Total, '+
    'case when approval_status = 1 then \'Approved\' when approval_status = 2 then \'Rejected\' else \'None\'  end as status '+
    'from ref_ml_document_status b,inv_market_list a '+
    'left join mst_cost_center as c on a.cost_center_id=c.id '+
    'left join mst_warehouse d on a.warehouse_id=d.id '+
    'where a.doc_status_id=b.id '
    var qwhere = '';
    var qstringdetail = 'select a.id as p_id,a.product_id,b.name as product_name,a.order_qty,a.net_price,a.order_amount,a.supplier_id,c.name as supplier_name '+
        'from inv_ml_line_item a '+
        'left join mst_product b on a.product_id = b.id '+
        'left join mst_supplier c on a.supplier_id = c.id '
    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.show = {
        prTable: true,
        itemTable:false
    }
    $scope.updateState = false
    $scope.items = []


    $scope.id = '';
    $scope.pr = {
        id: '',
        code: '',
        ml_notes: '',
        delivery_date: '',
        cost_center_id: ''
    }


    $scope.delivery_types = [
        {
            id: 'FD',
            name: 'Fully Delivery'
        },
        {
            id: 'PD',
            name: 'Partial Delivery'
        }
    ]

    $scope.selected = {
        status: {},
        product: {},
        supplier: {},
        warehouse: {},
        delivery_type: {},
        cost_center: {},
        doc_status: {},
        approval: 0
    }
    $scope.products = []
    $scope.suppliers = []
    $scope.warehouse = []
    $scope.cost_center = []
    $scope.doc_status = []
    $scope.doc_status_def = []

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    queryService.get('select id,name from mst_cost_center order by id',undefined)
    .then(function(data){
        $scope.cost_center = data.data
    })
    queryService.get('select id,name from mst_warehouse',undefined)
    .then(function(data){
        console.log(data)
        $scope.warehouse = data.data
    })
    queryService.get('select id,name from ref_ml_document_status order by seq_id',undefined)
    .then(function(data){
        $scope.doc_status = data.data
        $scope.doc_status_def = data.data
    })

    /*START AD ServerSide*/

    //define default option

    $scope.dtOptionsItem = DTOptionsBuilder.newOptions();
    //define colum
    $scope.dtColumnsItem = [

    ];
    $scope.dtInstance = {} //Use for reloadData
    $scope.nested = {};
    $scope.nested.dtInstance = {}
    $scope.actionsHtml = function(data, type, full, meta) {
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'

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
        .renderWith($scope.actionsHtml).withOption('width', '12%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('doc_status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('status').withTitle('Approval'),
        DTColumnBuilder.newColumn('delivery_date').withTitle('Expected At'),
        DTColumnBuilder.newColumn('cost_center_name').withTitle('Cost Center'),
        DTColumnBuilder.newColumn('warehouse_name').withTitle('Warehouse'),
        DTColumnBuilder.newColumn('Total').withTitle('Total')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere += ' and a.code=\''+$scope.filterVal.search+'\''
                else qwhere = ''

                $scope.nested.dtInstance.reloadData(function(obj){
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
        //$scope.show.itemTable=true
        $scope.addDetail(0)
        $scope.selected.doc_status['selected'] = $scope.doc_status[0]
        $scope.statusState = true
        $scope.approveState = false
        $scope.rejectState = true
        $scope.selected.approval = 1
    }
    $scope.openQuickViewItem = function(state){
        //$scope.addDetail(1);
        $('#form-input-item').modal('show')
    }
    $scope.setApprovalStatus = function(ev){
        $scope.approveState = false
        $scope.rejectState = false
    }

    $scope.submit = function(){
        console.log($scope.pr)
        if ($scope.pr.id.length==0 ){
            //exec creation
            console.log($scope.pr)
            if ($scope.items.length>0){
                var param = {}
                param = {
                    code: $scope.pr.code,
                    ml_notes: $scope.pr.ml_notes,
                    doc_status_id:1,
                    delivery_date: $scope.pr.delivery_date,
                    warehouse_id: $scope.selected.warehouse.selected.id,
                    cost_center_id: $scope.selected.cost_center.selected.id,
                    created_by: $localStorage.currentUser.name.id,
                    created_date: globalFunction.currentDate(),
                    approval_status:$scope.selected.approval
                }
                console.log(param)
                queryService.post('insert into inv_market_list set ?',param)
                .then(function (result){
                    console.log(result.data.insertId)
                    var paramDetail = {
                        ml_id: result.data.insertId,
                        doc_status_id:1,
                        created_by:$localStorage.currentUser.name.id
                    }
                    if ($scope.selected.approval==1){
                        paramDetail['approval_status'] = $scope.selected.approval
                        paramDetail['approval_notes'] = $scope.pr.approval_notes
                    }
                    else if($scope.selected.approval==2){
                        paramDetail['approval_status'] = $scope.selected.approval
                        paramDetail['denial_notes'] = $scope.pr.approval_notes
                    }
                    else {
                        paramDetail['approval_status'] = 0
                    }
                    queryService.post('insert into inv_ml_doc_state set ?',paramDetail)
                    .then(function (result2){
                        console.log(result2.data.insertId)
                        var paramItem = []
                        for (var x=0;x<$scope.items.length;x++){
                            paramItem.push([
                                result.data.insertId,$scope.items[x].product_id,$scope.items[x].supplier_id,
                                parseInt($scope.items[x].qty),parseInt($scope.items[x].price),parseInt($scope.items[x].amount),
                                $localStorage.currentUser.name.id,globalFunction.currentDate()
                            ])

                        }
                        console.log(paramItem)
                        //queryService.post('insert into inv_pr_line_item(pr_id,product_id,supplier_id,order_qty,net_price,order_amount,created_by,created_date) values ?',[paramItem])
                        $scope.addItemDetail(result)
                        .then(function (result3){
                            console.log(result.data.insertId)
                            $('#form-input').modal('hide')
                            $scope.nested.dtInstance.reloadData(function(obj){
                                // console.log(obj)
                            }, false)
                            $('body').pgNotification({
                                style: 'flip',
                                message: 'Success Insert Market List '+$scope.pr.code,
                                position: 'top-right',
                                timeout: 2000,
                                type: 'success'
                            }).show();
                        },
                        function (err3){
                            console.log(err3)
                            $('#form-input').pgNotification({
                                style: 'flip',
                                message: 'Error Insert Line Item: '+err3.code,
                                position: 'top-right',
                                timeout: 2000,
                                type: 'danger'
                            }).show();
                        })
                    },
                    function (err2){
                        console.log(err2)
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Insert: '+err2.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                },
                function (err){
                    console.log(err)
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
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Cannot Add PR, Item list is Empty !!',
                    position: 'top-right',
                    timeout: 10000,
                    type: 'danger'
                }).show();

            }


        }
        else {
            console.log($scope.pr)
            //exec update
            var param = [{
                code: $scope.pr.code,
                ml_notes: $scope.pr.ml_notes,
                delivery_date:$scope.pr.delivery_date,
                doc_status_id:($scope.selected.approval==2?1:$scope.selected.doc_status.selected.id),
                warehouse_id:$scope.selected.warehouse.selected.id,
                cost_center_id:$scope.selected.cost_center.selected.id,
                revision_counter:($scope.pr.revision_counter+1),
                modified_by:$localStorage.currentUser.name.id,
                modified_date:globalFunction.currentDate(),
                approval_status: ($scope.selected.approval==0?0:$scope.selected.approval)
            },$scope.pr.id]


            queryService.post('update inv_market_list set ? where id=?',param)
            .then(function (result){
                console.log(result)
                var queryState = ''
                var paramState = []
                var paramPr = {}


                if ($scope.pr.doc_status_id==$scope.selected.doc_status.selected.id &&
                    $scope.pr.approval_status==$scope.selected.approval ){
                    //Hanya Update inv_purchase_request, tidak doc_status_id atau approval yang berubah
                    $('#form-input').modal('hide')
                    result.data['insertId'] = $scope.pr.id
                    $scope.addItemDetail(result)
                    .then(function (result3){
                        $scope.nested.dtInstance.reloadData(function(obj){
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

                    },
                    function (err3){
                        console.log(err3)

                    })

                }
                else {
                    console.log('beda')

                    result.data['insertId'] = $scope.pr.id
                    var po_stat = true
                    var po_msg = []
                    console.log($scope.items)
                    for (var i=0;i<$scope.items.length;i++){
                        if ($scope.items[i].supplier_id==null || $scope.items[i].supplier_id.length==0){
                            po_stat = false
                            po_msg.push($scope.items[i].product_name)
                        }
                    }
                    if (po_stat == false && ($scope.selected.doc_status.selected.id==3 && $scope.selected.approval==1)){
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Empty Supplier on Item '+po_msg.join(', '),
                            position: 'top-right',
                            timeout: 10000,
                            type: 'danger'
                        }).show();
                    }
                    else {
                        $scope.addItemDetail(result)
                        .then(function (result3){
                            console.log(result.data.insertId)
                        },
                        function (err3){
                            console.log(err3)

                        })
                        if ($scope.selected.approval==1 || $scope.selected.approval==2){
                            queryState = 'insert into inv_ml_doc_state set ?'
                            paramState = {
                                ml_id:$scope.pr.id,
                                doc_status_id:$scope.selected.doc_status.selected.id,
                                created_by:$localStorage.currentUser.name.id,
                                created_date:globalFunction.currentDate(),
                                approval_status:$scope.selected.approval,
                                approval_notes: $scope.selected.approval==1?$scope.pr.approval_notes:'',
                                denial_notes: $scope.selected.approval==2?$scope.pr.approval_notes:''
                            }
                            paramPr = {
                                doc_status_id:$scope.selected.doc_status.selected.id,
                                approve_status:$scope.selected.approval
                            }
                        }
                        else {
                            queryState = 'insert into inv_ml_doc_state set ?'
                            paramState = {
                                ml_id:$scope.pr.id,
                                doc_status_id:$scope.selected.doc_status.selected.id,
                                created_by:$localStorage.currentUser.name.id,
                                created_date:globalFunction.currentDate(),
                                approval_status:0
                            }
                            paramPr = {
                                doc_status_id:$scope.selected.doc_status.selected.id,
                                approve_status:0
                            }
                        }
                        console.log(paramState)
                        if (queryState.length>0){
                            queryService.post(queryState,paramState)
                            .then(function (result){
                                console.log(result)
                                $('#form-input').modal('hide')
                                $scope.nested.dtInstance.reloadData(function(obj){
                                    // console.log(obj)
                                }, false)
                                $('body').pgNotification({
                                    style: 'flip',
                                    message: 'Success Approve '+$scope.pr.code,
                                    position: 'top-right',
                                    timeout: 2000,
                                    type: 'success'
                                }).show();
                                $scope.clear();
                            },
                            function (err){
                                console.log(err)
                                $('#form-input').pgNotification({
                                    style: 'flip',
                                    message: 'Error Approve: '+err.code,
                                    position: 'top-right',
                                    timeout: 2000,
                                    type: 'danger'
                                }).show();
                            })
                        }
                        else {
                            $scope.nested.dtInstance.reloadData(function(obj){
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
                    }



                }
            },
            function (err){
                console.log(err)
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
    $scope.addItemDetail = function(result){
        console.log('addItemDetail')
        console.log($scope.items)
        var defer = $q.defer();
        var paramItem = []
        for (var x=0;x<$scope.items.length;x++){
            paramItem.push([
                result.data.insertId,$scope.items[x].product_id,$scope.items[x].supplier_id,
                parseInt($scope.items[x].qty),parseInt($scope.items[x].price),parseInt($scope.items[x].amount),
                $localStorage.currentUser.name.id,globalFunction.currentDate()
            ])

        }
        console.log(paramItem)
        queryService.post('delete from inv_ml_line_item where ml_id='+result.data.insertId,undefined)
        .then(function (result2){
            queryService.post('insert into inv_ml_line_item(ml_id,product_id,supplier_id,order_qty,net_price,order_amount,created_by,created_date) values ?',[paramItem])
            .then(function (result3){
                console.log(result.data.insertId)
                defer.resolve(result3)
            },
            function (err3){
                console.log(err3)
                defer.reject(err3)
            })
        },
        function (err2){
            queryService.post('insert into inv_ml_line_item(ml_id,product_id,supplier_id,order_qty,net_price,order_amount,created_by,created_date) values ?',[paramItem])
            .then(function (result3){
                console.log(result.data.insertId)
                defer.resolve(result3)
            },
            function (err3){
                console.log(err3)
                defer.reject(err3)
            })
        })


        return defer.promise;
    }

    $scope.addDetail = function(ids){
        //$scope.show.prTable = false;
        //$scope.show.itemTable = true;
        console.log(ids)
        queryService.post(qstring+' and a.id='+ids,undefined)
        .then(function (result){
            console.log(result)

            queryService.get('select id,name,last_order_price from mst_product where is_ml=1 order by id',undefined)
            .then(function(data){
                $scope.products = data.data
            })

            //$scope.pr = result.data[0]
            //console.log($scope.pr)
            $scope.getProductPrice = function(e){
                $scope.item2Add.price = e.last_order_price
                $scope.item2Add.amount = e.last_order_price * $scope.item2Add.qty
                queryService.get('select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',b.price) as char)as price_name from mst_supplier a, inv_prod_price_contract b where a.id = b.supplier_id and a.status=1 and b.product_id ='+e.id+' order by id',undefined)
                .then(function(data){
                    console.log(data)
                    $scope.suppliers = data.data
                })
            }
            $scope.getProductPriceSupplier = function(e){
                $scope.item2Add.price = e.price
                $scope.item2Add.amount = e.price * $scope.item2Add.qty
            }
            $scope.updatePrice = function(e){
                $scope.item2Add.amount = $scope.item2Add.price * $scope.item2Add.qty
            }

            queryService.post(qstringdetail + ' where a.ml_id='+ids,undefined)
            .then(function(data){
                console.log(data)
                console.log($scope.items)
                $scope.items = []
                for (var i=0;i<data.data.length;i++){
                    $scope.items.push({
                        product_id:data.data[i].product_id,
                        product_name:data.data[i].product_name,
                        qty: data.data[i].order_qty,
                        price: data.data[i].net_price,
                        amount: data.data[i].order_amount,
                        supplier_id: data.data[i].supplier_id,
                        supplier_name: data.data[i].supplier_name
                    })
                }
                //$scope.items = data.data
            })
            $scope.nested.dtInstanceItem = {}

            $scope.dtOptionsItem = DTOptionsBuilder.newOptions()
                .withOption('bLengthChange', false)
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withPaginationType('full_numbers')
                .withDisplayLength(100)
                .withLanguage({
                    sZeroRecords: ' ',
                    "sInfo":           "",
                    "sInfoEmpty":      "",
                });
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3),
                DTColumnDefBuilder.newColumnDef(4),
                DTColumnDefBuilder.newColumnDef(5)
            ];
            $scope.item2Add = {
                product_id:'',
                qty: '',
                price: '',
                amount: '',
                supplier_id: ''
            }
            /*$scope.items = _buildPerson2Add({
                product_id:'',
                qty: '',
                price: '',
                amount: '',
                supplier_id: ''
            });
            /*$scope.addPerson = addPerson;
            $scope.modifyPerson = modifyPerson;
            $scope.removePerson = removePerson;*/

            function _buildPerson2Add(d) {
                return d;
            }
            $scope.addItem = function() {
                console.log($scope.item2Add)
                console.log($scope.selected.product)
                $scope.item2Add.product_id = $scope.selected.product.selected?$scope.selected.product.selected.id:null
                $scope.item2Add.product_name = $scope.selected.product.selected?$scope.selected.product.selected.name:null
                if ($scope.selected.supplier){
                    $scope.item2Add.supplier_id = $scope.selected.supplier.selected?$scope.selected.supplier.selected.id:null
                    $scope.item2Add.supplier_name = $scope.selected.supplier.selected?$scope.selected.supplier.selected.name:null
                }
                else {
                    $scope.item2Add.supplier_id = null
                    $scope.item2Add.supplier_name = null
                }

                if ($scope.item2Add.product_id!=null){
                    $scope.items.push(angular.copy($scope.item2Add));
                }

                console.log($scope.items)
                //$scope.nested.dtInstanceItem.reloadData();
                $scope.item2Add = {
                    product_id:'',
                    product_name:'',
                    qty: '',
                    price: '',
                    amount: '',
                    supplier_id: '',
                    supplier_name: ''
                };
            }
            $scope.modifyItem = function(index) {
                console.log(index)
                console.log($scope.items[index])
                $scope.selected.product.selected = {
                    id: $scope.items[index].product_id,
                    name: $scope.items[index].product_name
                }
                $scope.selected.supplier.selected = {
                    id: $scope.items[index].supplier_id,
                    name: $scope.items[index].supplier_name
                }
                queryService.get('select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',b.price) as char)as price_name from mst_supplier a, inv_prod_price_contract b where a.id = b.supplier_id and a.status=1 and b.product_id ='+$scope.items[index].product_id+' order by id',undefined)
                .then(function(data){
                    console.log(data)
                    $scope.suppliers = data.data
                })
                $scope.item2Add = $scope.items[index];
                $scope.items.splice(index, 1);

            }
            $scope.removeItem = function(index) {
                console.log(index)
                $scope.items.splice(index, 1);
            }

        })
    }



    $scope.update = function(ids){
        $('#form-input').modal('show');
        $scope.pr.id = ids
        console.log(qstring)
        console.log($scope.updateState)
        //$scope.updateState = true
        console.log($scope.updateState)

        queryService.post(qstring+' and a.id='+ids,undefined)
        .then(function (result){
            console.log(result)

            $scope.pr = result.data[0]
            $scope.selected.warehouse = {
                selected: {
                    id:result.data[0].warehouse_id,
                    name:result.data[0].warehouse_name
                }
            }
            $scope.selected.cost_center = {
                selected: {
                    id:result.data[0].cost_center_id,
                    name:result.data[0].cost_center_name
                }
            }
            $scope.selected.doc_status = {
                selected: {
                    id:result.data[0].doc_status_id,
                    name:result.data[0].doc_status_name
                }
            }
            $scope.statusState = false
            $scope.doc_status = []
            if ($scope.el.indexOf('approvalDeptHead')>-1){
                //$scope.doc_status.push($scope.doc_status_def[0])
                $scope.doc_status.push($scope.doc_status_def[1])
            }
            else if ($scope.el.indexOf('approvalPoManager')>-1){
                //$scope.doc_status.push($scope.doc_status_def[1])
                $scope.doc_status.push($scope.doc_status_def[2])
            }
            else if ($scope.el.indexOf('approvalCostControl')>-1){
                //$scope.doc_status.push($scope.doc_status_def[2])
                $scope.doc_status.push($scope.doc_status_def[3])
            }
            else if ($scope.el.indexOf('approvalFinance')>-1){
                //$scope.doc_status.push($scope.doc_status_def[3])
                $scope.doc_status.push($scope.doc_status_def[4])
            }
            else if ($scope.el.indexOf('approvalGm')>-1){
                //$scope.doc_status.push($scope.doc_status_def[4])
                $scope.doc_status.push($scope.doc_status_def[5])
            }
            else $scope.doc_status.push($scope.doc_status_def[0])

            /*for (var i=result.data[0].doc_status_id;i<(result.data[0].doc_status_id+1);i++){
                $scope.doc_status.push($scope.doc_status_def[i])
            }*/
            if ((result.data[0].approval_status==0||result.data[0].approval_status==2) && result.data[0].doc_status_id==1){
                console.log('satu')
                $scope.statusState=true
                $scope.selected.approval = 0
                $scope.approveState = false
                $scope.rejectState = true
            }
            else if (result.data[0].approval_status==0 && result.data[0].doc_status_id>1){
                console.log('dua')
                $scope.statusState=true
            }
            else {
                console.log('tiga')
                $scope.selected.approval = 0
                $scope.approveState = true
                $scope.rejectState = true

            }


            if ((result.data[0].doc_status_id==1) && $scope.el.indexOf('buttonCreate')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==2&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==1 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalDeptHead')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==3&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==2 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalPoManager')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==4&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==3 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalCostControl')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==5&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==4 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalFinance')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==6&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==5 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalGm')>-1) $scope.viewMode = false
            else $scope.viewMode = true

            console.log($scope.viewMode)
            $scope.addDetail(ids)
        },
        function (err){
            console.log(err)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Insert: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

    }

    $scope.delete = function(ids){
        $scope.pr.id = ids;
        //$scope.customer.name = obj.name;
        queryService.post(qstring+' and a.id='+ids,undefined)
        .then(function (result){
            console.log(result)
            $scope.pr = result.data[0]
            $('#modalDelete').modal('show')
        },
        function (err){
            console.log(err)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Display: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

    }

    $scope.execDelete = function(){
        console.log('Under Construction')
    }

    $scope.clear = function(){
        console.log('clear')
        $scope.pr = {
            id: '',
            code: '',
            ml_notes: '',
            delivery_date: '',
            approval_notes: '',
            doc_status_name: ''
        }
        $scope.selected = {
            status: {},
            product: {},
            warehouse: {},
            delivery_type: {},
            cost_center: {},
            doc_status: {},
            approval: 0
        }

        $scope.updateState = false
    }

})
