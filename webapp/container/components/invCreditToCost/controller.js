
var userController = angular.module('app', []);
userController
.controller('InvCreditToCostCtrl',
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
    var qstring = 'select a.id,a.code,a.request_status,b.name request_status_name,a.transc_date,a.credit_to_cost_center_id,d.name cost_orig_name,a.debt_to_cost_center_id,e.name cost_dest_name,a.total_amount,a.transc_notes '+
        'from inv_credit_to_cost a,(select value,name from table_ref where table_name=\'interlocation\' and column_name=\'request_status\') b,mst_cost_center d,mst_cost_center e '+
        'where a.request_status=b.value '+
        'and a.credit_to_cost_center_id=d.id '+
        'and a.debt_to_cost_center_id=e.id '
    var qstringdetail = 'select a.id,a.price price_per_unit,a.amount,a.product_id ,b.name product_name,d.stock_qty_l stock_in_hand,a.qty request_qty,e.name unit_name,b.unit_type_id unit_id,b.lowest_unit_type_id unit_id2,b.lowest_unit_conversion unit_conversion,d.id warehouse_item_id '+
        'from inv_ctc_line_item  a,mst_product b,inv_credit_to_cost c,inv_cost_center_stock d,ref_product_unit e '+
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
	queryService.get('select a.id, a.code,upper(a.name) name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
        'from mst_cost_center a, mst_department b '+
        'where a.department_id = b.id and a.status!=2 '+
		'and a.account_id is not null '+
        'order by a.code asc limit 50',undefined)
    .then(function(data){
		$scope.cc_origin = data.data
        $scope.cc_dest = data.data
    })
    $scope.costCenterUp = function(text,type){
        queryService.post('select a.id, a.code,upper(a.name) name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
            'from mst_cost_center a, mst_department b '+
            'where a.department_id = b.id and a.status!=2 '+
			'and a.account_id is not null '+
            ' and lower(a.name) like \'%'+text+'%\' '+
            'order by a.code asc limit 50',undefined)
        .then(function(data){
			console.log(data)
			if(type=='ori')
            	$scope.cc_origin = data.data
			else
				$scope.cc_dest = data.data
        })

    }
    $scope.request_status = []
    queryService.get('select value id,value,name from table_ref where table_name=\'store_request\' and column_name=\'request_status\' ',undefined)
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
                '<button class="btn btn-default" title="Update" ng-click="update(' + data + ')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
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
        DTColumnBuilder.newColumn('transc_date').withTitle('date'),
        DTColumnBuilder.newColumn('cost_orig_name').withTitle('Origin'),
        DTColumnBuilder.newColumn('cost_dest_name').withTitle('Destination'),
        DTColumnBuilder.newColumn('total_amount').withTitle('amount')
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
        $scope.clear()
        queryService.post('select curr_item_code("INV",concat("CTC",date_format(curdate(),"%y"))) as code',undefined)
        .then(function(data){
            $scope.it.code = data.data[0].code
        })
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
		$scope.disableAction = true;
        if ($scope.it.id.length==0){
            //exec creation
			queryService.post('select next_item_code("INV",concat("CTC",date_format(curdate(),"%y"))) as code',undefined)
	        .then(function(data){
	            $scope.it.code = data.data[0].code
				var param = {
	                code: $scope.it.code,
	                transc_date: $scope.it.date,
	                request_status: $scope.selected.request_status.selected.id,
	                transc_notes: $scope.it.request_notes,
	                credit_to_cost_center_id: $scope.selected.cc_origin.selected.id,
	                debt_to_cost_center_id: $scope.selected.cc_dest.selected.id,
	                created_by: $localStorage.currentUser.name.id,
	                created_date: globalFunction.currentDate(),
	            }
	            queryService.post('insert into inv_credit_to_cost set ?',param)
	            .then(function (result){
	                var qstr = $scope.child.saveTable(result.data.insertId)
	                queryService.post(qstr.join(';'),undefined)
	                .then(function (result2){
						$scope.disableAction = false;
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
						queryService.post('rollback')
						.then(function(result9){
						})
						$scope.disableAction = false;
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
	        })

        }
        else {
            //exec update
            var param = {
                code: $scope.it.code,
                transc_date: $scope.it.date,
                request_status: $scope.selected.request_status.selected.id,
                transc_notes: $scope.it.request_notes,
                credit_to_cost_center_id: $scope.selected.cc_origin.selected.id,
                debt_to_cost_center_id: $scope.selected.cc_dest.selected.id,
                modified_by: $localStorage.currentUser.name.id,
                modified_date: globalFunction.currentDate(),
            }
            //queryService.post('update inv_credit_to_cost set ? where id='+$scope.it.id,param)
            //.then(function (result){
                var qstr = $scope.child.saveTable($scope.it.id)
                console.log(qstr.join(';'))
				qstr.splice(1, 0, 'update inv_credit_to_cost set ? where id='+$scope.it.id);
                queryService.post(qstr.join(';'),param)
                .then(function (result2){
					$scope.disableAction = false;
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
                function (err){
					$('#form-input').pgNotification({
	                    style: 'flip',
	                    message: 'Error Insert: '+err.code,
	                    position: 'top-right',
	                    timeout: 2000,
	                    type: 'danger'
	                }).show();
					$scope.disableAction = false;
                })
            /*},
            function (err){
				$scope.disableAction = false;
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })*/
        }
    }

    $scope.update = function(ids){
        queryService.post(qstring+ ' and a.id='+ids,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            console.log(result.data)
            $scope.it = result.data[0]
            $scope.it.date = $scope.it.transc_date
            $scope.it.request_notes = $scope.it.transc_notes
            $scope.selected.cc_origin['selected'] = {id:$scope.it.credit_to_cost_center_id,name:$scope.it.cost_orig_name}
            $scope.selected.cc_dest['selected'] = {id:$scope.it.debt_to_cost_center_id,name:$scope.it.cost_dest_name}
            $scope.selected.request_status['selected'] = {id:$scope.it.request_status,name:$scope.it.request_status_name}
			if ($scope.it.request_status==1)
				$scope.disableAction = true;
            queryService.post(qstringdetail+ ' and c.id='+ids,undefined)
            .then(function(result2){
                $('#form-input').modal('show');
                $scope.items = []
                console.log(result2.data)
                for (var i=0;i<result2.data.length;i++){

					result2.data[i]['p_id'] = result2.data[i]['id']
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
		$scope.disableAction = false;
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
        var results = [];

        var sqlitem = ['start transaction']
		for (var i =0;i< $scope.items.length; i++) {
            var user = $scope.items[i];
			console.log(user)
            if (user.isNew && !user.isDeleted){
                sqlitem.push('insert into inv_ctc_line_item(ctc_id,product_id,price,amount,qty,unit_type_id,created_by) values '+
                    '( '+transfer_id+', '+user.product_id+','+user.price_per_unit+','+(user.price_per_unit*user.request_qty)+','+user.request_qty+','+user.unit_id+', '+$localStorage.currentUser.name.id+' )')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from inv_ctc_line_item where id='+user.p_id)
            }
            else if(!user.isNew){
				sqlitem.push('update inv_ctc_line_item '+
                    'set product_id='+user.product_id+',price= '+user.price_per_unit+',amount='+(user.price_per_unit*user.request_qty)+',qty='+user.request_qty+',unit_type_id='+user.unit_id+', modified_date=curdate(),modified_by='+$localStorage.currentUser.name.id )
            }
        }
		if($scope.selected.request_status.selected.id==1){
			var amt=0;
			for (var j=0;j<$scope.items.length;j++){
				var user = $scope.items[j];
				console.log(user)
				if(user.isDeleted==undefined){
					amt+=(user.price_per_unit*user.request_qty)
					var sql2 = 'insert into inv_cs_stock_move(transc_type,ctc_id,origin_cost_center_id,dest_cost_center_id,product_id,qty,unit_type_id,qty_l,lowest_unit_type_id,created_by) values '+
						'( \'CC\','+transfer_id+','+$scope.selected.cc_origin.selected.id+','+$scope.selected.cc_dest.selected.id+','+
						' '+user.product_id+', '+(user.request_qty*user.unit_conversion)+', '+user.unit_id+','+user.request_qty+','+user.unit_id2+', '+$localStorage.currentUser.name.id+' )'
					var sql3 = 'update inv_cost_center_stock set '+
						'cost_center_id = '+$scope.selected.cc_origin.selected.id+','+
						'product_id = '+user.product_id+','+
						'stock_qty = stock_qty-'+(parseInt(user.request_qty)*user.unit_conversion)+','+
						'stock_qty_l = stock_qty_l-'+(parseInt(user.request_qty))+','+
						' modified_by = '+$localStorage.currentUser.name.id+',' +
						' modified_date = \''+globalFunction.currentDate()+'\'' +
						' where id='+user.warehouse_item_id

					var sql4 = 'INSERT INTO inv_cost_center_stock(cost_center_id,product_id,stock_qty,stock_qty_l,created_by) '+
						' values('+$scope.selected.cc_origin.selected.id+','+user.product_id+','+((parseInt(user.request_qty)*user.unit_conversion))+
						','+(parseInt(user.request_qty))+', '+$localStorage.currentUser.name.id+') ' +
						'ON DUPLICATE KEY UPDATE '+
						' stock_qty = stock_qty-'+(parseInt(user.request_qty)*user.unit_conversion)+
						' ,stock_qty_l = stock_qty_l-'+(parseInt(user.request_qty))
						//' ,stock_qty_in_recipe_unit = '+(user.stock_qty_in_recipe_unit+(user.issued_qty_n*user.recipe_unit_conversion))
						' ,modified_by = '+$localStorage.currentUser.name.id+',' +
						' modified_date = \''+globalFunction.currentDate()+'\''
					sqlitem.push(sql2)
					sqlitem.push(sql3)
					sqlitem.push(sql4)
				}
			}
			sqlitem.push('insert into acc_gl_transaction(code,journal_type_id,voucher_id,gl_status,notes,bookkeeping_date,posted_by,posting_date,created_by)'+
				' values ("'+$scope.it.code+'", 21, @id, 1, \''+$scope.it.request_notes+'\',"'+$scope.it.date+'",'+$localStorage.currentUser.name.id+',curdate(),'+$localStorage.currentUser.name.id+') on duplicate KEY UPDATE '+
				'notes=\''+$scope.it.request_notes+'\'');
			sqlitem.push("set @id=(select last_insert_id())");
			sqlitem.push('insert into acc_gl_journal (notes,gl_id,account_id,transc_type,amount,created_by,bookkeeping_date)'+
			' values("'+$scope.it.request_notes+'",@id,(select case when is_has_store="Y" then inv_account_id else account_id end code from mst_cost_center where id='+$scope.selected.cc_origin.selected.id+'),\'C\','+amt+','+$localStorage.currentUser.name.id+',"'+$scope.it.date+'")')
			sqlitem.push('insert into acc_gl_journal (notes,gl_id,account_id,transc_type,amount,created_by,bookkeeping_date)'+
			' values("'+$scope.it.request_notes+'",@id,(select case when is_has_store="Y" then inv_account_id else account_id end code from mst_cost_center where id='+$scope.selected.cc_dest.selected.id+'),\'D\','+amt+','+$localStorage.currentUser.name.id+',"'+$scope.it.date+'")')
	    }
		sqlitem.push('commit')
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
