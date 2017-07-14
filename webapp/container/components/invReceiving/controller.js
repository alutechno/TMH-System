var userController = angular.module('app', []);
userController
.controller('InvReceivingCtrl',
function($scope, $state, $sce, $templateCache,globalFunction,queryService, $q,prService, DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, $localStorage, $compile, $rootScope, API_URL,
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
    $scope.updateState = false;
    $scope.finalState = false;
	$scope.rcv_qty=0;
	$scope.amount=0;
	$scope.disableAction = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    var qstring = "select * from ( "+
    	"select aa.*,g.name warehouse_name,h.name cost_center_name,i.code pr_code,j.code ml_code "+
        "from(  "+
    	"	select a.id,a.code,a.po_id,a.received_status status_id,c.name status_name,DATE_FORMAT(a.created_date,'%Y-%m-%d') as created_date, "+
    	"		a.currency_id,d.supplier_id,e.name supplier_name,f.code currency_code,format(a.total_amount,0)total_amount,a.total_amount TotalSum,a. "+
        "       receive_notes notes,d.warehouse_id,d.cost_center_id,DATE_FORMAT(d.delivery_date,'%Y-%m-%d') delivery_date,a.home_currency_exchange,  "+
        "        d.code po_code,d.po_source,DATE_FORMAT(a.receive_date,'%Y-%m-%d')receive_date,a.receive_notes , "+
        "        date_format(d.created_date,'%Y-%m-%d') po_created_date, date_format( d.released_date,'%Y-%m-%d') po_released_date,a.inv_no,a.faktur_no, "+
        "        (select name from table_ref x where table_name='inv_purchase_order' and column_name='receive_status' and value in(3,4) and x.value = d.receive_status) as receive_status_name,d.pr_id,d.ml_id "+
    	"	from inv_po_receive a,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f  "+
        "    where c.table_name='inv_po_receive'   "+
        "    and a.received_status=c.value   "+
        "    and a.po_id=d.id   "+
        "    and d.supplier_id=e.id   "+
        "    and a.currency_id=f.id "+
        "    ) as aa  "+
    	"left join mst_warehouse g on aa.warehouse_id = g.id  "+
        "left join mst_cost_center h on aa.cost_center_id = h.id  "+
		"left join inv_purchase_request i on aa.pr_id=i.id "+
		"left join inv_market_list j on aa.ml_id=j.id "+
    ") z "

    var qwhere = '';
    var qstringdetail = 'select (select g.order_qty-sum(received_qty) from inv_receive_line_item where item_id=b.item_id)remaining_qty, '+
		'b.item_id,b.id rcv_id,a.id,a.code,a.po_id,c.name,a.created_date,a.currency_id,e.name supplier_name,f.code,a.total_amount, b.item_id,'+
        'IFNULL(b.received_qty,0)received_qty,g.order_qty,g.price,IFNULL(b.total_amount,0)amount,g.product_id,'+
        'IF(h.id=0,b.product_name,h.name) product_name,b.received_price, '+
        'h.unit_type_id,h.lowest_unit_conversion,h.recipe_unit_conversion,h.lowest_unit_type_id ,b.order_notes '+
        'from inv_po_receive a,inv_receive_line_item b,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f, inv_po_line_item g ,mst_product h '+
        'where a.id=b.receive_id  '+
        'and c.table_name=\'inv_po_receive\'  '+
        'and a.received_status=c.value  '+
        'and a.po_id=d.id  '+
        'and d.supplier_id=e.id  '+
        'and a.currency_id=f.id  '+
        'and b.item_id=g.id   '+
        'and g.product_id = h.id ';
    var qstringdetailnon = 'select (select g.order_qty-sum(received_qty) from inv_receive_line_item where item_id=b.item_id)remaining_qty, '+
		'b.item_id,b.id rcv_id,a.id,a.code,a.po_id,c.name,a.created_date,a.currency_id,e.name supplier_name,f.code,a.total_amount, '+
        'b.item_id,IFNULL(b.received_qty,0)received_qty,g.order_qty,g.price,IFNULL(b.total_amount,0)amount,g.product_id,b.product_name product_name,b.received_price, '+
        'h.unit_type_id,h.lowest_unit_conversion,h.recipe_unit_conversion,h.lowest_unit_type_id ,b.order_notes '+
        'from inv_po_receive a,inv_receive_line_item b,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f, inv_po_line_item g ,mst_product h '+
        'where a.id=b.receive_id  '+
        'and c.table_name=\'inv_po_receive\'  '+
        'and a.received_status=c.value  '+
        'and a.po_id=d.id  '+
        'and d.supplier_id=e.id  '+
        'and a.currency_id=f.id  '+
        'and b.item_id=g.id   '+
        'and g.product_id = h.id ';
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
        po: {}
    }
    $scope.product = []
    $scope.delivery_status = []
	$scope.delivery_status_all = []
    $scope.supplier = []
    $scope.warehouse = []
    $scope.cost_center = []
    $scope.doc_status = []
    $scope.po = []
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
        po_id: '',
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
        inv_no:'',
		faktur_no:''
    }

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

	queryService.get('select a.id, a.code,upper(a.name) name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
        'from mst_cost_center a, mst_department b '+
        'where a.department_id = b.id and a.status!=2 '+
        'order by a.code asc limit 50',undefined)
    .then(function(data){
        $scope.cost_center = data.data
    })
    $scope.costCenterUp = function(text){
        queryService.post('select a.id, a.code,upper(a.name) name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
            'from mst_cost_center a, mst_department b '+
            'where a.department_id = b.id and a.status!=2 '+
            ' and lower(a.name) like \'%'+text+'%\' '+
            'order by a.code asc limit 50',undefined)
        .then(function(data){
            $scope.cost_center = data.data
        })
    }
    queryService.post('select a.id,a.code,a.po_source,a.supplier_id,b.name supplier_name,warehouse_id,DATE_FORMAT(delivery_date,\'%Y-%m-%d\')delivery_date,cost_center_id '+
        'from inv_purchase_order a,mst_supplier b '+
        'where a.supplier_id = b.id '+
        'and a.delivery_status = 1 '+
        'and (a.receive_status!=4 or isnull(receive_status)=true) order by a.id',undefined)
    .then(function(data){
        $scope.po_data = data.data
    })
    queryService.get('select id,code name from ref_currency order by id',undefined)
    .then(function(data){
        $scope.currency = data.data
        $scope.selected.currency['selected'] = $scope.currency[0]
    })
    queryService.get('select id,name from mst_warehouse where status=1 order by name',undefined)
    .then(function(data){
        $scope.warehouse = data.data
    })
    queryService.get('select value as id,name from table_ref where table_name = \'inv_po_receive\' and column_name = \'received_status\' order by value ',undefined)
    .then(function(data){
        $scope.delivery_status_all = data.data
        $scope.selected.delivery_status['selected'] = $scope.delivery_status[0]
		$scope.delivery_status = [$scope.delivery_status_all[0],$scope.delivery_status_all[1]]
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
        var sqlCtr = 'select a.id,a.name,a.address  '+
            'from mst_supplier a '+
            'where lower(a.name) like \''+text.toLowerCase()+'%\'' +
            ' order by name limit 50'
        queryService.post(sqlCtr,undefined)
        .then(function(data){
            $scope.supplier = data.data
        })
    }
    $scope.updateListItem = function(){
        if ($scope.selected.po.selected.warehouse_id!=null){
            for(var i=0;i<$scope.warehouse.length;i++){
                if($scope.selected.po.selected.warehouse_id==$scope.warehouse[i].id){
                    $scope.selected.warehouse['selected'] = $scope.warehouse[i]
                }
            }
        }
        if ($scope.selected.po.selected.cost_center_id!=null){
            queryService.post('select a.id, a.code,a.name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
                'from mst_cost_center a, mst_department b '+
                'where a.department_id = b.id '+
                ' and a.id = '+$scope.selected.po.selected.cost_center_id+' '+
                'order by a.code asc limit 10',undefined)
            .then(function(data){
                $scope.selected.cost_center['selected'] = data.data[0]
            })
        }
        $scope.selected.supplier['selected'] = {
            id: $scope.selected.po.selected.supplier_id,
            name: $scope.selected.po.selected.supplier_name
        }
        $scope.po.delivery_date = $scope.selected.po.selected.delivery_date
        $scope.items = []
        $scope.itemsOri = []
        queryService.post(qstringdetail+' and d.id='+$scope.selected.po.selected.id,undefined)
        .then(function (result2){
            for (var i=0;i<result2.data.length;i++){
                $scope.items.push({
                    id:(i+1),
                    p_id: result2.data[i].rcv_id,
                    product_id:result2.data[i].product_id,
                    product_name:result2.data[i].product_name,
                    item_id: result2.data[i].item_id,
					order_notes: result2.data[i].order_notes,
                    qty: result2.data[i].order_qty,
                    remaining_qty: result2.data[i].remaining_qty,
                    rcv_qty: result2.data[i].received_qty,
                    price: result2.data[i].price,
                    rcv_price: result2.data[i].received_price,
					rcv_price_dis: result2.data[i].received_price,
                    amount: result2.data[i].amount,
                    lowest_unit_conversion: result2.data[i].lowest_unit_conversion,
                    recipe_unit_conversion: result2.data[i].recipe_unit_conversion,
                    lowest_unit_type_id: result2.data[i].lowest_unit_type_id,
                    unit_type_id: result2.data[i].unit_type_id
                })
            }
            $scope.itemsOri = angular.copy($scope.items)
        },
        function(err2){
            //console.log(err2)
        })
    }

    $scope.dtOptionsItem = DTOptionsBuilder.newOptions();
    $scope.dtColumnsItem = [];
    $scope.dtInstance = {}
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
                html+='<button class="btn btn-default" title="Cancel" ng-click="delete(\'' + data + '\')">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';
            }
			if (full.receive_status_name=='Partially Delivered' && (full.status_id==2||full.status_id==1)){
                html+='<button class="btn btn-default" title="Partial Receiving" ng-click="update(\'' + data + '\',1)">' +
                '   <i class="fa fa-plus"></i>' +
                '</button>';
            }
            html += '</div>'
        }
        return html
    }

    $scope.createdRow = function(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }
    $scope.sums = 0
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
    .withOption('createdRow', $scope.createdRow)
    .withOption('footerCallback', function (tfoot, data) {
        if (data.length > 0) {
            $scope.$apply(function () {
                var footer = $templateCache.get('tableFooter'),
                        $tfoot = angular.element(tfoot),
                        content = $compile(footer)($scope);
                $tfoot.html(content)
            });
        }
    });
    queryService.post('select sum(TotalSum)as sm from ('+qstring+qwhere+')a',undefined)
    .then(function(data){
        $scope.sums = data.data[0].sm;
    });

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '7%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('RR Number').withOption('width', '10%'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('po_code').withTitle('PO Number').withOption('width', '10%'),
        DTColumnBuilder.newColumn('pr_code').withTitle('PR Number').withOption('width', '10%'),
        DTColumnBuilder.newColumn('ml_code').withTitle('ML Number').withOption('width', '10%'),
        DTColumnBuilder.newColumn('receive_status_name').withTitle('Delivery Status'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier').withOption('width', '10%'),
        DTColumnBuilder.newColumn('inv_no').withTitle('Inv#'),
		DTColumnBuilder.newColumn('faktur_no').withTitle('Faktur#'),
        DTColumnBuilder.newColumn('currency_code').withTitle('Currency'),
        DTColumnBuilder.newColumn('total_amount').withTitle('Amount').withClass('text-right'),
        DTColumnBuilder.newColumn('po_created_date').withTitle('PO Created'),
        DTColumnBuilder.newColumn('po_released_date').withTitle('PO Released'),
        DTColumnBuilder.newColumn('created_date').withTitle('Created At'),
        DTColumnBuilder.newColumn('receive_date').withTitle('Receive Date')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' where z.code like \'%'+$scope.filterVal.search+'%\' '
                else qwhere = ''
                $scope.nested.dtInstance.reloadData(function(obj){
                    //console.log(obj)
                }, false)
            }
        }
    }

    $scope.openQuickView = function(state){
        $scope.updateState = false
        if (state == 'add'){
            $scope.clear()
        }
        $scope.finalState = false;
        $('#form-input').modal('show')
        $scope.addDetail(0)
        var dt = new Date()

        var ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
        queryService.post('select curr_document_no(\'RR\',\''+$scope.ym+'\') as code',undefined)
        .then(function(data){
            $scope.po.code = data.data[0].code
        })
    }

    $scope.submit = function(){
		$scope.disableAction = true;
		if ($scope.po.id.length==0 ){
			var param={
				code:$scope.po.code,
				po_id:$scope.po.po_id,
				receive_date: globalFunction.currentDate(),
				receive_notes:$scope.po.notes,
				received_status:0,
				currency_id:$scope.po.currency_id,
				home_currency_exchange:$scope.po.home_currency_exchange,
				total_amount:$scope.po.total_amount,
				inv_no:$scope.po.inv_no,
				faktur_no:$scope.po.faktur_no,
				created_by:$localStorage.currentUser.name.id
			}
			var sql=`start transaction;
			insert into inv_po_receive (code,po_id,receive_date,receive_notes,received_status,currency_id,home_currency_exchange,total_amount,inv_no,faktur_no,created_by)
			values('`+$scope.po.code+`',`+$scope.po.po_id+`,'`+$scope.po.delivery_date+`','`+$scope.po.notes+`',0,`+$scope.po.currency_id+`,`+$scope.po.home_currency_exchange+`
				,`+$scope.po.TotalSum+`,`+$scope.po.inv_no+`,`+$scope.po.faktur_no+`,`+$localStorage.currentUser.name.id+`);
			set @id=(select last_insert_id());`
			for (var i =0;i< $scope.items.length; i++) {
				var user = $scope.items[i];
				sql+='insert into inv_receive_line_item (item_id,receive_id,product_id,received_qty,received_price,total_amount,created_by,order_notes) values('+user.item_id+',@id,'+user.product_id+','+user.rcv_qty+','+user.price+','+user.amount+','+$localStorage.currentUser.name.id+',"'+user.order_notes+'");'
			}
			sql+='commit;'
			queryService.post(sql,param)
			.then(function (result2){
				$scope.disableAction = false;
                $('#form-input').modal('hide')
                $scope.nested.dtInstance.reloadData(function(obj){
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Insert  '+$scope.po.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
				$scope.clear();
            },
            function(err2){
				$scope.disableAction = false;
				queryService.post('rollback')
				.then(function(result9){
				})
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert Line Item: '+err2.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }
        else {
            param = {
                received_status: $scope.selected.delivery_status.selected.id,
                receive_date: $scope.po.delivery_date,
                receive_notes: $scope.po.notes,
                inv_no: $scope.po.inv_no,
				faktur_no: $scope.po.faktur_no,
                modified_by: $localStorage.currentUser.name.id,
                modified_date: globalFunction.currentDate()
            }

            queryService.post('update inv_po_receive set ? where id='+$scope.po.id,param)
            .then(function (result){
                result.data['insertId'] = $scope.po.id
				    var q = $scope.child.saveTable($scope.po.id)
					console.log(q)
					queryService.post(q.join(';'), undefined)
                    .then(function (result2){
                        queryService.post('select po_id,sum(order_qty)order_qty,sum(received_qty)received_qty,sum(order_qty-received_qty)delta from( '+
                        	  'select a.id,a.po_id,a.product_id,a.order_qty,a.price,a.amount,b.item_id,ifnull(b.received_qty,0)received_qty,ifnull(b.received_price,0)received_price '+
                        	  'from inv_po_line_item a '+
                        	  'left join (select item_id,sum(received_qty)received_qty,sum(received_price)received_price from inv_receive_line_item group by item_id) b on a.id=b.item_id '+
                              'where a.po_id='+$scope.po.po_id+
                          ')a group by po_id',undefined)
                        .then(function(data){
							var paramPo = {
                                receive_status: null
                            }
                            if (data.data[0].delta==0){
                                paramPo.receive_status = 3
                            }
                            else paramPo.receive_status = 4
                            queryService.post('update inv_purchase_order SET ? where id='+$scope.po.po_id,paramPo)
                            .then(function(result9){
								$scope.disableAction = false;
                                $scope.clear();
								$('#form-input').modal('hide')
		                        $scope.nested.dtInstance.reloadData(function(obj){
		                        }, false)
		                        $('body').pgNotification({
		                            style: 'flip',
		                            message: 'Success Insert RR '+$scope.po.code,
		                            position: 'top-right',
		                            timeout: 2000,
		                            type: 'success'
		                        }).show();
                        	})
                        })
                    },
                    function(err2){
						$scope.disableAction = false;
						queryService.post('rollback')
						.then(function(result9){
						})
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Insert Line Item, some of fields is empty (rcv qty or rcv price) ',
                            position: 'top-right',
                            timeout: 5000,
                            type: 'danger'
                        }).show();
                    })

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
        queryService.post('select a.id,a.code,a.po_source,a.supplier_id,b.name supplier_name,warehouse_id,DATE_FORMAT(delivery_date,\'%Y-%m-%d\')delivery_date,cost_center_id '+
            'from inv_purchase_order a,mst_supplier b '+
            'where a.supplier_id = b.id '+
            'and a.delivery_status = 1 '+
            'and (a.receive_status!=4 or isnull(receive_status)=true) order by a.id',undefined)
        .then(function(data){
            $scope.po_data = data.data
        })
    }
    $scope.addItemDetail = function(result){
        var defer = $q.defer();
        var sqlCtr = []
        for (var x=0;x<$scope.items.length;x++){
            sqlCtr.push('update inv_receive_line_item set order_notes="'+$scope.items[x].order_notes+'",received_price='+$scope.items[x].received_price+',received_qty='+$scope.items[x].received_qty+', modified_date=\''+globalFunction.currentDate()+'\','+
                ' modified_by = '+$localStorage.currentUser.name.id+', total_amount='+($scope.items[x].received_price*$scope.items[x].received_qty)+' where id='+$scope.items[x].id
            )
        }
        if (sqlCtr.length>0){
            queryService.post(sqlCtr.join(';'),undefined)
            .then(function (result2){
                defer.resolve(result2)
            },
            function (err2){
                defer.reject(err2)
            })
        }
        return defer.promise;
    }

    $scope.addDetail = function(ids){
        queryService.post(qstring+' where z.id='+ids,undefined)
        .then(function (result){
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

            $scope.getProductPrice = function(e){
                $scope.item2Add.price = e.last_order_price
                $scope.item2Add.amount = e.last_order_price * $scope.item2Add.qty
            }
            $scope.getProductPriceSupplier = function(e){
                $scope.item2Add.price = e.price
                $scope.item2Add.amount = e.price * $scope.item2Add.qty
            }
            $scope.updatePrice = function(e){
                $scope.item2Add.amount = $scope.item2Add.received_price * $scope.item2Add.received_qty
            }

            queryService.post(qstringdetail + ' and a.id='+ids,undefined)
            .then(function(data){
                $scope.items = []
                $scope.itemsOri = []
                for (var i=0;i<data.data.length;i++){
                    $scope.items.push({
                        id: data.data[i].rcv_id,
                        product_id:data.data[i].product_id,
                        product_name:data.data[i].product_name,
						order_notes: data.data[i].order_notes,
                        qty: data.data[i].order_qty,
                        remaining_qty: (data.data[i].order_qty - (data.data[i].received_qty==null?0:data.data[i].received_qty)),
                        price: data.data[i].price,
                        price: data.data[i].price,
                        amount: data.data[i].amount,
                        received_qty: data.data[i].received_qty==null?0:data.data[i].received_qty,
                        received_price: data.data[i].received_price==null?0:data.data[i].received_price
                    })
                }
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
				order_notes: '',
                amount: '',
                received_qty: '',
                received_price: ''
            }

            function _buildPerson2Add(d) {
                return d;
            }
            $scope.addItem = function() {
                $scope.item2Add.product_id = $scope.selected.product.selected?$scope.selected.product.selected.id:null
                $scope.item2Add.product_name = $scope.selected.product.selected?$scope.selected.product.selected.name:null
                if ($scope.selected.supplier){
                    $scope.item2Add.old_price = $scope.selected.supplier.selected?$scope.selected.supplier.selected.price:null
                }
                else {
                    $scope.item2Add.old_price = null
                }
                $scope.item2Add.new_price = $scope.item2Add.price

                if ($scope.item2Add.product_id!=null){
                    $scope.items.push(angular.copy($scope.item2Add));
                }

                $scope.item2Add = {
                    id: '',
                    product_id:'',
                    product_name:'',
                    qty: '',
                    price: '',
                    amount: '',
					order_notes:'',
                    received_qty: '',
                    received_price: '',
                    old_price: '',
                    new_price: ''
                };
            }
            $scope.modifyItem = function(index) {
                $scope.selected.product.selected = {
                    id: $scope.items[index].product_id,
                    name: $scope.items[index].product_name
                }
                $scope.item2Add = $scope.items[index];
                $scope.items.splice(index, 1);

            }
            $scope.removeItem = function(index) {
                $scope.items.splice(index, 1);
            }
        })
    }

    $scope.update = function(ids,flag){
        $scope.updateState = true;
        $('#form-input').modal('show');
        queryService.post(qstring+' where z.id='+ids,undefined)
        .then(function (result){
			$scope.finalState = true
            $scope.po = result.data[0]
			$scope.po.delivery_date = result.data[0].receive_date
            $scope.po.notes = result.data[0].receive_notes
            $scope.selected.po['selected'] = {
                id: result.data[0].po_id,
                code: result.data[0].po_code,
                po_source: result.data[0].po_source,
                supplier_id: result.data[0].supplier_id,
                supplier_name: result.data[0].supplier_name,
                warehouse_id: result.data[0].warehouse_id,
                delivery_date: result.data[0].delivery_date,
                cost_center_id: result.data[0].cost_center_id
            }
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
			if(result.data[0].status_id==1 && flag==undefined){
				$scope.delivery_status = [$scope.delivery_status_all[1],$scope.delivery_status_all[2]]
			}else if(result.data[0].status_id==2 && flag==undefined){
				$scope.flag=true;
				$scope.delivery_status=[{id:result.data[0].status_id,name:result.data[0].status_name}]
			}else if(result.data[0].status_id==3 && flag==undefined){
				$scope.delivery_status=[{id:result.data[0].status_id,name:result.data[0].status_name}]
			}else{
				$scope.delivery_status = [$scope.delivery_status_all[0],$scope.delivery_status_all[1]]
			}
			if(flag==undefined ){
	            $scope.selected.delivery_status = {
	                selected: {
	                    id:result.data[0].status_id,
	                    name:result.data[0].status_name
	                }
	            }
			}else{
				$scope.selected.delivery_status.selected=$scope.delivery_status[0]
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
				$scope.order=0;
				$scope.amount=0;
				$scope.rcv_qty=0;
                for (var i=0;i<result2.data.length;i++){
                    $scope.items.push({
                        id:(i+1),
                        p_id: result2.data[i].rcv_id,
                        product_id:result2.data[i].product_id,
                        product_name:result2.data[i].product_name,
                        item_id: result2.data[i].item_id,
                        qty: result2.data[i].order_qty,
						order_notes: result2.data[i].order_notes,
                        remaining_qty: result2.data[i].remaining_qty,
                        rcv_qty: flag==undefined?result2.data[i].received_qty:0,
                        price: result2.data[i].price,
                        rcv_price: result2.data[i].received_price==null?result2.data[i].price:result2.data[i].received_price,
						rcv_price_dis: result2.data[i].received_price,
                        amount: flag==undefined?result2.data[i].amount:0,
                        lowest_unit_conversion: result2.data[i].lowest_unit_conversion,
                        recipe_unit_conversion: result2.data[i].recipe_unit_conversion,
                        lowest_unit_type_id: result2.data[i].lowest_unit_type_id,
                        unit_type_id: result2.data[i].unit_type_id
                    })
					$scope.order+=result2.data[i].order_qty;
					$scope.rcv_qty+=result2.data[i].received_qty;
					$scope.amount+=result2.data[i].amount;
                }

                $scope.itemsOri = angular.copy($scope.items)
				var date = new Date()
				if(flag!=undefined){
					$scope.po.id=''
					$scope.amount=0;
					$scope.rcv_qty=0;
					$scope.po.delivery_date = date.getFullYear()+'-'+((date.getMonth() + 1)>9?(date.getMonth() + 1):'0'+(date.getMonth() + 1) )+ '-' + (date.getDate()>9?date.getDate():'0'+date.getDate())
					$scope.ym = date.getFullYear() + '/' + (date.getMonth()<9?'0':'') + (date.getMonth()+1)
					queryService.post('select curr_document_no(\'RR\',\''+$scope.ym+'\') as code',undefined)
					.then(function(data){
						console.log(data)
						$scope.po.code = data.data[0].code
					})
				}
            },
            function(err2){
                //console.log(err2)
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

    $scope.delete = function(ids){
        $scope.po.id = ids;
        var qstring = 'select id, code from inv_po_receive where id='+ids
        queryService.post(qstring,undefined)
        .then(function (result){
            $scope.po = result.data[0]
            $('#modalDelete').modal('show')
        },
        function (err){
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
        var param = [{
            received_status: 3
        },$scope.po.id]
        queryService.post('update inv_po_receive set ? where id=?',param)
        .then(function (result){
            $('#modalDelete').modal('hide')
            $scope.nested.dtInstance.reloadData(function(obj){
                //console.log(obj)
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
        $scope.po = {
            id: '',
            code: '',
            supplier_id: '',
            warehouse_id: '',
            cost_center_id: '',
            notes: '',
            delivery_status: '',
            delivery_date: '',
            receive_status: '',
        }
		$scope.rcv_qty=0;
		$scope.amount=0;
		$scope.flag=false;
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
            approval: 0,
            po: {}
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
		rcv_price_dis: '',
        amount: ''
    };

    $scope.checkName = function(data, id) {
        if (id === 2 && data !== 'awesome') {
            return "Username 2 should be `awesome`";
        }
    };

    $scope.filterUser = function(user) {
        return user.isDeleted !== true;
    };

    $scope.deleteUser = function(id) {
        var filtered = $filter('filter')($scope.items, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

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
			rcv_price_dis: '',
            amount: '',
            isNew: true
        };
        $scope.items.push($scope.item)
        queryService.get('select id,code,name,last_order_price from mst_product order by id limit 20 ',undefined)
        .then(function(data){
            $scope.product[$scope.item.id] = data.data
        })
    };

    $scope.cancel = function() {
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
            if (user.isDeleted) {
                delete user.isDeleted;
            }
            if (user.isNew) {
                $scope.items.splice(i, 1);
            }
        };
    };

    $scope.child.saveTable = function(pr_id) {
        var results = [];
        var sqlitem = []

		sqlitem.push("start transaction");
		var amt = 0
        for (var i =0; i<$scope.items.length; i++) {
            var user = $scope.items[i];
            if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from inv_receive_line_item where id='+user.p_id)
            }
            else if(!user.isNew){

                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri[j].p_id+$scope.itemsOri[j].item_id+$scope.itemsOri[j].product_id+$scope.itemsOri[j].rcv_qty+$scope.itemsOri[j].rcv_price+$scope.itemsOri[j].order_notes
                        var d2 = user.p_id+user.item_id+user.product_id+user.rcv_qty+user.rcv_price+user.order_notes
                        if(d1 != d2){
                            //amt += (user.rcv_qty*user.rcv_price)
                            sqlitem.push('update inv_receive_line_item set '+
                            //' product_id = '+user.product_id+',' +
                            ' received_qty = '+user.rcv_qty+',' +
							' order_notes = "'+user.order_notes+'",' +
                            ' received_price = '+user.rcv_price+',' +
                            ' total_amount = '+user.amount+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
						}

                    }
                }
            }
			if($scope.selected.delivery_status.selected.id==2){

				amt += (user.rcv_qty*user.rcv_price)
				if($scope.selected.cost_center.selected){
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
				else if ($scope.selected.warehouse.selected){
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
				sqlitem.push('insert into inv_prod_price_contract(supplier_id,product_id,contract_status,contract_start_date,contract_end_date,price,net_price)'+
				' values('+$scope.selected.supplier.selected.id+','+user.product_id+',1,\''+globalFunction.currentDate()+'\',\''+globalFunction.next30Day()+'\','+user.rcv_price+','+user.rcv_price+')'+
				' ON DUPLICATE KEY UPDATE '+
				' previous_price = net_price ,'+
				' contract_start_date = \''+globalFunction.currentDate()+'\' ,'+
				' contract_end_date = \''+globalFunction.next30Day()+'\','+
				' price ='+user.rcv_price+','+
				' net_price = '+user.rcv_price)

				sqlitem.push('update mst_product b,(select IF(a.avg> 0, a.avg, '+user.rcv_price+') as amount from (select avg(received_price) avg from inv_receive_line_item where product_id='+user.product_id+' and received_price>0 and modified_date<now() and modified_date>now() - interval 30 day) a )c set'+
				' price_per_unit =c.amount,'+
				(isFinite(user.rcv_price/user.lowest_unit_conversion)?(' price_per_lowest_unit = c.amount/lowest_unit_conversion,'):'')+
				//' price_per_lowest_unit = '+(isFinite(user.rcv_price/user.lowest_unit_conversion)?(user.rcv_price/user.lowest_unit_conversion):user.rcv_price)+', '+
				(isFinite(user.rcv_price/user.lowest_unit_conversion/user.recipe_unit_conversion)?(' price_per_recipe_unit =  c.amount/recipe_unit_conversion, '):'')+
				//' price_per_recipe_unit =  '+(user.rcv_price/user.lowest_unit_conversion/user.recipe_unit_conversion)+', '+
				' last_order_qty ='+user.rcv_qty+','+
				' last_order_price= '+user.rcv_price+','+
				' last_order_date= \''+globalFunction.currentDate()+'\' ,'+
				' last_received_qty ='+user.rcv_qty+','+
				' last_received_price= '+user.rcv_price+','+
				' last_received_date= \''+globalFunction.currentDate()+'\' ,'+
				' last_supplier='+$scope.selected.supplier.selected.id + ' where id='+user.product_id)
			}
        }
		if($scope.selected.delivery_status.selected.id==2){
			var dt = new Date()
	        var ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
	        sqlitem.push('insert into acc_ap_voucher(code,source,receive_id,supplier_id,currency_id,total_amount,home_total_amount,status,open_date,created_by,inv_no,faktur_no,total_due_amount,current_due_amount)'+
		        'values(next_document_no("AP/RR","'+ym+'"),\'RR\','+pr_id+','+$scope.selected.supplier.selected.id+','+$scope.po.currency_id+','+amt+
		        ','+($scope.po.home_currency_exchange*amt)+',0,\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+',"'+$scope.po.inv_no+'","'+$scope.po.faktur_no+'",'+amt+','+amt+')'
			);
			sqlitem.push("set @id=(select last_insert_id())");
			 sqlitem.push('insert into acc_gl_transaction(code,journal_type_id,voucher_id,gl_status,notes,bookkeeping_date)'+
				' values (next_item_code(\'GL\',\'AP\'), 1, @id, \'0\', \''+$scope.po.code+'\',curdate()) on duplicate KEY UPDATE '+
				'notes=\''+$scope.po.notes+'\'');
				//debit dr cost center account
			sqlitem.push("set @id=(select last_insert_id())");
			sqlitem.push('insert into acc_gl_journal (notes,gl_id,account_id,transc_type,amount,created_by,bookkeeping_date) values("receiving "'+$scope.po.code+
				'@id,(select b.payable_account_id from mst_supplier a,ref_supplier_type b where a.supplier_type_id=b.id and a.id='+$scope.po.supplier_id+'),\'C\','+amt+','+$localStorage.currentUser.name.id+',curdate())')
				//credit supplier type
			sqlitem.push('insert into acc_gl_journal (notes,gl_id,account_id,transc_type,amount,created_by,bookkeeping_date) values("receiving "'+$scope.po.code+
				'@id,(select account_id from mst_cost_center where id='+$scope.selected.cost_center.selected.id+' union select account_id from mst_warehouse where id='+$scope.selected.warehouse.selected.id+' limit 1),\'D\','+amt+','+$localStorage.currentUser.name.id+',curdate())')
		}
		sqlitem.push("commit");
        return sqlitem
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };


    $scope.productUp = function(d,text) {
        queryService.post('select id,code,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 10 ',undefined)
        .then(function(data){
            $scope.product[d] = data.data
        })
    }

    $scope.getProduct = function(e,d){
        $scope.items[d-1].product_id = e.id
        $scope.items[d-1].product_name = e.name
    }

    $scope.getProductPriceSupplier = function(e,d){
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
            if(parseFloat(p)>parseFloat($scope.items[d-1].qty)){
                $scope.items[d-1].rcv_qty = $scope.items[d-1].qty
                e.target.value=$scope.items[d-1].qty
            }
            else {
                $scope.items[d-1].rcv_qty = p
                e.target.value=p
            }
            $scope.items[d-1].amount = $scope.items[d-1].rcv_price*$scope.items[d-1].rcv_qty
        }
        if (t=='price') {
			if(parseFloat(p)>parseFloat($scope.items[d-1].price)){
                $scope.items[d-1].rcv_price = $scope.items[d-1].price
				p=$scope.items[d-1].price
            }
            else {
                $scope.items[d-1].rcv_price = parseFloat(p)
            }
            $scope.items[d-1].amount = $scope.items[d-1].rcv_qty*$scope.items[d-1].rcv_price
        }
		$scope.rcv_qty=0;
		$scope.amount=0;
		for(var i=0;i<$scope.items.length;i++){
			$scope.rcv_qty+=parseFloat($scope.items[i].rcv_qty)
			$scope.amount+=parseFloat($scope.items[i].amount)
		}
    }
	$scope.updateNotes = function(e,d,p){
		$scope.items[d-1].order_notes = p
	}
});
