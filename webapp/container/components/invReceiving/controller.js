
var userController = angular.module('app', []);
userController
.controller('InvReceivingCtrl',
function($scope, $state, $sce, globalFunction,queryService, $q,prService, DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, $localStorage, $compile, $rootScope, API_URL,
    warehouseService) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    $scope.addItem = false;
    $scope.child = {}
    $scope.items = []
    $scope.itemsOri = []
    console.log($scope.el)
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    var qstring = 'select * from (select aa.*,g.name warehouse_name,h.name cost_center_name from( '+
        'select a.id,a.code,a.po_id,a.received_status status_id,c.name status_name,DATE_FORMAT(a.created_date,\'%Y-%m-%d\') as created_date,'+
        'a.currency_id,d.supplier_id,e.name supplier_name,f.code currency_code,format(a.total_amount,0)total_amount,a.receive_notes notes,d.warehouse_id,'+
        'd.cost_center_id,d.delivery_date,a.home_currency_exchange '+
        'from inv_po_receive a,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f '+
        'where c.table_name=\'inv_po_receive\'  '+
        'and a.received_status=c.value  '+
        'and a.po_id=d.id  '+
        'and d.supplier_id=e.id  '+
        'and a.currency_id=f.id) as aa '+
        'left join mst_warehouse g on aa.warehouse_id = g.id '+
        'left join mst_cost_center h on aa.cost_center_id = h.id ) z '

    var qwhere = '';
    var qstringdetail = 'select b.id rcv_id,a.id,a.code,a.po_id,c.name,a.created_date,a.currency_id,e.name supplier_name,f.code,a.total_amount, b.item_id,g.order_qty,g.price,g.amount,g.product_id,h.name product_name,b.received_qty,b.received_price, '+
        'h.unit_type_id,h.lowest_unit_conversion,h.recipe_unit_conversion,h.lowest_unit_type_id '+
        'from inv_po_receive a,inv_receive_line_item b,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f, inv_po_line_item g ,mst_product h '+
        'where a.id=b.receive_id  '+
        'and c.table_name=\'inv_po_receive\'  '+
        'and a.received_status=c.value  '+
        'and a.po_id=d.id  '+
        'and d.supplier_id=e.id  '+
        'and a.currency_id=f.id  '+
        'and b.item_id=g.id   '+
        'and g.product_id = h.id';
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
    $scope.po = {
        id: '',
        code: '',
        pr_id: '',
        ml_id: '',
        po_source: '',
        supplier_id: '',
        warehouse_id: '',
        cost_center_id: '',
        notes: '',
        doc_submission_date: '',
        delivery_type: '',
        delivery_status: '',
        delivery_date: '',
        receive_status: '',
        payment_type: '',
        due_days: '',
        currency_id: ''
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
        payment_type: {},
        delivery_type: {},
        delivery_status: {},
        cost_center: {},
        doc_status: {},
        currency: {},
        approval: 0
    }
    $scope.product = []
    $scope.delivery_status = []
    $scope.supplier = []
    $scope.warehouse = []
    $scope.cost_center = []
    $scope.doc_status = []
    $scope.doc_status_def = []
    $scope.payment_type = [{
        id: 0,
        name: 'Credit'
    },
    {
        id: 1,
        name: 'Cash'

    }]
    $scope.selected.payment_type['selected'] = $scope.payment_type[0]

    $scope.po = {
        id: '',
        code: '',
        pr_id: '',
        ml_id: '',
        po_source: '',
        supplier_id: '',
        warehouse_id: '',
        cost_center_id: '',
        notes: '',
        doc_submission_date: '',
        delivery_type: '',
        delivery_status: '',
        delivery_date: '',
        receive_status: '',
        payment_type: '',
        due_days: '',
        currency_id: ''
    }

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    queryService.get('select a.id, a.code,a.name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
        'from mst_cost_center a, mst_department b '+
        'where a.department_id = b.id '+
        'order by a.code asc limit 10',undefined)
    .then(function(data){
        $scope.cost_center = data.data
    })
    $scope.costCenterUp = function(text){
        console.log(text)
        queryService.post('select a.id, a.code,a.name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
            'from mst_cost_center a, mst_department b '+
            'where a.department_id = b.id '+
            ' and lower(a.code) like \'%'+text+'%\' '+
            'order by a.code asc limit 10',undefined)
        .then(function(data){
            $scope.cost_center = data.data
        })

    }
    queryService.get('select id,code name from ref_currency order by id',undefined)
    .then(function(data){
        $scope.currency = data.data
        $scope.selected.currency['selected'] = $scope.currency[0]
    })
    queryService.get('select id,name from mst_warehouse order by name',undefined)
    .then(function(data){
        console.log(data)
        $scope.warehouse = data.data
        //$scope.selected.warehouse['selected'] = $scope.warehouse[0]
    })
    queryService.get('select value as id,name from table_ref where table_name = \'inv_purchase_order\' and column_name = \'delivery_status\' order by id',undefined)
    .then(function(data){
        console.log(data)
        $scope.delivery_status = data.data
        $scope.selected.delivery_status['selected'] = $scope.delivery_status[0]
        //$scope.po.delivery_status = $scope.selected.delivery_status.selected.id
        console.log($scope.po)
    })

    var sqlCtr = 'select a.id,a.name,a.address  '+
        'from mst_supplier a '+
        //'where lower(a.name) like \''+text.toLowerCase()+'%\'' +
        ' order by name limit 50'
    //queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
    queryService.post(sqlCtr,undefined)
    .then(function(data){
        console.log(data)
        $scope.supplier = data.data
    })

    $scope.supplierUp = function(text) {
        console.log(text.toLowerCase())
        var sqlCtr = 'select a.id,a.name,a.address  '+
            'from mst_supplier a '+
            'where lower(a.name) like \''+text.toLowerCase()+'%\'' +
            ' order by name limit 50'
        //queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
        queryService.post(sqlCtr,undefined)
        .then(function(data){
            console.log(data)
            $scope.supplier = data.data
        })
    }

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
        type: 'POST',
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
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '12%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('PO Number'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('created_date').withTitle('Created at'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier'),
        DTColumnBuilder.newColumn('currency_code').withTitle('Currency'),
        DTColumnBuilder.newColumn('total_amount').withTitle('Amount')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' where z.code like \'%'+$scope.filterVal.search+'%\' '
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
    }

    $scope.submit = function(){
        console.log(JSON.stringify($scope.po))
        console.log(JSON.stringify($scope.items))
        if ($scope.po.id.length==0 ){
            //exec creation
            /*if ($scope.items.length>0){
                var param = {}
                param = {
                    code: $scope.po.code,
                    delivery_status: $scope.selected.delivery_status.selected.id,
                    delivery_date: $scope.po.delivery_date,
                    po_source: 'PO',
                    //pr_id: $scope.po.pr_id,
                    //ml_id: $scope.po.ml_id,
                    warehouse_id: $scope.selected.warehouse.selected?$scope.selected.warehouse.selected.id:null,
                    cost_center_id: $scope.selected.cost_center.selected?$scope.selected.cost_center.selected.id:null,
                    notes: $scope.po.notes,
                    supplier_id: $scope.selected.supplier.selected?$scope.selected.supplier.selected.id:null,
                    currency_id: $scope.selected.currency.selected?$scope.selected.currency.selected.id:null,
                    payment_type: $scope.selected.payment_type.selected.id,
                    due_days: $scope.po.due_days,
                    doc_submission_date: globalFunction.currentDate(),
                    created_by: $localStorage.currentUser.name.id,
                    created_date: globalFunction.currentDate()
                }

                console.log(param)
                queryService.post('insert into inv_purchase_order set ?',param)
                .then(function (result){
                    console.log(result.data.insertId)
                    $scope.addItemDetail(result)
                    .then(function (result3){
                        console.log(result.data.insertId)
                        $('#form-input').modal('hide')
                        $scope.nested.dtInstance.reloadData(function(obj){
                            // console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert PR '+$scope.po.code,
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
                    message: 'Cannot Add PO, Item list is Empty !!',
                    position: 'top-right',
                    timeout: 10000,
                    type: 'danger'
                }).show();
            }*/
        }
        else {
            console.log($scope.po)
            console.log($scope.items)
            //exec update
            param = {
                received_status: $scope.selected.delivery_status.selected.id,
                modified_by: $localStorage.currentUser.name.id,
                modified_date: globalFunction.currentDate()
            }


            queryService.post('update inv_po_receive set ? where id='+$scope.po.id,param)
            .then(function (result){
                console.log(result)
                result.data['insertId'] = $scope.po.id
                if ($scope.selected.delivery_status.selected.id == 1 || $scope.selected.delivery_status.selected.id == 3||$scope.selected.delivery_status.selected.id == 4){
                    //console.log('CALL `receive-ap`('+$scope.po.id+','+$localStorage.currentUser.name.id+')')
                    //queryService.post('CALL `receive-ap`('+$scope.po.id+','+$localStorage.currentUser.name.id+')', undefined)
                    var q = $scope.child.saveTable($scope.po.id)
                    queryService.post(q.join(';'), undefined)
                    .then(function (result2){
                        console.log(result2)
                        $('#form-input').modal('hide')
                        $scope.nested.dtInstance.reloadData(function(obj){
                            // console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert PO '+$scope.po.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                        $scope.clear();
                    },
                    function(err2){
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Insert Line Item: '+err2.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                }
                /*$scope.addItemDetail(result)
                .then(function (result3){
                    console.log(result.data.insertId)
                    //PO-Receive
                    $('#form-input').modal('hide')
                    $scope.nested.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert PO '+$scope.po.code,
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
                })*/
                var queryState = ''
                var paramState = []
                var paramPr = {}


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
        console.log(result.data)
        var defer = $q.defer();
        var sqlCtr = []
        for (var x=0;x<$scope.items.length;x++){
            sqlCtr.push('update inv_receive_line_item set received_price='+$scope.items[x].received_price+',received_qty='+$scope.items[x].received_qty+', modified_date=\''+globalFunction.currentDate()+'\','+
                ' modified_by = '+$localStorage.currentUser.name.id+', total_amount='+($scope.items[x].received_price*$scope.items[x].received_qty)+' where id='+$scope.items[x].id
            )
        }
        if (sqlCtr.length>0){
            console.log('Execute update Line Item')
            queryService.post(sqlCtr.join(';'),undefined)
            .then(function (result2){
                console.log('Contract:'+JSON.stringify(result2))
                defer.resolve(result2)
            },
            function (err2){
                console.log('Contract:'+JSON.stringify(err2))
                defer.reject(err2)
            })
        }
        /*var paramItem = []
        var sqlCtr = []
        for (var x=0;x<$scope.items.length;x++){
            paramItem.push([
                result.data.insertId,$scope.items[x].product_id,
                parseInt($scope.items[x].qty),parseInt($scope.items[x].price),
                //parseInt($scope.items[x].amount),
                (parseInt($scope.items[x].qty)*parseInt($scope.items[x].price)),
                $localStorage.currentUser.name.id,globalFunction.currentDate()
            ])
            if ($scope.items[x].old_price == null && $scope.items[x].new_price!=undefined){
                sqlCtr.push('insert into inv_prod_price_contract(product_id,supplier_id,contract_status,contract_start_date,contract_end_date,price,created_date,created_by)' +
                    ' values('+$scope.items[x].product_id+', '+$scope.po.supplier_id+', \'1\', \''+globalFunction.currentDate()+'\', \''+globalFunction.endOfYear()+'\', '+
                    ' '+$scope.items[x].new_price+', \''+globalFunction.currentDate()+'\', '+$localStorage.currentUser.name.id+')'
                )
            }
            else if($scope.items[x].old_price != $scope.items[x].new_price){
                sqlCtr.push('update inv_prod_price_contract set price='+$scope.items[x].new_price+', modified_date=\''+globalFunction.currentDate()+'\','+
                    ' modified_by = '+$localStorage.currentUser.name.id+' where product_id='+$scope.items[x].product_id+' and supplier_id='+$scope.po.supplier_id
                )
            }
        }
        console.log(sqlCtr)
        console.log(paramItem)
        if (sqlCtr.length>0){
            console.log('Execute update Contract')
            queryService.post(sqlCtr.join(';'),undefined)
            .then(function (result2){
                console.log('Contract:'+JSON.stringify(result2))
            },
            function (err2){
                console.log('Contract:'+JSON.stringify(err2))
            })
        }

        queryService.post('delete from inv_po_line_item where po_id='+result.data.insertId,undefined)
        .then(function (result2){
            console.log(result2)
            queryService.post('insert into inv_po_line_item(po_id,product_id,order_qty,price,amount,created_by,created_date) values ?',[paramItem])
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
            console.log(err2)
            queryService.post('insert into inv_po_line_item(po_id,product_id,order_qty,price,amount,created_by,created_date) values ?',[paramItem])
            .then(function (result3){
                console.log(result.data.insertId)
                defer.resolve(result3)
            },
            function (err3){
                console.log(err3)
                defer.reject(err3)
            })
        })*/


        return defer.promise;
    }

    $scope.addDetail = function(ids){
        //$scope.show.prTable = false;
        //$scope.show.itemTable = true;
        console.log(ids+ ': '+qstring+' where z.id='+ids)
        queryService.post(qstring+' where z.id='+ids,undefined)
        .then(function (result){
            console.log(result)

            queryService.get('select id,name,last_order_price from mst_product order by id limit 50 ',undefined)
            .then(function(data){
                $scope.products = data.data
            })
            $scope.productUp = function(text) {
                console.log(text.toLowerCase())
                queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
                .then(function(data){
                    console.log(data)
                    $scope.products = data.data
                })


            }

            $scope.getProductPrice = function(e){
                $scope.item2Add.price = e.last_order_price
                $scope.item2Add.amount = e.last_order_price * $scope.item2Add.qty
                /*var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
                    'from mst_supplier a '+
                    'left join inv_prod_price_contract b '+
                    'on a.id = b.supplier_id  '+
                    'and a.status=1  '+
                    'and b.product_id ='+e.id+' order by price desc limit 50'
                queryService.get(sqlCtr,undefined)
                .then(function(data){
                    console.log(data)
                    $scope.suppliers = data.data
                })*/
            }
            $scope.getProductPriceSupplier = function(e){
                $scope.item2Add.price = e.price
                $scope.item2Add.amount = e.price * $scope.item2Add.qty
            }
            $scope.updatePrice = function(e){
                $scope.item2Add.amount = $scope.item2Add.received_price * $scope.item2Add.received_qty
            }
            console.log(qstringdetail + ' and a.id='+ids)

            queryService.post(qstringdetail + ' and a.id='+ids,undefined)
            .then(function(data){
                console.log(data)
                console.log($scope.items)
                $scope.items = []
                for (var i=0;i<data.data.length;i++){
                    $scope.items.push({
                        id: data.data[i].rcv_id,
                        product_id:data.data[i].product_id,
                        product_name:data.data[i].product_name,
                        qty: data.data[i].order_qty,
                        price: data.data[i].price,
                        price: data.data[i].price,
                        amount: data.data[i].amount,
                        received_qty: data.data[i].received_qty==null?0:data.data[i].received_qty,
                        received_price: data.data[i].received_price==null?0:data.data[i].received_price
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
                .withOption('width','800px')
                .withLanguage({
                    sZeroRecords: ' ',
                    "sInfo":           "",
                    "sInfoEmpty":      "",
                });
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).withOption('width', '5%').notSortable(),
                DTColumnDefBuilder.newColumnDef(1).withOption('width', '35%'),
                DTColumnDefBuilder.newColumnDef(2).withOption('width', '5%'),
                DTColumnDefBuilder.newColumnDef(2).withOption('width', '5%'),
                DTColumnDefBuilder.newColumnDef(3).withOption('width', '10%'),
                DTColumnDefBuilder.newColumnDef(3).withOption('width', '10%'),
                DTColumnDefBuilder.newColumnDef(4).withOption('width', '10%')
            ];
            $scope.item2Add = {
                id: '',
                product_id:'',
                qty: '',
                price: '',
                amount: '',
                received_qty: '',
                received_price: ''
                //supplier_id: ''
            }

            function _buildPerson2Add(d) {
                return d;
            }
            $scope.addItem = function() {
                console.log($scope.item2Add)
                console.log($scope.selected.product)
                console.log($scope.selected.supplier)
                $scope.item2Add.product_id = $scope.selected.product.selected?$scope.selected.product.selected.id:null
                $scope.item2Add.product_name = $scope.selected.product.selected?$scope.selected.product.selected.name:null
                if ($scope.selected.supplier){
                    //$scope.item2Add.supplier_id = $scope.selected.supplier.selected?$scope.selected.supplier.selected.id:null
                    //$scope.item2Add.supplier_name = $scope.selected.supplier.selected?$scope.selected.supplier.selected.name:null
                    $scope.item2Add.old_price = $scope.selected.supplier.selected?$scope.selected.supplier.selected.price:null
                }
                else {
                    //$scope.item2Add.supplier_id = null
                    //$scope.item2Add.supplier_name = null
                    $scope.item2Add.old_price = null
                }
                $scope.item2Add.new_price = $scope.item2Add.price

                if ($scope.item2Add.product_id!=null){
                    $scope.items.push(angular.copy($scope.item2Add));
                }

                console.log($scope.items)
                //$scope.nested.dtInstanceItem.reloadData();
                $scope.item2Add = {
                    id: '',
                    product_id:'',
                    product_name:'',
                    qty: '',
                    price: '',
                    amount: '',
                    received_qty: '',
                    received_price: '',
                    old_price: '',
                    new_price: ''
                };
            }
            $scope.modifyItem = function(index) {
                console.log(index)
                console.log($scope.items[index])
                $scope.selected.product.selected = {
                    id: $scope.items[index].product_id,
                    name: $scope.items[index].product_name
                }
                /*if ($scope.selected.supplier.selected){
                    $scope.selected.supplier.selected = {
                        id: $scope.items[index].supplier_id,
                        name: $scope.items[index].supplier_name
                    }
                }*/

                /*var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
                    'from mst_supplier a '+
                    'left join inv_prod_price_contract b '+
                    'on a.id = b.supplier_id  '+
                    'and a.status=1  '+
                    'and b.product_id ='+$scope.items[index].product_id+' order by price desc limit 50'
                queryService.get(sqlCtr,undefined)
                //queryService.get('select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',b.price) as char)as price_name from mst_supplier a, inv_prod_price_contract b where a.id = b.supplier_id and a.status=1 and b.product_id ='+$scope.items[index].product_id+' order by id',undefined)
                .then(function(data){
                    console.log(data)
                    $scope.suppliers = data.data
                })*/
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
        $scope.po.id = ids
        console.log(qstring)

        queryService.post(qstring+' where z.id='+ids,undefined)
        .then(function (result){
            console.log(result)

            $scope.po = result.data[0]
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
            $scope.selected.delivery_status = {
                selected: {
                    id:result.data[0].status_id,
                    name:result.data[0].status_name
                }
            }
            $scope.selected.supplier = {
                selected: {
                    id:result.data[0].supplier_id,
                    name:result.data[0].supplier_name
                }
            }

            $scope.items = []
            $scope.itemsOri = []
            queryService.post(qstringdetail+' and a.id='+ids,undefined)
            .then(function (result2){
                for (var i=0;i<result2.data.length;i++){
                    $scope.items.push({
                        id:(i+1),
                        p_id: result2.data[i].rcv_id,
                        product_id:result2.data[i].product_id,
                        product_name:result2.data[i].product_name,
                        item_id: result2.data[i].item_id,
                        qty: result2.data[i].order_qty,
                        rcv_qty: result2.data[i].receive_qty,
                        price: result2.data[i].price,
                        rcv_price: result2.data[i].received_price,
                        amount: result2.data[i].amount,
                        lowest_unit_conversion: result2.data[i].lowest_unit_conversion,
                        recipe_unit_conversion: result2.data[i].recipe_unit_conversion,
                        lowest_unit_type_id: result2.data[i].lowest_unit_type_id,
                        unit_type_id: result2.data[i].unit_type_id
                    })
                }
                $scope.itemsOri = angular.copy($scope.items)
                console.log($scope.items)
            },
            function(err2){
                console.log(err2)
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

    $scope.delete = function(ids){
        $scope.po.id = ids;
        //$scope.customer.name = obj.name;
        var qstring = 'select id, code from inv_po_receive where id='+ids
        queryService.post(qstring,undefined)
        .then(function (result){
            console.log(result)
            $scope.po = result.data[0]
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
        var param = [{
            received_status: 2
        },$scope.po.id]
        queryService.post('update inv_po_receive set ? where id=?',param)
        .then(function (result){
            $('#modalDelete').modal('hide')
            $scope.nested.dtInstance.reloadData(function(obj){
                console.log(obj)
            }, false)
            $('body').pgNotification({
                style: 'flip',
                message: 'Success Cancel PO '+$scope.po.code,
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.clear();
        },
        function (err){
            $('#modalDelete').modal('hide')
            $('body').pgNotification({
                style: 'flip',
                message: 'Error Cancel : '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
            $scope.clear();
        })
    }

    $scope.clear = function(){
        console.log('clear')
        $scope.po = {
            id: '',
            code: '',
            pr_id: '',
            ml_id: '',
            po_source: '',
            supplier_id: '',
            warehouse_id: '',
            cost_center_id: '',
            notes: '',
            doc_submission_date: '',
            delivery_type: '',
            delivery_status: '',
            delivery_date: '',
            receive_status: '',
            payment_type: '',
            due_days: '',
            currency_id: ''
        }
        $scope.items = []
        $scope.itemsOri = []
        $scope.selected = {
            status: {},
            product: {},
            supplier: {},
            warehouse: {},
            payment_type: {},
            delivery_type: {},
            delivery_status: {},
            cost_center: {},
            doc_status: {},
            currency: {},
            approval: 0
        }
        $scope.selected.payment_type['selected'] = $scope.payment_type[0]
        $scope.selected.currency['selected'] = $scope.currency[0]
        $scope.selected.delivery_status['selected'] = $scope.delivery_status[0]
    }

})
.controller('EditableTableRecCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    $scope.item = {
        product_id:'',
        product_name:'',
        qty: '',
        rcv_qty: '',
        price: '',
        rcv_price: '',
        amount: ''
    };

    $scope.checkName = function(data, id) {
        console.log('checkName')
        console.log(data)
        console.log(id)
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
    $scope.product = {}
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.items.length+1),
            product_id:'',
            product_name:'',
            qty: '',
            rcv_qty: '',
            price: '',
            rcv_price: '',
            amount: '',
            isNew: true
        };
        $scope.items.push($scope.item)
        queryService.get('select id,code,name,last_order_price from mst_product order by id limit 20 ',undefined)
        .then(function(data){
            $scope.product[$scope.item.id] = data.data
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
    $scope.child.saveTable = function(pr_id) {
        console.log('asd')
        var results = [];
        console.log($scope.itemsOri)

        console.log(JSON.stringify($scope.items,null,2))
        var sqlitem = []
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
            console.log(user)
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
                sqlitem.push('insert into inv_receive_line_item (receive_id,product_id,order_qty,price,amount,created_by,created_date) values('+
                pr_id+','+user.product_id+','+user.qty+','+user.price+','+user.amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from inv_po_line_item where id='+user.p_id)
            }
            else if(!user.isNew){
                console.log(user)
                var amt = 0
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri[j].p_id+$scope.itemsOri[j].item_id+$scope.itemsOri[j].product_id+$scope.itemsOri[j].rcv_qty+$scope.itemsOri[j].rcv_price
                        var d2 = user.p_id+user.item_id+user.product_id+user.rcv_qty+user.rcv_price
                        console.log($scope.itemsOri[j])
                        console.log(d1)
                        console.log(d2)
                        if(d1 != d2){
                            amt += (user.rcv_qty*user.rcv_price)
                            /*sqlitem.push('update inv_po_line_item set '+
                            ' product_id = '+user.product_id+',' +
                            ' order_qty = '+user.rcv_qty+',' +
                            ' price = '+user.rcv_price+',' +
                            ' amount = '+user.amount+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)*/
                            if ($scope.selected.warehouse.selected){
                                sqlitem.push('INSERT INTO inv_warehouse_stock(warehouse_id,product_id,stock_qty,stock_qty_l,last_order_date,last_order_qty,last_order_supplier_id)'+
                                'values('+$scope.selected.warehouse.selected.id+','+user.product_id+',stock_qty+'+user.qty+',stock_qty_l+'+(user.rcv_qty*user.lowest_unit_conversion)+','+
                                ' \''+globalFunction.currentDate()+'\','+user.rcv_qty+','+$scope.selected.supplier.selected.id+')'+
                                ' ON DUPLICATE KEY UPDATE '+
                                ' stock_qty = stock_qty+'+user.rcv_qty+' ,'+
                                ' stock_qty_l = stock_qty_l+'+(user.rcv_qty*user.lowest_unit_conversion)+' ,'+
                                ' last_order_date = \''+globalFunction.currentDate()+'\','+
                                ' last_order_qty = '+user.rcv_qty+','+
                                ' last_order_supplier_id = '+$scope.selected.supplier.selected.id+' '
                                )
                                sqlitem.push('insert into inv_wh_stock_move(transc_type,receive_id,origin_warehouse_id,dest_warehouse_id,product_id,unit_type_id,'+
                                'qty,lowest_unit_type_id,qty_l,created_by) '+
                                'values(\'RC\','+pr_id+','+$scope.selected.warehouse.selected.id+','+$scope.selected.warehouse.selected.id+','+user.product_id+','+user.unit_type_id+','+
                                ' '+user.rcv_qty+', '+user.lowest_unit_type_id+','+(user.rcv_qty*user.lowest_unit_type_id)+','+$localStorage.currentUser.name.id+')')


                            }
                            else if($scope.selected.cost_center.selected){
                                sqlitem.push('INSERT INTO inv_cost_center_stock(cost_center_id,product_id,stock_qty,stock_qty_l,stock_qty_in_recipe_unit,last_order_date,last_order_qty,last_order_supplier_id)'+
                                'values('+$scope.selected.cost_center.selected.id+','+user.product_id+','+user.rcv_qty+','+(user.rcv_qty*user.lowest_unit_conversion)+','+(user.rcv_qty*user.lowest_unit_conversion*user.recipe_unit_conversion)+','+
                                ' \''+globalFunction.currentDate()+'\','+user.rcv_qty+','+$scope.selected.supplier.selected.id+')'+
                                ' ON DUPLICATE KEY UPDATE '+
                                ' stock_qty = stock_qty+'+user.rcv_qty+' ,'+
                                ' stock_qty_l = stock_qty_l+'+(user.rcv_qty*user.lowest_unit_conversion)+' ,'+
                                ' stock_qty_in_recipe_unit = stock_qty_in_recipe_unit+'+(user.rcv_qty*user.lowest_unit_conversion*user.recipe_unit_conversion)+' ,'+
                                ' last_order_date = \''+globalFunction.currentDate()+'\','+
                                ' last_order_qty = '+user.rcv_qty+','+
                                ' last_order_supplier_id = '+$scope.selected.supplier.selected.id+' '
                                )
                                sqlitem.push('insert into inv_cs_stock_move(transc_type,receive_id,origin_cost_center_id,dest_cost_center_id,product_id,unit_type_id,'+
                                'qty,lowest_unit_type_id,qty_l,created_by) '+
                                'values(\'RC\','+pr_id+','+$scope.selected.cost_center.selected.id+','+$scope.selected.cost_center.selected.id+','+user.product_id+','+user.unit_type_id+','+
                                ' '+user.rcv_qty+', '+user.lowest_unit_type_id+','+(user.rcv_qty*user.lowest_unit_conversion)+','+$localStorage.currentUser.name.id+')')

                            }
                            sqlitem.push('insert into inv_prod_price_contract(supplier_id,product_id,contract_status,contract_start_date,contract_end_date,price,net_price)'+
                            ' values('+$scope.selected.supplier.selected.id+','+user.product_id+',1,\''+globalFunction.currentDate()+'\',\''+globalFunction.next30Day()+'\','+user.rcv_price+','+user.rcv_price+')'+
                            ' ON DUPLICATE KEY UPDATE '+
                            ' previous_price = net_price ,'+
                            ' contract_start_date = \''+globalFunction.currentDate()+'\' ,'+
                            ' contract_end_date = \''+globalFunction.next30Day()+'\','+
                            ' price ='+user.rcv_price+','+
                            ' net_price = '+user.rcv_price)

                            sqlitem.push('update mst_product set'+
                            ' price_per_unit ='+user.rcv_price+','+
                        	' price_per_lowest_unit = '+(user.rcv_price/user.lowest_unit_conversion)+', '+
                        	' price_per_recipe_unit =  '+(user.rcv_price/user.lowest_unit_conversion/user.recipe_unit_conversion)+', '+
                        	' last_order_qty ='+user.rcv_qty+','+
                        	' last_order_price= '+user.rcv_price+','+
                        	' last_order_date= \''+globalFunction.currentDate()+'\' ,'+
                        	' last_supplier='+$scope.selected.supplier.selected.id + ' where id='+user.product_id)
                        }
                    }
                }
            }

        }
        sqlitem.push('insert into acc_ap_voucher(code,source,receive_id,supplier_id,currency_id,total_amount,home_total_amount,status,open_date,created_by)'+
        'values(\''+$scope.po.code+'\',\'RR\','+pr_id+','+$scope.selected.supplier.selected.id+','+$scope.po.currency_id+','+amt+
        ','+($scope.po.home_currency_exchange*amt)+',0,\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+')'
        )
        console.log($scope.items)
        console.log(sqlitem)
        console.log(sqlitem.join(';'))
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };


    $scope.productUp = function(d,text) {
        //queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        queryService.post('select id,code,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 10 ',undefined)
        .then(function(data){
            $scope.product[d] = data.data
        })
    }
    /*$scope.supplierUp = function(text,d) {
        console.log('supplierUp')
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
            $scope.suppliers = data.data
        })
    }*/

    $scope.getProduct = function(e,d){
        console.log(e)
        $scope.items[d-1].product_id = e.id
        $scope.items[d-1].product_name = e.name
        //$scope.items[d-1].price = e.last_order_price
        //$scope.items[d-1].amount = e.last_order_price*$scope.items[d-1].qty
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
    $scope.setValue = function(e,d,p,t){
        console.log(e)
        console.log(d)
        console.log(p)
        console.log(t)
        if (t=='qty') {

            if(parseFloat(p)>parseFloat($scope.items[d-1].qty)){
                $scope.items[d-1].rcv_qty = $scope.items[d-1].qty
                e.target.value=$scope.items[d-1].qty
            }
            else {
                $scope.items[d-1].rcv_qty = p
                e.target.value=p
            }
            $scope.items[d-1].amount = $scope.items[d-1].rcv_price*p
            //$scope.items[d-1].rcv_qty = (parseFloat(p)<=parseFloat($scope.items[d-1].qty)?p:(p.substring(0,p.length-1)))
        }
        if (t=='price') {
            if(parseFloat(p)>parseFloat($scope.items[d-1].price)){
                $scope.items[d-1].rcv_price = $scope.items[d-1].price
                e.target.value=$scope.items[d-1].price
            }
            else {
                $scope.items[d-1].rcv_price = p
                e.target.value=p
            }
            $scope.items[d-1].amount = $scope.items[d-1].rcv_qty*p
            //$scope.items[d-1].rcv_price = p
        }
    }

});
