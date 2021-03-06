
var userController = angular.module('app', []);
userController
.controller('InvWarehouseStoreRequestCtrl',
function($scope, $state, $sce, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

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
	var date = new Date();
	date.setDate(date.getDate());

	$('#startDate').datepicker({
	    startDate: date
	});
	$scope.new=false
	var qstring = 'select concat(\'Department: \',f.name)  dept_desc,e.code cc_code,a.id,a.code,a.request_status,c.name request_status_name,a.issued_status,b.name issued_status_name,DATE_FORMAT(a.required_date,\'%Y-%m-%d\') required_date,a.origin_warehouse_id,d.name warehouse_name,d.account_id coa_wr,a.dest_cost_center_id,e.name cost_center_name,e.account_id,a.request_notes '+
        'from inv_store_request a,(select value,name from table_ref where table_name=\'store_request\' and column_name=\'issued_status\') b, '+
        '(select value,name from table_ref where table_name=\'store_request\' and column_name=\'request_status\') c,mst_warehouse d,mst_cost_center e, mst_department f '+
        'where a.request_status=c.value '+
        'and a.issued_status=b.value '+
        'and a.origin_warehouse_id=d.id '+
        'and a.dest_cost_center_id=e.id '+
		'and e.department_id = f.id '
		//'and a.request_status!=0 '
    var qstringdetail = 'select b.price_per_lowest_unit,a.request_notes as item_notes,a.id p_id,a.product_id ,b.name product_name,d.stock_qty,d.stock_qty_l stock_in_hand,a.request_qty,e.name unit_name,a.issued_qty,a.issued_status,f.name issued_status,b.unit_type_id unit_id,b.lowest_unit_type_id unit_id2,b.lowest_unit_conversion unit_conversion,d.id warehouse_item_id,b.recipe_unit_conversion '+
        'from inv_store_req_line_item a,mst_product b,inv_store_request c,inv_warehouse_stock d,ref_product_unit e,(select value,name from table_ref where table_name=\'inv_store_req_line_item\')f '+
        'where a.product_id=b.id '+
        'and a.sr_id=c.id '+
        'and c.origin_warehouse_id=d.warehouse_id '+
        'and a.product_id=d.product_id '+
        'and b.lowest_unit_type_id=e.id '+
        'and a.issued_status=f.value'
    var qwhere = ''

    $scope.role = {
        selected: []
    };
    $scope.child = {}
    $scope.items = []
    $scope.itemsOri = []

    $scope.cats = {}
    $scope.id = '';
    $scope.sr = {
        id: '',
        code: '',
        warehouse_id: '',
        cost_center_id: '',
        request_status: '',
        issued_status: '',
        date: '',
        notes: ''
    }

    $scope.selected = {
        request_status: {},
        issued_status: {},
        warehouse: {},
        cost_center: {}
    }

    $scope.cost_center = []
	queryService.get('select a.id, a.code,upper(a.name) name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
        'from mst_cost_center a, mst_department b '+
        'where a.department_id = b.id and a.status!=2 '+
		'and a.account_id is not null '+
        'order by a.code asc limit 50',undefined)
    .then(function(data){
        $scope.cost_center = data.data
    })
    $scope.costCenterUp = function(text){
        queryService.post('select a.id, a.code,upper(a.name) name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
            'from mst_cost_center a, mst_department b '+
            'where a.department_id = b.id and a.status!=2 '+
			'and a.account_id is not null '+
            ' and lower(a.name) like \'%'+text+'%\' '+
            'order by a.code asc limit 50',undefined)
        .then(function(data){
            $scope.cost_center = data.data
        })
    }
    $scope.warehouse = []
    queryService.get('select id,name from mst_warehouse where account_id is not null and status=1 order by name',undefined)
    .then(function(data){
        $scope.warehouse = data.data
    })
    $scope.request_status = []
    queryService.get('select value id, value, name from table_ref where table_name=\'store_request\' and column_name=\'request_status\' order by value',undefined)
    .then(function(data){
        if ($scope.buttonCreate = true){
            $scope.request_status.push(data.data[0])
        }
        if ($scope.releaseSr = true || $scope.issuing == true){
            $scope.request_status.push(data.data[1])
        }
        $scope.selected.request_status['selected'] = $scope.request_status[0]
    })
    $scope.issued_status = []
    queryService.get('select value id, value, name from table_ref where table_name=\'store_request\' and column_name=\'issued_status\' order by value',undefined)
    .then(function(data){
        if ($scope.buttonCreate = true || $scope.releaseSr){
            $scope.issued_status.push(data.data[0])
        }
        if ($scope.issuing = true){
            $scope.issued_status.push(data.data[1])
            $scope.issued_status.push(data.data[2])
            $scope.issued_status.push(data.data[3])
        }
        $scope.selected.issued_status['selected'] = $scope.issued_status[0]
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
		$scope.cats[data] = {id:data,code:full.code};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(' + data + ')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
			if ($scope.el.indexOf('buttonDelete')>-1 && full.issued_status==0 && full.request_status==0){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(cats[\'' + data + '\'])" )"="">' +
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
	.withOption('order', [2, 'desc'])
    .withDisplayLength(10)
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('id').withOption('width', '8%'),
        DTColumnBuilder.newColumn('code').withTitle('code'),
        DTColumnBuilder.newColumn('request_status_name').withTitle('request status'),
        DTColumnBuilder.newColumn('issued_status_name').withTitle('issued'),
        DTColumnBuilder.newColumn('required_date').withTitle('date'),
        DTColumnBuilder.newColumn('warehouse_name').withTitle('warehouse'),
        DTColumnBuilder.newColumn('cost_center_name').withTitle('cost center')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' and a.code like "%'+$scope.filterVal.search+'%"'
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
		$scope.new=true
        $scope.items = []
        $scope.itemsOri = []
        $('#form-input').modal('show')
		//var dt = new Date()
		//$scope.ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
        //queryService.post('select cast(concat(\'PR/\',date_format(date(now()),\'%Y/%m/%d\'), \'/\', lpad(seq(\'PR\',\''+ym+'\'),4,\'0\')) as char) as code ',undefined)
        //queryService.post('select curr_document_no(\'SR\',\''+$scope.ym+'\') as code',undefined)
		queryService.post('select curr_item_code("INV",concat("SR",date_format(curdate(),"%y"))) as code',undefined)
        .then(function(data){
            $scope.sr.code = data.data[0].code
        })
    }

    $scope.submit = function(){
		$scope.disableAction = true;
		if ($scope.sr.id.length==0){
            //exec creation
			//queryService.post('select next_document_no(\'SR\',\''+$scope.ym+'\') as code',undefined)
			queryService.post('select next_item_code("INV",concat("SR",date_format(curdate(),"%y"))) as code',undefined)
			.then(function(data){
				$scope.sr.code = data.data[0].code
			})
            var param = {
                code: $scope.sr.code,
                required_date: $scope.sr.date,
                request_status: $scope.selected.request_status.selected.id,
                request_notes: $scope.sr.request_notes,
                origin_warehouse_id: $scope.selected.warehouse.selected.id,
                dest_cost_center_id: $scope.selected.cost_center.selected.id,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate(),
            }
            queryService.post('insert into inv_store_request set ?',param)
            .then(function (result){
				var qstr = $scope.child.saveTable(result.data.insertId)
				if(qstr.length>0){
					queryService.post(qstr.join(';'),undefined)
	                .then(function (result2){
						$scope.disableAction = false;
	                    $('#form-input').modal('hide')
	                    $scope.dtInstance.reloadData(function(obj){}, false)
	                    $('body').pgNotification({
	                        style: 'flip',
	                        message: 'Success Insert '+$scope.sr.code,
	                        position: 'top-right',
	                        timeout: 2000,
	                        type: 'success'
	                    }).show();
	                },
	                function (err2){
						$scope.disableAction = false;
	                    console.log(err2)
	                })
				}else{
					$scope.disableAction = false;
					$('#form-input').modal('hide')
					$scope.dtInstance.reloadData(function(obj){}, false)

					$('body').pgNotification({
						style: 'flip',
						message: 'Success Insert '+$scope.sr.code,
						position: 'top-right',
						timeout: 2000,
						type: 'success'
					}).show();
				}
            },
            function (err){
				$scope.disableAction = false;
				console.log(JSON.stringify(err))
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
                code: $scope.sr.code,
                required_date: $scope.sr.date,
                request_status: $scope.selected.request_status.selected.id,
                request_notes: $scope.request_notes,
                origin_warehouse_id: $scope.selected.warehouse.selected.id,
                dest_cost_center_id: $scope.selected.cost_center.selected.id,
                modified_by: $localStorage.currentUser.name.id,
                modified_date: globalFunction.currentDate(),
            }
			queryService.post('update inv_store_request set ? where id='+$scope.sr.id,param)
            .then(function (result){
                var qstr = $scope.child.saveTable($scope.sr.id)
				if(qstr.length>0){
	                queryService.post(qstr.join(';'),undefined)
	                .then(function (result2){
						$scope.disableAction = false;
	                    $('#form-input').modal('hide')
	                    $scope.dtInstance.reloadData(function(obj){}, false)
	                    $('body').pgNotification({
	                        style: 'flip',
	                        message: 'Success Insert '+$scope.sr.code,
	                        position: 'top-right',
	                        timeout: 2000,
	                        type: 'success'
	                    }).show();
	                },
	                function (err2){
	                    console.log(err2)
						$scope.disableAction = false;
	                })
				}else{
					$scope.disableAction = false;
					$('#form-input').modal('hide')
					$scope.dtInstance.reloadData(function(obj){}, false)
					$('body').pgNotification({
						style: 'flip',
						message: 'Success Insert '+$scope.sr.code,
						position: 'top-right',
						timeout: 2000,
						type: 'success'
					}).show();
				}
            },
            function (err){
				console.log(JSON.stringify(err))
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
    }

    $scope.update = function(ids){
		$scope.new=false;
        queryService.post(qstring+ ' and a.id='+ids,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.sr = result.data[0]
            $scope.sr.date = $scope.sr.required_date
			$scope.selected.cost_center['selected'] = {id:$scope.sr.dest_cost_center_id,name:$scope.sr.cost_center_name,account_id:$scope.sr.account_id,code:$scope.sr.cc_code,dept_desc:$scope.sr.dept_desc}
			$scope.selected.warehouse['selected'] = {id:$scope.sr.origin_warehouse_id,name:$scope.sr.warehouse_name,account_id:$scope.sr.coa_wr}
            $scope.selected.request_status['selected'] = {id:$scope.sr.request_status,name:$scope.sr.request_status_name}
            $scope.selected.issued_status['selected'] = {id:$scope.sr.issued_status,name:$scope.sr.issued_status_name}
			if($scope.sr.issued_status!=0)
				$scope.request_status = [{id:$scope.sr.request_status,name:$scope.sr.request_status_name}]
			queryService.post(qstringdetail+ ' and c.id='+ids,undefined)
            .then(function(result2){
                $('#form-input').modal('show');
                $scope.items = []
                $scope.itemsOri = []
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

	$scope.refresh = function(){
		$scope.items=[];
		var ss = 'select a.id,a.product_id,b.name product_name,a.stock_qty_l,b.lowest_unit_type_id unit_id,c.name unit_name '+
            'from inv_warehouse_stock a,mst_product b,ref_product_unit c '+
            'where a.product_id=b.id '+
            'and b.lowest_unit_type_id=c.id '+
            'and warehouse_id='+$scope.selected.warehouse.selected.id +
            //' and lower(b.name) like \''+text.toLowerCase()+'%\' '+
            ' order by id limit 50 '
        queryService.post(ss,undefined)
        .then(function(data){
            $scope.products = data.data
        })
	}

    $scope.delete = function(obj){
		$scope.sr.id = obj.id;
		$scope.sr.name = obj.code;
        $('#modalDelete').modal('show')
    }

    $scope.execDelete = function(){
        queryService.post('delete from inv_store_req_line_item where sr_id='+$scope.sr.id+'; delete from inv_store_request where id='+$scope.sr.id,undefined)
        .then(function (result){
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.sr.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
        },
        function (err){
            $('body').pgNotification({
                style: 'flip',
                message: 'Error Delete: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.clear = function(){
		$scope.new=false
        $scope.sr = {
            id: '',
            code: '',
            warehouse_id: '',
            cost_center_id: '',
            request_status: '',
            issued_status: '',
            date: '',
            notes: ''
        }
		$scope.selected = {
	        request_status: {},
	        issued_status: {},
	        warehouse: {},
	        cost_center: {}
	    }
    }
})

.controller('EditableTableSrCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    $scope.item = {
        id: '',
        p_id: '',
        product_id:'',
        product_name:'',
        stock_in_hand: '',
        request_qty: '',
        unit_id: '',
        unit_name: '',
        issued_qty_n: 0,
        issued_qty: 0,
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
            issued_qty_n: 0,
            issued_qty: '',
            issued_id: '',
            issued_status: '',
			request_notes: '',
            item_notes: '',
            isNew: true
        };
        $scope.items.push($scope.item)
        var ss = 'select a.id,a.product_id,b.name product_name,a.stock_qty_l,b.lowest_unit_type_id unit_id,c.name unit_name '+
            'from inv_warehouse_stock a,mst_product b,ref_product_unit c '+
            'where a.product_id=b.id '+
            'and b.lowest_unit_type_id=c.id '+
            'and warehouse_id='+$scope.selected.warehouse.selected.id +
            //' and lower(b.name) like \''+text.toLowerCase()+'%\' '+
            ' order by id limit 50 '
        queryService.post(ss,undefined)
        .then(function(data){
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
    $scope.child.saveTable = function(sr_id) {
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
                sqlitem.push('insert into inv_store_req_line_item(sr_id,product_id,request_qty,issued_qty,created_by,request_notes) values '+
                    '( '+sr_id+', '+user.product_id+','+parseInt(user.request_qty)+', '+parseInt(user.issued_qty_n)+', '+$localStorage.currentUser.name.id+' ,"'+user.item_notes+'")')
                //sqlitem.push('insert into inv_pr_line_item (pr_id,product_id,'+(user.supplier_id.length>0?'supplier_id,':'')+'order_qty,net_price,order_amount,created_by,created_date) values('+
                //pr_id+','+user.product_id+','+(user.supplier_id.length>0?user.supplier_id+',':'')+''+user.qty+','+user.price+','+user.amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from inv_store_req_line_item where id='+user.p_id)
            }
            else if(!user.isNew){
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri[j].p_id+$scope.itemsOri[j].product_id+$scope.itemsOri[j].request_qty+$scope.itemsOri[j].issued_qty_n+$scope.itemsOri[j].item_notes
                        var d2 = user.p_id+user.product_id+user.request_qty+user.issued_qty_n+user.item_notes
                        if(d1 != d2){
                            var sql1 = 'update inv_store_req_line_item set '+
                                'request_qty = '+user.request_qty+','+
                                'request_notes = "'+user.item_notes+'",'+
                                ' modified_by = '+$localStorage.currentUser.name.id+',' +
                                ' modified_date = \''+globalFunction.currentDate()+'\'' +
                                ' where id='+user.p_id
                            /*var sql2 = 'insert into inv_wh_stock_move(transc_type,sr_id,origin_warehouse_id,dest_cost_center_id,product_id,qty,unit_type_id,qty_l,lowest_unit_type_id,created_by) values '+
                                '( \'SR\','+sr_id+','+$scope.selected.warehouse.selected.id+','+$scope.selected.cost_center.selected.id+','+
                                ' '+user.product_id+', '+(user.issued_qty_n*user.unit_conversion)+', '+user.unit_id+','+user.issued_qty_n+','+user.unit_id2+', '+$localStorage.currentUser.name.id+' )'
                            var sql3 = 'update inv_warehouse_stock set '+
                                'warehouse_id = '+$scope.selected.warehouse.selected.id+','+
                                'product_id = '+user.product_id+','+
                                'stock_qty_l = stock_qty_l-'+((user.issued_qty_n*user.unit_conversion))+','+
                                'stock_qty = stock_qty-'+(user.issued_qty_n)+','+
                                ' modified_by = '+$localStorage.currentUser.name.id+',' +
                                ' modified_date = \''+globalFunction.currentDate()+'\'' +
                                ' where id='+user.warehouse_item_id
								*/
                            /*var sql4 = 'INSERT INTO inv_cost_center_stock(cost_center_id,product_id,stock_qty,stock_qty_l,stock_qty_in_recipe_unit,created_by) '+
                                ' values('+$G.selected.id+','+user.product_id+','+(user.stock_qty+(user.issued_qty_n*used.unit_conversion))+
                                ','+(user.stock_qty_l+user.issued_qty_n)+', '+(user.stock_qty_in_recipe_unit+(user.issued_qty_n*user.recipe_unit_conversion))+','+$localStorage.currentUser.name.id+') ' +
                                'ON DUPLICATE KEY UPDATE '+
                                ' stock_qty = '+(user.stock_qty+(user.issued_qty_n*used.unit_conversion))+
                                ' ,stock_qty_l = '+(user.stock_qty_l+user.issued_qty_n)
                                ' ,stock_qty_in_recipe_unit = '+(user.stock_qty_in_recipe_unit+(user.issued_qty_n*user.recipe_unit_conversion))
                                ' ,modified_by = '+$localStorage.currentUser.name.id+',' +
                                ' modified_date = \''+globalFunction.currentDate()+'\''*/

                            sqlitem.push(sql1)
                            //sqlitem.push(sql2)
                            //sqlitem.push(sql3)
                            //sqlitem.push(sql4)
                        }
                    }
                }
            }

        }
        console.log(sqlitem)
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.products = []


    $scope.productUp = function(text) {
        var ss = 'select a.id,a.product_id,b.name product_name,a.stock_qty_l,b.lowest_unit_type_id unit_id,c.name unit_name '+
            'from inv_warehouse_stock a,mst_product b,ref_product_unit c '+
            'where a.product_id=b.id '+
            'and b.lowest_unit_type_id=c.id '+
            'and warehouse_id='+$scope.selected.warehouse.selected.id +
            ' and lower(b.name) like \''+text.toLowerCase()+'%\' '+
            ' order by id limit 50 '
        queryService.post(ss,undefined)
        .then(function(data){
            $scope.products = data.data
        })
    }


    $scope.getProductPrice = function(e,d){
        $scope.items[d-1].product_id = e.product_id
        $scope.items[d-1].product_name = e.product_name
        $scope.items[d-1].stock_in_hand = e.stock_qty_l
        $scope.items[d-1].unit_id = e.unit_id
        $scope.items[d-1].unit_name = e.unit_name
    }
    $scope.updaterl = function(e,d,f,g){
		if($scope.items[d-1].stock_in_hand>=f){
        	$scope.items[d-1].request_qty = f
			e.target.value=f
		}else{
			$scope.items[d-1].request_qty=angular.copy($scope.items[d-1].stock_in_hand)
			e.target.value=$scope.items[d-1].stock_in_hand
		}
    }
	$scope.update = function(e,d,f){
		$scope.items[d-1].item_notes=f
	}

});
