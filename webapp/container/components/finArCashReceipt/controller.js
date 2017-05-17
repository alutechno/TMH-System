var userController = angular.module('app', []);
userController
.controller('FinArCashReceiptCtrl',
function($scope, $state, $stateParams,$sce,$templateCache, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
	$scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
	$scope.items = []
    $scope.itemsOri = []
	$scope.items = []
    $scope.itemsOri = []
    $scope.trans = []
    $scope.transOri = []
    $scope.child = {}
	$scope.cr = {
		id: '',
		invoice_id:'',
		receipt_date:'',
		receipt_notes:'',
		receipt_amount:'',
		receipt_status:''
	}
	$scope.selected = {
        receipt_status: {}
	}
	var qstring = 'select a.*,b.name receipt_status_name from acc_ar_cash_receipt a,(select value as id,name from table_ref where table_name='acc_ar_cash_receipt') b
where a.receipt_status=b.id '
	var qwhere = ''
	var qstringt='select * from acc_ar_receipt_line_item '

	$scope.receipt_status = []
	queryService.get(`select value id, value,name from table_ref where table_name='acc_ar_cash_receipt' order by value`,undefined)
	.then(function(data){
	})

	$scope.dtInstance = {}
    $scope.actionsHtml = function(data, type, full, meta) {
		$scope.cats[data] = {id:data,code:full.code};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(' + data + ')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
			if ($scope.el.indexOf('buttonDelete')>-1 && full.issued_status==0 && full.request_status==0){
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
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('id').withOption('width', '5%'),
        DTColumnBuilder.newColumn('invoice_id').withTitle('Invoice ID').withOption('width', '15%'),
        DTColumnBuilder.newColumn('receipt_status_name').withTitle('Status').withOption('width', '10%'),
		DTColumnBuilder.newColumn('created_by').withTitle('Created By').withOption('width', '10%'),
		DTColumnBuilder.newColumn('created_date').withTitle('Created Date').withOption('width', '10%')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' and invoice_id like "%'+$scope.filterVal.search+'%"'
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
	$scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.releaseState = true;
            $scope.clear()
        }
        $('#form-input').modal('show')
		var dt = new Date()
		$scope.ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
        queryService.post('select curr_document_no(\'AR\',\''+$scope.ym+'\') as code',undefined)
        .then(function(data){
            $scope.cr.invoice_id = data.data[0].code
        })
        //$scope.viewMode = false
        //$scope.addDetail(0)
    }
	$scope.submit = function(){
		if ($scope.cr.id.length==0){
			queryService.post('select next_document_no(\'AR\',\''+$scope.ym+'\') as code',undefined)
			.then(function(data){
				$scope.cr.invoice_id = data.data[0].code
			})
            var param = {
				invoice_id:$scope.cr.invoice_id,
				receipt_date:$scope.cr.receipt_date,
				receipt_notes:$scope.cr.receipt_notes,
				receipt_amount:$scope.cr.receipt_amount,
				receipt_status:$scope.selected.receipt_status.selected.id
			}
            queryService.post('insert into acc_ar_cash_receipt set ?',param)
            .then(function (result){
				var qstr = $scope.child.saveTable(result.data.insertId)
				if(qstr.length>0){
					queryService.post(qstr.join(';'),undefined)
	                .then(function (result2){
	                    $('#form-input').modal('hide')
	                    $scope.dtInstance.reloadData(function(obj){}, false)
	                    $('body').pgNotification({
	                        style: 'flip',
	                        message: 'Success Insert '+$scope.cr.invoice_id,
	                        position: 'top-right',
	                        timeout: 2000,
	                        type: 'success'
	                    }).show();
	                },
	                function (err2){
	                    console.log(err2)
	                })
				}else{
					$('#form-input').modal('hide')
					$scope.dtInstance.reloadData(function(obj){}, false)
					$('body').pgNotification({
						style: 'flip',
						message: 'Success Insert '+$scope.cr.invoice_id,
						position: 'top-right',
						timeout: 2000,
						type: 'success'
					}).show();
				}
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
		}else{
			var param = {
				invoice_id:$scope.cr.invoice_id,
				receipt_date:$scope.cr.receipt_date,
				receipt_notes:$scope.cr.receipt_notes,
				receipt_amount:$scope.cr.receipt_amount,
				receipt_status:$scope.selected.receipt_status.selected.id
			}
            queryService.post('update acc_ar_cash_receipt set ? where id='+$scope.cr.id,param)
			var qstr = $scope.child.saveTable()
			if(qstr.length>0){
				queryService.post(qstr.join(';'),undefined)
				.then(function (result2){
					$('#form-input').modal('hide')
					$scope.dtInstance.reloadData(function(obj){}, false)
					$('body').pgNotification({
						style: 'flip',
						message: 'Success Insert '+$scope.cr.invoice_id,
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
		}
	}
	$scope.update = function(ids){
	}
	$scope.delete = function(obj){
		$scope.cr.id = obj.id;
		$scope.cr.invoice_id = obj.invoice_id;
        $('#modalDelete').modal('show')
    }
	$scope.execDelete = function(){
	}
	$scope.clear = function(){
        $scope.cr = {
            id: '',
            invoice_id: '',
            status: ''
        }
    }
})
.controller('EditableTableSrCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
	$scope.item = {
        id: '',
		invoice_id:0,
		status:''
	}
	$scope.deleteUser = function(id) {
        var filtered = $filter('filter')($scope.items, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    }
	$scope.addUser = function() {
        $scope.item = {
			id: '',
			invoice_id:0,
			status:''
		}
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
	}
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
	}
	$scope.child.saveTable = function(cr_id) {
        var results = [];
        var sqlitem = []
		sqlitem.push('START TRANSACTION')
		for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
			if (user.isNew && !user.isDeleted){
                sqlitem.push('insert into inv_store_req_line_item(sr_id,product_id,request_qty,issued_qty,created_by,request_notes) values '+
                    '( '+cr_id+', '+user.product_id+','+parseInt(user.request_qty)+', '+parseInt(user.issued_qty_n)+', '+$localStorage.currentUser.name.id+' ,"'+user.item_notes+'")')
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
							var sql1 = 'update inv_store_req_line_item set '
							sqlitem.push(sql1)
						}
					}
				}
			}
		}
		sqlitem.push('COMMIT')
		return sqlitem
	}
	$scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    }
})
