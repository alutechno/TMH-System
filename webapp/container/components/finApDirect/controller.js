
var userController = angular.module('app', []);
userController
.controller('FinApDirectCtrl',
function($scope, $state, $stateParams,$sce,$templateCache, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []
    $scope.items = []
    $scope.itemsOri = []
    $scope.trans = []
    $scope.transOri = []
    $scope.child = {}
    $scope.voucher = {}
    $scope.sums1 = 0
    $scope.sums2 = 0
    $scope.total_debit = 0
    $scope.total_credit = 0
    $scope.total_debit_f = 0
    $scope.total_credit_f = 0
    $scope.total = {
        debit:0,
        credit:0,
        debit_f:0,
        credit_f:0
    }
    $scope.total_balance = 0
    $scope.journal_type_id = null
	$scope.disableAction = false;
    var year = ['2015','2016','2017','2018','2019']
    var month = [
        {id:'01',last:'31'},
        {id:'02',last:'28'},
        {id:'03',last:'31'},
        {id:'04',last:'30'},
        {id:'05',last:'31'},
        {id:'06',last:'30'},
        {id:'07',last:'31'},
        {id:'08',last:'31'},
        {id:'09',last:'30'},
        {id:'10',last:'31'},
        {id:'11',last:'30'},
        {id:'12',last:'31'}]
    $scope.listYear = []
    $scope.listMonth = []
    for (var i=0;i<year.length;i++){
        $scope.listYear.push({
            id: year[i],
            name: year[i]
        })
    }
    for (var i=0;i<month.length;i++){
        $scope.listMonth.push({
            id: month[i].id,
            name: month[i].id,
            last:month[i].last
        })
    }
    var qstring = "select id, code, voucher_id, voucher_doc_no, open_date, due_date, check_no, status, status_name, "+
                  "prepared_date, supplier_id, supplier_name, currency_id, currency_exchange, currency_code, currency_name, "+
                  "total_amount, home_total_amount, bank_id, bank_account_id, bank_account, format(a.total_amount,0) ta, format(a.home_total_amount,0) hta, "+
                  "prepare_notes, gl_account_id, gl_account_code, gl_account_name, ap_clearance_account_id, ap_clearance_account_code, ap_clearance_account_name, "+
                  "supplier_account_id, supplier_account_code, supplier_account_name, approved_by, approved_date, prepared_by, issued_by, issued_date, created_by, created_date " +
        "from ( "+
        "select a.id, a.code, '-' as 'voucher_id', '-' as 'voucher_doc_no', "+
    	"DATE_FORMAT(a.open_date,'%Y-%m-%d')open_date, DATE_FORMAT(a.check_due_date,'%Y-%m-%d')due_date, a.check_no, a.status, e.name as status_name,  "+
    	"DATE_FORMAT(a.prepared_date,'%Y-%m-%d') prepared_date,a.supplier_id, d.name as 'supplier_name', a.currency_id,a.currency_exchange,  "+
    	"f.code as 'currency_code', f.name as currency_name, (select sum(x.amount) amount "+
                 "from acc_gl_journal x, acc_gl_transaction y "+
                "where x.gl_id = y.id "+
                  "and x.transc_type = 'C' "+
                  "and y.payment_id=a.id) total_amount ,a.home_total_amount, g.bank_id,a.bank_account_id,  "+
    	"g.name as 'bank_account', 0 ta,0 hta, prepare_notes,  "+
        "g.gl_account_id,h.code gl_account_code,h.name gl_account_name, "+
        "g.ap_clearance_account_id,i.code ap_clearance_account_code,i.name ap_clearance_account_name,  "+
        "k.id supplier_account_id,k.code supplier_account_code,k.name supplier_account_name,l.name approved_by,DATE_FORMAT(a.approved_date,'%Y-%m-%d') approved_date,m.name prepared_by,n.name issued_by,DATE_FORMAT(a.issued_date,'%Y-%m-%d') issued_date,o.name created_by,DATE_FORMAT(a.created_date,'%Y-%m-%d') created_date  "+
    "from acc_cash_payment a  "+
    "left join mst_supplier d on a.supplier_id = d.id  "+
    "left join (select value, name from table_ref  "+
    "where table_name = 'acc_cash_payment'  "+
    "and column_name = 'status') e on a.status = e.value  "+
    "left join ref_currency f on a.currency_id = f.id  "+
    "left join mst_cash_bank_account g on a.bank_account_id = g.id  "+
    "left join mst_ledger_account h on g.gl_account_id=h.id  "+
    "left join mst_ledger_account i on g.ap_clearance_account_id=i.id  "+
    "left join ref_supplier_type j on d.supplier_type_id=j.id  "+
    "left join mst_ledger_account k on j.payable_account_id=k.id  "+
	"left join user l on a.approved_by=l.id  "+
	"left join user m on a.prepared_by=m.id  "+
	"left join user n on a.issued_by=n.id  "+
	"left join user o on a.created_by=o.id  "+
    "where a.payment_method = '1' " +
    ") a where id > 0 "

    /*var qstring = "select a.id, a.code, c.id as 'voucher_id', c.code as 'voucher_doc_no', "+
    	"DATE_FORMAT(a.open_date,'%Y-%m-%d')open_date, DATE_FORMAT(a.check_due_date,'%Y-%m-%d')due_date, a.check_no, a.status, e.name as status_name, "+
    	"DATE_FORMAT(a.prepared_date,'%Y-%m-%d') prepared_date,a.supplier_id, d.name as 'supplier_name', a.currency_id,a.currency_exchange, "+
    	"f.code as 'currency_code', f.name as currency_name, a.total_amount ,a.home_total_amount, g.bank_id,a.bank_account_id, "+
    	"g.name as 'bank_account', format(a.total_amount,0)ta,format(a.home_total_amount,0)hta, prepare_notes, "+
        "g.gl_account_id,h.code gl_account_code,h.name gl_account_name,"+
        "g.ap_clearance_account_id,i.code ap_clearance_account_code,i.name ap_clearance_account_name, "+
        "k.id supplier_account_id,k.code supplier_account_code,k.name supplier_account_name,l.name approved_by,DATE_FORMAT(a.approved_date,'%Y-%m-%d') approved_date,m.name prepared_by,n.name issued_by,DATE_FORMAT(a.issued_date,'%Y-%m-%d') issued_date,o.name created_by,DATE_FORMAT(a.created_date,'%Y-%m-%d') created_date "+
    "from acc_cash_payment a "+
    "left join acc_payment_line_item b on b.payment_id = a.id "+
    "left join acc_ap_voucher c on b.voucher_id = c.id "+
    "left join mst_supplier d on a.supplier_id = d.id "+
    "left join (select value, name from table_ref "+
    "where table_name = 'acc_cash_payment' "+
    "and column_name = 'status') e on a.status = e.value "+
    "left join ref_currency f on a.currency_id = f.id "+
    "left join mst_cash_bank_account g on a.bank_account_id = g.id "+
    "left join mst_ledger_account h on g.gl_account_id=h.id "+
    "left join mst_ledger_account i on g.ap_clearance_account_id=i.id "+
    "left join ref_supplier_type j on d.supplier_type_id=j.id "+
    "left join mst_ledger_account k on j.payable_account_id=k.id "+
	"left join user l on a.approved_by=l.id "+
	"left join user m on a.prepared_by=m.id "+
	"left join user n on a.issued_by=n.id "+
	"left join user o on a.created_by=o.id "+
    "where a.payment_method = '1' "*/
    var qwhere = ''
	/*var qstringt = 'select a.id,a.code, '+
              'from acc_ap_voucher a '+
              'inner join acc_payment_line_item b on a.id = b.voucher_id '*/
  var qstringt ="select a.id gl_id,a.payment_id,a.code,a.journal_type_id,a.gl_status,a.notes,b.account_id,c.code account_code,c.name account_name,b.transc_type,b.amount "+
    "from acc_gl_transaction a, acc_gl_journal b, mst_ledger_account c "+
    "where a.id = b.gl_id "+
    "and b.account_id=c.id "
      //'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
      //'order by id limit 20 '
              //'where b.deposit_id=?'

    var year = ['2015','2016','2017','2018','2019']
    var month = ['01','02','03','04','05','06','07','08','09','10','11','12']
    $scope.period = [
        { id: 0, name: 'Current Month'},
        { id: 1, name: 'Last Month'}
    ]
    if ($stateParams.currentPeriod!=null){
        qwhere = ' and a.created_date between \''+$stateParams.currentPeriod+' 00:00:00\' and \''+$stateParams.currentPeriod+' 23:59:59\' '
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
        payment_method: {},
        filter_status: [],
        filter_due_date: '',
        filter_month: {},
        filter_year: {},
        filter_supplier: {}
    }
    $scope.selected.period = $scope.period[0]
    $scope.status = [
        {id: 0, name: 'Open'},
        {id: 1, name: 'Prepare'},
        {id: 2, name: 'Close'}
    ]

    $scope.status = []
    $scope.statusShow = []
    queryService.get("select value id, name from table_ref where table_name = 'acc_cash_payment'  "+
        "and column_name = 'status' and value < '4' order by id ",undefined)
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

    $scope.bank = []
    queryService.get('select id,code,name from mst_cash_bank where status = \'1\' order by name ',undefined)
    .then(function(data){
        $scope.bank = data.data
    })
    queryService.get("select id from ref_journal_type where code = 'DP' ",undefined)
    .then(function(data){
        $scope.journal_type_id = data.data[0].id
    })
    $scope.bank_account = []
    $scope.setBankAccount = function(e){
        queryService.get("select a.id,a.code,a.name, a.gl_account_id,b.code gl_account_code,b.name gl_account_name, "+
        	"a.ap_clearance_account_id,c.code ap_clearance_account_code,c.name ap_clearance_account_name "+
        "from mst_cash_bank_account a,mst_ledger_account b,mst_ledger_account c "+
        "where a.gl_account_id = b.id "+
        "and a.ap_clearance_account_id= c.id "+
        "and a.status = '1' "+
        "and a.bank_id="+e.id+ " order by name",undefined)
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
    queryService.get('select  id currency_id,code currency_code,name currency_name,home_currency_exchange exchange  from ref_currency order by id asc',undefined)
    .then(function(data){
        $scope.currency = data.data
    })

    $scope.payment_method = []
    queryService.get('select value id, value, name from table_ref where table_name = \'acc_cash_payment\' and column_name = \'payment_method\' order by id ',undefined)
    .then(function(data){
        $scope.payment_method = data.data
    })

    $scope.tax = []
    queryService.get('select  id ,code ,name ,account_id from mst_taxes where status=\'1\' order by id asc',undefined)
    .then(function(data){
        $scope.tax = data.data
    })
    $scope.setDebit = function(a){
        return a
    }

    $scope.setExchange = function(){
        $scope.total.debit = 0
        $scope.total.credit = 0
        $scope.total.debit_f = 0
        $scope.total.credit_f = 0

        for (var i=0;i<$scope.items.length;i++){
            if ($scope.selected.currency.selected.currency_id==1){
                $scope.items[i].debit_f = ''
                $scope.items[i].credit_f = ''
            }
            else {
                $scope.items[i].debit = ($scope.ap.exchange*$scope.items[i].debit_f)
                $scope.items[i].credit = ($scope.ap.exchange*$scope.items[i].credit_f)
            }

            $scope.total.debit_f += (parseInt($scope.items[i].debit_f).toString()=='NaN'?0:parseInt($scope.items[i].debit_f))
            $scope.total.credit_f += (parseInt($scope.items[i].credit_f).toString()=='NaN'?0:parseInt($scope.items[i].credit_f))
            $scope.total.debit += (parseInt($scope.items[i].debit).toString()=='NaN'?0:parseInt($scope.items[i].debit))
            $scope.total.credit += (parseInt($scope.items[i].credit).toString()=='NaN'?0:parseInt($scope.items[i].credit))

        }
        //$scope.setDebit(1000)
        //$scope.$apply();
        /*$('#totalDebitF').html($scope.total.debit_f)
        $('#totalCreditF').html($scope.total.credit_f)
        $('#totalDebit').html($scope.total.debit)
        $('#totalCredit').html($scope.total.credit)*/

    }


    $scope.filterVal = {
        search: ''
    }

    $scope.isReceiving = true
    $scope.supplier = []
    queryService.post("select a.id supplier_id,a.name supplier_name,c.id supplier_account_id,c.code supplier_account_code,c.name supplier_account_name "+
        "from mst_supplier a, ref_supplier_type b, mst_ledger_account c "+
        "where a.supplier_type_id = b.id "+
        "and b.payable_account_id = c.id "+
        "and a.status='1' order by a.name limit 50",undefined)
    .then(function(data){
        $scope.supplier = data.data
    })
    $scope.findSupplier = function(text){
        queryService.post("select a.id supplier_id,a.name supplier_name,c.id supplier_account_id,c.code supplier_account_code,c.name supplier_account_name "+
            "from mst_supplier a, ref_supplier_type b, mst_ledger_account c "+
            "where a.supplier_type_id = b.id "+
            "and b.payable_account_id = c.id "+
            "status='1' and lower(name) like '%"+text.toLowerCase()+"%' order by name asc limit 50",undefined)
        .then(function(data){
            $scope.supplier = data.data
        })
    }
    $scope.source_no = []

    $scope.showAdvance = false
    $scope.openAdvancedFilter = function(val){
        $scope.showAdvance = val
    }


    $scope.setSupplier = function(e){
        $scope.ap.supplier_id=$scope.selected.supplier.selected.supplier_id
        /*if ($scope.trans.length>0){
            queryService.post('select a.id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name '+
                'from acc_ap_voucher a,(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
                	'and column_name = \'status\')b '+
                'where a.status=b.value '+
                'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
                'order by id limit 20 ',undefined)
            .then(function(data){
                console.log($scope.voucher)
                for(var i=0;i<($scope.trans.length);i++){
                    $scope.voucher[$scope.trans[i].id] = data.data
                }
            })
        }*/
    }


    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.focusinControl = {};
    $scope.fileName = "Direct Payment";
    $scope.exportExcel = function(){
        queryService.post('select id,code,check_no,open_date,due_date,status_name,supplier_name,bank_account,currency_code,total_amount from('+qstring + qwhere+')aa order by id desc',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["ID","Doc No", 'Check No',"Open Date",'Due Date', 'Status','Supplier', 'Bank Account','Currency',
                'Total Amount']);
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
                if (full.status_name=='Open') {
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

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('Trans#').withOption('width', '5%'),
        DTColumnBuilder.newColumn('code').withTitle('Doc No').withOption('width', '8%'),
        DTColumnBuilder.newColumn('check_no').withTitle('Check No').withOption('width', '6%'),
        DTColumnBuilder.newColumn('open_date').withTitle('Open Date').withOption('width', '6%'),
        DTColumnBuilder.newColumn('due_date').withTitle('Due Date').withOption('width', '6%'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '6%'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier').withOption('width', '13%'),
        //DTColumnBuilder.newColumn('age').withTitle('Age'),
        DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account').withOption('width', '10%'),
        DTColumnBuilder.newColumn('currency_code').withTitle('Currency').withOption('width', '5%'),
        DTColumnBuilder.newColumn('ta').withTitle('Total Amount').withOption('width', '7%').withClass('text-right')
        //DTColumnBuilder.newColumn('hta').withTitle('Total Amount').withOption('width', '5%').withClass('text-right')
    );
    queryService.post('select sum(total_amount)as sm,sum(home_total_amount)as sm2 from ('+qstring+qwhere+')a',undefined)
    .then(function(data){
        $scope.sums1 = data.data[0].sm;
        $scope.sums2 = data.data[0].sm2;
    });

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
            qwhereobj.due_date = ' a.check_due_date between \''+s+' 00:00:00\' and \''+d+' 23:59:59\' '
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
        $scope.statusShow.push($scope.status[0])
        $scope.selected.status['selected'] = $scope.status[0]
        $('#form-input').modal('show')
        var dt = new Date()

        var ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
        //queryService.post('select cast(concat(\'DMT/\',date_format(date(now()),\'%Y/%m/%d\'), \'/\', lpad(seq(\'DMT\',\''+ym+'\'),4,\'0\')) as char) as code ',undefined)
		queryService.post('select curr_document_no(\'DMT\',\''+$scope.ym+'\') as code',undefined)
        .then(function(data){
            $scope.ap.code = data.data[0].code
        });
        $scope.items = []
        $scope.itemsOri = []
        $scope.total = {
            debit:0,
            credit:0,
            debit_f:0,
            credit_f:0
        }
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
            var total_amount = 0
            var home_total_amount = 0
            var statDetail = true
            for (var i=0;i<$scope.items.length;i++){
                if($scope.items[i].account_id.length==0) statDetail = false
                if(($scope.items[i].debit+$scope.items[i].credit)==0) statDetail = false
            }
			queryService.post('select next_document_no(\'DMT\',\''+$scope.ym+'\')',undefined)
			.then(function(data){
                console.log('direct code',data)
				$scope.pr.code = data.data[0].code
			})
            if (statDetail == true){
                var param = {
                    code: $scope.ap.code,
                	check_no: $scope.ap.check,
                	bank_account_id: $scope.selected.bank_account.selected.id,
                    payment_method: 1,
                	status: $scope.selected.status.selected.id,
                	open_date: $scope.ap.open_date,
                    check_due_date: $scope.ap.due_date,
                	prepared_date:$scope.ap.prepared_date,
                	supplier_id: ($scope.selected.supplier.selected?$scope.selected.supplier.selected.supplier_id:null),
                	prepare_notes: $scope.ap.notes,
                	currency_id: $scope.selected.currency.selected.currency_id,
                	currency_exchange: $scope.ap.exchange,
                	total_amount: $scope.total.debit,
                	home_total_amount: $scope.total.debit,
                	created_by: $localStorage.currentUser.name.id,
                    created_date: globalFunction.currentDate()
                }

                queryService.post('insert into acc_cash_payment SET ?',param)
                .then(function (result){
                    var q2 = $scope.child.saveTable(0)
                    if (q2.length > 0){
                            var qq = ''
                            qq = 'insert into acc_gl_transaction(bookkeeping_date,code,payment_id,gl_status,journal_type_id,notes,posted_by,posting_date,created_by) '+
                             'values(\''+$scope.ap.open_date+'\',next_item_code("GL","DP"),'+result.data.insertId+',\'0\',19,\''+($scope.ap.notes?$scope.ap.notes:'')+'\','+$localStorage.currentUser.name.id+',curdate(),'+$localStorage.currentUser.name.id+');'
                            queryService.post(qq ,undefined)
                            .then(function (result2){
                                var ids = '';
                                ids = result2.data.insertId
                                var q2 = $scope.child.saveTable(ids)
                                if (q2.length>0){
                                    queryService.post(q2.join(';') ,undefined)
                                    .then(function (result3){
                                        $('#form-input').modal('hide')
                                        $scope.dtInstance.reloadData(function(obj){
                                            // console.log(obj)
                                        }, false)
                                        $('body').pgNotification({
                                            style: 'flip',
                                            message: 'Success Insert '+$scope.ap.code,
                                            position: 'top-right',
                                            timeout: 2000,
                                            type: 'success'
                                        }).show();
                                        $scope.disableAction = false;
                                    },
                                    function(err3){
                                        console.log(err3)
                                        $scope.disableAction = false;
                                    })
                                }
                                else {
                                    $('#form-input').modal('hide')
                                    $scope.dtInstance.reloadData(function(obj){
                                        // console.log(obj)
                                    }, false)
                                    $('body').pgNotification({
                                        style: 'flip',
                                        message: 'Success Insert '+$scope.ap.code,
                                        position: 'top-right',
                                        timeout: 2000,
                                        type: 'success'
                                    }).show();
                                    $scope.disableAction = false;
                                }
                            },
                            function(err2){
                                console.log(err2)
                                $scope.disableAction = false;
                            })

                    }
                    else {
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){}, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert '+$scope.ap.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                        $scope.disableAction = false;
                        $scope.clear();
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
    				$scope.disableAction = false;
                })
            }
            else {
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Cannot Insert Payment, please check account id and its value',
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
                $scope.disableAction = false;
            }


        }
        else {
            //exec update
            var total_amount = 0
            var home_total_amount = 0
            var statDetail = true
            for (var i=0;i<$scope.items.length;i++){
				console.log($scope.items[i])
                if(!$scope.items[i].isDeleted && $scope.items[i].account_id.length==0) statDetail = false
                if(!$scope.items[i].isDeleted && ($scope.items[i].debit+$scope.items[i].credit)==0) statDetail = false
            }
            if (statDetail == true){
                var param = {
                    code: $scope.ap.code,
                	check_no: $scope.ap.check,
                	bank_account_id: $scope.selected.bank_account.selected.id,
                    payment_method: 1,
                	status: $scope.selected.status.selected.id,
                	open_date: $scope.ap.open_date,
                    check_due_date: $scope.ap.due_date,
                	prepared_date:$scope.ap.prepared_date,
                	supplier_id: $scope.selected.supplier.selected.supplier_id,
                	prepare_notes: $scope.ap.notes,
                	currency_id: $scope.selected.currency.selected.currency_id,
                	currency_exchange: $scope.ap.exchange,
                	total_amount: $scope.total.debit,
                	home_total_amount: $scope.total.debit,
                	modified_by: $localStorage.currentUser.name.id,
                    modified_date: globalFunction.currentDate()
                }
                if ($scope.selected.status.selected.id=='1'){
                    param['approved_date'] = globalFunction.currentDate()
                    param['approved_by'] = $localStorage.currentUser.name.id
                }
                else if ($scope.selected.status.selected.id=='2'){
                    param['prepared_date'] = globalFunction.currentDate()
                    param['prepared_by'] = $localStorage.currentUser.name.id
                }
                else if ($scope.selected.status.selected.id=='3'){
                    param['issued_date'] = globalFunction.currentDate()
                    param['issued_by'] = $localStorage.currentUser.name.id
                }
                else if ($scope.selected.status.selected.id=='4'){
                    param['reconciled_date'] = globalFunction.currentDate()
                    param['reconcled_by'] = $localStorage.currentUser.name.id
                }

                queryService.post('update acc_cash_payment SET ? WHERE id='+$scope.ap.id ,param)
                .then(function (result){
                    var q2 = $scope.child.saveTable(0)
					console.log(q2)
					if (q2.length > 0){
console.log(q2)
                        queryService.get('select id from acc_gl_transaction where payment_id= '+$scope.ap.id,undefined)
                        .then(function(data){
                            //console.log(data)
                            var qq = ''
                            if(data.data.length==0){
                                qq = 'insert into acc_gl_transaction(bookkeeping_date,code,payment_id,gl_status,journal_type_id,notes,posted_by,posting_date,created_by) '+
                                 'values(\''+$scope.ap.open_date+'\',next_item_code("GL","DP"),'+$scope.ap.id+',\'0\',19,\''+$scope.ap.notes+'\','+$localStorage.currentUser.name.id+',curdate(),'+$localStorage.currentUser.name.id+');'
                            }
                            else {
                                qq = 'update acc_gl_transaction set '+
                                    'bookkeeping_date = \''+$scope.ap.open_date+'\', '+
                                    'code = \''+$scope.ap.code+'\', '+
                                    'journal_type_id = 19,'+
                                    'notes = \''+$scope.ap.notes+'\', '+
									'modified_by='+$localStorage.currentUser.name.id+','+
									'modified_date=curdate() '+
                                    'where id='+data.data[0].id
                            }
							console.log(qq)
                            queryService.post(qq ,undefined)
                            .then(function (result2){
                                var ids = '';
                                if (result2.data.insertId) ids = result2.data.insertId
                                else ids = data.data[0].id
                                var q2 = $scope.child.saveTable(ids)
								console.log(q2)
                                if (q2.length>0){
                                    queryService.post(q2.join(';') ,undefined)
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
                                        console.log(err3)
            							$scope.disableAction = false;
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
                            function(err2){
								console.log(err2)
                                console.log(err2)
        						$scope.disableAction = false;
                            })
                        })


                    }
                    /*else if($scope.selected.status.selected.id=='3'){
                        queryService.post('select id from acc_gl_transaction where payment_id='+$scope.ap.id ,undefined)
                        .then(function (result2){
                            var v_gl_id = result2.data[0].id
                            var q2 = $scope.child.saveTable(v_gl_id)
                            queryService.post(q2.join(';') ,undefined)
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
                                console.log(err3)
    							$scope.disableAction = false;
                            })
                        },
                        function(err2){
                            console.log(err2)
    						$scope.disableAction = false;
                        })

                    }*/
                    else {
                        $('#form-input').modal('hide')
    					$scope.disableAction = false;
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
            else {
                $scope.disableAction = false;
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Update Payment, Account ID must be Filled ',
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            }

        }
    }
    $scope.setStatus = function(par){
        if ($scope.selected.status.selected.id<3){

            if ($scope.items.length==0){
                $scope.items.push(
                    {
                        id:1,
                        account_id:$scope.selected.bank_account.selected.ap_clearance_account_id,
                        account_code:$scope.selected.bank_account.selected.ap_clearance_account_code,
                        account_name: $scope.selected.bank_account.selected.ap_clearance_account_name,
                        notes: '',
                        debit: '',
                        credit: '',
                        debit_f: '',
                        credit_f: '',
                        balance: '',
                        isNew: true
                    }
                )
                if ($scope.selected.supplier.selected && $scope.selected.supplier.selected.supplier_id!=null){
                    $scope.items.push(
                        {
                            id:2,
                            account_id:$scope.selected.supplier.selected.supplier_account_id,
                            account_code:$scope.selected.supplier.selected.supplier_account_code,
                            account_name: $scope.selected.supplier.selected.supplier_account_name,
                            notes: '',
                            debit: '',
                            credit: '',
                            debit_f: '',
                            credit_f: '',
                            balance: '',
                            isNew: true
                        }
                    )
                }
            }


        }
        else if ($scope.selected.status.selected.id==3&&par==1){
            var v = 0,v_gl_id=null;

            for (var i=0;i<$scope.items.length;i++){
                if($scope.items[i].account_id == $scope.selected.bank_account.selected.ap_clearance_account_id){
                    v = $scope.items[i].credit
                }

            }
            $scope.items.push(
                {
                    id:$scope.items.length+1,
                    account_id:$scope.selected.bank_account.selected.ap_clearance_account_id,
                    account_code:$scope.selected.bank_account.selected.ap_clearance_account_code,
                    account_name: $scope.selected.bank_account.selected.ap_clearance_account_name,
                    notes: '',
                    debit: v,
                    credit: '',
                    debit_f: '',
                    credit_f: '',
                    balance: '',
                    isNew: true
                },
                {
                    id:$scope.items.length+2,
                    account_id:$scope.selected.bank_account.selected.gl_account_id,
                    account_code:$scope.selected.bank_account.selected.gl_account_code,
                    account_name: $scope.selected.bank_account.selected.gl_account_name,
                    notes: '',
                    debit: '',
                    credit: v,
                    debit_f: '',
                    credit_f: '',
                    balance: '',
                    isNew: true
                }
            )



        }
        //console.log($scope.items)
    }

    $scope.update = function(obj){
        $scope.total = {
            debit:0,
            credit:0,
            debit_f:0,
            credit_f:0
        }
        queryService.post(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.ap = result.data[0]
            for (var i=0;i<$scope.bank.length;i++){
                if ($scope.bank[i].id==result.data[0].bank_id){
                    $scope.selected.bank['selected']= {
                        id: result.data[0].bank_id,
                        name: $scope.bank[i].name
                    }
                }
            }

            $scope.selected.bank_account['selected'] = {
                id: result.data[0].bank_account_id,
                name: result.data[0].bank_account,
                gl_account_id:result.data[0].gl_account_id,
                gl_account_code:result.data[0].gl_account_code,
                gl_account_name:result.data[0].gl_account_name,
                ap_clearance_account_id:result.data[0].ap_clearance_account_id,
                ap_clearance_account_code:result.data[0].ap_clearance_account_code,
                ap_clearance_account_name:result.data[0].ap_clearance_account_name
            }
            $scope.selected.supplier['selected'] = {
                supplier_id: result.data[0].supplier_id,
                supplier_name: result.data[0].supplier_name,
                supplier_account_id:result.data[0].supplier_account_id,
                supplier_account_code: result.data[0].supplier_account_code,
                supplier_account_name:result.data[0].supplier_account_name
            }
            $scope.selected.status['selected'] = {
                id: result.data[0].status,
                name: result.data[0].status_name
            }
            $scope.selected.currency['selected'] = {
                currency_id:result.data[0].currency_id,
                currency_name: result.data[0].currency_name
            }
            $scope.selected.payment_method['selected'] = {
                id:result.data[0].payment_method,
                name: result.data[0].payment_method_name
            }
            for (var i=0;i<$scope.bank.length;i++){
                if (result.data[0].bank_id == $scope.bank[i].id){
                    $scope.selected.bank['selected'] = $scope.bank[i]
                }
            }
            $scope.ap.check = result.data[0].check_no
            $scope.ap.check_due_date = result.data[0].check_due_date
            $scope.ap.prepared_date = result.data[0].prepared_date
            $scope.ap.exchange = result.data[0].currency_exchange
            $scope.ap.notes = result.data[0].prepare_notes

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
            /*else if(result.data[0].status=="3"){
                $scope.statusShow.push($scope.status[4])
            }
            else if(result.data[0].status=="4"){
                $scope.statusShow.push($scope.status[5])
            }*/
            $scope.items = []
            $scope.itemsOri = []
            var qd = "select a.id gl_id,a.payment_id,b.notes,a.code,a.journal_type_id,a.gl_status,b.notes,b.id line_id,b.account_id,c.code account_code,c.name account_name,b.transc_type,b.amount "+
                "from acc_gl_transaction a, acc_gl_journal b, mst_ledger_account c "+
                "where a.id = b.gl_id "+
                "and b.account_id=c.id "+
                "and a.payment_id="+$scope.ap.id+" order by b.id "
            queryService.post(qd,undefined)
            .then(function(result2){
                var d = result2.data
                $scope.total.debit = 0
                $scope.total.credit = 0
                $scope.total.debit_f = 0
                $scope.total.credit_f = 0
                $scope.total.balance = 0
                for (var i=0;i<d.length;i++){
                    $scope.total.debit += (d[i].transc_type=='D'?d[i].amount:0)
                    $scope.total.credit += (d[i].transc_type=='C'?d[i].amount:0)
                    $scope.total.balance = ($scope.total.debit-$scope.total.credit)
                    var item = {

                    }
                    if ($scope.selected.currency.selected.currency_id==1){
                        item = {
                            id:(i+1),
                            p_id: d[i].line_id,
                            gl_id: d[i].gl_id,
                            account_id:d[i].account_id,
                            account_code:d[i].account_code,
                            account_name: d[i].account_name,
                            notes: d[i].notes,
                            debit: d[i].transc_type=='D'?d[i].amount:'',
                            credit: d[i].transc_type=='C'?d[i].amount:'',
                            debit_f: '',
                            credit_f: '',
                            balance: d[i].transc_type=='D'?d[i].amount:(-1*d[i].amount)
                        }
                    }
                    else if ($scope.selected.currency.selected.currency_id!=1){
                        $scope.total.debit_f += (d[i].transc_type=='D'?(d[i].amount/$scope.ap.exchange):0)
                        $scope.total.credit_f += (d[i].transc_type=='C'?(d[i].amount/$scope.ap.exchange):0)

                        item = {
                            id:(i+1),
                            p_id: d[i].line_id,
                            gl_id: d[i].gl_id,
                            account_id:d[i].account_id,
                            account_code:d[i].account_code,
                            account_name: d[i].account_name,
                            notes: d[i].notes,
                            debit: d[i].transc_type=='D'?d[i].amount:'',
                            credit: d[i].transc_type=='C'?d[i].amount:'',
                            debit_f: d[i].transc_type=='D'?(d[i].amount/$scope.ap.exchange):'',
                            credit_f: d[i].transc_type=='C'?(d[i].amount/$scope.ap.exchange):'',
                            balance: d[i].transc_type=='D'?d[i].amount:(-1*d[i].amount)
                        }
                    }
                    $scope.items.push(
                        item
                    )
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
        $scope.ap.id = obj.id;
        $scope.ap.code = obj.code;
        $('#modalDelete').modal('show')

        //$scope.customer.name = obj.name;
        /*productCategoryService.get(obj.id)
        .then(function(result){
            $scope.cat.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })*/
    }

    $scope.execDelete = function(){
        var sql = ['delete from acc_gl_journal where gl_id in (select id from acc_gl_transaction where payment_id='+$scope.ap.id+')',
            'delete from acc_gl_transaction where payment_id='+$scope.ap.id,
            'delete from acc_payment_line_item where payment_id='+$scope.ap.id,
            'delete from acc_cash_payment where id='+$scope.ap.id]
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
        /*queryService.post('update ref_product_category set status=2 where id='+$scope.cat.id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.cat.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Delete: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })*/
    }

    $scope.clear = function(){
        $scope.ap = {
            id: '',
            name: '',
            description: '',
            status: ''
        }
        $scope.selected.bank = {}
        $scope.selected.bank_account = {}
        $scope.selected.currency = {}
        $scope.selected.supplier = {}
		$scope.items=[];
    }

})
.controller('EditableTableApptCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
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
        //console.log($scope.selected)
        $scope.item = {
            id:($scope.trans.length+1),
            p_id: '',
            code:'',
            open_date:'',
            due_date: '',
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
            'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
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
                sqlitem.push('insert into acc_payment_line_item (payment_id,voucher_id,created_by,created_date) values('+
                pr_id+','+user.p_id+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_payment_line_item where id='+user.p_id)
            }
            else if(!user.isNew){
                for (var j=0;j<$scope.transOri.length;j++){
                    if ($scope.transOri[j].p_id==user.p_id){
                        var d1 = $scope.transOri.p_id+$scope.transOri[j].voucher_id
                        var d2 = user.p_id+user.voucher_id
                        if(d1 != d2){
                            sqlitem.push('update acc_payment_line_item set '+
                            ' voucher_id = '+user.voucher_id+',' +
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

        queryService.post('select a.id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name '+
                'from acc_ap_voucher a,(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
                    'and column_name = \'status\')b '+
                'where a.status=b.value '+
            'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
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
        $scope.trans[d-1].due_date = e.due_date
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
.controller('EditableTableAppgCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
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
        for (var i=0;i<$scope.items.length;i++){
            if ($scope.items[i].id==id){
                $scope.total.debit_f -= (parseInt($scope.items[i].debit_f).toString()=='NaN'?0:parseInt($scope.items[i].debit_f))
                $scope.total.credit_f -= (parseInt($scope.items[i].credit_f).toString()=='NaN'?0:parseInt($scope.items[i].credit_f))
                $scope.total.debit -= (parseInt($scope.items[i].debit).toString()=='NaN'?0:parseInt($scope.items[i].debit))
                $scope.total.credit -= (parseInt($scope.items[i].credit).toString()=='NaN'?0:parseInt($scope.items[i].credit))
            }

            //$scope.total_balance += (parseInt($scope.items[i].balance).toString()=='NaN'?0:parseInt($scope.items[i].balance))
        }
    };

    // add user
    $scope.account = {}
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.items.length+1),
            gl_id: '',
            account_id:'',
            account_code:'',
            account_name: '',
            notes: '',
            debit_f: '',
            credit_f: '',
            debit: '',
            credit: '',
            balance: '',
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
        var sqlitem = [];
        $scope.total.debit =0;
        $scope.total.credit=0;

        $scope.total.debit_f =0;
        $scope.total.credit_f =0;
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
                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,notes,amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'D\',\''+user.notes+'\','+user.debit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }
                else if (user.credit>0){
                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,notes,amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'C\',\''+user.notes+'\','+user.credit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_gl_journal where id='+user.p_id)
            }
            else if(!user.isNew){
				console.log('user')
				console.log(user)
				/*for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri._id+$scope.itemsOri[j].account_id+$scope.itemsOri[j].debit+$scope.itemsOri[j].credit+$scope.itemsOri[i].notes
                        var d2 = user.pid+user.account_id+user.debit+user.credit+user.notes
                        if(d1 != d2){*/
							//console.log(user)
                            sqlitem.push('update acc_gl_journal set '+
                            ' account_id = '+user.account_id+',' +
                            ' notes = \''+user.notes+'\','+
                            ' transc_type = \''+(user.debit>0?'D':'C')+'\',' +
                            ' amount = '+(user.debit>0?user.debit:user.credit)+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
                        /*}
                    }
                }*/
            }
            $scope.total.debit += (!isNaN(parseInt(user.debit))?parseInt(user.debit):0)
            $scope.total.credit += (!isNaN(parseInt(user.credit))?parseInt(user.credit):0)
            $scope.total.debit_f += (user.transc_type=='D'?(parseInt(user.debit)/$scope.ap.exchange):0)
            $scope.total.credit_f += (user.transc_type=='C'?(parseInt(user.credit)/$scope.ap.exchange):0)
        }
		console.log(sqlitem)
        return sqlitem
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
        //console.log(e,d,p,t)
        if (t=='notes') $scope.items[d-1].notes = p
        if (t=='debit_f') {
            $scope.items[d-1].debit_f = p
            $scope.items[d-1].debit = (parseInt(p)*$scope.ap.exchange)
        }
        if (t=='credit_f') {
            $scope.items[d-1].credit_f = p
            $scope.items[d-1].credit = (parseInt(p)*$scope.ap.exchange)
        }
        if (t=='debit') $scope.items[d-1].debit = p
        if (t=='credit') $scope.items[d-1].credit = p
        $scope.items[d-1].balance = ($scope.items[d-1].debit-$scope.items[d-1].credit)
        $scope.total.debit = 0
        $scope.total.credit = 0
        $scope.total.debit_f = 0
        $scope.total.credit_f = 0
        //$scope.total_balance = 0
        for (var i=0;i<$scope.items.length;i++){
            if (!$scope.items[i].isDeleted){
                $scope.total.debit_f += (parseInt($scope.items[i].debit_f).toString()=='NaN'?0:parseInt($scope.items[i].debit_f))
                $scope.total.credit_f += (parseInt($scope.items[i].credit_f).toString()=='NaN'?0:parseInt($scope.items[i].credit_f))
                $scope.total.debit += (parseInt($scope.items[i].debit).toString()=='NaN'?0:parseInt($scope.items[i].debit))
                $scope.total.credit += (parseInt($scope.items[i].credit).toString()=='NaN'?0:parseInt($scope.items[i].credit))

            }
            //$scope.total_balance += (parseInt($scope.items[i].balance).toString()=='NaN'?0:parseInt($scope.items[i].balance))
        }
        /*$('#totalDebitF').html($scope.total.debit_f)
        $('#totalCreditF').html($scope.total.credit_f)
        $('#totalDebit').html($scope.total.debit)
        $('#totalCredit').html($scope.total.credit)*/
    }

});
