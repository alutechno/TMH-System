var userController = angular.module('app', []);
userController
.controller('FinApPaymentCtrl',
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
    $scope.total = {
        debit:0,
        credit:0
    }
    $scope.finalStatus = false;
    $scope.totalv = {due:0,payment:0,paid:0,terbilang:''}
    var date = new Date();
	date.setDate(date.getDate());

	/*$('#openDate').datepicker({
	    startDate: date
	});
	$('#dueDate').datepicker({
	    startDate: date
	});
	$('#prepDate').datepicker({
	    startDate: date
	});*/
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
    var qstring = 'select a.id, a.code, '+
           'DATE_FORMAT(a.open_date,\'%Y-%m-%d\') as open_date, DATE_FORMAT(a.check_due_date,\'%Y-%m-%d\') as check_due_date, '+
           'a.check_no, a.status, e.name as status_name,  '+
           'a.supplier_id, d.name as supplier_name, a.currency_id,  '+
           'f.code as currency_code,f.name as currency_name,a.currency_exchange, a.total_amount, a.home_total_amount, a.bank_account_id, '+
           'format(a.total_amount,0) ta, format(a.home_total_amount,0) hta,'+
           'g.name as bank_account,a.payment_method,h.name payment_method_name,g.bank_id,a.prepare_notes,DATE_FORMAT(a.prepared_date,\'%Y-%m-%d\') prepared_date, '+
           'DATE_FORMAT(a.issued_date,\'%Y-%m-%d\') issued_date,DATE_FORMAT(a.approved_date,\'%Y-%m-%d\') approved_date,DATE_FORMAT(a.created_date,\'%Y-%m-%d\')created_date, '+
           'i.name approved_by_name,j.name prepared_by_name,k.name issued_by_name,l.name created_by_name, '+
           'm.id gl_account_id,m.code gl_account_code,m.name gl_account_name, '+
           'n.id ap_clearance_account_id,n.code ap_clearance_account_code,n.name ap_clearance_account_name, '+
           'p.id supplier_account_id,p.code supplier_account_code,p.name supplier_account_name, '+
           'd.address supplier_address, ifnull(d.bank1_name,"-") supplier_bank, '+
           'ifnull(d.bank1_address,"-") supplier_bank_address, ifnull(d.bank1_account_no,"-") supplier_bank_acc_no, '+
           'ifnull(d.bank1_account_owner,"-") supplier_bank_acc_owner, d.code supplier_code, g.bank_account bank_account_no '+
      'from acc_cash_payment a  '+
      'left join mst_supplier d on a.supplier_id = d.id '+
      'left join (select value, name from table_ref '+
                              'where table_name = \'acc_cash_payment\' '+
                                    'and column_name = \'status\') e on a.status = e.value '+
      'left join ref_currency f on a.currency_id = f.id '+
      'left join mst_cash_bank_account g on a.bank_account_id = g.id '+
      'left join (select value, name from table_ref '+
                              'where table_name = \'acc_cash_payment\' '+
                                    'and column_name = \'payment_method\') h on a.payment_method = h.value '+
        'left join user i on a.approved_by=i.id '+
        'left join user j on a.prepared_by=j.id '+
        'left join user k on a.issued_by=k.id '+
        'left join user l on a.created_by=l.id '+
        'left join mst_ledger_account m on g.gl_account_id=m.id '+
        'left join mst_ledger_account n on g.ap_clearance_account_id=n.id '+
        'left join ref_supplier_type o on d.supplier_type_id=o.id '+
        'left join mst_ledger_account p on o.payable_account_id=p.id '+
        'where a.payment_method=\'0\' '
        //'where a.status in (:status1,:status2,:status3)  '+
        //'and a.open_date beetween :date1 and :date2  '+
        //'and a.due_date between :date1and :date2'
    var qwhere = ''
    /*var qstringt = 'select a.id,a.code, '+
              'from acc_ap_voucher a '+
              'inner join acc_payment_line_item b on a.id = b.voucher_id '*/
  var qstringt ='select c.id,a.id voucher_id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name, '+
    'format(a.total_amount,0)ta,format(a.home_total_amount,0)hta,a.paid_amount,ifnull(c.payment_amount,0)payment_amount, d.code rr_no, replace(ifnull(a.faktur_no,a.inv_no),\'null\',\'-\') faktur_no '+
      'from acc_ap_voucher a left join inv_po_receive d on d.id = a.receive_id,(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
      	'and column_name = \'status\')b, acc_payment_line_item c '+
      'where a.status=b.value '+
      'and a.id=c.voucher_id '
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
        filter_supplier: {},
        filter_notes: '',
        filter_check_no: ''
    }
    $scope.selected.period = $scope.period[0]
    $scope.status = [
        {id: 0, name: 'Open'},
        {id: 1, name: 'Prepare'},
        {id: 2, name: 'Close'}
    ]

    $scope.status = []
    $scope.statusShow = []
    queryService.get('select value id, value, name from table_ref where table_name = \'acc_cash_payment\' and column_name = \'status\' order by id ',undefined)
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
    $scope.bank_account = []
    $scope.setBankAccount = function(e){
        queryService.get("select a.id,a.code,a.name, a.gl_account_id,b.code gl_account_code,b.name gl_account_name, "+
        	"a.ap_clearance_account_id,c.code ap_clearance_account_code,c.name ap_clearance_account_name, a.bank_account bank_account_no "+
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
    $scope.setStatus = function(){
        console.log('setStatus0',$scope.selected.status.selected,$scope.items)
        if ($scope.selected.status.selected.id==3){

            if ($scope.items.length==0){
                if ($scope.selected.supplier.selected){
                    console.log('setStatus',$scope.selected.supplier.selected)
                    $scope.items.push(
                        {
                            id:2,
                            account_id:$scope.selected.supplier.selected.supplier_account_id,
                            account_code:$scope.selected.supplier.selected.supplier_account_code,
                            account_name: $scope.selected.supplier.selected.supplier_account_name,
                            notes: $scope.ap.notes,
                            debit: $scope.totalv.payment,
                            credit: '',
                            debit_f: $scope.totalv.payment,
                            credit_f: '',
                            balance: '',
                            isNew: true
                        }
                    )
                }
                console.log('setStatus2',$scope.selected.bank_account.selected)
                $scope.items.push(
                    {
                        id:1,
                        //account_id:$scope.selected.bank_account.selected.ap_clearance_account_id,
                        //account_code:$scope.selected.bank_account.selected.ap_clearance_account_code,
                        //account_name: $scope.selected.bank_account.selected.ap_clearance_account_name,
                        account_id:$scope.selected.bank_account.selected.gl_account_id,
                        account_code:$scope.selected.bank_account.selected.gl_account_code,
                        account_name: $scope.selected.bank_account.selected.gl_account_name,
                        notes: $scope.ap.notes,
                        debit: '',
                        credit: $scope.totalv.payment,
                        debit_f: '',
                        credit_f: $scope.totalv.payment,
                        balance: '',
                        isNew: true
                    }
                )

            }


        }
        /*else if ($scope.selected.status.selected.id==3){
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



        }*/
    }
    $scope.currency = []
    queryService.get('select  id currency_id,code currency_code,name currency_name,home_currency_exchange exchange from ref_currency order by id asc',undefined)
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




    $scope.filterVal = {
        search: ''
    }

    $scope.isReceiving = true
    $scope.supplier = []
    queryService.post("select a.id supplier_id,a.name supplier_name,c.id supplier_account_id,c.code supplier_account_code,c.name supplier_account_name, "+
        "a.address supplier_address, a.bank1_name supplier_bank, a.bank1_account_no supplier_bank_acc_no, a.bank1_address supplier_bank_address "+
        "from mst_supplier a, ref_supplier_type b, mst_ledger_account c "+
        "where a.supplier_type_id = b.id "+
        "and b.payable_account_id = c.id "+
        "and a.status='1' order by a.name limit 50",undefined)
    .then(function(data){
        $scope.supplier = data.data
        console.log("$scope.supplier",$scope.supplier);
    })
    $scope.findSupplier = function(text){
        queryService.post("select a.id supplier_id,a.name supplier_name,c.id supplier_account_id,c.code supplier_account_code,c.name supplier_account_name, "+
            "a.address supplier_address, a.bank1_name supplier_bank, a.bank1_account_no supplier_bank_acc_no, a.bank1_address supplier_bank_address "+
            "from mst_supplier a, ref_supplier_type b, mst_ledger_account c "+
            "where a.supplier_type_id = b.id "+
            "and b.payable_account_id = c.id "+
            "and a.status='1' and lower(a.name) like '%"+text.toLowerCase()+"%' order by a.name asc limit 50",undefined)
        .then(function(data){
            $scope.supplier = data.data;
            console.log("$scope.supplier",$scope.supplier);
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
            queryService.post(
                'select a.id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name,paid_amount,current_due_amount,concat(\'Faktur:\',a.faktur_no)ff,concat(\'RR Number: \',y.code)rr  '+
                        'from acc_ap_voucher a '+
                        'left join inv_po_receive y on a.receive_id = y.id,'+
                        '(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
                	'and column_name = \'status\')b '+
                'where a.status=b.value '+
                'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
                ' and current_due_amount>0 '+
                'order by id ',undefined)
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
    $scope.fileName = "AP Payment";
    $scope.exportExcel = function(){
        queryService.post('select id,code,check_no,open_date,check_due_date,status_name,supplier_name,bank_account,currency_code,total_amount,home_total_amount,approved_date,approved_by_name,prepared_date,prepared_by_name,issued_date,issued_by_name,created_date,created_by_name from('+qstring + qwhere+')aa order by id desc',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["ID","Doc No", 'Check No',"Open Date",'Due Date', 'Status','Supplier', 'Bank Account','Currency',
                'Total Amount (IDR)','Total Amount','Approved Date','Approved By','Prepared Date','Prepared By',
                'Issued Date','Issued By','Created Date','Created By']);
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
			$scope.data=data;
			// Need to call $apply in order to call the next digest
            $scope.$apply(function () {
                var footer = $templateCache.get('tableFooter'),
                        $tfoot = angular.element(tfoot),
                        content = $compile(footer)($scope);
                $tfoot.html(content)
            });
        }
    });

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '3%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('Transc No').withOption('width', '5%'),
        DTColumnBuilder.newColumn('code').withTitle('Doc No').withOption('width', '5%'),
        DTColumnBuilder.newColumn('check_no').withTitle('Check No').withOption('width', '6%'),
        DTColumnBuilder.newColumn('open_date').withTitle('Open Date').withOption('width', '4%'),
        DTColumnBuilder.newColumn('check_due_date').withTitle('Due Date').withOption('width', '4%'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '3%'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier').withOption('width', '9%'),
        //DTColumnBuilder.newColumn('age').withTitle('Age'),
        DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account').withOption('width', '7%'),
        DTColumnBuilder.newColumn('currency_code').withTitle('Currency').withOption('width', '4%'),
        DTColumnBuilder.newColumn('hta').withTitle('Payment Amount').withOption('width', '5%').withClass('text-right'),
        DTColumnBuilder.newColumn('approved_date').withTitle('Approved Date').withOption('width', '5%'),
        DTColumnBuilder.newColumn('approved_by_name').withTitle('Approved By').withOption('width', '4%'),
        DTColumnBuilder.newColumn('prepared_date').withTitle('Prepared Date').withOption('width', '5%'),
        DTColumnBuilder.newColumn('prepared_by_name').withTitle('Prepared By').withOption('width', '5%'),
        DTColumnBuilder.newColumn('issued_date').withTitle('Issued Date').withOption('width', '5%'),
        DTColumnBuilder.newColumn('issued_by_name').withTitle('Issued By').withOption('width', '5%'),
        DTColumnBuilder.newColumn('created_date').withTitle('Created Date').withOption('width', '5%'),
        DTColumnBuilder.newColumn('created_by_name').withTitle('Created By').withOption('width', '5%')
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
        supplier: '',
        notes: '',
        check_no: ''
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
        qwhereobj = {
            text: '',
            status: '',
            due_date: '',
            period: '',
            supplier: '',
            notes: '',
            check_no: ''
        }
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
        if ($scope.selected.filter_notes.length>0){
            qwhereobj.notes = ' lower(a.prepare_notes) like \'%'+$scope.selected.filter_notes.toLowerCase()+'%\' '
        }
        if ($scope.selected.filter_check_no.length>0){
            qwhereobj.check_no = ' lower(a.check_no) like \'%'+$scope.selected.filter_check_no.toLowerCase()+'%\' '
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
            strWhere = ' and ' + arrWhere.join(' and ')
        }
        return strWhere
    }

    /*END AD ServerSide*/

    $scope.openQuickView = function(state){
        $scope.clear();
        $scope.finalStatus = false;
        $scope.statusShow.push($scope.status[0])
        $scope.selected.status['selected'] = $scope.status[0]
        $('#form-input').modal('show');
        $('#tab-fillup1').show();
        $('#tab-fillup2').hide();

        //var dt = new Date()
        //var ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
        //queryService.post('select cast(concat(\'PMT/\',date_format(date(now()),\'%Y/%m/%d\'), \'/\', lpad(seq(\'PMT\',\''+ym+'\'),4,\'0\')) as char) as code ',undefined)
		//queryService.post('select curr_document_no(\'PMT\',\''+$scope.ym+'\') as code',undefined)
		queryService.post('select curr_item_code("AP",concat("PMT",date_format(curdate(),"%y"))) as code',undefined)
        .then(function(data){
            $scope.ap.code = data.data[0].code
        })
    }
    $scope.setIdr = function(a,b){
        $scope.ap[b] = parseFloat($scope.ap[a]*$scope.ap.exchange)
        $scope.ap.balance_home = $scope.ap.deposit_home-$scope.ap.applied_home
        $scope.ap.balance_idr = $scope.ap.deposit_idr-$scope.ap.applied_idr
    }
    $scope.updateVoucher= function(){
        console.log('updateVoucher')
        var vcr_id = [],sqlv = []
        for(var i=0; i<$scope.trans.length;i++){
            console.log($scope.trans[i])
            vcr_id.push($scope.trans[i].p_id)
        }
        queryService.post("select voucher_id, sum(payment_amount)payment_amount "+
            "from acc_payment_line_item "+
            "where voucher_id in("+vcr_id.join(',')+") "+
            "group by voucher_id",undefined)
        .then(function(data){
            console.log(data)
            for (var i=0;i<data.data.length;i++){
                sqlv.push('update acc_ap_voucher set paid_amount=ifnull(paid_amount,0)+'+data.data[i].payment_amount+', current_due_amount=ifnull(current_due_amount,0)-total_amount-'+data.data[i].payment_amount+' where id='+data.data[i].voucher_id)
            }
            console.log(sqlv)
            queryService.post(sqlv.join(';'),undefined)
            .then(function(data2){
                console.log(data2)

            })
        })
    }

    $scope.submit = function(){
		$scope.disableAction = true;
        if ($scope.ap.id.length==0){
            //exec creation
            var total_amount = 0
            var home_total_amount = 0
            for (var i=0;i<$scope.trans.length;i++){
                //total_amount += $scope.trans[i].total_amount
                //home_total_amount += $scope.trans[i].home_total_amount
                total_amount += $scope.trans[i].payment_amount
                home_total_amount += ($scope.trans[i].payment_amount*$scope.ap.exchange)
            }
            queryService.post('select next_item_code("AP",concat("PMT",date_format(curdate(),"%y"))) as code',undefined)
            .then(function(data){
                $scope.ap.code = data.data[0].code
                console.log('apcode',$scope.ap.code)
                var param = {
                    code: $scope.ap.code,
                	check_no: $scope.ap.check,
                	bank_account_id: $scope.selected.bank_account.selected.id,
                    payment_method: 0,
                	status: $scope.selected.status.selected.id,
                	open_date: $scope.ap.open_date,
                    check_due_date: $scope.ap.due_date,
                	prepared_date:$scope.ap.prepared_date,
                	supplier_id: $scope.selected.supplier.selected.supplier_id,
                	prepare_notes: $scope.ap.notes,
                	currency_id: $scope.selected.currency.selected.currency_id,
                	currency_exchange: $scope.ap.exchange,
                	total_amount: total_amount,
                	home_total_amount: home_total_amount,
                	created_by: $localStorage.currentUser.name.id,
                    created_date: globalFunction.currentDate()
                }

                queryService.post('insert into acc_cash_payment SET ?',param)
                .then(function (result){
    				//queryService.post('select next_document_no(\'PMT\',\''+$scope.ym+'\')',undefined)
    				var qstr = $scope.child.saveTableT(result.data.insertId)
                    queryService.post(qstr.join(';'),undefined)
                    .then(function (result2){
    					$scope.disableAction = false;
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
            })


        }
        else {
            //exec update
            var total_amount = 0
            var home_total_amount = 0
            for (var i=0;i<$scope.trans.length;i++){
                total_amount += $scope.trans[i].payment_amount
                home_total_amount += ($scope.trans[i].payment_amount*$scope.ap.exchange)
            }
            var param = {
                code: $scope.ap.code,
            	check_no: $scope.ap.check,
            	bank_account_id: $scope.selected.bank_account.selected.id,
                payment_method: 0,
            	status: $scope.selected.status.selected.id,
            	open_date: $scope.ap.open_date,
                check_due_date: $scope.ap.due_date,
            	prepared_date:$scope.ap.prepared_date,
            	supplier_id: $scope.selected.supplier.selected.supplier_id,
            	prepare_notes: $scope.ap.notes,
            	currency_id: $scope.selected.currency.selected.currency_id,
            	currency_exchange: $scope.ap.exchange,
            	total_amount: total_amount,
            	home_total_amount: home_total_amount,
            	created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
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

                if ($scope.selected.status.selected.id=='3'){
                    $scope.updateVoucher();
                    $scope.insertBankBook();
                    queryService.get('select id from acc_gl_transaction where payment_id= '+$scope.ap.id,undefined)
                    .then(function(data){
                        var qq = ''
                        if(data.data.length==0){
                            qq = 'insert into acc_gl_transaction(gl_status,bookkeeping_date,code,payment_id,journal_type_id,notes,posted_by,posting_date,created_by) '+
                             'values(1,\''+$scope.ap.open_date+'\',\''+$scope.ap.code+'\','+$scope.ap.id+',18,\''+$scope.ap.notes+'\','+$localStorage.currentUser.name.id+',curdate(),'+$localStorage.currentUser.name.id+');'
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
                else if($scope.selected.status.selected.id=='3'){
                    var qq = 'update acc_gl_transaction set '+
                        //'bookkeeping_date = \''+$scope.ap.open_date+'\', '+
                        //'code = \''+$scope.ap.code+'\', '+
                        //'journal_type_id = '+$scope.journal_type_id+','+
                        //'notes = \''+$scope.ap.notes+'\', '+
                        'gl_status = 1, '+
                        'modified_by='+$localStorage.currentUser.name.id+','+
                        'modified_date=curdate() '+
                        'where payment_id='+$scope.ap.id
                    queryService.post(qq ,undefined)
                    .then(function(result){
                        queryService.post('select id from acc_gl_transaction where payment_id='+$scope.ap.id ,undefined)
                        .then(function (result2){
                            $scope.updateVoucher();
                            var v_gl_id = result2.data[0].id
                            var q2 = $scope.child.saveTable(v_gl_id)
                            if (q2.length>0){
                                console.log('payment',q2)
                                queryService.post(q2.join(';') ,undefined)
                                .then(function (result3){
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
                                    $scope.clear();
                                },
                                function(err3){
                                    $scope.disableAction = false;
                                    console.log(err3)
                                })
                            }
                            else {
                                $('#form-input').modal('hide')
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
    						$scope.disableAction = false;
                            console.log(err2)
                        })
                    },
                    function(err){
                        $scope.disableAction = false;
                        console.log(err)
                    })


                }
                else {
					var qstr = $scope.child.saveTableT($scope.ap.id)
					console.log(JSON.stringify(qstr))
	                queryService.post(qstr.join(';'),undefined)
	                .then(function (result2){

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
                        $scope.clear();
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
    $scope.insertBankBook = function(){
        var total_amount = 0
        for (var i=0;i<$scope.trans.length;i++){
            //total_amount += $scope.trans[i].payment_amount
            total_amount += ($scope.trans[i].payment_amount*$scope.ap.exchange)
        }

        var param = {
            bank_account_id:$scope.selected.bank_account.selected.id,
            book_date:globalFunction.currentDate(),
            supplier_id:$scope.selected.supplier.selected.supplier_id,
            check_no:$scope.ap.check,
            source_code: $scope.ap.code,
            reference_no:'',
            notes:$scope.ap.notes,
            transc_type:'C',
            total_amount: total_amount,
            created_by:$localStorage.currentUser.name.id
        }
        queryService.post('insert into acc_cash_bank_book SET ?',param)
        .then(function (result){
            console.log('success insert to bank book',result)

        },
        function (err){
            console.log('error insert to bank book',err)
        })
    }

    $scope.updateVoucher = function(){
        var qstr = []
        var ids = []

        for (var i=0;i<$scope.trans.length; i++){
            qstr.push('update acc_ap_voucher set paid_amount=ifnull(paid_amount,0)+'+$scope.trans[i].payment_amount+',current_due_amount=total_amount-(paid_amount) where id='+$scope.trans[i].voucher_id);
            ids.push($scope.trans[i].voucher_id)
        }
        console.log('update acc_ap_voucher',qstr.join(';'))
        queryService.post(qstr.join(';'),undefined)
        .then(function(data){
            queryService.post('select b.id p_id,a.id v_id, a.total_amount, a.paid_amount, b.payment_amount, a.current_due_amount as balance '+
                'from acc_ap_voucher a, acc_payment_line_item b '+
                'where a.id=b.voucher_id  '+
                'and a.id in ('+ids.join(',')+') and b.payment_id='+$scope.ap.id,undefined)
            .then(function(data2){
                var qstr2 = []
                console.log('hasil query',data2)
                for (var i=0;i<data2.data.length;i++){
                    qstr2.push('update acc_payment_line_item set last_current_due_amount='+data2.data[i].balance+' where id='+data2.data[i].p_id)
                }
                console.log('update acc_payment_line_item',qstr2.join(';'))
                queryService.post(qstr2.join(';'),undefined)
                .then(function(data3){
                    console.log('data3status',data3)

                })
            })

        })
    }

    $scope.update = function(obj){
        console.log(qstring+ ' and a.id='+obj.id);
        queryService.post(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.ap = result.data[0]
            $scope.selected.bank['selected']= {
                id: result.data[0].bank_id,
                name: result.data[0].bank_name
            }
            $scope.selected.bank_account['selected'] = {
                id: result.data[0].bank_account_id,
                name: result.data[0].bank_account,
                bank_account_no: result.data[0].bank_account_no,
                gl_account_id: result.data[0].gl_account_id,
                gl_account_code: result.data[0].gl_account_code,
                gl_account_name: result.data[0].gl_account_name,
                ap_clearance_account_id:result.data[0].ap_clearance_account_id,
                ap_clearance_account_code:result.data[0].ap_clearance_account_code,
                ap_clearance_account_name:result.data[0].ap_clearance_account_name
            }
            $scope.selected.supplier['selected'] = {
                supplier_id: result.data[0].supplier_id,
                supplier_name: result.data[0].supplier_name,
                supplier_account_id:result.data[0].supplier_account_id,
                supplier_account_code:result.data[0].supplier_account_code,
                supplier_account_name:result.data[0].supplier_account_name,
                supplier_address:result.data[0].supplier_address,
                supplier_bank:result.data[0].supplier_bank,
                supplier_bank_address:result.data[0].supplier_bank_address,
                supplier_bank_acc_no:result.data[0].supplier_bank_acc_no,
                supplier_bank_acc_owner:result.data[0].supplier_bank_acc_owner,
                supplier_code:result.data[0].supplier_code
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
            $scope.ap.due_date = result.data[0].check_due_date
            $scope.ap.exchange = result.data[0].currency_exchange
            $scope.ap.notes = result.data[0].prepare_notes

            $scope.ap.deposit_home = result.data[0].home_deposit_amount
            $scope.ap.deposit_idr = result.data[0].tot_deposit_amount
            $scope.ap.applied_home = result.data[0].home_applied_amount
            $scope.ap.applied_idr = result.data[0].tot_applied_amount
            $scope.ap.balance_home = result.data[0].home_balance_amount
            $scope.ap.balance_idr = result.data[0].tot_balance_amount
            $scope.statusShow = []
            $scope.finalStatus = false;
            if (result.data[0].status=="0"){
                $scope.statusShow.push($scope.status[1])
            }
            else if(result.data[0].status=="1"){
                $scope.statusShow.push($scope.status[2])
            }
            else if(result.data[0].status=="2"){
                $scope.statusShow.push($scope.status[3])
            }
            else if(result.data[0].status=="3"){
                $scope.finalStatus = true;
            }
            /*else if(result.data[0].status=="3"){
                $scope.statusShow.push($scope.status[4])
            }
            else if(result.data[0].status=="4"){
                $scope.statusShow.push($scope.status[5])
            }*/
            $scope.trans = []
            $scope.transOri = []
			$scope.totalv.payment=0
			$scope.totalv.total=0
			$scope.totalv.current=0
            $scope.totalv.terbilang = ''

            queryService.post(qstringt+ ' and c.payment_id='+obj.id,undefined)
            .then(function(result2){
                var d = result2.data
                for (var i=0;i<d.length;i++){
                    var ii = i+1
                    $scope.trans.push(
                        {
                            id:(ii),
                            p_id: d[i].id,
							voucher_id: d[i].voucher_id,
                            code:d[i].code,
                            faktur_no:d[i].faktur_no,
                            open_date:d[i].open_date,
                            due_date:d[i].due_date,
                            status_id: d[i].status,
                            status_name: d[i].status_name,
                            source: d[i].source,
                            home_total_amount: d[i].current_due_amount,
                            total_amount: d[i].total_amount,
                            paid_amount: d[i].paid_amount,
                            current_due_amount: d[i].current_due_amount,
                            payment_amount: d[i].payment_amount==undefined?0:d[i].payment_amount,
                            faktur_no: d[i].faktur_no
                        }
                    )
                    console.log('transvoucher', $scope.trans)
					$scope.totalv.total+=parseFloat(d[i].total_amount)
					$scope.totalv.current+=parseFloat(d[i].current_due_amount)
		            $scope.totalv.payment += parseFloat(d[i].payment_amount)

                    //$scope.updateVoucher();
                }
                queryService.post('select a.id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,'+
                        'a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name,y.code rr_no,'+
                        'ifnull(paid_amount,0)paid_amount,current_due_amount,concat(\'Faktur:\',a.faktur_no)ff,concat(\'RR Number: \',y.code)rr  '+
                        'from acc_ap_voucher a '+
                        'left join inv_po_receive y on a.receive_id = y.id,'+
                        '(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
                            'and column_name = \'status\')b '+
                        'where a.status=b.value '+
                    'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
                    'and current_due_amount>0 ' +
                    'order by id ',undefined)
                /*queryService.post('select a.id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name,paid_amount,current_due_amount,concat(\'Faktur:\',a.faktur_no)ff,concat(\'RR Number: \',y.code)rr  '+
                        'from acc_ap_voucher a '+
                        'left join inv_po_receive y on a.receive_id = y.id,'+
                        '(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
                        'and column_name = \'status\')b '+
                    'where a.status=b.value '+
                    'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
                    ' and current_due_amount>0 ' +
                    'order by id limit 20 ',undefined)*/
                .then(function(data){
                    for (var i=0;i<$scope.trans.length;i++){
                        $scope.voucher[i+1] = data.data
                    }

                    console.log('vcrList', $scope.voucher[ii])

                })
                $scope.totalv['terbilang'] = globalFunction.terbilang($scope.totalv.payment)

                $scope.transOri = angular.copy($scope.trans)


            },function(err2){
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Failed Fetch Data: '+err2.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
            $scope.items = []
            $scope.itemsOri = []
            var qd = 'select b.id,a.voucher_id, b.account_id, c.name account_name,c.code account_code, b.transc_type, b.amount '+
                  'from acc_gl_transaction a '+
                  'left join acc_gl_journal b on a.id = b.gl_id '+
                  'left join mst_ledger_account c on b.account_id = c.id '+
                 'where a.payment_id =  '+$scope.ap.id
            queryService.get(qd,undefined)
            .then(function(result2){
                var d = result2.data
                for (var i=0;i<d.length;i++){
                    if (d[i].account_id!=null){
                        $scope.items.push(
                            {
                                id:(i+1),
                                p_id: d[i].id,
                                account_id:d[i].account_id,
                                account_code:d[i].account_code,
                                account_name: d[i].account_name,
                                debit: d[i].transc_type=='D'?d[i].amount:'',
                                credit: d[i].transc_type=='C'?d[i].amount:''
                            }
                        )
                    }

                }
                $scope.itemsOri = angular.copy($scope.items)
            },
            function(err2){
                console.log(err2)
            })
            /*queryService.get(qstringg+ ' where b.payment_id='+obj.id,undefined)
            .then(function(result2){
                var d = result2.data
                console.log(d)
                for (var i=0;i<d.length;i++){
                    $scope.trans.push(
                        {
                            id:(i+1),
                            p_id: d[i].id,
                            code:d[i].code,
                            open_date:d[i].open_date,
                            status: d[i].status,
                            source: d[i].source,
                            home_total_amount: d[i].home_total_amount,
                            total_amount: d[i].total_amount
                        }
                    )
                }


            },function(err2){
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Failed Fetch Data: '+err2.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })*/


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
        console.log(obj)
        $scope.ap.id = obj.id;
        $scope.ap.code = obj.code;
        $('#modalDelete').modal('show')


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
    }

    $scope.clear = function(){
        $scope.ap = {
            id: '',
            name: '',
            description: '',
            status: ''
        }
		$scope.trans=[];
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
		$scope.totalv.total=0
		$scope.totalv.current=0
		$scope.totalv.payment=0
        $scope.totalv.terbilang = ''
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
        var filtered = $filter('filter')($scope.trans, {id: id});
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
            faktur_no: '',
            open_date:'',
            due_date: '',
            status: '',
            source: '',
            rr_no: '',
            home_total_amount: '',
            total_amount: '',
            applied_amount: '',
            current_due_amount: '',
            paid_amount: '',
            payment_amount: '',
            isNew: true
        };
        $scope.trans.push($scope.item)
        var temp = [];
        for (var key in $scope.trans){
            if ($scope.trans[key].code) temp.push('\''+$scope.trans[key].code+'\'')
        }
        var qss2='select a.id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,'+
                'a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name,y.code rr_no,'+
                'ifnull(paid_amount,0)paid_amount,current_due_amount,concat(\'Faktur:\',a.faktur_no)ff,concat(\'RR Number: \',y.code)rr  '+
                'from acc_ap_voucher a '+
                'left join inv_po_receive y on a.receive_id = y.id,'+
                '(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
                    'and column_name = \'status\')b '+
                'where a.status=b.value '+
            'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
            'and current_due_amount>0 '
            //'order by id limit 50 '

        var qss = "select a.id,a.code,date_format(a.open_date,'%Y-%m-%d')open_date,date_format(a.due_date,'%Y-%m-%d')due_date, "+
               "a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name,e.code rr_no, "+
               "paid_amount,current_due_amount, d.voucher_id, c.status,concat(\'Faktur:\',a.faktur_no)ff,concat('RR Number: ',e.code)rr  "+
          "from acc_ap_voucher a "+
          "join (select * from table_ref where table_name = 'acc_ap_voucher'  and column_name = 'status')b on b.value = a.status "+
          "left join acc_cash_payment c on c.supplier_id = a.supplier_id "+
          "left join acc_payment_line_item d on d.payment_id = c.id and d.voucher_id = a.id "+
          "left join inv_po_receive e on a.receive_id = e.id "+
         "where a.supplier_id= "+$scope.selected.supplier.selected.supplier_id+
         " and a.current_due_amount>0 "+
          "and d.voucher_id is null";
        /*var qss = "select a.id,a.code,date_format(a.open_date,'%Y-%m-%d')open_date,date_format(a.due_date,'%Y-%m-%d')due_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name,paid_amount,current_due_amount "+
            "from acc_ap_voucher a,(select * from table_ref where table_name = 'acc_ap_voucher'  "+
                "and column_name = 'status')b "+
            "where a.status=b.value "+
            "and supplier_id="+$scope.selected.supplier.selected.supplier_id+
            " and current_due_amount>0 "+
            " and a.id not in(select voucher_id) ";*/
        /*if (temp.length>0) qss2 += " and y.code not in ("+temp.join(',')+") "+
            "order by id limit 20 "*/
            if (temp.length>0) qss2 +=
                "order by id limit 20 "
            console.log('qss',qss)
        queryService.post(qss2,undefined)
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
                sqlitem.push('insert into acc_payment_line_item (payment_id,voucher_id,home_payment_amount,payment_amount,created_by,created_date) values('+
                pr_id+','+user.voucher_id+','+user.payment_amount+','+user.payment_amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
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
                            ' home_payment_amount = '+user.payment_amount+',' +
                            ' payment_amount = '+user.payment_amount+',' +
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
        queryService.post('select a.id,a.code,date_format(a.open_date,\'%Y-%m-%d\')open_date,date_format(a.due_date,\'%Y-%m-%d\')due_date,'+
                'a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name,y.code rr_no,'+
                'ifnull(paid_amount,0)paid_amount,current_due_amount,concat(\'Faktur:\',a.faktur_no)ff,concat(\'RR Number: \',y.code)rr  '+
                'from acc_ap_voucher a '+
                'left join inv_po_receive y on a.receive_id = y.id,'+
                '(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
                    'and column_name = \'status\')b '+
                'where a.status=b.value '+
            'and supplier_id='+$scope.selected.supplier.selected.supplier_id+' '+
            'and (lower(a.code) like \'%'+text.toLowerCase()+'%\' or lower(y.code) like \'%'+text.toLowerCase()+'%\') '+
            'and current_due_amount>0 ' +
            'order by id ',undefined)
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
        console.log(e)
        $scope.trans[d-1].code = e.code
        $scope.trans[d-1].rr_no = e.rr_no
		$scope.trans[d-1].voucher_id = e.id
        $scope.trans[d-1].p_id = e.id
        $scope.trans[d-1].open_date = e.open_date
        $scope.trans[d-1].due_date = e.due_date
        $scope.trans[d-1].status_id = e.status_id
        $scope.trans[d-1].status_name = e.status_name
        $scope.trans[d-1].source = e.source
        $scope.trans[d-1].home_total_amount = e.home_total_amount
        $scope.trans[d-1].total_amount = e.total_amount
        $scope.trans[d-1].current_due_amount = e.current_due_amount
        $scope.trans[d-1].payment_amount = (e.payment_amount?e.payment_amount:e.current_due_amount)
        $scope.totalv.current=0;
        //$scope.totalv.paid=0;
        $scope.totalv.payment=0;
        $scope.totalv.total=0;
        for (var key in $scope.trans){
            console.log('getVoucher',key,$scope.trans[key])
            $scope.totalv.current+=parseFloat($scope.trans[key].current_due_amount)
            //$scope.totalv.paid+=(parseFloat($scope.trans[key].current_due_amount)-parseFloat($scope.trans[key].total_amount))
            $scope.totalv.payment += parseFloat($scope.trans[key].payment_amount)
            $scope.totalv.total += parseFloat($scope.trans[key].total_amount)
        }
        $scope.totalv['terbilang'] = globalFunction.terbilang($scope.totalv.payment)

    }

    $scope.setValue = function(e,d,p){
        $scope.trans[d-1].applied_amount = p
        $scope.ap.applied_home = 0
        for (var i=0;i<$scope.trans.length;i++){
            $scope.ap.applied_home += parseFloat($scope.trans[i].applied_amount)
        }
        $scope.ap.applied_idr = $scope.ap.applied_home*$scope.ap.exchange

    }
    $scope.setPayment = function(e,d,p){
        p=p==undefined?0:p;
        if((parseFloat(p)*($scope.ap.exchange?$scope.ap.exchange:1))>parseFloat($scope.trans[d-1].current_due_amount)){
                $scope.trans[d-1].payment_amount = $scope.trans[d-1].current_due_amount
                p=$scope.trans[d-1].current_due_amount
        } else {
                //$scope.items[d-1].rcv_price = parseFloat(p)
                $scope.trans[d-1].payment_amount = parseFloat(p)*($scope.ap.exchange?$scope.ap.exchange:1)
        }
        //$scope.trans[d-1].payment_amount = parseFloat(p)*($scope.ap.exchange?$scope.ap.exchange:1)
        //$scope.trans[d-1].paid_amount = (parseFloat($scope.trans[d-1].current_due_amount) - parseFloat(p)*($scope.ap.exchange?$scope.ap.exchange:1))
		$scope.totalv.payment=0
		$scope.totalv.current=0
		//$scope.totalv.paid=0
        for (var key in $scope.trans){
            console.log('getVoucher',key,$scope.trans[key])
            $scope.totalv.current+=parseFloat($scope.trans[key].current_due_amount)
            //$scope.totalv.paid+=(parseFloat($scope.trans[key].current_due_amount)-parseFloat($scope.trans[key].total_amount))
            $scope.totalv.payment += parseFloat($scope.trans[key].payment_amount)
        }
        $scope.totalv['terbilang'] = globalFunction.terbilang($scope.totalv.payment)
		/*for (var i=0;i<$scope.trans.length;i++){
			$scope.totalv.due+=parseFloat($scope.trans[i].current_due_amount)
			$scope.totalv.paid+=parseFloat($scope.trans[i].paid_amount)
            $scope.totalv.payment += parseFloat($scope.trans[i].total_amount)
        }*/
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
        if (t=='debit') $scope.items[d-1].debit = p
        if (t=='credit') $scope.items[d-1].credit = p
    }

});
