
var userController = angular.module('app', []);
userController
.controller('FinApDepositCtrl',
function($scope, $state, $stateParams,$sce, $templateCache,productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
	var date = new Date();
	date.setDate(date.getDate());

	/*$('#openDate').datepicker({
	    startDate: date
	});*/
    $scope.users = []
    $scope.items = []
    $scope.itemsOri = []
    $scope.trans = []
    $scope.transOri = []
    $scope.child = {}
    $scope.voucher = {}
    $scope.sums1 = 0
    $scope.sums2 = 0
    $scope.sums3 = 0
    $scope.sums4 = 0
    $scope.totalv = {due:0,payment:0,paid:0};
    $scope.total = {debit:0,credit:0,balance:0}
	$scope.disableAction = false;
    var qstring = 'select a.id,a.code, a.home_currency_exchange,a.check_no, '+
                'DATE_FORMAT(a.open_date,\'%Y-%m-%d\') as open_date, a.status, b.name as \'status_name\', '+
               'a.notes, a.bank_account_id, c.name as \'bank_account\', d.name as \'bank\', '+
               'a.supplier_id, e.name as \'supplier_name\', a.used_currency_id, f.name as \'currency\', '+
               'a.home_deposit_amount, a.home_applied_amount, a.home_balance_amount,  '+
               'a.tot_deposit_amount, a.tot_applied_amount, a.tot_balance_amount, '+
               'format(a.home_deposit_amount,0)hda, format(a.home_applied_amount,0)haa, format(a.home_balance_amount,0)hba,  '+
               'format(a.tot_deposit_amount,0)tda, format(a.tot_applied_amount,0)taa, format(a.tot_balance_amount,0)tba, '+
               'd.id bank_id,d.name bank_name,if(a.used_currency_id=1,\'-\',format(home_deposit_amount,0))hda2, '+
               'DATE_FORMAT(a.issued_date,\'%Y-%m-%d\')issued_date,g.name issued_by_name,DATE_FORMAT(a.created_date,\'%Y-%m-%d\')created_date,h.name created_by_name, '+
               'i.id gl_account_id, i.name gl_account_name, i.code gl_account_code, '+
               'k.id supplier_account_id, k.name supplier_account_name, k.code supplier_account_code '+
          'from acc_cash_deposit a '+
          'left join (select value, name from table_ref  '+
                     'where table_name = \'acc_cash_deposit\'  '+
                       'and column_name = \'status\') b on a.status = b.value '+
          'left join mst_cash_bank_account c on a.bank_account_id = c.id '+
          'left join mst_cash_bank d on c.bank_id = d.id '+
          'left join mst_supplier e on a.supplier_id = e.id '+
          'left join ref_currency f on a.used_currency_id = f.id  '+
          'left join user g on a.issued_by=g.id '+
          'left join user h on a.created_by=h.id '+
          'left join mst_ledger_account i on c.gl_account_id = i.id '+
          'left join ref_supplier_type j on e.supplier_type_id = j.id '+
          'left join mst_ledger_account k on j.deposit_account_id = k.id '
        //'where a.status in (:status1,:status2,:status3)  '+
        //'and a.open_date beetween :date1 and :date2  '+
        //'and a.due_date between :date1and :date2'
    var qwhere = ''
    var qstringt = 'select b.id,a.code,date_format(a.open_date,\'%Y-%m-%d\') open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,a.status,a.source,a.home_total_amount,b.applied_amount,a.current_due_amount '+
              'from acc_ap_voucher a '+
              'inner join acc_deposit_line_item b on a.id = b.voucher_id '
              //'where b.deposit_id=?'

    var year = ['2015','2016','2017','2018','2019']
    var month = ['01','02','03','04','05','06','07','08','09','10','11','12']
    $scope.period = [
        { id: 0, name: 'Current Month'},
        { id: 1, name: 'Last Month'}
    ]
    if ($stateParams.currentPeriod!=null){
        qwhere = ' where a.open_date between \''+$stateParams.currentPeriod+' 00:00:00\' and \''+$stateParams.currentPeriod+' 23:59:59\' '
    }

    /*for (var i=0;i<year.length;i++){
        for (var j=0;j<month.length;j++){
            $scope.period.push({id:year[i]+month[j],name:year[i]+'-'+month[j]})
        }
    }*/

    $scope.role = {
        selected: []
    };

    $scope.cats = {}
    $scope.id = '';
    $scope.ap = {
        id: '',
        code: ''
    }

    $scope.selected = {
        status: {},
        startperiod: {},
        endperiod : {},
        period: {},
        supplier: {},
        currency: {},
        bank: {},
        bank_account: {},
        filter_status: [],
        filter_due_date: '',
        filter_month: {},
        filter_year: {},
        filter_supplier: {},
    }
    $scope.selected.period = $scope.period[0]
    $scope.status = [
        {id: 0, name: 'Open'},
        {id: 1, name: 'Prepare'},
        {id: 2, name: 'Close'}
    ]

    $scope.status = []
    $scope.statusShow = []
    queryService.get('select value id, value, name from table_ref where table_name = \'acc_cash_deposit\' and column_name = \'status\' order by id ',undefined)
    .then(function(data){
        $scope.status = data.data
    })
    /*$scope.status = [
        {id:0,name:'Open'},
        {id:1,name:'Prepare'},
        {id:2,name:'Close'}
    ]*/
    /*queryService.get('select value id,name from table_ref where table_name = \'acc_ap_voucher\' and column_name = \'status\' order by name asc',undefined)
    .then(function(data){
        $scope.status = data.data
    })*/

    $scope.setStatus = function(){
        console.log('setStatus0',$scope.selected.status.selected,$scope.items)
        if ($scope.selected.status.selected.id==3){

            if ($scope.items.length==0){
                if ($scope.selected.supplier.selected){
                    console.log('setStatus',$scope.selected.supplier.selected)
                    $scope.items.push(
                        {
                            id:1,
                            account_id:$scope.selected.supplier.selected.supplier_account_id,
                            account_code:$scope.selected.supplier.selected.supplier_account_code,
                            account_name: $scope.selected.supplier.selected.supplier_account_name,
                            notes: $scope.ap.notes,
                            debit: $scope.totalv.payment,
                            credit: 0,
                            debit_f: $scope.totalv.payment,
                            credit_f: 0,
                            balance: 0,
                            isNew: true
                        }
                    )
                }
                console.log('setStatus2',$scope.selected.bank_account.selected)
                $scope.items.push(
                    {
                        id:2,
                        //account_id:$scope.selected.bank_account.selected.ap_clearance_account_id,
                        //account_code:$scope.selected.bank_account.selected.ap_clearance_account_code,
                        //account_name: $scope.selected.bank_account.selected.ap_clearance_account_name,
                        account_id:$scope.selected.bank_account.selected.gl_account_id,
                        account_code:$scope.selected.bank_account.selected.gl_account_code,
                        account_name: $scope.selected.bank_account.selected.gl_account_name,
                        notes: $scope.ap.notes,
                        debit: 0,
                        credit: $scope.totalv.payment,
                        debit_f: 0,
                        credit_f: $scope.totalv.payment,
                        balance: 0,
                        isNew: true
                    }
                )
                $scope.total = {debit:0,credit:0,balance:0}
                for (var i=0;i<$scope.items.length;i++){
                    $scope.total.debit += $scope.items[i].debit;
                    $scope.total.credit += $scope.items[i].credit;
                }

            }


        }

    }


    $scope.bank = []
    queryService.get('select id,code,name from mst_cash_bank where status = \'1\' order by name ',undefined)
    .then(function(data){
        $scope.bank = data.data
    })
    $scope.bank_account = []
    $scope.setBankAccount = function(e){
        queryService.get('select id,code,name from mst_cash_bank_account where bank_id='+e.id+'  order by name ',undefined)
        .then(function(data){
            $scope.bank_account = data.data
        })
    }


    /*$scope.source = [
        {id:0,code:'R',name:'Receiving'},
        {id:1,code:'O',name:'Other Source'}
    ]*/
    /*queryService.get('select value id,name from table_ref where table_name = \'acc_ap_voucher\' and column_name = \'source\' order by name asc',undefined)
    .then(function(data){
        $scope.source = data.data
    })*/
    $scope.currency = []
    queryService.get('select  id currency_id,code currency_code,name currency_name from ref_currency order by id asc',undefined)
    .then(function(data){
        $scope.currency = data.data
    })

    $scope.tax = []
    queryService.get('select  id ,code ,name ,account_id from mst_taxes where status=\'1\' order by id asc',undefined)
    .then(function(data){
        $scope.tax = data.data
    })




    $scope.filterVal = {
        search: ''
    }

    $scope.isReceiving = true
    $scope.supplier = []
    queryService.post("select a.id supplier_id,a.name supplier_name,c.id supplier_account_id,c.code supplier_account_code,c.name supplier_account_name, "+
        "a.address supplier_address, a.bank1_name supplier_bank, a.bank1_account_no supplier_bank_acc_no, a.bank1_address supplier_bank_address "+
        "from mst_supplier a, ref_supplier_type b, mst_ledger_account c "+
        "where a.supplier_type_id = b.id "+
        "and b.deposit_account_id = c.id "+
        "and a.status='1' order by a.name limit 50",undefined)
    .then(function(data){
        $scope.supplier = data.data
    })
    $scope.findSupplier = function(text){
        queryService.post("select a.id supplier_id,a.name supplier_name,c.id supplier_account_id,c.code supplier_account_code,c.name supplier_account_name, "+
            "a.address supplier_address, a.bank1_name supplier_bank, a.bank1_account_no supplier_bank_acc_no, a.bank1_address supplier_bank_address "+
            "from mst_supplier a, ref_supplier_type b, mst_ledger_account c "+
            "where a.supplier_type_id = b.id "+
            "and b.deposit_account_id = c.id "+
            "and a.status='1' and lower(a.name) like '%"+text.toLowerCase()+"%' order by a.name asc limit 50",undefined)
        .then(function(data){
            $scope.supplier = data.data
        })
    }
    $scope.source_no = []
    $scope.setSource = function(e){
        $scope.ap.source=$scope.selected.source.selected.id
        if (e.value == 'RR') {
            $scope.isReceiving = false
            queryService.post('select id,code,cast(concat(\'Amount: \',ifnull(total_amount,\' - \')) as char) total_amount from inv_po_receive order by id desc limit 50',undefined)
            .then(function(data){
                $scope.source_no = data.data
                //$scope.isReceiving = false
            })
        }
        else $scope.isReceiving = true
    }

    $scope.showAdvance = false
    $scope.openAdvancedFilter = function(val){
        $scope.showAdvance = val
    }

    $scope.setReceiving = function(e){
        $scope.ap.source_no=$scope.selected.source_no.selected.id
        queryService.post('select a.id,a.po_id,c.name,DATE_FORMAT(a.created_date, \'%Y-%m-%d\') created_date,a.currency_id,d.due_days,d.supplier_id,e.name supplier_name,f.code currency_name,a.total_amount,a.home_currency_exchange exchange, '+
            ' DATE_ADD(a.created_date, INTERVAL d.due_days DAY) due_date '+
            'from inv_po_receive a,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f '+
            'where c.table_name=\'inv_po_receive\' '+
            'and a.received_status=c.value '+
            'and a.po_id=d.id '+
            'and d.supplier_id=e.id '+
            'and a.currency_id=f.id '+
            'and a.id=' + e.id +
            ' order by a.id desc',undefined)
        .then(function(data){
            $scope.supplier = data.data
            $scope.selected.supplier['selected'] = $scope.supplier[0]
            $scope.selected.currency['selected'] = $scope.supplier[0]
            $scope.ap.exchange = data.data[0].exchange
            $scope.ap.total_idr = data.data[0].total_amount*data.data[0].exchange
            $scope.ap.total_home = $scope.ap.total_idr
            $scope.ap.open_date = data.data[0].created_date
            $scope.ap.due_date = data.data[0].due_date
        })
    }

    $scope.findReceiving = function(text){
        queryService.get('select id,code,cast(concat(\'Amount: \',ifnull(total_amount,\' - \')) as char) total_amount from inv_po_receive where lower(code) like \'%'+text.toLowerCase()+'%\' order by id desc limit 50',undefined)
        .then(function(data){
            $scope.currency = data.data
        })

    }
    $scope.setSupplier = function(e){
        $scope.ap.supplier_id=$scope.selected.supplier.selected.supplier_id
        if ($scope.trans.length>0){
            queryService.post('select a.id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name '+
                'from acc_ap_voucher a,(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
                	'and column_name = \'status\')b '+
                'where a.status=b.value '+
                'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
                'and a.status in(0,1) '+
                'order by id limit 20 ',undefined)
            .then(function(data){
                for(var i=0;i<($scope.trans.length);i++){
                    $scope.voucher[$scope.trans[i].id] = data.data
                }
            })
        }
    }


    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.focusinControl = {};
    $scope.fileName = "AP Deposit";
    $scope.exportExcel = function(){
        queryService.post('select id,code,open_date,status_name,supplier_name,bank_name,bank_account,currency,issued_date,issued_by_name,created_date,created_by_name,tda,hda2,taa,tba from('+qstring + qwhere+')aa order by id desc',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["ID","Code", "Open Date", 'Status','Supplier', 'Bank','Bank Account','Currency','Issued Date','Issued By','Created Date','Created By','Total(IDR)','Total(Foreign Exchange)','Applied','Balance']);
            //Data
            for(var i=0;i<data.data.length;i++){
                var arr = []
                for (var key in data.data[i]){
                    arr.push(data.data[i][key])
                }
                $scope.exportData.push(arr)
            }
            $scope.focusinControl.downloadExcel()
        })
    }

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.cats[data] = {id:data,code:full.code};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(cats[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                if (full.status_name=='Open'){
                    html+='<button class="btn btn-default" title="Delete" ng-click="delete(cats[\'' + data + '\'])" )"="">' +
                    '   <i class="fa fa-trash-o"></i>' +
                    '</button>';
                }

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
    .withOption('scrollX',true)
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', $scope.createdRow)
    .withOption('footerCallback', function (tfoot, data) {

        if (data.length > 0) {
			$scope.data=data
			console.log(data)
            // Need to call $apply in order to call the next digest
            $scope.$apply(function () {
                //$scope.sums = 100;
                var footer = $templateCache.get('tableFooter'),
                        $tfoot = angular.element(tfoot),
                        content = $compile(footer)($scope);
                //$tfoot.find('tr').html(content);
                $tfoot.html(content)
            });
        }
    });
    queryService.post('select sum(tot_deposit_amount)as sm,sum(home_deposit_amount)as sm2,sum(tot_applied_amount) as sm3,sum(tot_balance_amount) as sm4 from ('+qstring+qwhere+')a',undefined)
    .then(function(data){
        $scope.sums1 = data.data[0].sm;
        $scope.sums2 = data.data[0].sm2;
        $scope.sums3 = data.data[0].sm3;
        $scope.sums4 = data.data[0].sm4;


    });

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('Transc No').withOption('width', '5%'),
        DTColumnBuilder.newColumn('code').withTitle('Doc No').withOption('width', '7%'),
        DTColumnBuilder.newColumn('open_date').withTitle('Open Date').withOption('width', '5%'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '4%'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier').withOption('width', '15%'),
        //DTColumnBuilder.newColumn('age').withTitle('Age'),
        DTColumnBuilder.newColumn('bank_name').withTitle('Bank').withOption('width', '5%'),
        DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account').withOption('width', '10%'),
        DTColumnBuilder.newColumn('currency').withTitle('Currency').withOption('width', '5%'),
        DTColumnBuilder.newColumn('issued_date').withTitle('Issued Date').withOption('width', '5%'),
        DTColumnBuilder.newColumn('issued_by_name').withTitle('Issued By').withOption('width', '5%'),
        DTColumnBuilder.newColumn('created_date').withTitle('Created Date').withOption('width', '5%'),
        DTColumnBuilder.newColumn('created_by_name').withTitle('Created By').withOption('width', '5%'),
        //DTColumnBuilder.newColumn('tot_deposit_amount').withTitle('Total(IDR)'),
        //DTColumnBuilder.newColumn('home_deposit_amount').withTitle('Total Amount'),
        //DTColumnBuilder.newColumn('tot_applied_amount').withTitle('Applied'),
        //DTColumnBuilder.newColumn('tot_balance_amount').withTitle('Balance')
        DTColumnBuilder.newColumn('tda').withTitle('Total Amount(IDR)').withOption('width', '6%').withClass('text-right'),
        DTColumnBuilder.newColumn('hda2').withTitle('Total Amount').withOption('width', '5%').withClass('text-right'),
        DTColumnBuilder.newColumn('taa').withTitle('Applied').withOption('width', '4%').withClass('text-right'),
        DTColumnBuilder.newColumn('tba').withTitle('Balance').withOption('width', '5%').withClass('text-right')
    );

    var qwhereobj = {
        text: '',
        status: '',
        due_date: '',
        period: '',
        supplier: ''
    }
    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhereobj.text = ' lower(a.code) like \'%'+$scope.filterVal.search+'%\' '
                else qwhereobj.text = ''
                qwhere = setWhere()

                //if ($scope.filterVal.search.length>0) qwhere = ' and lower(a.name) like "%'+$scope.filterVal.search.toLowerCase()+'%"'
                //else qwhere = ''
                $scope.dtInstance.reloadData(function(obj){

                }, false)
            }
        }
        else {
            $scope.dtInstance.reloadData(function(obj){

            }, false)
        }
    }

    $scope.applyFilter = function(){

        //console.log($scope.selected.filter_cost_center)
        if($scope.selected.filter_status.length>0){
            var ids = []
            for (var i=0;i<$scope.selected.filter_status.length;i++){
                ids.push($scope.selected.filter_status[i].id)
            }
            qwhereobj.status= ' a.status in ('+ids.join(',')+') '
        }
        if ($scope.selected.filter_month.selected && $scope.selected.filter_year.selected){
            qwhereobj.period = ' (a.open_date between \''+$scope.selected.filter_year.selected.id+'-'+$scope.selected.filter_month.selected.id+'-01\' and '+
            ' \''+$scope.selected.filter_year.selected.id+'-'+$scope.selected.filter_month.selected.id+'-'+$scope.selected.filter_month.selected.last+'\') '
        }
        if ($scope.selected.filter_due_date.length>0){
            var s= $scope.selected.filter_due_date.split(' - ')[0],d=$scope.selected.filter_due_date.split(' - ')[0];
            qwhereobj.due_date = ' a.open_date between \''+s+' 00:00:00\' and \''+d+' 23:59:59\' '
        }
        if ($scope.selected.filter_supplier.selected){
            qwhereobj.supplier = ' a.supplier_id= '+$scope.selected.filter_supplier.selected.supplier_id+' '
        }

        qwhere = setWhere()
        $scope.dtInstance.reloadData(function(obj){

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
        return strWhere
    }

    /*END AD ServerSide*/

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $scope.items = []
        $scope.itemsOri = []
        $scope.trans = []
        $scope.transOri = []

        $scope.statusShow.push($scope.status[0])
        $scope.selected.status['selected'] = $scope.status[0]
        $('#form-input').modal('show')
        //var dt = new Date()
        //var ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
        //queryService.post('select cast(concat(\'AP/DP/\',date_format(date(now()),\'%Y/%m/%d\'), \'/\', lpad(seq(\'APDP\',\''+ym+'\'),4,\'0\')) as char) as code ',undefined)
		//queryService.post('select curr_document_no(\'AP/DP\',\''+$scope.ym+'\') as code',undefined)
		queryService.post('select curr_item_code("AP",concat("AP/DP",date_format(curdate(),"%y"))) as code',undefined)
		.then(function(data){
            $scope.ap.code = data.data[0].code
        })
    }
    $scope.setIdr = function(a,b){
        $scope.ap[b] = parseInt($scope.ap[a]*$scope.ap.exchange)
        $scope.ap.balance_home = $scope.ap.deposit_home-$scope.ap.applied_home
        $scope.ap.balance_idr = $scope.ap.deposit_idr-$scope.ap.applied_idr
    }

    $scope.submit = function(){
		$scope.disableAction = true;
        if ($scope.ap.id.length==0){
            //exec creation
            var applied_amount = 0
            var applied_amount_home = 0
			//queryService.post('select next_document_no(\'AP/DP\',\''+$scope.ym+'\')',undefined)
			queryService.post('select next_item_code("AP",concat("AP/DP",date_format(curdate(),"%y"))) as code',undefined)
			.then(function(data){
				$scope.ap.code = data.data[0].code
			})
            var param = {
                code: $scope.ap.code,
            	check_no: $scope.ap.check,
            	bank_account_id: $scope.selected.bank_account.selected.id,
            	status: $scope.selected.status.selected.id,
            	open_date: $scope.ap.open_date,
            	supplier_id: $scope.selected.supplier.selected.supplier_id,
            	notes: $scope.ap.notes,
            	used_currency_id: $scope.selected.currency.selected.currency_id,
            	home_currency_exchange: $scope.ap.exchange,
            	tot_deposit_amount: $scope.ap.deposit_idr,
            	home_deposit_amount: $scope.ap.deposit_home,
            	tot_applied_amount: $scope.ap.applied_home,
            	home_applied_amount: $scope.ap.applied_idr,
            	tot_balance_amount: $scope.ap.balance_idr,
            	home_balance_amount: $scope.ap.balance_home,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
            }

            queryService.post('insert into acc_cash_deposit SET ?',param)
            .then(function (result){
                var qstr = $scope.child.saveTableT(result.data.insertId)
                queryService.post(qstr.join(';'),undefined)
                .then(function (result2){
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){}, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert '+$scope.ap.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                        $scope.clear();
						$scope.disableAction = false;
                },
                function (err2){
					$scope.disableAction = false;
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
            //exec update
            var param = {
                code: $scope.ap.code,
            	check_no: $scope.ap.check,
            	bank_account_id: $scope.selected.bank_account.selected.id,
            	status: $scope.selected.status.selected.id,
            	open_date: $scope.ap.open_date,
            	supplier_id: $scope.selected.supplier.selected.supplier_id,
            	notes: $scope.ap.notes,
            	used_currency_id: $scope.selected.currency.selected.currency_id,
            	home_currency_exchange: $scope.ap.exchange,
            	tot_deposit_amount: $scope.ap.deposit_idr,
            	home_deposit_amount: $scope.ap.deposit_home,
            	tot_applied_amount: $scope.ap.applied_home,
            	home_applied_amount: $scope.ap.applied_idr,
            	tot_balance_amount: $scope.ap.balance_idr,
            	home_balance_amount: $scope.ap.balance_home,
                modified_by: $localStorage.currentUser.name.id,
                modified_date: globalFunction.currentDate()
            }

            queryService.post('update acc_cash_deposit SET ? WHERE id='+$scope.ap.id ,param)
            .then(function (result){
                /*if ($scope.selected.status.selected.id=='1'){
                    var qq = 'insert into acc_gl_transaction(bookkeeping_date,code,deposit_id,gl_status,journal_type_id,notes) '+
                     'values(\''+$scope.ap.open_date+'\',\''+$scope.ap.code+'\','+$scope.ap.id+',\'0\',null,\''+$scope.ap.notes+'\');'
                    var q1 = 'insert into acc_gl_transaction'
                    var p1 = {
                        code: $scope.ap.code,
                        bookkeeping_date: $scope.ap.open_date,
                        journal_type_id: null,
                        deposit_id: $scope.ap.id,
                        gl_status: '0',
                        notes: $scope.ap.notes
                    }
                    queryService.post(qq ,undefined)
                    .then(function (result2){
                        var q2 = $scope.child.saveTable(result2.data.insertId)
                        queryService.post(q2.join(';') ,undefined)
                        .then(function (result3){
							$scope.disableAction = false;
                            $('#form-input').modal('hide')
                            $scope.dtInstance.reloadData(function(obj){
                                // console.log(obj)
                            }, false)
                            $('body').pgNotification({
                                style: 'flip',
                                message: 'Success Update '+$scope.ap.code,
                                position: 'top-right',
                                timeout: 2000,
                                type: 'success'
                            }).show();
                        },
                        function(err3){
							$scope.disableAction = false;
                            console.log(err3)
                        })
                    },
                    function(err2){
						$scope.disableAction = false;
                        console.log(err2)
                    })
                }
                else if($scope.selected.status.selected.id=='2'){
                    var qs = 'update acc_gl_transaction set gl_status = \'1\' where deposit_id = '+$scope.ap.id
                    queryService.post(qs ,undefined)
                    .then(function (result3){
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            // console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Update '+$scope.ap.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
						$scope.disableAction = false;
                    },
                    function(err3){
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Update: '+err3.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
						$scope.disableAction = false;
                    })
                }*/
                if ($scope.selected.status.selected.id==0){
                    var qstr = $scope.child.saveTableT(0)
                    console.log('0',qstr)
                    if (qstr.length>0){
                        qstr = $scope.child.saveTableT($scope.ap.id)
                        queryService.post(qstr.join(';'),undefined)
                        .then(function (result2){
                                $('#form-input').modal('hide')
                                $scope.dtInstance.reloadData(function(obj){}, false)
                                $('body').pgNotification({
                                    style: 'flip',
                                    message: 'Success Insert '+$scope.ap.code,
                                    position: 'top-right',
                                    timeout: 2000,
                                    type: 'success'
                                }).show();
                                $scope.clear();
        						$scope.disableAction = false;
                        },
                        function (err2){
        					$scope.disableAction = false;
                            $('#form-input').pgNotification({
                                style: 'flip',
                                message: 'Error Insert: '+err2.code,
                                position: 'top-right',
                                timeout: 2000,
                                type: 'danger'
                            }).show();
                        })
                    }

                }
                else if ($scope.selected.status.selected.id=='3'){
                    queryService.get('select id from acc_gl_transaction where deposit_id= '+$scope.ap.id,undefined)
                    .then(function(data){
                        var qq = ''
                        if(data.data.length==0){
                            qq = 'insert into acc_gl_transaction(gl_status,bookkeeping_date,code,deposit_id,journal_type_id,notes,posted_by,posting_date,created_by) '+
                             'values(1,\''+$scope.ap.open_date+'\',\''+$scope.ap.code+'\','+$scope.ap.id+',16,\''+$scope.ap.notes+'\','+$localStorage.currentUser.name.id+',curdate(),'+$localStorage.currentUser.name.id+');'
                        }
                        else {
                            qq = 'update acc_gl_transaction set '+
                                'bookkeeping_date = \''+$scope.ap.open_date+'\', '+
                                'code = \''+$scope.ap.code+'\', '+
                                //'journal_type_id = '+$scope.journal_type_id+','+
                                'notes = \''+$scope.ap.notes+'\', '+
                                'gl_status = 1, '+
								'modified_by='+$localStorage.currentUser.name.id+','+
								'modified_date=curdate() '+
                                'where id='+data.data[0].id
                        }
                        queryService.post(qq ,undefined)
                        .then(function (result2){
                            var ids = '';
                            if (result2.data.insertId) ids = result2.data.insertId
                            else ids = data.data[0].id
							var q2 = $scope.child.saveTable(ids)
                            if (q2.length>0){
                                queryService.post(q2.join(';') ,undefined)
                                .then(function (result3){
                                    $('#form-input').modal('hide')
        							$scope.disableAction = false;
                                    $scope.dtInstance.reloadData(function(obj){}, false)
                                    $('body').pgNotification({
                                        style: 'flip',
                                        message: 'Success Update '+$scope.ap.code,
                                        position: 'top-right',
                                        timeout: 2000,
                                        type: 'success'
                                    }).show();
                                    $scope.clear();
                                },
                                function(err3){
        							$scope.disableAction = false;
                                    console.log(err3)
                                })
                            }
                            else {
                                $('#form-input').modal('hide')
                                $scope.disableAction = false;
                                $scope.dtInstance.reloadData(function(obj){}, false)
                                $('body').pgNotification({
                                    style: 'flip',
                                    message: 'Success Update '+$scope.ap.code,
                                    position: 'top-right',
                                    timeout: 2000,
                                    type: 'success'
                                }).show();
                            }
                        },
                        function(err2){
                            console.log(err2)
    						$scope.disableAction = false;
                        })
                    })
                }
                else {
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.ap.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
					$scope.disableAction = false;
                }

            },
            function (err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Update: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
				$scope.disableAction = false;
            })
        }
    }

    $scope.update = function(obj){
        queryService.post(qstring+ ' where a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)
            $('#form-input').modal('show');
            $scope.ap = result.data[0]
            $scope.selected.bank['selected']= {
                id: result.data[0].bank_id,
                name: result.data[0].bank_name
            }
            $scope.selected.bank_account['selected'] = {
                id: result.data[0].bank_account_id,
                name: result.data[0].bank_account,
                gl_account_id: result.data[0].gl_account_id,
                gl_account_code: result.data[0].gl_account_code,
                gl_account_name: result.data[0].gl_account_name
            }
            $scope.selected.supplier['selected'] = {
                supplier_id: result.data[0].supplier_id,
                supplier_name: result.data[0].supplier_name,
                supplier_account_id: result.data[0].supplier_account_id,
                supplier_account_code: result.data[0].supplier_account_code,
                supplier_account_name: result.data[0].supplier_account_name
            }
            $scope.selected.status['selected'] = {
                id: result.data[0].status,
                name: result.data[0].status_name
            }
            $scope.selected.currency['selected'] = {
                currency_id:result.data[0].used_currency_id,
                currency_name: result.data[0].currency
            }
            $scope.ap.check = result.data[0].check_no
            $scope.ap.exchange = result.data[0].home_currency_exchange

            $scope.ap.deposit_home = result.data[0].home_deposit_amount
            $scope.ap.deposit_idr = result.data[0].tot_deposit_amount
            $scope.ap.applied_home = result.data[0].home_applied_amount
            $scope.ap.applied_idr = result.data[0].tot_applied_amount
            $scope.ap.balance_home = result.data[0].home_balance_amount
            $scope.ap.balance_idr = result.data[0].tot_balance_amount
            $scope.statusShow = []
            if (result.data[0].status=="0"){
                $scope.statusShow.push($scope.status[1])
            }
            else if(result.data[0].status=="1"){
                $scope.statusShow.push($scope.status[2])
            }
            else if(result.data[0].status=="2"){
                $scope.statusShow.push($scope.status[3])
            }
            queryService.post(qstringt+ ' where b.deposit_id='+obj.id,undefined)
            .then(function(result2){
                var d = result2.data
                $scope.trans = []
                $scope.transOri = []
                $scope.totalv.payment=0
    			$scope.totalv.total=0
    			$scope.totalv.current=0
                for (var i=0;i<d.length;i++){
                    $scope.trans.push(
                        {
                            id:(i+1),
                            p_id: d[i].id,
                            code:d[i].code,
                            open_date:d[i].open_date,
                            due_date:d[i].due_date,
                            status: d[i].status,
                            source: d[i].source,
                            home_total_amount: d[i].home_total_amount,
                            total_amount: d[i].total_amount,
                            applied_amount: d[i].applied_amount,
                            current_due_amount: d[i].current_due_amount
                        }
                    )
                    $scope.totalv.total+=parseFloat(d[i].total_amount)
					$scope.totalv.current+=parseFloat(d[i].current_due_amount)
		            $scope.totalv.payment += parseFloat(d[i].applied_amount)

                }


            },function(err2){
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Failed Fetch Data: '+err2.code,
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
        $scope.ap.id = obj.id;
        $scope.ap.code = obj.code;
        $('#modalDelete').modal('show')
    }

    $scope.execDelete = function(){
        var sql = ['delete from acc_gl_journal where gl_id in (select id from acc_gl_transaction where deposit_id='+$scope.ap.id+')',
            'delete from acc_gl_transaction where deposit_id='+$scope.ap.id,
            'delete from acc_deposit_line_item where deposit_id='+$scope.ap.id,
            'delete from acc_cash_deposit where id='+$scope.ap.id]
        queryService.post(sql.join(';'),undefined)
        .then(function (result){
            $('#modalDelete').modal('hide')
            $scope.dtInstance.reloadData(function(obj){
                // console.log(obj)
            }, false)
            $('body').pgNotification({
                style: 'flip',
                message: 'Success Delete '+$scope.ap.code,
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.ap.id = '';
            $scope.ap.code = '';

        },
        function (err){
            $scope.ap.id = '';
            $scope.ap.code = '';
            $('#modalDelete').modal('hide')
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
        $scope.ap = {
            id: '',
            name: '',
            description: '',
            status: ''
        }
    }

})
.controller('EditableTableApdtCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
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
            id:($scope.trans.length+1),
            p_id: '',
            code:'',
            open_date:'',
            status: '',
            source: '',
            home_total_amount: '',
            total_amount: '',
            applied_amount: '',
            current_due_amount: '',
            isNew: true
        };
        $scope.trans.push($scope.item)
        queryService.post('select a.id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name '+
            'from acc_ap_voucher a,(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
            	'and column_name = \'status\')b '+
            'where a.status=b.value '+
            'and a.supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
            'and a.status in(0,1) '+
            'order by id limit 20 ',undefined)
        .then(function(data){
            $scope.voucher[$scope.item.id] = data.data
        })
    };

    // cancel all changes
    $scope.cancel = function() {
        for (var i = $scope.trans.length; i--;) {
            var user = $scope.trans[i];
            // undelete
            if (user.isDeleted) {
                delete user.isDeleted;
            }
            // remove new
            if (user.isNew) {
                $scope.trans.splice(i, 1);
            }
        };
    };


    // save edits
    $scope.child.saveTableT = function(pr_id) {
        var results = [];
        var sqlitem = []
		for (var i =0;i< $scope.trans.length; i++) {
            var user = $scope.trans[i];
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
                sqlitem.push('insert into acc_deposit_line_item (deposit_id,voucher_id,applied_amount,created_by,created_date) values('+
                pr_id+','+user.p_id+','+user.applied_amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_deposit_line_item where id='+user.p_id)
            }
            else if(!user.isNew){
                for (var j=0;j<$scope.transOri.length;j++){
                    if ($scope.transOri[j].p_id==user.p_id){
                        var d1 = $scope.transOri.p_id+$scope.transOri[j].voucher_id+$scope.itemsOri[j].applied_amount
                        var d2 = user.p_id+user.voucher_id+user.applied_amount
                        if(d1 != d2){
                            sqlitem.push('update acc_deposit_line_item set '+
                            ' voucher_id = '+user.voucher_id+',' +
                            ' applied_amount = '+user.applied_amount+',' +
                            ' home_total_amount = '+user.home_total_amount+',' +
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

    $scope.products = []

    $scope.voucherUp = function(d,text) {
        //queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        queryService.post('select a.id,a.code,a.open_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name '+
            'from acc_ap_voucher a,(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
            	'and column_name = \'status\')b '+
            'where a.status=b.value '+
            'and a.supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
            'and a.status in(0,1) '+
            'and lower(code) like \''+text.toLowerCase()+'%\' '+
            'order by id limit 20 ',undefined)
        .then(function(data){
            $scope.voucher[d] = data.data
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

    $scope.getVoucher = function(e,d){
        $scope.trans[d-1].code = e.code
        $scope.trans[d-1].p_id = e.id
        $scope.trans[d-1].open_date = e.open_date
        $scope.trans[d-1].status_id = e.status_id
        $scope.trans[d-1].status_name = e.status_name
        $scope.trans[d-1].source = e.source
        $scope.trans[d-1].home_total_amount = e.home_total_amount
        $scope.trans[d-1].total_amount = e.total_amount
        $scope.trans[d-1].current_due_amount = e.current_due_amount

    }

    $scope.setValue = function(e,d,p){
        $scope.trans[d-1].applied_amount = p
        $scope.ap.applied_home = 0
        for (var i=0;i<$scope.trans.length;i++){
            $scope.ap.applied_home += parseInt($scope.trans[i].applied_amount)
        }
        $scope.ap.applied_idr = $scope.ap.applied_home*$scope.ap.exchange

    }

})
.controller('EditableTableApdgCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    $scope.item = {
        account_id:'',
        account_code:'',
        account_name: '',
        debit: '',
        credit: ''
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

                if (user.debit>0){
                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'D\','+user.debit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }
                else if (user.credit>0){
                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'C\','+user.credit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }

            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_gl_journal where id='+user.p_id)
            }
            /*else if(!user.isNew){
                console.log(user)
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri._id+$scope.itemsOri[j].account_id+$scope.itemsOri[j].debit+$scope.itemsOri[j].credit
                        var d2 = user.pid+user.account_id+user.debit+user.credit
                        if(d1 != d2){
                            sqlitem.push('update acc_gl_journal set '+
                            ' account_id = '+user.account_id+',' +
                            ' transc_type = '+(user.debit>0?'D':'C')+',' +
                            ' amount = '+user.debit>0?user.debit:user.credit+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
                        }
                    }
                }
            }*/

        }
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.products = []

    $scope.accountUp = function(d,text) {
        //queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        queryService.post('select id,code,name from mst_ledger_account where lower(code) like \''+text.toLowerCase()+'%\' order by id limit 10 ',undefined)
        .then(function(data){
            $scope.account[d] = data.data
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

    $scope.getAccount = function(e,d){
        $scope.items[d-1].account_id = e.id
        $scope.items[d-1].account_code = e.code
        $scope.items[d-1].account_name = e.name

    }
    $scope.funcAsync = function(e,d){
        var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
            'from mst_supplier a '+
            'left join inv_prod_price_contract b '+
            'on a.id = b.supplier_id  '+
            'and a.status=1  '+
            'and b.product_id ='+$scope.items[d-1].product_id + ' '+
            'and lower(a.name) like \''+e.toLowerCase()+'%\'' +
            ' order by price desc limit 50'
        //queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
        queryService.post(sqlCtr,undefined)
        .then(function(data){
            $scope.suppliers = data.data
        })
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
        console.log(d)
        if (t=='debit') $scope.items[d-1].debit = p
        if (t=='credit') $scope.items[d-1].credit = p

        $scope.total = {debit:0,credit:0,balance:0}
        for (var i=0;i<$scope.items.length;i++){
            $scope.total.debit += parseFloat($scope.items[i].debit);
            $scope.total.credit += parseFloat($scope.items[i].credit);
        }
    }

});
