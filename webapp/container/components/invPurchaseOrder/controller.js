
var userController = angular.module('app', []);
userController
.controller('InvPurchaseOrderCtrl',
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
    $scope.finalState = false;
	$scope.disableAction = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    var qstring = "select a.id,a.code,a.pr_id,a.ml_id,DATE_FORMAT(a.created_date,'%Y-%m-%d') created_date,DATE_FORMAT(a.delivery_date,'%Y-%m-%d') as delivery_date, "+
    	"a.po_source,a.supplier_id, a.warehouse_id, a.cost_center_id, a.notes, a.doc_submission_date, a.delivery_type,a.delivery_status,a.receive_status,  "+
        "a.payment_type,a.due_days,a.currency_id, b.name supplier_name,c.name cost_center_name,d.name warehouse_name,g.dept_name dept, b.address supplier_address, "+
        "b.contact_person supplier_cp,b.phone_number supplier_phone,b.fax_number supplier_fax,date_format(date_add(released_date,interval due_days day),'%Y-%m-%d')expired_date, "+
        "format((SELECT SUM(amount) FROM inv_po_line_item item WHERE item.po_id = a.id),0) AS 'Total',  "+
        "(select name from table_ref r where table_name = 'inv_purchase_order' and column_name = 'delivery_status' and value=a.delivery_status) as delivery_status_name , "+
        "if(a.pr_id,f.code,g.code) doc_prev_code,if(a.pr_id,f.created_name,g.created_name) prev_created_name, "+
        "date_format(if(a.pr_id,f.created_date,g.created_date),'%Y-%m-%d') prev_created_date,if(a.pr_id,f.dept_name,g.dept_name) prev_dept, "+
        "f.code pr_code,g.code ml_code,f.purchase_type " +
    "from inv_purchase_order a  "+
    "left join mst_supplier b on a.supplier_id=b.id  "+
    "left join mst_cost_center c on a.cost_center_id=c.id  "+
    "left join mst_warehouse d on a.warehouse_id = d.id  "+
    //"left join (select m.id,m.name,n.name dept from user m,mst_department n where m.department_id=n.id) e on a.created_by=e.id  "+
    "left join (select a.id,a.code,a.created_by, b.name created_name,a.created_date,c.name dept_name,a.purchase_type from inv_purchase_request a "+
    "	left join user b on a.created_by = b.id "+
    "	left join mst_department c on b.department_id = c.id) f on a.pr_id=f.id "+
    "left join (select a.id,a.code,a.created_by, b.name created_name,a.created_date,c.name dept_name from inv_market_list a "+
    "	left join user b on a.created_by = b.id "+
    "	left join mst_department c on b.department_id = c.id) g on a.ml_id = g.id"
    var qwhere = '';
    var qstringdetail = 'select a.id as p_id,a.product_id,b.code product_code, b.name as product_name,a.order_qty qty,a.price,a.amount,c.name unit_name,a.order_notes '+
        'from inv_po_line_item a '+
        'left join mst_product b on a.product_id = b.id '+
        'left join ref_product_unit c on b.unit_type_id = c.id';
    var qstringdetailnon = 'select a.id as p_id,a.product_id,\'\' product_code, a.product_name as product_name,a.order_qty qty,a.price,a.amount,a.product_unit unit_name,a.order_notes '+
        'from inv_po_line_item a '+
        'left join mst_product b on a.product_id = b.id '+
        'left join ref_product_unit c on b.unit_type_id = c.id';
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
        approval: 0,
        filter_status: [],
        filter_cost_center: {},
        filter_warehouse: {},
        filter_source: {},
        filter_supplier: {}
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
        $scope.warehouse = data.data
        //$scope.selected.warehouse['selected'] = $scope.warehouse[0]
    })
    queryService.get('select value as id,name from table_ref where table_name = \'inv_purchase_order\' and column_name = \'delivery_status\' and value in(0,1) order by id',undefined)
    .then(function(data){
        $scope.delivery_status = data.data
        $scope.selected.delivery_status['selected'] = $scope.delivery_status[0]
        //$scope.po.delivery_status = $scope.selected.delivery_status.selected.id
    })

    var sqlCtr = 'select a.id,a.name,a.address  '+
        'from mst_supplier a '+
        //'where lower(a.name) like \''+text.toLowerCase()+'%\'' +
        ' order by name limit 50'
    //queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
    queryService.post(sqlCtr,undefined)
    .then(function(data){
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
                '<button class="btn btn-default" title="Update" ng-click="update(\'' + data + '\')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(\'' + data + '\')">' +
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
    .withDisplayLength(15)
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('PO No').withOption('width', '12%'),
        DTColumnBuilder.newColumn('delivery_status_name').withTitle('Status').withOption('width', '5%'),
        DTColumnBuilder.newColumn('warehouse_name').withTitle('Store Location').withOption('width', '10%'),
        DTColumnBuilder.newColumn('cost_center_name').withTitle('Cost Center').withOption('width', '10%'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier').withOption('width', '12%'),
        DTColumnBuilder.newColumn('Total').withTitle('Total').withClass('text-right').withOption('width', '8%'),
        DTColumnBuilder.newColumn('delivery_date').withTitle('Expected').withOption('width', '5%'),
        DTColumnBuilder.newColumn('expired_date').withTitle('Expired').withOption('width', '5%'),
        DTColumnBuilder.newColumn('doc_prev_code').withTitle('PR/ML No').withOption('width', '12%'),
        DTColumnBuilder.newColumn('prev_created_date').withTitle('PR/ML Date').withOption('width', '7%'),
        DTColumnBuilder.newColumn('prev_created_name').withTitle('Created By').withOption('width', '7%'),
        DTColumnBuilder.newColumn('prev_dept').withTitle('Dept').withOption('width', '7%')
    );

    var qwhereobj = {
        text: '',
        status: '',
        cost_center: '',
        warehouse: '',
        date: '',
        source: '',
        supplier: ''
    }
    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhereobj.text = ' a.code like \'%'+$scope.filterVal.search+'%\' '
                else qwhereobj.text = ''
                qwhere = setWhere()
                //if ($scope.filterVal.search.length>0) qwhere = ' and a.code like \'%'+$scope.filterVal.search+'%\' '
                //else qwhere = ''

                $scope.nested.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }

    }
    $scope.source = [
        {id: '0',name: 'PR'},
        {id: '1',name: 'ML'}
    ]
    $scope.f = {filter_date : ''}
    $scope.applyFilter = function(){
        //console.log($scope.selected.filter_status)
        var status = []
        if ($scope.selected.filter_status.length>0){
            for (var i=0;i<$scope.selected.filter_status.length;i++){
                status.push($scope.selected.filter_status[i].id)
            }
            qwhereobj.status = ' a.delivery_status in('+status.join(',')+') '
        }

        //console.log($scope.selected.filter_cost_center)
        if ($scope.selected.filter_cost_center.selected){
            qwhereobj.cost_center = ' a.cost_center_id = '+$scope.selected.filter_cost_center.selected.id+ ' '
        }
        //console.log($scope.selected.filter_warehouse)
        if ($scope.selected.filter_warehouse.selected){
            qwhereobj.warehouse = ' a.warehouse_id = '+$scope.selected.filter_warehouse.selected.id+ ' '
        }
        if ($scope.selected.filter_supplier.selected){
            qwhereobj.supplier = ' a.supplier_id = '+$scope.selected.filter_supplier.selected.id+ ' '
        }
        if ($scope.selected.filter_source.selected){
            qwhereobj.source = ' a.po_source = \''+$scope.selected.filter_source.selected.name+ '\' '
        }
        //console.log($scope.f.filter_date)
        if ($scope.f.filter_date1.length>0 && $scope.f.filter_date2.length>0){
            qwhereobj.date = ' a.delivery_date between \''+$scope.f.filter_date1+ ' 00:00:00\'  and \''+$scope.f.filter_date2+' 23:59:59\' '
        }
        else qwhereobj.date = ''
        //console.log(setWhere())
        qwhere = setWhere()
        $scope.nested.dtInstance.reloadData(function(obj){
            console.log(obj)
        }, false)

    }
    function setWhere(){
        var arrWhere = []
        var strWhere = ''
        for (var key in qwhereobj){
            if (qwhereobj[key].length>0) arrWhere.push(qwhereobj[key])
        }
        if (arrWhere.length>0){
            strWhere = ' where ' + arrWhere.join(' and ')
        }
        //console.log(strWhere)
        return strWhere
    }
    $scope.showAdvance = false
    $scope.openAdvancedFilter = function(val){
        $scope.showAdvance = val
        if (val==false){
            $scope.selected.filter_status = []
            $scope.selected.filter_cost_center = {}
            $scope.selected.filter_warehouse = {}
            $scope.selected.filter_source = {}
            $scope.selected.filter_supplier = {}
            $scope.f.filter_date = ''
        }
    }

    /*END AD ServerSide*/

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
        //$scope.show.itemTable=true
        //$scope.addDetail(0)
    }

    $scope.submit = function(){
		$scope.disableAction = true;
        console.log(JSON.stringify($scope.po))
        console.log(JSON.stringify($scope.items))
        if ($scope.po.id.length==0 ){
            //exec creation
            if ($scope.items.length>0){
                var param = {}
                param = {
                    code: $scope.po.code,
                    delivery_status: $scope.selected.delivery_status.selected.id,
                    delivery_date: $scope.po.delivery_date,
                    //po_source: 'PO',
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
                    var q = $scope.child.saveTable(result.data.insertId)
                    queryService.post(q.join(';'),undefined)
                    .then(function (result3){
                        $scope.disableAction = false;
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
                        $scope.disableAction = false;
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
                    $scope.disableAction = false;
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
				$scope.disableAction = false;
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Cannot Add PO, Item list is Empty !!',
                    position: 'top-right',
                    timeout: 10000,
                    type: 'danger'
                }).show();

            }
        }
        else {
            console.log($scope.po)
            console.log($scope.items)
            //exec update
            param = {
                code: $scope.po.code,
                delivery_status: $scope.po.delivery_status,
                delivery_date: $scope.po.delivery_date,
                //po_source: 'PO',
                pr_id: $scope.po.pr_id,
                ml_id: $scope.po.ml_id,
                warehouse_id: $scope.po.warehouse_id,
                cost_center_id: $scope.po.cost_center_id,
                notes: $scope.po.notes,
                supplier_id: $scope.po.supplier_id,
                currency_id: $scope.selected.currency.selected?$scope.selected.currency.selected.id:null,

                payment_type: $scope.po.payment_type,
                due_days: $scope.po.due_days,
                //doc_submission_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id,
                modified_date: globalFunction.currentDate(),
                released_by: ($scope.po.delivery_status==1?$localStorage.currentUser.name.id:null),
                released_date: ($scope.po.delivery_status==1?globalFunction.currentDate():null),
            }


            queryService.post('update inv_purchase_order set ? where id='+$scope.po.id,param)
            .then(function (result){
                console.log(result)
                result.data['insertId'] = $scope.po.id
                if ($scope.po.delivery_status == 1){
                    console.log('CALL `po-receive`('+$scope.po.id+','+$localStorage.currentUser.name.id+')')
                    queryService.post('CALL `po-receive`('+$scope.po.id+','+$localStorage.currentUser.name.id+')', undefined)
                    .then(function (result2){
                        console.log(result2)
                    },
                    function(err2){
                        console.log(err2)
                    })
                }
                var q = $scope.child.saveTable($scope.po.id)
                if (q.length>0){
                    queryService.post(q.join(';'), undefined)
                    .then(function (result3){
                        $scope.disableAction = false;
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
                        $scope.clear();

                    },
                    function (err3){
                        $scope.disableAction = false;
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Insert Line Item: '+err3.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                }
                else {
					$scope.disableAction = false;
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
                }

                var queryState = ''
                var paramState = []
                var paramPr = {}


            },
            function (err){
                $scope.disableAction = false;
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
        var paramItem = []
        var sqlCtr = []
        for (var x=0;x<$scope.items.length;x++){
            paramItem.push([
                result.data.insertId,$scope.items[x].product_id,
                parseInt($scope.items[x].qty),parseInt($scope.items[x].price),
                //parseInt($scope.items[x].amount),
                (parseInt($scope.items[x].qty)*parseInt($scope.items[x].price)),
                $localStorage.currentUser.name.id,globalFunction.currentDate(),$scope.items[x].order_notes
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
            queryService.post('insert into inv_po_line_item(po_id,product_id,order_qty,price,amount,created_by,created_date,order_notes) values ?',[paramItem])
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
            queryService.post('insert into inv_po_line_item(po_id,product_id,order_qty,price,amount,created_by,created_date,order_notes) values ?',[paramItem])
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
        console.log(ids+ ': '+qstring+' where a.id='+ids)
        queryService.post(qstring+' where a.id='+ids,undefined)
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
                $scope.item2Add.amount = $scope.item2Add.price * $scope.item2Add.qty
            }

            queryService.post(($scope.po.purchase_type=='NDN'||$scope.po.purchase_type=='DN'?qstringdetailnon:qstringdetail) + ' where a.po_id='+ids,undefined)
            .then(function(data){
                console.log(data)
                console.log($scope.items)
                $scope.items = []
                for (var i=0;i<data.data.length;i++){
                    $scope.items.push({
                        product_id:data.data[i].product_id,
                        product_name:data.data[i].product_name,
						order_notes: data.data[i].order_notes,
                        qty: data.data[i].order_qty,
                        price: data.data[i].price,
                        amount: data.data[i].order_amount
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
                DTColumnDefBuilder.newColumnDef(3).withOption('width', '10%'),
                DTColumnDefBuilder.newColumnDef(4).withOption('width', '10%')
            ];
            $scope.item2Add = {
                product_id:'',
                qty: '',
                price: '',
                amount: ''
                //supplier_id: ''
            }

            function _buildPerson2Add(d) {
                return d;
            }
            $scope.addItem = function() {
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

                //$scope.nested.dtInstanceItem.reloadData();
                $scope.item2Add = {
                    product_id:'',
                    product_name:'',
					order_notes:'',
                    qty: '',
                    price: '',
                    amount: '',
                    //supplier_id: '',
                    //supplier_name: '',
                    old_price: '',
                    new_price: ''
                };
            }
            $scope.modifyItem = function(index) {
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
                $scope.items.splice(index, 1);
            }
        })
    }



    $scope.update = function(ids){
        $('#form-input').modal('show');
        $scope.po.id = ids

        queryService.post(qstring+' where a.id='+ids,undefined)
        .then(function (result){
            if (result.data[0].delivery_status==1){
                $scope.finalState = true;
            }
            else if(result.data[0].delivery_status==0){
                $scope.finalState = false;
            }

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
                    id:result.data[0].delivery_status,
                    name:result.data[0].delivery_status_name
                }
            }
            $scope.selected.supplier = {
                selected: {
                    id:result.data[0].supplier_id,
                    name:result.data[0].supplier_name
                }
            }
            for (var i=0;i<$scope.payment_type.length;i++){
                if ($scope.payment_type[i].id == result.data[0].payment_type){
                    $scope.selected.payment_type = {
                        selected: $scope.payment_type[i]
                    }
                }
            }

            $scope.items = []
            $scope.itemsOri = []
            queryService.post(($scope.po.purchase_type=='NDN'||$scope.po.purchase_type=='DN'?qstringdetailnon:qstringdetail)+' where a.po_id='+ids,undefined)
            .then(function (result2){
                $scope.totalQty = 0
                $scope.tAmt = 0
                for (var i=0;i<result2.data.length;i++){
                    $scope.items.push({
                        id:(i+1),
                        p_id: result2.data[i].p_id,
                        product_id:result2.data[i].product_id,
                        product_code:result2.data[i].product_code,
                        product_name: result2.data[i].product_name,
                        price:result2.data[i].price,
						order_notes:result2.data[i].order_notes,
                        qty: result2.data[i].qty,
                        amount: result2.data[i].amount,
                        unit_name: result2.data[i].unit_name
                    })
                    $scope.totalQty += result2.data[i].qty
                    $scope.tAmt  += result2.data[i].amount
                }
                $scope.itemsOri = angular.copy($scope.items)
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
        var qstring = 'select id, code from inv_purchase_order where id='+ids
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
            delivery_status: 2
        },$scope.po.id]
        queryService.post('update inv_purchase_order set ? where id=?',param)
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
.controller('EditableTablePoCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    $scope.item = {
        product_id:'',
        product_name:'',
		order_notes: '',
        qty: '',
        price: '',
        amount: ''
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
    $scope.product = {}
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.items.length+1),
            product_id:'',
            price:'',
			order_notes: '',
            qty: '',
            amount: '',
            unit_name: '',
            isNew: true
        };
        $scope.items.push($scope.item)
        queryService.get('select a.id,a.code,a.name,a.last_order_price,b.name unit_name from mst_product a left join ref_product_unit b on a.unit_type_id=b.id order by id limit 20 ',undefined)
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
        var results = [];
        var sqlitem = []
		for (var i =0;i< $scope.items.length; i++) {
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
                sqlitem.push('insert into inv_po_line_item (po_id,product_id,order_qty,price,amount,created_by,created_date,order_notes) values('+
                pr_id+','+user.product_id+','+user.qty+','+user.price+','+user.amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',"'+user.order_notes+'")')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from inv_po_line_item where id='+user.p_id)
            }
            else if(!user.isNew){
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri[j].p_id+$scope.itemsOri[j].product_id+$scope.itemsOri[j].qty+$scope.itemsOri[j].price+$scope.itemsOri[j].order_notes
                        var d2 = user.p_id+user.product_id+user.qty+user.price+user.order_notes
                        if(d1 != d2){
                            sqlitem.push('update inv_po_line_item set '+
                            ' product_id = '+user.product_id+',' +
							' order_notes = '+user.order_notes+',' +
                            ' order_qty = '+user.qty+',' +
                            ' price = '+user.price+',' +
                            ' amount = '+user.amount+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
                        }
                    }
                }
            }

        }
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.productUp = function(d,text) {
        //queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        queryService.post('select a.id,a.code,a.name,a.last_order_price,b.name unit_name from mst_product a left join ref_product_unit b on a.unit_type_id=b.id where lower(a.name) like \''+text.toLowerCase()+'%\' order by id limit 10 ',undefined)
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
        $scope.items[d-1].price = e.last_order_price
        $scope.items[d-1].amount = e.last_order_price*$scope.items[d-1].qty
        $scope.items[d-1].unit_name = e.unit_name
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
        if (t=='qty') {
            $scope.items[d-1].amount = $scope.items[d-1].price*p
            $scope.items[d-1].qty = p
        }
        if (t=='price') {
            $scope.items[d-1].amount = $scope.items[d-1].qty*p
            $scope.items[d-1].price = p
        }
    }
	$scope.updateNotes = function(e,d,p){
		$scope.items[d-1].order_notes = p
	}
});
