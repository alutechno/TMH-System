var userController = angular.module('app', []);
userController
.controller('FinARIvoinceEntryCtrl',
function($scope, $state, $stateParams,$sce,$templateCache, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
	$scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
	$scope.buttonAdjust = false;
	$scope.disableAction = false;
	$scope.close=false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
	$scope.items = []
    $scope.itemsOri = []
	$scope.items = []
    $scope.child = {}
	$scope.guest={
		room_no:'',
		arrival_date:'',
		departure_date:'',
		room_rate_code:'',
		num_of_pax:'',
		num_of_child:'',
		room_rate_amount:'',
		discount_amount:'',
		guest_name:''
	}
	$scope.ie = {
		id: '',
		code:'',
		source_type:'',
		status:'',
		open_date:'',
		due_date:'',
		customer_id:'',
		folio_id:'',
		notes:'',
		used_currency_id:'',
		currency_exchange:1,
		home_total_amount:'',
		total_amount:'',
		home_deposit_amount:'',
		deposit_amount:'',
		home_adjust_amount:'',
		adjust_amount:'',
		home_paid_amount:'',
		paid_amount:'',
		home_gain_loss_amount:'',
		gain_loss_amount:'',
		home_total_due_amount:'',
		total_due_amount:'',
		home_received_amount:'',
		received_amount:'',
		home_fo_prepared_amount:'',
		fo_prepared_amount:'',
		home_current_due_amount:'',
		current_due_amount:'',
		prev_total_amount:''
	}
	$scope.selected = {
        status: {},
		source: {},
		customer:{},
		folio:{},
		currency:{}
	}
	var qstring = `select a.*,DATE_FORMAT(a.open_date,\'%Y-%m-%d\')open_date2,DATE_FORMAT(a.due_date,\'%Y-%m-%d\')due_date2,concat(b.first_name,' ',b.last_name,', ',b.title)guest_name,c.name company_name,d.name,e.arrival_date,e.departure_date,
		e.num_of_pax,e.num_of_child,e.room_rate_amount,e.discount_amount,e.voucher,f.name room_no,g.code room_rate_code,h.name status_name,i.name currency_name
		from acc_ar_invoice a,mst_customer b left join mst_cust_company c on b.company_id=c.id,ref_currency d,fd_guest_folio e,
		mst_room f,mst_room_rate g,(select value id, value,name from table_ref where table_name='acc_ar_invoice' and column_name='status' order by value)h,ref_currency i
		where a.customer_id=b.id
		and a.used_currency_id=d.id
		and a.folio_id=e.id
		and e.room_id=f.id
		and e.room_rate_id=g.id
		and a.status=h.id
		and a.used_currency_id=i.id `
	var qwhere = ''
	var qstringt='select * from acc_ar_receipt_line_item '

	$scope.status = []
	$scope.status_all = []
	queryService.get(`select value id, value,name from table_ref where table_name='acc_ar_invoice' and column_name='status' order by value`,undefined)
	.then(function(data){
		$scope.status = [data.data[0]]
		$scope.status_all = data.data
	})
	$scope.folio = []
	queryService.post(`select a.*,a.id name,concat(b.first_name,' ',b.last_name,', ',b.title)guest_name ,c.name room_no,d.code rate_code
		from fd_guest_folio a,mst_customer b,mst_room c,mst_room_rate d
		where a.customer_id=b.id
		and a.room_id=c.id
		and a.room_rate_id=d.id `,undefined)
	.then(function(data){
		$scope.folio = data.data
	})
	$scope.source = []
	queryService.get(`select value id, value,name from table_ref where table_name='acc_ar_invoice' and column_name='source_type' order by value`,undefined)
	.then(function(data){
		$scope.source = data.data
	})
	$scope.customer = []
	queryService.get('select id,code,name from mst_cust_company order by name ',undefined)
	.then(function(data){
		$scope.customer = data.data
	})
	$scope.currency = []
    queryService.get('select  id currency_id,code currency_code,name currency_name,home_currency_exchange exchange from ref_currency order by id asc',undefined)
    .then(function(data){
        $scope.currency = data.data
    })
	$scope.dtInstance = {}
    $scope.actionsHtml = function(data, type, full, meta) {
        var html = ''
		if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
			if ($scope.el.indexOf('buttonAdjust')>-1 && full.status!=2){
                html+='<button class="btn btn-default" title="Adjustment" ng-click="adjust(\'' + data + '\')" >' +
                '   <i class="fa fa-undo"></i>' +
                '</button>';
            }
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(\'' + data + '\')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
			/*if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(' + full + ' )">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';
            }*/
            html += '</div>'
        }
        return html
    }
	$scope.showAdvance = false
    $scope.createdRow = function(row, data, dataIndex) {
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
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '7%'),
        DTColumnBuilder.newColumn('open_date').withTitle('Open').withOption('width', '5%'),
		DTColumnBuilder.newColumn('due_date').withTitle('Due').withOption('width', '5%'),
		DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '5%'),
		DTColumnBuilder.newColumn('company_name').withTitle('Customer').withOption('width', '10%'),
		DTColumnBuilder.newColumn('guest_name').withTitle('Guest').withOption('width', '10%'),
		DTColumnBuilder.newColumn('total_amount').withTitle('Total').withOption('width', '10%')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' and code like "%'+$scope.filterVal.search+'%"'
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
            $scope.ie.code = data.data[0].code
        })
    }
	$scope.submit = function(){
		$scope.disableAction = true;
		if ($scope.ie.id.length==0){
			var dt = new Date()
			$scope.ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
			queryService.post('select next_document_no(\'AR\',\''+$scope.ym+'\') as code',undefined)
			.then(function(data){
				$scope.ie.code = data.data[0].code
			})

			$scope.ie.source_type=$scope.selected.source.selected?$scope.selected.source.selected.value:null;
			$scope.ie.status=$scope.selected.status.selected?$scope.selected.status.selected.id:null;
			$scope.ie.folio_id=$scope.selected.folio.selected?$scope.selected.folio.selected.id:null;
			$scope.ie.customer_id=$scope.selected.folio.selected?$scope.selected.folio.selected.id:null;
			$scope.ie.customer_id=1;
			$scope.ie.created_by=$localStorage.currentUser.name.id
			delete $scope.ie.guest_name;
            queryService.post('insert into acc_ar_invoice set ?',$scope.ie)
            .then(function (result){
				var qstr = $scope.child.saveTable()
				if(qstr.length>0){
					queryService.post(qstr.join(';'),undefined)
					.then(function (result3){
						$scope.disableAction = false;
						$('#form-input').modal('hide')
						$scope.dtInstance.reloadData(function(obj){}, false)
						$('body').pgNotification({
							style: 'flip',
							message: 'Success Update '+$scope.ie.code,
							position: 'top-right',
							timeout: 2000,
							type: 'success'
						}).show();
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
				}else{
					$scope.disableAction = false;
					$('#form-input').modal('hide')
					$scope.dtInstance.reloadData(function(obj){}, false)
					$('body').pgNotification({
						style: 'flip',
						message: 'Success Insert '+$scope.ie.code,
						position: 'top-right',
						timeout: 2000,
						type: 'success'
					}).show();
				}
				},function (err){
					$scope.disableAction = false;
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
		}else{
			$scope.ie.source_type=$scope.selected.source.selected?$scope.selected.source.selected.value:null;
			$scope.ie.status=$scope.selected.status.selected?$scope.selected.status.selected.id:null;
			$scope.ie.folio_id=$scope.selected.folio.selected?$scope.selected.folio.selected.id:null;
			$scope.ie.customer_id=$scope.selected.folio.selected?$scope.selected.folio.selected.id:null;
			$scope.ie.modified_by=$localStorage.currentUser.name.id
			$scope.ie.customer_id=1;
			$scope.ie.modified_date=globalFunction.currentDate()
			queryService.post('update acc_ar_invoice set ? where id='+$scope.ie.id,$scope.ie)
			.then(function (result2){
				var qstr = $scope.child.saveTable()
				if(qstr.length>0){
					queryService.post(qstr.join(';'),undefined)
					.then(function (result3){
						$('#form-input').modal('hide')
						$scope.dtInstance.reloadData(function(obj){}, false)
						$('body').pgNotification({
							style: 'flip',
							message: 'Success Update '+$scope.ie.code,
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
				$scope.disableAction = false;
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
	$scope.update = function(obj){
		$scope.clear();
		$scope.buttonUpdate = true;
		queryService.post(qstring+ ' and a.id='+obj,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.updateState = true;
			$scope.ie=result.data[0]
			$scope.ie.open_date=$scope.ie.open_date2
			$scope.ie.due_date=$scope.ie.due_date2

			$scope.selected.source['selected']= {
                id: result.data[0].source_type,
                name: result.data[0].source_type,
				value: result.data[0].source_type
            }
			$scope.selected.status['selected']= {
                id: result.data[0].status,
                name: result.data[0].status_name
            }
			if(result.data[0].status==2)
				$scope.close=true;
			if(result.data[0].status==0){
				$scope.status=[$scope.status_all[0],$scope.status_all[1]]
			}else if(result.data[0].status==1){
				$scope.status=[$scope.status_all[1],$scope.status_all[2]]
			}else{
				$scope.status=[$scope.status_all[2]]
			}
			$scope.selected.currency['selected']= {
                currency_id: result.data[0].used_currency_id,
				exchange:result.data[0].currency_exchange,
                currency_name: result.data[0].currency_name
            }
			$scope.selected.folio['selected']= {
                id: result.data[0].folio_id,
                value: result.data[0].folio_id
            }

			$scope.guest={
				room_no:result.data[0].room_no,
				arrival_date:result.data[0].arrival_date,
				departure_date:result.data[0].departure_date,
				room_rate_code:result.data[0].room_rate_code,
				num_of_pax:result.data[0].num_of_pax,
				num_of_child:result.data[0].num_of_child,
				room_rate_amount:result.data[0].room_rate_amount,
				discount_amount:result.data[0].discount_amount,
				guest_name:result.data[0].guest_name
			}
			delete $scope.ie.room_no
			delete $scope.ie.arrival_date
			delete $scope.ie.departure_date
			delete $scope.ie.open_date2
			delete $scope.ie.due_date2
			delete $scope.ie.room_rate_code
			delete $scope.ie.num_of_pax
			delete $scope.ie.num_of_child
			delete $scope.ie.room_rate_amount
			delete $scope.ie.discount_amount
			delete $scope.ie.guest_name
			delete $scope.ie.company_name
			delete $scope.ie.name
			delete $scope.ie.voucher
			delete $scope.ie.created_date
			delete $scope.ie.currency_name
			delete $scope.ie.status_name
			var qd=`select b.*,c.code account_code,c.name account_name
				from acc_gl_transaction a,acc_gl_journal b,mst_ledger_account c
				where a.id=b.gl_id
				and b.account_Id=c.id
				and a.ar_invoice_id=`+obj
			queryService.post(qd,undefined)
            .then(function(result2){
				var d = result2.data
                $scope.items = []
                $scope.itemsOri = []
				$scope.totaldebit = 0
				$scope.totalcredit = 0
                for (var i=0;i<d.length;i++){
					$scope.gl_id=d[i].gl_id
                    $scope.items.push(
                        {
                            id:(i+1),
                            p_id: d[i].id,
							notes: d[i].notes,
                            account_id:d[i].account_id,
                            account_code:d[i].account_code,
                            account_name: d[i].account_name,
                            debit: d[i].transc_type=='D'?d[i].amount:'',
                            credit: d[i].transc_type=='C'?d[i].amount:''
                        }
                    )
					$scope.totaldebit += d[i].transc_type=='D'?d[i].amount:0
		            $scope.totalcredit += d[i].transc_type=='C'?d[i].amount:0
                }
                $scope.itemsOri = angular.copy($scope.items)
            },
            function(err2){
                console.log(err2)
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
	$scope.adjust = function(obj){
		$scope.clear()
		$scope.buttonAdjust = true;
		queryService.post(qstring+ ' and a.id='+obj,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.updateState = true;
			$scope.ie=result.data[0]
			$scope.ie.open_date=$scope.ie.open_date2
			$scope.ie.due_date=$scope.ie.due_date2
			$scope.orig_home=parseFloat($scope.ie.home_total_amount)
			$scope.orig_total=parseFloat($scope.ie.total_amount)
			$scope.adjust_home=parseFloat($scope.ie.home_adjust_amount)
			$scope.adjust_total=parseFloat($scope.ie.adjust_amount)
			$scope.selected.source['selected']= {
                id: result.data[0].source_type,
                name: result.data[0].source_type,
				value: result.data[0].source_type
            }

			$scope.selected.status['selected']= {
                id: result.data[0].status,
                name: result.data[0].status_name
            }
			if(result.data[0].status==0){
				$scope.status=[$scope.status_all[0],$scope.status_all[1]]
			}else if(result.data[0].status==1){
				$scope.status=[$scope.status_all[1],$scope.status_all[2]]
			}else{
				$scope.status=[$scope.status_all[2]]
			}
			$scope.selected.currency['selected']= {
                currency_id: result.data[0].used_currency_id,
				exchange:result.data[0].currency_exchange,
                currency_name: result.data[0].currency_name
            }
			$scope.selected.folio['selected']= {
                id: result.data[0].folio_id,
                value: result.data[0].folio_id
            }
			$scope.guest={
				room_no:result.data[0].room_no,
				arrival_date:result.data[0].arrival_date,
				departure_date:result.data[0].departure_date,
				room_rate_code:result.data[0].room_rate_code,
				num_of_pax:result.data[0].num_of_pax,
				num_of_child:result.data[0].num_of_child,
				room_rate_amount:result.data[0].room_rate_amount,
				discount_amount:result.data[0].discount_amount,
				guest_name:result.data[0].guest_name
			}
			delete $scope.ie.room_no
			delete $scope.ie.arrival_date
			delete $scope.ie.departure_date
			delete $scope.ie.open_date2
			delete $scope.ie.due_date2
			delete $scope.ie.room_rate_code
			delete $scope.ie.num_of_pax
			delete $scope.ie.num_of_child
			delete $scope.ie.room_rate_amount
			delete $scope.ie.discount_amount
			delete $scope.ie.guest_name
			delete $scope.ie.company_name
			delete $scope.ie.name
			delete $scope.ie.voucher
			delete $scope.ie.created_date
			delete $scope.ie.currency_name
			delete $scope.ie.status_name
			var qd=`select b.*,c.code account_code,c.name account_name
				from acc_gl_transaction a,acc_gl_journal b,mst_ledger_account c
				where a.id=b.gl_id
				and b.account_Id=c.id
				and a.ar_invoice_id=`+obj
			queryService.post(qd,undefined)
            .then(function(result2){
				var d = result2.data
                $scope.items = []
                $scope.itemsOri = []
				$scope.totaldebit = 0
				$scope.totalcredit = 0
                for (var i=0;i<d.length;i++){
					$scope.gl_id=d[i].gl_id
                    $scope.items.push(
                        {
                            id:(i+1),
                            p_id: d[i].id,
							notes: d[i].notes,
                            account_id:d[i].account_id,
                            account_code:d[i].account_code,
                            account_name: d[i].account_name,
                            debit: d[i].transc_type=='D'?d[i].amount:'',
                            credit: d[i].transc_type=='C'?d[i].amount:''
                        }
                    )
					$scope.totaldebit += d[i].transc_type=='D'?d[i].amount:0
		            $scope.totalcredit += d[i].transc_type=='C'?d[i].amount:0
                }
                $scope.itemsOri = angular.copy($scope.items)
            },
            function(err2){
                console.log(err2)
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
		$scope.ie.id = obj.id;
		$scope.ie.code = obj.code;
        $('#modalDelete').modal('show')
    }
	$scope.execDelete = function(){

	}
	$scope.clear = function(){
		delete $scope.gl_id
		$scope.buttonUpdate = false;
	    $scope.buttonDelete = false;
		$scope.buttonAdjust = false;
		$scope.ie = {
			id: '',
			code:'',
			source_type:'',
			status:'',
			open_date:'',
			due_date:'',
			customer_id:'',
			folio_id:'',
			notes:'',
			used_currency_id:'',
			currency_exchange:1,
			home_total_amount:'',
			total_amount:'',
			home_deposit_amount:'',
			deposit_amount:'',
			home_adjust_amount:'',
			adjust_amount:'',
			home_paid_amount:'',
			paid_amount:'',
			home_gain_loss_amount:'',
			gain_loss_amount:'',
			home_total_due_amount:'',
			total_due_amount:'',
			home_received_amount:'',
			received_amount:'',
			home_fo_prepared_amount:'',
			fo_prepared_amount:'',
			home_current_due_amount:'',
			current_due_amount:'',
			prev_total_amount:''
		}
		$scope.selected = {
	        status: {},
			source: {},
			customer:{},
			folio:{},
			currency:{}
		}
		$scope.items = []
		$scope.guest={}
		$scope.close=false;
    }
	$scope.trustAsHtml = function(value) {
		return $sce.trustAsHtml(value.toString());
    }
})
.controller('EditableTableSrCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
	$scope.item = {
        account_id:'',
        account_code:'',
        account_name: '',
        debit: '',
        credit: ''
    };
	$scope.filterUser = function(user) {
        return user.isDeleted !== true;
    };
	$scope.deleteUser = function(id) {
        var filtered = $filter('filter')($scope.items, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    }
	$scope.account = {}
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.items.length+1),
            account_id:'',
            account_code:'',
            account_name: '',
            debit: '',
            credit: '',
            isNew: true
        };
        $scope.items.push($scope.item)
        queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        .then(function(data){
            $scope.account[$scope.item.id] = data.data
        })
    };
	$scope.accountUp = function(d,text) {
        //queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        queryService.post('select id,code,name from mst_ledger_account where lower(code) like \''+text.toLowerCase()+'%\' order by id limit 10 ',undefined)
        .then(function(data){
            $scope.account[d] = data.data
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
		if($scope.gl_id==undefined && $scope.items.length>0){
			sqlitem.push('insert into acc_gl_transaction(code,journal_type_id,ar_invoice_id,gl_status,notes)'+
				' values (\''+$scope.ie.code+'\', 1, '+$scope.ie.id+', \'0\', \''+$scope.ie.notes+'\') ')
			sqlitem.push('set @id=(select last_insert_id())')
		}
		for (var i =0;i< $scope.items.length; i++) {

            var user = $scope.items[i];
			user.notes=user.notes==undefined?'':user.notes
			if (user.isNew && !user.isDeleted){
				if($scope.gl_id==undefined){
					if (user.debit>0){
	                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date,notes) values'+
						'(@id,'+user.account_id+',\'D\','+user.debit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',"'+user.notes+'")')
	                }
	                else if (user.credit>0){
	                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date,notes) values'+
						'(@id,'+user.account_id+',\'C\','+user.credit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',"'+user.notes+'")')
	                }
				}else{
					if (user.debit>0){
						sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date,notes) values('+
						$scope.gl_id+','+user.account_id+',\'D\','+user.debit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',"'+user.notes+'")')
					}
					else if (user.credit>0){
						sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date,notes) values('+
						$scope.gl_id+','+user.account_id+',\'C\','+user.credit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',"'+user.notes+'")')
					}
				}
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_gl_journal where id='+user.p_id)
            }

            else if(!user.isNew){
				if (user.debit>0){
				sqlitem.push(`update acc_gl_journal set gl_id=`+$scope.gl_id+
					`,account_id=`+user.account_id+
					`,notes='`+user.notes+`'
					,transc_type='D',amount=`+user.debit+` where id=`+user.p_id)
				}else if (user.credit>0){
					sqlitem.push(`update acc_gl_journal set gl_id=`+$scope.gl_id+
						`,account_id=`+user.account_id+
						`,notes='`+user.notes+`'
						,transc_type='C',amount=`+user.credit+` where id=`+user.p_id)
				}
			}
		}
		if($scope.buttonAdjust==true && ($scope.adjust_home!=parseFloat($scope.ie.home_adjust_amount) || $scope.adjust_total!=parseFloat($scope.ie.adjust_amount))){
			for (var i =0;i< $scope.items.length&&i<2; i++) {
				var user = $scope.items[i];
				if (user.debit>0){
					sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date,notes) values('+
					$scope.gl_id+','+user.account_id+',\'D\','+($scope.ie.adjust_amount-$scope.orig_total)+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',"Adjustment")')
				}
				else if (user.credit>0){
					sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date,notes) values('+
					$scope.gl_id+','+user.account_id+',\'C\','+($scope.ie.adjust_amount-$scope.orig_total)+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',"Adjustment")')
				}
			}
		}
		sqlitem.push('COMMIT')
		return sqlitem
	}
	$scope.getAccount = function(e,d){
        $scope.items[d-1].account_id = e.id
        $scope.items[d-1].account_code = e.code
        $scope.items[d-1].account_name = e.name
    }
	$scope.setValue = function(e,d,p,t){
		$scope.totaldebit = 0
        $scope.totalcredit = 0
        if (t=='debit'){
			$scope.items[d-1].debit = p
		}
        if (t=='credit'){
			$scope.items[d-1].credit = p
		}
		for(var i=0;i<$scope.items.length;i++){
            $scope.totaldebit += (parseInt($scope.items[i].debit).toString()=='NaN'?0:parseInt($scope.items[i].debit))
            $scope.totalcredit += (parseInt($scope.items[i].credit).toString()=='NaN'?0:parseInt($scope.items[i].credit))
        }
    }
	$scope.updateNotes = function(e,d,p){
		$scope.items[d-1].notes = p
	}
	$scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    }
})
