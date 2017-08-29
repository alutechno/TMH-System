var userController = angular.module('app', ["xeditable",'fcsa-number']);

userController.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});
userController
.controller('InvPurchaseRequestCtrl',
function($scope, $state, $sce, $templateCache,globalFunction,queryService, $q,prService, DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, $localStorage, $compile, $rootScope, API_URL,
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
    $scope.releaseState = true;
    $scope.seqState = 1;
    $scope.disableAction = false;
    $scope.stat = {pr:'pr'}
	$scope.direct='non';
	$scope.supp={};
	$scope.tot_amt={};
	$scope.tot_qty={};
    for (var i=0;i<$scope.el.length;i++){

        if ($scope.el[i]=='approvalDeptHead'){
            $scope.approveState = true;
            $scope.rejectState = true;
            $scope.seqState = 2;
        }
        else if ($scope.el[i]=='approvalPoManager'){
            $scope.approveState = true;
            $scope.rejectState = true;
            $scope.seqState = 3;
        }
        else if ($scope.el[i]=='approvalCostControl'){
            $scope.approveState = true;
            $scope.rejectState = true;
            $scope.seqState = 4;
        }
        else if ($scope.el[i]=='approvalFinance'){
            $scope.approveState = true;
            $scope.rejectState = false;
            $scope.seqState = 5;
        }
        else if ($scope.el[i]=='approvalGm'){
            $scope.approveState = true;
            $scope.rejectState = false;
            $scope.seqState = 6;
        }
        else if ($scope.el[i]=='prReleased'){
            $scope.approveState = true;
            $scope.rejectState = true;
            $scope.seqState = 7;
        }
        else $scope[$scope.el[i]] = true;

    }
    var qstring = 'select a.id,a.code,a.purchase_notes,a.doc_status_id, a.approval_status,a.revision_counter, '+
    	'b.name as doc_status_name,date_format(a.created_date,\'%Y-%m-%d %H:%i:%s\') created_date, e.name created_by, e.department_name,'+
        'DATE_FORMAT(a.delivery_date,\'%Y-%m-%d\') as delivery_date, '+
        'a.cost_center_id,c.name cost_center_name, '+
    	'a.warehouse_id,d.name warehouse_name,purchase_type, '+
    'format((SELECT SUM(order_amount) FROM inv_pr_line_item item WHERE item.pr_id = a.id),0) AS Total, '+
    '(SELECT SUM(order_amount) FROM inv_pr_line_item item WHERE item.pr_id = a.id) AS TotalSum, '+
    'case when approval_status = 1 then \'Approved\' when approval_status = 2 then \'Rejected\' else \'None\'  end as status '+
    'from ref_pr_document_status b,inv_purchase_request a '+
    'left join mst_cost_center as c on a.cost_center_id=c.id '+
    'left join mst_warehouse d on a.warehouse_id=d.id '+
    'left join (select a.*,b.name department_name from user a '+
            'left join mst_department b on a.department_id = b.id) e  '+
        'on a.created_by = e.id '+
    'where a.doc_status_id=b.id '+
	'and a.doc_status_id!=8 '
    var qwhere = '';
    var qstringdetail = 'select a.id as p_id,a.cost_center_id,e.name cost_center_name,concat(\'Department: \',f.name) dept_desc,a.product_id,b.code as product_code,d.name unit_name,b.name as product_name,a.order_qty,a.net_price,a.order_amount,a.supplier_id,c.name as supplier_name,a.order_notes '+
        'from inv_pr_line_item a '+
        'left join mst_product b on a.product_id = b.id '+
        'left join mst_supplier c on a.supplier_id = c.id '+
        'left join ref_product_unit d on b.unit_type_id=d.id '+
		'left join mst_cost_center e on a.cost_center_id=e.id '+
		'left join mst_department f on f.id=e.department_id '
    var qstringdetailnon = 'select a.id as p_id,a.cost_center_id,e.name cost_center_name,concat(\'Department: \',f.name) dept_desc,a.product_id,b.code as product_code,a.product_unit unit_name,a.product_name as product_name,a.order_qty,a.net_price,a.order_amount,a.supplier_id,c.name as supplier_name,a.order_notes '+
        'from inv_pr_line_item a '+
        'left join mst_product b on a.product_id = b.id '+
        'left join mst_supplier c on a.supplier_id = c.id '+
        'left join ref_product_unit d on b.unit_type_id=d.id '+
		'left join mst_cost_center e on a.cost_center_id=e.id '+
		'left join mst_department f on f.id=e.department_id '
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
    $scope.itemsOri = []
    $scope.child = {}
    $scope.child.totalQty = 0
    $scope.totalPrice = 0
    $scope.child.tAmt = 0

    $scope.id = '';
    $scope.pr = {
        id: '',
        code: '',
        purchase_notes: '',
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
        approval: 0,
        filter_status: [],
        filter_cost_center: {},
        filter_warehouse: {}
    }
    $scope.filter_date = ''
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
	$scope.popup=true;

	$scope.popup_history = function(){
		$scope.popup=!$scope.popup;
	}
    queryService.get('select a.id, a.code,upper(a.name) as name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
        'from mst_cost_center a, mst_department b '+
        'where a.department_id = b.id and a.status!=2 '+
        'order by a.code asc limit 50',undefined)
    .then(function(data){
        $scope.cost_center = data.data
    })
    $scope.costCenterUp = function(text){
        queryService.post('select a.id, a.code,upper(a.name) as name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
            'from mst_cost_center a, mst_department b '+
            'where a.department_id = b.id and a.status!=2 '+
            ' and lower(a.name) like \'%'+text+'%\' '+
            'order by a.code asc limit 50',undefined)
        .then(function(data){
            $scope.cost_center = data.data
        })

    }
    queryService.get('select id,name from mst_warehouse where status!=2',undefined)
    .then(function(data){
        $scope.warehouse = data.data
    })
    queryService.get('select id,name from ref_pr_document_status order by seq_id',undefined)
    .then(function(data){
        $scope.doc_status = data.data
        $scope.doc_status_def = data.data
    })

    /*START AD ServerSide*/

    $scope.dtOptionsItem = DTOptionsBuilder.newOptions();
    //define colum
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
            if ($scope.el.indexOf('buttonDelete')>-1 && full.approval_status==0 && full.doc_status_id==1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(\'' + data + '\')" )"="">' +
                '   <i class="fa fa-trash-o"></i>' +
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
            data.query = qstring + qwhere ;
        }
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withPaginationType('full_numbers')
    .withOption('order', [0, 'desc'])
    .withDisplayLength(15)
    .withOption('scrollX',true)
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

    })

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '7%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('PR Number').withOption('width', '10%'),
        DTColumnBuilder.newColumn('doc_status_name').withTitle('PR Status').withOption('width', '7%'),
        DTColumnBuilder.newColumn('status').withTitle('Approval').withOption('width', '7%'),
        DTColumnBuilder.newColumn('created_date').withTitle('PR Request Date').withOption('width','11%'),
        DTColumnBuilder.newColumn('delivery_date').withTitle('Expected At').withOption('width', '9%'),
        DTColumnBuilder.newColumn('warehouse_name').withTitle('Store Location').withOption('width','12%'),
        DTColumnBuilder.newColumn('cost_center_name').withTitle('Cost Center').withOption('width','12%'),
        DTColumnBuilder.newColumn('Total').withTitle('Total').withClass('text-right').withOption('width', '9%'),
        DTColumnBuilder.newColumn('created_by').withTitle('Created by').withOption('width', '9%'),
        DTColumnBuilder.newColumn('department_name').withTitle('Dept').withOption('width', '9%')
    );

    var qwhereobj = {
        text: '',
        status: '',
        cost_center: '',
        warehouse: '',
        date: ''
    }
    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhereobj.text = ' a.code like \'%'+$scope.filterVal.search+'%\' '
                else qwhereobj.text = ''
                qwhere = setWhere()

                $scope.nested.dtInstance.reloadData(function(obj){
                }, false)
            }
        }

    }
    $scope.f = {filter_date : ''}
    $scope.applyFilter = function(){
        var status = []
        if ($scope.selected.filter_status.length>0){
            for (var i=0;i<$scope.selected.filter_status.length;i++){
                status.push($scope.selected.filter_status[i].id)
            }
            qwhereobj.status = ' a.doc_status_id in('+status.join(',')+') '
        }

        if ($scope.selected.filter_cost_center.selected){
            qwhereobj.cost_center = ' a.cost_center_id = '+$scope.selected.filter_cost_center.selected.id+ ' '
        }
        if ($scope.selected.filter_warehouse.selected){
            qwhereobj.warehouse = ' a.warehouse_id = '+$scope.selected.filter_warehouse.selected.id+ ' '
        }
        if ($scope.f.filter_date1.length>0 && $scope.f.filter_date2.length>0){
            qwhereobj.date = ' a.created_date between \''+$scope.f.filter_date1+ ' 00:00:00\'  and \''+$scope.f.filter_date2+' 23:59:59\' '
        }
        qwhere = setWhere()
        $scope.nested.dtInstance.reloadData(function(obj){
        }, false)

    }
    function setWhere(){
        var arrWhere = []
        var strWhere = ''
        for (var key in qwhereobj){
            if (qwhereobj[key].length>0) arrWhere.push(qwhereobj[key])
        }
        if (arrWhere.length>0){
            strWhere = ' and ' + arrWhere.join(' and ')
        }
        return strWhere
    }

    /*END AD ServerSide*/
    $scope.showAdvance = false
    $scope.openAdvancedFilter = function(val){
        $scope.showAdvance = val
    }

    $scope.openQuickView = function(state,stat){
        if (state == 'add'){
            $scope.releaseState = true;
            $scope.clear()
        }
        $scope.stat.pr = stat;
        $scope.seqState = 1
        $scope.disableAction = false;
        $('#form-input').modal('show')
        //$scope.show.itemTable=true
        $scope.viewMode = false
        $scope.addDetail(0)
        $scope.selected.doc_status['selected'] = $scope.doc_status_def[0]
        $scope.statusState = true
        $scope.approveState = false
        $scope.rejectState = true
        $scope.selected.approval = 0
        //var dt = new Date()

        //$scope.ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
        //queryService.post('select curr_document_no(\'PR\',\''+$scope.ym+'\') as code',undefined)
		queryService.post('select curr_item_code("INV",concat("PR",date_format(curdate(),"%y"))) as code',undefined)
        .then(function(data){
            $scope.pr.code = data.data[0].code
        })
    }
    $scope.openQuickViewItem = function(state){
        $('#form-input-item').modal('show')

    }
    $scope.setApprovalStatus = function(ev){
        $scope.approveState = false
        $scope.rejectState = false
    }

	$scope.reformat = function(){
		$scope.tot_amt={};
		$scope.tot_qty={};
		$scope.supp={};
		for(var i=0;i<$scope.items.length;i++){
			if(!$scope.supp[$scope.items[i].supplier_id]){
				$scope.supp[$scope.items[i].supplier_id]=[$scope.items[i]]
				$scope.tot_amt[$scope.items[i].supplier_id]=$scope.items[i].amount
				$scope.tot_qty[$scope.items[i].supplier_id]=$scope.items[i].qty
			}else{
				$scope.supp[$scope.items[i].supplier_id].push($scope.items[i])
				$scope.tot_amt[$scope.items[i].supplier_id]+=$scope.items[i].amount
				$scope.tot_qty[$scope.items[i].supplier_id]+=$scope.items[i].qty
			}
		}
        var printSection = window.document.getElementById('printSection');
        var printSectionParent = window.document.getElementById('printSectionParent');
        if (printSectionParent){
            printSectionParent.innerHTML = '';
            printSectionParent.appendChild(printSection);
        }
        else {
            printSectionParent = document.createElement('div');
            printSectionParent.id = 'printSectionParent';
            document.body.appendChild(printSectionParent);
            printSectionParent.appendChild(printSection)

        }
		setTimeout(function(){
			window.print();
		}, 100)
	}

    $scope.submit = function(){
		$scope.disableAction = true;
		var purchase_type='DN'
		if($scope.stat.pr=='pr' && $scope.direct=='non')
			purchase_type='NDI'
		else if($scope.stat.pr=='non' && $scope.direct=='non')
			purchase_type='NDN'
		else if($scope.stat.pr=='pr' && $scope.direct=='direct')
			purchase_type='DI'
		if ($scope.pr.id.length==0 ){
            //exec creation
            $scope.child.totalQty = 0

            for (var i=0;i<$scope.items.length;i++){
                if ($scope.items[i].product_id.toString().length>0||$scope.items[i].product_name.length>0) $scope.child.totalQty += parseFloat($scope.items[i].qty)
            }
            var statCostCenter = true
            if ($scope.direct=='direct'){
                for (var i=0;i<$scope.items.length;i++){
                    console.log($scope.items[i])
                    if ($scope.items[i].cost_center_id){
                        if ($scope.items[i].cost_center_id.toString().length>0) statCostCenter = true
                        else {
                            statCostCenter = false
                            break
                        }
                    }
                    else {
                        statCostCenter = false
                        break
                    }

                }
            }


            if ($scope.items.length>0 && $scope.child.totalQty>0 && statCostCenter){
                var param = {}
				if($scope.direct=='non'){
	                //queryService.post('select next_document_no(\'PR\',\''+$scope.ym+'\') as code',undefined)
					queryService.post('select next_item_code("INV",concat("PR",date_format(curdate(),"%y"))) as code',undefined)
	                .then(function(data){
	                    $scope.pr.code = data.data[0].code
	                })
				}else{
					//queryService.post('select next_document_no(\'DP\',\''+$scope.ym+'\') as code',undefined)
					queryService.post('select next_item_code("INV",concat("DP",date_format(curdate(),"%y"))) as code',undefined)
	                .then(function(data){
	                    $scope.pr.code = data.data[0].code
	                })
				}

                param = {
                    code: $scope.pr.code,
                    purchase_notes: $scope.pr.purchase_notes,
					doc_status_id:1,
                    delivery_date: $scope.pr.delivery_date,
                    warehouse_id: $scope.selected.warehouse.selected?$scope.selected.warehouse.selected.id:null,
                    cost_center_id: $scope.selected.cost_center.selected?$scope.selected.cost_center.selected.id:null,
                    created_by: $localStorage.currentUser.name.id,
                    created_date: globalFunction.currentDate(),
                    purchase_type: purchase_type,
                    approval_status:$scope.selected.approval
                }
                queryService.post('insert into inv_purchase_request set ?',param)
                .then(function (result){
                    var paramDetail = {
                        pr_id: result.data.insertId,
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
                    queryService.post('insert into inv_pr_doc_state set ?',paramDetail)
                    .then(function (result2){
                        var paramItem = []
                        for (var x=0;x<$scope.items.length;x++){
                            paramItem.push([
                                result.data.insertId,$scope.items[x].product_id,$scope.items[x].supplier_id,
                                parseInt($scope.items[x].qty),parseInt($scope.items[x].price),parseInt($scope.items[x].amount),
                                $localStorage.currentUser.name.id,globalFunction.currentDate()
                            ])
                        }
                        $scope.addItemDetail(result.data.insertId)
                        .then(function (result3){
                            $('#form-input').modal('hide')

                            $scope.nested.dtInstance.reloadData(function(obj){
                                // console.log(obj)
                            }, false)
                            $('body').pgNotification({
                                style: 'flip',
                                message: 'Success Insert PR '+$scope.pr.code,
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
                    },
                    function (err2){
						$scope.disableAction = false;
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Insert PR State: '+err2.code,
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
                        message: 'Error Insert PR: '+err.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            }
            else {
				$scope.disableAction = false;
                var msgErr = ''
                if (!statCostCenter){
                    msgErr = 'Cannot Add PR, Cost Center is Empty !!'
                }
                else {
                    msgErr = 'Cannot Add PR, Item list or QTY is Empty !!'
                }
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: msgErr,
                    position: 'top-right',
                    timeout: 10000,
                    type: 'danger'
                }).show();
            }
        }
        else {
            //exec update
            var param = [{
                code: $scope.pr.code,
                purchase_notes: $scope.pr.purchase_notes,
                delivery_date:$scope.pr.delivery_date,
                doc_status_id:($scope.selected.approval==2?1:$scope.selected.doc_status.selected.id),
                warehouse_id:$scope.selected.warehouse.selected.id,
                cost_center_id:$scope.selected.cost_center.selected.id,
				purchase_type: purchase_type,
                revision_counter:($scope.pr.revision_counter+1),
                modified_by:$localStorage.currentUser.name.id,
                modified_date:globalFunction.currentDate(),
                approval_status: ($scope.selected.approval==0?0:$scope.selected.approval)
            },$scope.pr.id]

            queryService.post('update inv_purchase_request set ? where id=?',param)
            .then(function (result){
                var queryState = ''
                var paramState = []
                var paramPr = {}

                if ($scope.pr.doc_status_id==$scope.selected.doc_status.selected.id &&
                    $scope.pr.approval_status==$scope.selected.approval ){
                    $('#form-input').modal('hide')
                    result.data['insertId'] = $scope.pr.id
                    $scope.addItemDetail($scope.pr.id)
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
						$scope.disableAction = false;
                        console.log(err3)
                    })
                }
                else {
                    result.data['insertId'] = $scope.pr.id
                    var po_stat = true
                    var po_msg = []
                    for (var i=0;i<$scope.items.length;i++){
                        if (!$scope.items[i].isDeleted && ($scope.items[i].supplier_id==null || $scope.items[i].supplier_id.length==0)){
                            po_stat = false
                            po_msg.push($scope.items[i].product_name)
                        }
                    }
                    if (po_stat == false && ($scope.selected.doc_status.selected.id==3 && $scope.selected.approval==1)){
						$scope.disableAction = false;
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Empty Supplier on Item '+po_msg.join(', '),
                            position: 'top-right',
                            timeout: 10000,
                            type: 'danger'
                        }).show();
                    }
                    else {
                        $scope.addItemDetail($scope.pr.id)
                        .then(function (result3){
                            console.log(result.data.insertId)
                        },
                        function (err3){
                            console.log(err3)
                        })
                        var approvalMsg = ''
                        if ($scope.selected.approval==1 || $scope.selected.approval==2){
                            approvalMsg = ($scope.selected.approval=='1'?'Approve':'Reject')
                            queryState = 'insert into inv_pr_doc_state set ?'
                            paramState = {
                                pr_id:$scope.pr.id,
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
                            approvalMsg = 'Process'
                            queryState = 'insert into inv_pr_doc_state set ?'
                            paramState = {
                                pr_id:$scope.pr.id,
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
                        if (queryState.length>0){
                            queryService.post(queryState,paramState)
                            .then(function (result){
								$('#form-input').modal('hide')
                                $scope.nested.dtInstance.reloadData(function(obj){
                                    // console.log(obj)
                                }, false)
                                $('body').pgNotification({
                                    style: 'flip',
                                    message: 'Success '+approvalMsg+' '+$scope.pr.code,
                                    position: 'top-right',
                                    timeout: 3000,
                                    type: 'success'
                                }).show();
                                //Generate PO
                                if ($scope.selected.doc_status.selected.id == 7 && $scope.selected.approval == 1){
                                    queryService.post('CALL `pr-po`('+$scope.pr.id+','+$localStorage.currentUser.name.id+')', undefined)
                                    .then(function (result){
                                        console.log(result)
                                    },
                                    function(err){
                                        console.log(err)
                                    })
                                }
                                $scope.clear();
                            },
                            function (err){
								$scope.disableAction = false;
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
							$scope.disableAction = false;
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
    $scope.addItemDetail = function(pr_id){
        var sqli = $scope.child.saveTable(pr_id);
        var defer = $q.defer();
        var paramItem = []
        var sqlCtr = []

        queryService.post(sqli.join(';'),undefined)
        .then(function (result2){
            defer.resolve(result2)
        },
        function (err2){
            defer.reject(err2)
        })
        return defer.promise;
    }

    $scope.addDetail = function(ids){
        /*queryService.post(qstring+' and a.id='+ids,undefined)
        .then(function (result){*/
			queryService.post(($scope.stat.pr=='pr'?qstringdetail:qstringdetailnon) + ' where a.pr_id='+ids,undefined)
            .then(function(data){
				console.log(data)
                $scope.items = []
                $scope.child.totalQty = 0
                $scope.child.tAmt = 0
                for (var i=0;i<data.data.length;i++){
					var p=''
					if(data.data[i].net_price!=null)
						p=data.data[i].net_price.toString()
                    $scope.items.push({
                        id: i+1,
                        p_id: data.data[i].p_id,
                        product_id:data.data[i].product_id,
                        product_code:data.data[i].product_code,
						cost_center_id:data.data[i].cost_center_id,
                        cost_center_name:data.data[i].cost_center_name,
						dept_desc:data.data[i].dept_desc,
                        product_name:data.data[i].product_name,
                        unit_name:data.data[i].unit_name,
						order_notes: data.data[i].order_notes,
                        qty: data.data[i].order_qty,
                        price: data.data[i].net_price,
						price_dis: p.replace(/\B(?=(?:\d{3})+(?!\d))/g, ","),
                        amount: data.data[i].order_amount,
                        supplier_id: data.data[i].supplier_id,
                        supplier_name: data.data[i].supplier_name
                    })
                    $scope.child.totalQty += data.data[i].order_qty
                    $scope.child.tAmt += data.data[i].order_amount
                }
                $scope.itemsOri = angular.copy($scope.items)
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
                DTColumnDefBuilder.newColumnDef(4).withOption('width', '10%'),
                DTColumnDefBuilder.newColumnDef(5).withOption('width', '35%'),
				DTColumnDefBuilder.newColumnDef(6).withOption('width', '10%'),
            ];
        //})
    }

    $scope.update = function(ids){
        $('#form-input').modal('show');
        $scope.pr.id = ids
        $scope.releaseState = true
        $scope.disableAction = false
		queryService.post(`select a.seq_id, a.name doc_status,
			   case b.approval_status
					when '1' then 'Approved'
		            when '2' then 'Rejected'
		            else 'None'
			   end approval_status,
		       case b.approval_status
					when '1' then b.approval_notes
		            when '2' then b.denial_notes
			   end notes,
			   c.name created_by, date_format(b.created_date,'%Y-%m-%d %H:%i:%s') created_date
		  from ref_pr_document_status a
		  left join inv_pr_doc_state b on a.id = b.doc_status_id and b.pr_id = `+ids+`
		  left join user c on c.id = b.created_by
		 where a.status = '1'
		 order by a.seq_id, b.created_date;`,undefined).then(function (result){
 			$scope.history=result.data;
 		});
        queryService.post(qstring+' and a.id='+ids,undefined)
        .then(function (result){
            if ($scope.seqState < parseInt(result.data[0].doc_status_id) && result.data[0].approval_status>0){
                $scope.disableAction = true;
            }
            else {
                $scope.disableAction = false;
            }
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
            if (result.data[0].doc_status_id == 7 && result.data[0].approval_status>0){
                $scope.releaseState = false
            }
            if ($scope.el.indexOf('approvalDeptHead')>-1 && (result.data[0].doc_status_id == 1 && result.data[0].approval_status == 1)){
                $scope.doc_status.push($scope.doc_status_def[1])
            }
            if ($scope.el.indexOf('approvalPoManager')>-1 && (result.data[0].doc_status_id == 2 && result.data[0].approval_status == 1)){
                $scope.doc_status.push($scope.doc_status_def[2])
            }
            if ($scope.el.indexOf('approvalCostControl')>-1 && (result.data[0].doc_status_id == 3 && result.data[0].approval_status == 1)){
                $scope.doc_status.push($scope.doc_status_def[3])
            }
            if ($scope.el.indexOf('approvalFinance')>-1 && (result.data[0].doc_status_id == 4 && result.data[0].approval_status == 1)){
                $scope.doc_status.push($scope.doc_status_def[4])
            }
            if ($scope.el.indexOf('approvalGm')>-1 && (result.data[0].doc_status_id == 5 && result.data[0].approval_status == 1)){
                $scope.doc_status.push($scope.doc_status_def[5])
            }
            if ($scope.el.indexOf('prReleased')>-1 && (result.data[0].doc_status_id == 6 && result.data[0].approval_status == 1)){
                $scope.doc_status.push($scope.doc_status_def[6])
            }
            if ($scope.el.indexOf('buttonCreate')>-1 && (result.data[0].doc_status_id == 0 && result.data[0].approval_status == 1)){
                $scope.doc_status.push($scope.doc_status_def[0])
            }
            if ((result.data[0].approval_status==0||result.data[0].approval_status==2) && result.data[0].doc_status_id==1){
                $scope.statusState=true
                $scope.selected.approval = 0
                $scope.approveState = false
                $scope.rejectState = true
            }
            else if (result.data[0].approval_status==0 && result.data[0].doc_status_id>1){
                $scope.statusState=true
            }
            else {
                $scope.selected.approval = 0
                $scope.approveState = true
                $scope.rejectState = true

            }
			if(result.data[0].approval_status==0){
				$scope.approveState = false
				$scope.rejectState = false
			}

            if ((result.data[0].doc_status_id==1) && $scope.el.indexOf('buttonCreate')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==2&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==1 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalDeptHead')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==3&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==2 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalPoManager')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==4&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==3 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalCostControl')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==5&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==4 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalFinance')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==6&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==5 && result.data[0].approval_status==1)) && $scope.el.indexOf('approvalGm')>-1) $scope.viewMode = false
            else if (((result.data[0].doc_status_id==7&&result.data[0].approval_status!=1) || (result.data[0].doc_status_id==6 && result.data[0].approval_status==1)) && $scope.el.indexOf('prReleased')>-1) $scope.viewMode = false
            else $scope.viewMode = true

			if ($scope.pr.purchase_type == 'NDI') {
				$scope.stat.pr = 'pr'
				$scope.direct='non'
			}else if ($scope.pr.purchase_type == 'NDN'){
				$scope.stat.pr = 'non'
				$scope.direct='non'
			}else if($scope.pr.purchase_type == 'DI'){
				$scope.stat.pr = 'pr'
				$scope.direct='direct'
			}else{
				$scope.stat.pr = 'non'
				$scope.direct='direct'
			}
            $scope.addDetail(ids)
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
        $scope.pr.id = ids;
        var qstring = 'select * from inv_purchase_request where id='+ids
        queryService.post(qstring,undefined)
        .then(function (result){
            $scope.pr = result.data[0]
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
            doc_status_id: 8,
            approval_status: 0
        },$scope.pr.id]
		queryService.post('update inv_purchase_request set ? where id=?',param)
        .then(function (result){
            var paramState = {
                pr_id:$scope.pr.id,
                doc_status_id:8,
                created_by:$localStorage.currentUser.name.id,
                created_date:globalFunction.currentDate(),
                approval_status:0,
                approval_notes: '',
                denial_notes: ''
            }
            queryService.post('insert into inv_pr_doc_state set ?',paramState)
            .then(function (result){
                    $('#modalDelete').modal('hide')
                    $scope.nested.dtInstance.reloadData(function(obj){
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Cancel PR '+$scope.pr.code,
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
                    message: 'Error Cancel PR: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
                $scope.clear();
            })
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
        $scope.pr = {
            id: '',
            code: '',
            purchase_notes: '',
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
		$scope.disableAction = false;
        $scope.updateState = false
		$scope.stat = {pr:'pr'}
		$scope.direct='non';
    }

	$scope.change = function(flag){
		if(flag=='d'){
			//queryService.post('select cast(concat(\'PR/\',date_format(date(now()),\'%Y/%m/%d\'), \'/\', lpad(seq(\'PR\',\''+ym+'\'),4,\'0\')) as char) as code ',undefined)
			$scope.selected.warehouse.selected={}
			$scope.selected.cost_center.selected={}
	        //queryService.post('select curr_document_no(\'DP\',\''+$scope.ym+'\') as code',undefined)
			queryService.post('select curr_item_code("INV",concat("DP",date_format(curdate(),"%y"))) as code',undefined)
	        .then(function(data){
	            $scope.pr.code = data.data[0].code
	        })
		}else{
			//queryService.post('select curr_document_no(\'PR\',\''+$scope.ym+'\') as code',undefined)
			queryService.post('select curr_item_code("INV",concat("PR",date_format(curdate(),"%y"))) as code',undefined)
			.then(function(data){
				$scope.pr.code = data.data[0].code
			})
		}
	}
})
.controller('EditableTableCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    $scope.item = {
        product_id:'',
        product_name:'',
		order_notes: '',
        qty: '',
        price: '',
		price_dis: '',
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
            product_id:'',
            product_code: '',
            product_name:'',
            unit_name: '',
			order_notes: '',
            qty: 0,
            price: 0,
			price_dis: 0,
            amount: 0,
            supplier_id: '',
            supplier_name: '',
            old_price: 0,
            new_price: 0,
            isNew: true
        };
        $scope.items.push($scope.item)
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
        var sqlitem = [];
		for (var i =0;i< $scope.items.length; i++) {
            var user = $scope.items[i];
            //results.push($http.post('/saveUser', user));
			if (user.isNew && !user.isDeleted){
                if (user.product_id.toString().length>0 && user.qty>0){
                    sqlitem.push('insert into inv_pr_line_item (pr_id,cost_center_id,product_id,'+(user.supplier_id.toString().length>0?'supplier_id,':'')+'order_qty,net_price,order_amount,created_by,created_date,order_notes) values('+
                    pr_id+','+(user.cost_center_id==undefined?null:user.cost_center_id)+','+user.product_id+','+(user.supplier_id.toString().length>0?user.supplier_id+',':'')+''+user.qty+','+(user.price==null?0:user.price)+','+user.amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',"'+user.order_notes+'")')
                }
                else if(user.product_name.length>0 && user.qty>0){
                    sqlitem.push('insert into inv_pr_line_item (pr_id,cost_center_id,product_id,product_name,product_unit,'+(user.supplier_id.toString().length>0?'supplier_id,':'')+'order_qty,net_price,order_amount,created_by,created_date,order_notes) values('+
                    pr_id+','+(user.cost_center_id==undefined?null:user.cost_center_id)+',0,\''+user.product_name+'\',\''+user.unit_name+'\','+(user.supplier_id.toString().length>0?user.supplier_id+',':'')+''+user.qty+','+(user.price==null?0:user.price)+','+user.amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',"'+user.order_notes+'")')
                }
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from inv_pr_line_item where id='+user.p_id)
            }
            else if(!user.isNew){
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri[j].p_id+$scope.itemsOri[j].product_id+$scope.itemsOri[j].supplier_id+$scope.itemsOri[j].qty+$scope.itemsOri[j].price+$scope.itemsOri[j].order_notes+$scope.itemsOri[j].unit_name
                        var d2 = user.p_id+user.product_id+user.supplier_id+user.qty+user.price+user.order_notes+user.unit_name
                        if(d1 != d2){
                            sqlitem.push('update inv_pr_line_item set '+
                            ' product_id = '+user.product_id+',' +
							' cost_center_id = '+(user.cost_center_id==undefined?null:user.cost_center_id)+',' +
                            ' product_name = \''+user.product_name+'\',' +
                            ' product_unit = \''+user.unit_name+'\',' +
                            ' supplier_id = '+user.supplier_id+',' +
                            ' order_qty = '+user.qty+',' +
                            ' net_price = '+(user.price==null?0:user.price)+',' +
							' order_notes = "'+user.order_notes+'",' +
                            ' order_amount = '+user.amount+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
                        }
                    }
                }
            }
        }
		console.log(JSON.stringify(sqlitem))
        return sqlitem
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.products = []

    queryService.post('select a.id,a.code as product_code, a.name, e.name unit_name, '+
        'b.name as category, c.name as subcategory, a.price_per_unit as on_hand_cost, '+
        'a.last_order_price, a.last_order_date, d.name as last_supplier_name, '+
        'a.last_received_price, a.last_received_date, '+
        'concat(\'Cat: \',b.name,\', Sub: \',c.name) cat_text, '+
        'cast(concat(\'On Hand Cost: \',a.price_per_unit) as char) cost_text, '+
        'cast(concat(\'Last order price: \',ifnull(a.last_order_price,\'-\'),\', rcv price: \',ifnull(a.last_received_price,\'-\')) as char) lastp_text, '+
        'cast(concat(\'Last order date: \',ifnull(date_format(last_order_date,\'%Y-%m-%d\'),\'-\'),\', rcv date: \',ifnull(date_format(last_received_date,\'%Y-%m-%d\'),\'-\')) as char) lastd_text, '+
        'cast(concat(\'Last order supplier: \',d.name) as char) lasts_text '+
        'from mst_product a '+
        'left join ref_product_category b on b.id = a.category_id '+
        'left join ref_product_subcategory c on c.id = a.subcategory_id '+
        'left join mst_supplier d on d.id = a.last_supplier '+
        'left join ref_product_unit e on a.unit_type_id = e.id '+
        'where a.is_pr = \'Y\' '+
        'and a.status = \'1\' '+
        'order by id limit 50 ',undefined)
    .then(function(data){
        $scope.products = data.data
    })
    $scope.productUp = function(text) {
        queryService.post('select a.id,a.code as product_code, a.name, e.name unit_name,'+
            'b.name as category, c.name as subcategory, a.price_per_unit as on_hand_cost, '+
            'a.last_order_price, a.last_order_date, d.name as last_supplier_name, '+
            'a.last_received_price, a.last_received_date, '+
            'concat(\'Cat: \',b.name,\', Sub: \',c.name) cat_text, '+
            'cast(concat(\'On Hand Cost: \',a.price_per_unit) as char) cost_text, '+
            'cast(concat(\'Last order price: \',ifnull(a.last_order_price,\'-\'),\', rcv price: \',ifnull(a.last_received_price,\'-\')) as char) lastp_text, '+
            'cast(concat(\'Last order date: \',ifnull(date_format(last_order_date,\'%Y-%m-%d\'),\'-\'),\', rcv date: \',ifnull(date_format(last_received_date,\'%Y-%m-%d\'),\'-\')) as char) lastd_text, '+
            'cast(concat(\'Last order supplier: \',d.name) as char) lasts_text '+
            'from mst_product a '+
            'left join ref_product_category b on b.id = a.category_id '+
            'left join ref_product_subcategory c on c.id = a.subcategory_id '+
            'left join mst_supplier d on d.id = a.last_supplier '+
            'left join ref_product_unit e on a.unit_type_id = e.id '+
            'where a.is_pr = \'Y\' '+
            'and a.status = \'1\' '+
            'and lower(a.name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
        .then(function(data){
            $scope.products = data.data
        })
    }
	$scope.cost_centers = [];
	queryService.post('select a.id, a.code,upper(a.name) as name,a.status,b.name as department_name, concat(\'Department: \',b.name)  dept_desc '+
		'from mst_cost_center a, mst_department b '+
		'where a.department_id = b.id and a.status=1 '+
		'order by a.code asc',undefined)
	.then(function(data){
		$scope.cost_centers = data.data
	})
    $scope.getProductPrice = function(e,d){
        $scope.items[d-1].product_id = e.id
        $scope.items[d-1].product_code = e.product_code
        $scope.items[d-1].unit_name = e.unit_name
        $scope.items[d-1].product_name = e.name
        $scope.items[d-1].price = e.last_order_price
        $scope.items[d-1].amount = e.last_order_price * $scope.items[d-1].qty
        var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(concat(b.price,\' (valid until:\',date_format(contract_end_date,\'%Y-%m-%d\'),\')\' ),\' - \')) as char)as price_name,'+
            'b.contract_end_date,cast(concat(\'Type: \',c.name) as char) type_name  '+
            'from mst_supplier a '+
            'left join (select * from inv_prod_price_contract where contract_end_date>curdate() and product_id='+e.id+') b '+
            'on a.id = b.supplier_id  '+
            'left join ref_supplier_type c on a.supplier_type_id=c.id '+
            'and a.status=1  '+
            //'and b.product_id ='+e.id+' '+
            'order by price desc limit 50'
        queryService.post(sqlCtr,undefined)
        .then(function(data){
            $scope.suppliers[d-1] = data.data
        })
    }
    $scope.funcAsync = function(e,d){
        var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(concat(b.price,\' (valid until:\',date_format(contract_end_date,\'%Y-%m-%d\'),\')\' ),\' - \')) as char)as price_name,'+
            'b.contract_end_date,cast(concat(\'Type: \',c.name) as char) type_name  '+
            'from mst_supplier a '+
            'left join (select * from inv_prod_price_contract where contract_end_date>curdate() and product_id ='+$scope.items[d-1].product_id + ' ) b '+
            'on a.id = b.supplier_id  '+
            'left join ref_supplier_type c on a.supplier_type_id=c.id '+
            'where a.status=1  '+
            //'and b.product_id ='+$scope.items[d-1].product_id + ' '+
            'and lower(a.name) like \''+e.toLowerCase()+'%\'' +
            ' order by price desc limit 50'
        queryService.post(sqlCtr,undefined)
        .then(function(data){
            $scope.suppliers[d-1] = data.data
        })
    }
    $scope.getProductPriceSupplier = function(e,d){
        $scope.items[d-1].supplier_id = e.id
        $scope.items[d-1].supplier_name = e.name
        $scope.items[d-1].price = (e.price==null?0:e.price)
        $scope.items[d-1].amount = e.price * $scope.items[d-1].qty
    }
    $scope.updatePrice = function(e,d,p){
		$scope.items[d-1].price = p
        $scope.items[d-1].amount = p * $scope.items[d-1].qty
        $scope.totalPrice = 0
        $scope.child.tAmt = 0
        for (var i=0;i<$scope.items.length;i++){
            $scope.totalPrice += parseFloat($scope.items[i].price)
            $scope.child.tAmt += parseFloat($scope.items[i].amount)
        }
        if ($scope.child.tAmt.toString()=='NaN') $scope.child.tAmt = 0
        if ($scope.child.totalQty.toString()=='NaN') $scope.child.totalQty = 0

    }
    $scope.updateProductName = function(e,d,p){
		$scope.items[d-1].product_name = p
    }
    $scope.updateUnit = function(e,d,p){
		$scope.items[d-1].unit_name = p
    }
    $scope.updatePriceQty = function(e,d,q){
        $scope.items[d-1].qty = q
        $scope.items[d-1].amount = q * $scope.items[d-1].price
        $scope.child.totalQty = 0
        $scope.child.tAmt = 0
        for (var i=0;i<$scope.items.length;i++){
            $scope.child.totalQty += parseFloat($scope.items[i].qty)
            $scope.child.tAmt += parseFloat($scope.items[i].amount)
        }
        if ($scope.child.tAmt.toString()=='NaN') $scope.child.tAmt = 0
        if ($scope.child.totalQty.toString()=='NaN') $scope.child.totalQty = 0

    }
    function numberSep(val){
        return parseFloat(val.length==0?0:val).toLocaleString()
    }
    function numberDesep(val){

        return parseFloat(val.replace(/[, ]+/g, " ").trim())
    }
	$scope.updateNotes = function(e,d,p){
		$scope.items[d-1].order_notes = p
	}
	$scope.getCostCenter = function(e,d){
        $scope.items[d-1].cost_center_id = e.id
        $scope.items[d-1].cost_center_name = e.name
    }
});
