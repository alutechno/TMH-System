
var userController = angular.module('app', []);
userController
.controller('FinApVoucherCtrl',
function($scope, $state, $sce, $templateCache, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.printMode =  false;
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
    $scope.child = {}
    $scope.updateState = false;
    $scope.total = {
        debit: 0,
        credit:0
    }
    $scope.totaldebit = 0
    $scope.totalkredit = 0
	$scope.disableAction = false;
    var qstring = 'select a.id, a.inv_no,a.code, DATE_FORMAT(a.open_date,\'%Y-%m-%d\')open_date, DATE_FORMAT(a.due_date,\'%Y-%m-%d\')due_date,DATE_FORMAT(a.due_date,\'%Y-%m-%d\') as due, a.status, a.supplier_id, '+
        'c.name supplier_name, a.source, b.code as receive_no, d.name status_name,a.currency_exchange exchange, '+
        'a.receive_id, a.currency_id, a.total_amount, format(a.total_amount,0)ta, a.home_total_amount,format(a.deposit_amount,0)deposit_amount,a.deposit_amount tda,format(a.total_due_amount,0)tde,format(a.paid_amount,0)hpa,a.paid_amount,format(a.current_due_amount,0)hcda,format(a.home_total_amount,0)hta,a.voucher_notes, '+
        'a.current_due_amount,e.name currency_name,e.code currency_code,f.name created_by_name,DATE_FORMAT(a.created_date,\'%Y-%m-%d\')created_date, '+
        'g.previous_amount adjustment_prev_amount,g.adjusted_amount adjustment_idr, 0 adjustment_home,a.is_adjusted,a.faktur_no '+
        'from acc_ap_voucher a  '+
        'left join inv_po_receive b on a.receive_id = b.id  '+
        'left join mst_supplier c on a.supplier_id = c.id  '+
        'left join (select * from table_ref where table_name = \'acc_ap_voucher\' '+
             ' and column_name = \'status\') d on a.status = d.value '+
        'left join ref_currency e on a.currency_id=e.id '+
        'left join user f on a.created_by = f.id '+
        'left join acc_voucher_adjust g on a.id = g.voucher_id '
        //'where a.status in (:status1,:status2,:status3)  '+
        //'and a.open_date beetween :date1 and :date2  '+
        //'and a.due_date between :date1and :date2'
    var qwhere = ''
    var year = ['2015','2016','2017','2018','2019']
    var month = ['01','02','03','04','05','06','07','08','09','10','11','12']
    $scope.period = [
        { id: 0, name: 'Current Month'},
        { id: 1, name: 'Last Month'}
    ]

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
        code: '',
        notes: '',
        source: '',
        source_no: '',
        status: '',
        open_date: '',
        due_date: '',
        supplier: '',
        notes: '',
        total_home: '',
        total_idr: '',
        deposit: '',
        deposit_home: '',
        deposit_idr: '',
        tax: '',
        tax_home: '',
        tax_idr: '',
        total_due_home: '',
        total_due_idr: '',
        payment_home: '',
        payment_idr: '',
        current_due_home: '',
        current_due_idr: '',
        currency: '',
        exchange: '',
        adjustment_idr: '',
        adjustment_home: '',
        is_adjusted: '',
		gl_id: ''
    }

    $scope.selected = {
        status: {},
        startperiod: {},
        endperiod : {},
        period: {},
        supplier: {},
        currency: {},
        deposit: {},
        source: {},
        source_no: {},
        filter_status: [],
        filter_due_date: '',
        filter_month: {},
        filter_year: {},
        filter_supplier: {},
        deposit: 0,
        taxStat: 0
    }

    $scope.selected.period = $scope.period[0]
    /*$scope.status = [
        {id: 0, name: 'Open'},
        {id: 1, name: 'Prepare'},
        {id: 2, name: 'Close'}
    ]*/

    $scope.status = []
    $scope.statusShow = []
    queryService.get('select value id, value, name from table_ref where table_name = \'acc_ap_voucher\' and column_name = \'status\' order by id ',undefined)
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

    $scope.sourceOri = []
    $scope.source = []
    queryService.get('select value id, value, name from table_ref where table_name = \'acc_ap_voucher\' and column_name = \'source\' and value in(\'MT\',\'RR\') order by id ',undefined)
    .then(function(data){
        $scope.source = data.data
        $scope.sourceOri = data.data

    })
    $scope.deposit = []

    /*$scope.source = [
        {id:0,code:'R',name:'Receiving'},
        {id:1,code:'O',name:'Other Source'}
    ]*/
    /*queryService.get('select value id,name from table_ref where table_name = \'acc_ap_voucher\' and column_name = \'source\' order by name asc',undefined)
    .then(function(data){
        $scope.source = data.data
    })*/
    $scope.currency = []
    queryService.get('select  id currency_id,code currency_code,name currency_name,home_currency_exchange from ref_currency order by id asc',undefined)
    .then(function(data){
        $scope.currency = data.data
        $scope.selected.currency['selected'] = $scope.currency[0]
        $scope.ap.exchange = $scope.currency[0].home_currency_exchange
        //console.log('curr',$scope.currency[0])
        //console.log('curr2',$scope.selected.currency)
    })

    $scope.tax = []
    queryService.get('select  id ,code ,name ,account_id from mst_taxes where status=\'1\' order by id asc',undefined)
    .then(function(data){
        $scope.tax = data.data
    })

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



    $scope.filterVal = {
        search: ''
    }

    $scope.isReceiving = true
    $scope.supplier = []
    queryService.post('select id supplier_id,name supplier_name from mst_supplier order by name limit 50',undefined)
    .then(function(data){
        $scope.supplier = data.data
    })
    $scope.findSupplier = function(text){
        queryService.post('select id supplier_id, name supplier_name from mst_supplier where lower(name) like \'%'+text.toLowerCase()+'%\' order by name asc limit 50',undefined)
        .then(function(data){
            $scope.supplier = data.data
        })
    }
    $scope.source_no = []
    $scope.setSource = function(e,stat){
        $scope.ap.source=$scope.selected.source.selected.id
        if (e.value == 'RR') {
            $scope.isReceiving = false
            queryService.post("select a.id,a.code,cast(concat('Amount: ',ifnull(format(total_amount,0),' - ')) as char) total_amount,cast(concat('Supplier: ',b.name) as char) sname "+
                "from inv_po_receive a,mst_supplier b, inv_purchase_order c  "+
                "where c.supplier_id=b.id  "+
                "and a.po_id = c.id "+
                "order by id desc limit 50",undefined)
            .then(function(data){
                $scope.source_no = data.data
                //$scope.isReceiving = false
            })
        }
        else {
            queryService.post('select id supplier_id,name supplier_name from mst_supplier order by name limit 50',undefined)
            .then(function(data){
                $scope.supplier = data.data
            })
            $scope.isReceiving = true
        }
        if (!$scope.updateState){
            $scope.ap = {
                id: '',
                code: '',
                notes: '',
                source: '',
                source_no: '',
                status: '',
                open_date: '',
                due_date: '',
                supplier: '',
                notes: '',
                total_home: '',
                total_idr: '',
                deposit: '',
                deposit_home: '',
                deposit_idr: '',
                tax: '',
                tax_home: '',
                tax_idr: '',
                total_due_home: '',
                total_due_idr: '',
                payment_home: '',
                payment_idr: '',
                current_due_home: '',
                current_due_idr: '',
                currency: '',
                exchange: ''
            }
            $scope.selected.supplier = {}
            $scope.selected.status['selected'] = $scope.status[0]
            $scope.selected.currency['selected'] = $scope.currency[0]
            $scope.ap.exchange = $scope.currency[0].home_currency_exchange

        }

        //$scope.statusShow.push($scope.status[0])
        if (stat!='update'){
            /*var dt = new Date()
            var ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
			queryService.post('select curr_document_no(\'AP/'+$scope.selected.source.selected.value+'/\',\''+$scope.ym+'\') as code',undefined)
            .then(function(data){
                $scope.ap.code = data.data[0].code
            })*/
			queryService.post('select curr_item_code(\'AP\',concat("AP/MT",date_format(curdate(),"%y"))) as code',undefined)
			.then(function(data){
				$scope.ap.code = data.data[0].code
			})
        }
    }

    $scope.showAdvance = false
    $scope.openAdvancedFilter = function(val){
        $scope.showAdvance = val
    }

    $scope.setReceiving = function(e){
        $scope.ap.source_no=$scope.selected.source_no.selected.id
        queryService.post('select a.id,a.po_id,c.name,DATE_FORMAT(a.created_date, \'%Y-%m-%d\') created_date,a.currency_id,d.due_days,d.supplier_id,e.name supplier_name,f.name currency_name,a.total_amount,a.home_currency_exchange exchange, '+
            ' DATE_FORMAT(DATE_ADD(a.created_date, INTERVAL d.due_days DAY),\'%Y-%m-%d\') due_date '+
            'from inv_po_receive a,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f '+
            'where c.table_name=\'inv_po_receive\' '+
            'and a.received_status=c.value '+
            'and a.po_id=d.id '+
            'and d.supplier_id=e.id '+
            'and a.currency_id=f.id '+
            'and a.id=' + e.id +
            ' order by a.id desc',undefined)
        .then(function(data){
            if (data.data.length>0){
                $scope.supplier = data.data
                $scope.selected.supplier['selected'] = $scope.supplier[0]
                $scope.selected.currency['selected'] = $scope.currency[0]
                $scope.ap.exchange = data.data[0].exchange
                $scope.ap.total_idr = data.data[0].total_amount*data.data[0].exchange
                $scope.ap.total_home = $scope.ap.total_idr
                $scope.ap.open_date = data.data[0].created_date
                //if ($scope.ap.due_date.length==0){
                    $scope.ap.due_date = data.data[0].due_date
                //}
            }

        })

    }

    $scope.findReceiving = function(text){
        queryService.post("select a.id,a.code,cast(concat('Amount: ',ifnull(format(total_amount,0),' - ')) as char) total_amount,cast(concat('Supplier: ',b.name) as char) sname "+
            "from inv_po_receive a,mst_supplier b, inv_purchase_order c  "+
            "where c.supplier_id=b.id  "+
            "and a.po_id = c.id "+
            "where lower(a.code) like '%"+text.toLowerCase()+"%' "+
            "order by id desc limit 50",undefined)
        .then(function(data){
            //$scope.currency = data.data
            $scope.source_no = data.data
        })

    }
    $scope.setSupplier = function(e){
        $scope.ap.supplier_id=$scope.selected.supplier.selected.supplier_id
        queryService.get('select id,code from acc_cash_deposit where supplier_id = '+e.supplier_id+' and status = 1 ',undefined)
        .then(function(data){
            $scope.deposit = data.data
        })
    }

    $scope.setAmt = function(){
        $scope.ap.total_home
        $scope.ap.total_idr
        $scope.ap.deposit_home
        $scope.ap.deposit_idr

        $scope.ap.total_due_home =
            parseInt($scope.ap.total_home) - parseInt($scope.ap.deposit_home)
        $scope.ap.total_due_idr =
            parseInt($scope.ap.total_idr) - parseInt($scope.ap.deposit_idr)
        $scope.ap.current_due_home =
            parseInt($scope.ap.total_amount) - parseInt($scope.ap.tda) - parseInt($scope.ap.paid_amount)
        $scope.ap.current_due_idr =
            parseInt($scope.ap.total_idr) - parseInt($scope.ap.deposit_idr) - parseInt($scope.ap.payment_idr)
    }

    $scope.focusinControl = {};
    $scope.fileName = "AP Voucher";
    $scope.exportExcel = function(){
        queryService.post('select id,code,open_date,due_date,status_name,supplier_name,source,created_date,created_by_name,currency_code,total_amount,home_total_amount from('+qstring + qwhere+')aa order by id desc',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["ID","Code", "Open Date", "Due Date", 'Status','Suppluer', 'Source','Created At','Created By','Currency','Total(IDR)','Total(Foreign Exchange)']);
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
            if ($scope.el.indexOf('buttonAdjust')>-1){
                html+='<button class="btn btn-default" title="Adjustment" ng-click="adjust(cats[\'' + data + '\'])" >' +
                '   <i class="fa fa-undo"></i>' +
                '</button>';
            }
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(cats[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(cats[\'' + data + '\'])" >' +
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
    $scope.sums1 = 0
    $scope.sums2 = 0

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
    $scope.data2 = []
    queryService.post(qstring+qwhere,undefined)
    .then(function(data){
        $scope.data2 = data.data
    });
    queryService.post('select sum(total_amount)as sm,sum(home_total_amount)as sm2 from ('+qstring+qwhere+')a',undefined)
    .then(function(data){
        $scope.sums1 = data.data[0].sm;
        $scope.sums2 = data.data[0].sm2;
    });
    /*.withOption("oTableTools", {
        "sSwfPath": "assets/plugins/jquery-datatable/extensions/TableTools/swf/copy_csv_xls_pdf.swf",
        "aButtons": [{
            "sExtends": "csv",
            "sButtonText": "<i class='pg-grid'></i>",
        }, {
            "sExtends": "xls",
            "sButtonText": "<i class='fa fa-file-excel-o'></i>",
        }, {
            "sExtends": "pdf",
            "sButtonText": "<i class='fa fa-file-pdf-o'></i>",
        }, {
            "sExtends": "copy",
            "sButtonText": "<i class='fa fa-copy'></i>",
        }]
    })
    .withOption("sDom", "<'exportOptions'T><'table-responsive't><'row'<p i>>")*/;

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '8%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Invoice#').withOption('width', '10%'),
        DTColumnBuilder.newColumn('source').withTitle('Src').withOption('width', '5%'),
        DTColumnBuilder.newColumn('receive_no').withTitle('Source No').withOption('width', '10%'),
        DTColumnBuilder.newColumn('open_date').withTitle('Open Date').withOption('width', '8%'),
        DTColumnBuilder.newColumn('due_date').withTitle('Due Date').withOption('width', '7%'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '6%'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier').withOption('width', '12%'),
        DTColumnBuilder.newColumn('faktur_no').withTitle('Faktur No').withOption('width', '8%'),
        DTColumnBuilder.newColumn('currency_code').withTitle('').withOption('width', '5%'),
        DTColumnBuilder.newColumn('tde').withTitle('Inv Amount').withOption('width', '8%').withClass('text-right'),
        DTColumnBuilder.newColumn('ta').withTitle('IDR').withOption('width', '8%').withClass('text-right'),
        DTColumnBuilder.newColumn('deposit_amount').withTitle('Deposit Amount').withOption('width', '8%').withClass('text-right'),
        DTColumnBuilder.newColumn('hpa').withTitle('Paid Amount').withOption('width', '8%').withClass('text-right'),
        DTColumnBuilder.newColumn('hcda').withTitle('Balance Amount').withOption('width', '8%').withClass('text-right'),
        DTColumnBuilder.newColumn('created_date').withTitle('Created at').withOption('width', '8%'),
        DTColumnBuilder.newColumn('created_by_name').withTitle('Created by').withOption('width', '8%'),
        //DTColumnBuilder.newColumn('hta').withTitle('Total(Foreign Currency)').withOption('width', '8%').withClass('text-right')
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
            qwhereobj.due_date = ' a.due_date between \''+s+' 00:00:00\' and \''+d+' 23:59:59\' '
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
        $scope.updateState = false;
        $scope.statusShow.push($scope.status[0])
        $scope.selected.status['selected']=$scope.status[0]
        $scope.source = []
        for (var i=0;i<$scope.sourceOri.length;i++){
            if($scope.sourceOri[i].value=='MT') $scope.source.push($scope.sourceOri[i])
        }
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
		$scope.disableAction = true;
        if ($scope.ap.id.length==0){
            var param = {
                code: $scope.ap.code,
                source:	 $scope.selected.source.selected.id,
            	receive_id: ($scope.selected.source_no.selected?$scope.selected.source_no.selected.id:null),
            	recurring_id: null,
            	status: $scope.selected.status.selected.id,
                open_date: $scope.ap.open_date,
                due_date: $scope.ap.due_date,
                supplier_id: $scope.selected.supplier.selected.supplier_id,
            	voucher_notes: $scope.ap.notes,
            	currency_id: $scope.selected.currency.selected.currency_id,
            	currency_exchange: $scope.ap.exchange,
            	total_amount: $scope.ap.total_idr,
            	home_total_amount: $scope.ap.total_home,
				faktur_no: $scope.ap.faktur_no
            }
			queryService.post('select next_item_code("AP",concat("AP/MT",date_format(curdate(),"%y"))) as code',undefined)
			.then(function(data){
				//$scope.po.code = data.data[0].code
			})
            queryService.post('insert into acc_ap_voucher SET ?',param)
            .then(function (result){
                if ($scope.selected.deposit.selected){
                    var qdeposit = 'insert into acc_deposit_line_item (voucher_id,deposit_id,home_applied_amount,applied_amount)'+
                    'values ('+result.data.insertId+','+$scope.selected.deposit.selected.id+','+$scope.ap.deposit_home+','+$scope.ap.deposit_idr+')';
                    qdeposit += 'update acc_cash_deposit set '+
                    ' home_applied_amount='+$scope.ap.deposit_home+', '
                    ' tot_applied_amount='+$scope.ap.deposit_idr+' '
                    ' where deposit_id='+$scope.selected.deposit.selected.id
                    queryService.post(qdeposit,undefined)
                    .then(function (result2){
                        $('#form-input').modal('hide')
						$scope.disableAction = false;
                        $scope.dtInstance.reloadData(function(obj){
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert '+$scope.ap.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();

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
                else {
                    $('#form-input').modal('hide')
					$scope.disableAction = false;
                    $scope.dtInstance.reloadData(function(obj){
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.ap.code,
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
                source:	 $scope.selected.source.selected.id,
            	receive_id: $scope.selected.source_no.selected.id,
            	recurring_id: null,
            	status: $scope.selected.status.selected.id,
                open_date: $scope.ap.open_date,
                due_date: $scope.ap.due_date,
                supplier_id: $scope.selected.supplier.selected.supplier_id,
            	voucher_notes: $scope.ap.notes,
            	currency_id: $scope.selected.currency.selected.id,
            	currency_exchange: $scope.ap.exchange,
            	total_amount: $scope.ap.total_idr,
            	home_total_amount: $scope.ap.total_home,
				faktur_no: $scope.ap.faktur_no
            }
            //queryService.post('insert into acc_ap_voucher SET ?',param)
            queryService.post('update acc_ap_voucher SET ? WHERE id='+$scope.ap.id ,param)
            .then(function (result){
                if ($scope.selected.status.selected.id=="1"){

					var qq = 'insert into acc_gl_transaction(code,journal_type_id,voucher_id,gl_status,notes,created_by)'+
                        ' values (next_item_code("GL",concat("AP",date_format(curdate(),"%y"))), 1, '+$scope.ap.id+', \'0\', \''+$scope.ap.notes+'\','+$localStorage.currentUser.name.id+') on duplicate KEY UPDATE '+
						'notes=\''+$scope.ap.notes+'\''
                    queryService.post(qq ,undefined)
                    .then(function (result2){
						if(result2.data==undefined)
							var qd = $scope.child.saveTable($scope.ap.gl_id);
						else
                        	var qd = $scope.child.saveTable(result2.data.insertId);
						if(qd.length>0){
						    queryService.post(qd.join(';') ,undefined)
	                        .then(function (result3){
	                                $('#form-input').modal('hide')
									$scope.disableAction = false;
	                                $scope.dtInstance.reloadData(function(obj){

	                                }, false)
	                                $('body').pgNotification({
	                                    style: 'flip',
	                                    message: 'Success Update '+$scope.ap.code,
	                                    position: 'top-right',
	                                    timeout: 2000,
	                                    type: 'success'
	                                }).show();
	                        },
	                        function (err3){
								$scope.disableAction = false;
	                            $('#form-input').pgNotification({
	                                style: 'flip',
	                                message: 'Error Update: '+err3.code,
	                                position: 'top-right',
	                                timeout: 2000,
	                                type: 'danger'
	                            }).show();
	                        })
						}else{
							$('#form-input').modal('hide')
							$scope.disableAction = false;
							$scope.dtInstance.reloadData(function(obj){
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
                    function (err2){
						$scope.disableAction = false;
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Update: '+err2.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                }
                else if($scope.selected.status.selected.id=="2"){
					var qs = 'update acc_ap_voucher set status ='+$scope.selected.status.selected.id+', open_date=\''+$scope.ap.open_date+'\' where id ='+$scope.ap.id+';'+
                    'update acc_gl_transaction set bookkeeping_date=\''+$scope.ap.open_date+'\', gl_status = \'1\',posted_by='+$localStorage.currentUser.name.id+' where voucher_id ='+$scope.ap.id
                    queryService.post(qs ,undefined)
                    .then(function (result3){
                            $('#form-input').modal('hide')
							$scope.disableAction = false;
                            $scope.dtInstance.reloadData(function(obj){

                            }, false)
                            $('body').pgNotification({
                                style: 'flip',
                                message: 'Success Update '+$scope.ap.code,
                                position: 'top-right',
                                timeout: 2000,
                                type: 'success'
                            }).show();
                    },
                    function (err3){
						$scope.disableAction = false;
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Update: '+err3.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                }
                else {
                    $('#form-input').modal('hide')
					$scope.disableAction = false;
                    $scope.dtInstance.reloadData(function(obj){

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
    }
    $scope.saveAdjustment = function(){
		$scope.disableAction = true;
        var param = {
        	voucher_id: $scope.ap.id,
        	adjustment_date: globalFunction.currentDate(),
        	adjustment_status: '0',
        	previous_amount: $scope.ap.total_idr,
        	//home_previous_amount: $scope.ap.total_home,
        	adjusted_amount: $scope.ap.adjustment_idr,
        	//home_adjusted_amount: $scope.ap.adjustment_home
    	}
        var q = "insert into acc_voucher_adjust(voucher_id,adjustment_date,adjustment_status,previous_amount,adjusted_amount) values "+
            "("+$scope.ap.id+",'"+globalFunction.currentDate()+"','0',"+$scope.ap.total_idr+","+$scope.ap.adjustment_idr+")"
        queryService.post(q,undefined)
        .then(function (result2){
			$scope.disableAction = false;
            $('#form-input').modal('hide')
            $scope.dtInstance.reloadData(function(obj){

            }, false)
            $('body').pgNotification({
                style: 'flip',
                message: 'Success Save Adjustment '+$scope.ap.code,
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();

        },
        function (err2){
			$scope.disableAction = false;
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Save Adjustment: '+err2.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }
    $scope.releaseAdjustment = function(){
		$scope.disableAction = true;
        queryService.post("update acc_voucher_adjust set adjustment_status = '1' where voucher_id = "+$scope.ap.id,undefined)
        .then(function (result2){
            var param = {
            	is_adjusted : 'Y',
                home_total_amount: 0,
                total_amount: 0,
            	prev_home_total_amount: $scope.ap.total_home,
                prev_total_amount: $scope.ap.total_idr,
                home_adjustment_amount: $scope.ap.adjustment_home,
            	adjustment_amount: $scope.ap.adjustment_idr
        	}

            queryService.post("update acc_ap_voucher SET ? where id = "+$scope.ap.id,param)
            .then(function (result2){
				$scope.disableAction = false;
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){

                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Release Adjustment '+$scope.ap.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();

            },
            function (err2){
				$scope.disableAction = false;
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Release Adjustment: '+err2.code,
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
                message: 'Error Release Adjustment: '+err2.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.update = function(obj){
        $scope.source = $scope.sourceOri;
        queryService.post(qstring+ ' where a.id='+obj.id,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.updateState = true;
            $scope.adjustState = false;
            $scope.ap = result.data[0]
            $scope.ap.notes = result.data[0].voucher_notes
			$scope.ap.faktur_no = result.data[0].faktur_no
            $scope.ap.due_date = result.data[0].due_date

			//(result.data[0].due==null?'':result.data[0].due)
            $scope.ap.total_home = result.data[0].home_total_amount
            $scope.ap.total_idr = result.data[0].total_amount
            $scope.ap.current_due_home = result.data[0].current_due_amount*result.data[0].exchange
            $scope.ap.current_due_idr = result.data[0].current_due_amount
            for (var i=0;i<$scope.currency.length;i++){
                if ($scope.currency[i].currency_id==result.data[0].currency_id){
                    $scope.selected.currency['selected'] = $scope.currency[i]
                }
            }
            for (var i=0;i<$scope.source.length;i++){
                if ($scope.source[i].id==result.data[0].source){
                    $scope.selected.source['selected'] = $scope.source[i]
                }
            }
            for (var i=0;i<$scope.status.length;i++){
                if ($scope.status[i].id==result.data[0].status){
                    $scope.selected.status['selected'] = $scope.status[i]
                }
            }
            $scope.selected.supplier['selected'] = {
                supplier_id: result.data[0].supplier_id,
                supplier_name: result.data[0].supplier_name
            }
            $scope.setSource({value:result.data[0].source},'update')
            $scope.selected.source_no['selected'] = {
                id: result.data[0].receive_id,
                code: result.data[0].receive_no
            }
            $scope.setReceiving({id:result.data[0].receive_id})
            $scope.statusShow = []
            if (result.data[0].status=="0"){
                $scope.statusShow.push($scope.status[1])
            }
            else if(result.data[0].status=="1"){
                $scope.statusShow.push($scope.status[2])
            }
            $scope.items = []
            $scope.itemsOri = []
            //ERR: REPEAT DUPES
            var qd = 'select b.id,b.gl_id,a.voucher_id, b.account_id, c.name account_name,c.code account_code, b.transc_type, b.amount '+
                  'from acc_gl_transaction a '+
                  'left join acc_gl_journal b on a.id = b.gl_id '+
                  'left join mst_ledger_account c on b.account_id = c.id '+
                 'where a.voucher_id =  '+$scope.ap.id
            queryService.get(qd,undefined)
            .then(function(result2){
                var d = result2.data
                $scope.items = []
                $scope.itemsOri = []
                $scope.total.debit = 0;
                $scope.total.credit = 0;
                for (var i=0;i<d.length;i++){
					console.log(d[i])
					if(d[i].gl_id!=null)
						$scope.ap.gl_id=d[i].gl_id
                    $scope.items.push(
                        {
                            id:(i+1),
                            p_id: d[i].id,
							gl_id: d[i].gl_id,
							notes: d[i].notes,
                            account_id:d[i].account_id,
                            account_code:d[i].account_code,
                            account_name: d[i].account_name,
                            debit: d[i].transc_type=='D'?d[i].amount:'',
                            credit: d[i].transc_type=='C'?d[i].amount:''
                        }
                    )
                    if (d[i].transc_type=='D') $scope.total.debit += d[i].amount
                    else if (d[i].transc_type=='C') $scope.total.credit += d[i].amount
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
        $scope.cat.id = obj.id;
        //$scope.customer.name = obj.name;
        productCategoryService.get(obj.id)
        .then(function(result){
            $scope.cat.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }
    $scope.adjustState = false
    $scope.adjust = function(obj){
        $scope.adjustState = true
        queryService.post(qstring+ ' where a.id='+obj.id,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.updateState = true;
            $scope.ap = result.data[0]
            $scope.ap.notes = result.data[0].voucher_notes
            $scope.ap.due_date = (result.data[0].due==null?'':result.data[0].due)
            $scope.ap.total_home = result.data[0].home_total_amount
            $scope.ap.total_idr = result.data[0].total_amount
            for (var i=0;i<$scope.currency.length;i++){
                if ($scope.currency[i].currency_id==result.data[0].currency_id){
                    $scope.selected.currency['selected'] = $scope.currency[i]
                }
            }
            for (var i=0;i<$scope.source.length;i++){
                if ($scope.source[i].id==result.data[0].source){
                    $scope.selected.source['selected'] = $scope.source[i]
                }
            }
            for (var i=0;i<$scope.status.length;i++){
                if ($scope.status[i].id==result.data[0].status){
                    $scope.selected.status['selected'] = $scope.status[i]
                }
            }
            $scope.selected.supplier['selected'] = {
                supplier_id: result.data[0].supplier_id,
                supplier_name: result.data[0].supplier_name
            }
            $scope.setSource({value:result.data[0].source},'update')
            $scope.selected.source_no['selected'] = {
                id: result.data[0].receive_id,
                code: result.data[0].receive_no
            }
            $scope.setReceiving({id:result.data[0].receive_id})
            $scope.statusShow = []
            if (result.data[0].status=="0"){
                $scope.statusShow.push($scope.status[1])
            }
            else if(result.data[0].status=="1"){
                $scope.statusShow.push($scope.status[2])
            }
            $scope.items = []
            $scope.itemsOri = []
            /*
            ERR: REPEAT DUPES
            var qd = 'select b.id,a.voucher_id, b.account_id, c.name account_name,c.code account_code, b.transc_type, b.amount '+
                  'from acc_gl_transaction a '+
                  'left join acc_gl_journal b on a.id = b.gl_id '+
                  'left join mst_ledger_account c on b.account_id = c.id '+
                 'where a.voucher_id =  '+$scope.ap.id
            queryService.get(qd,undefined)
            .then(function(result2){
                var d = result2.data
                $scope.items = []
                $scope.itemsOri = []
                for (var i=0;i<d.length;i++){
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
                $scope.itemsOri = angular.copy($scope.items)
            },
            function(err2){
                console.log(err2)
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

    $scope.execDelete = function(){
        queryService.post('update ref_product_category set status=2 where id='+$scope.cat.id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){

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
        })
    }

    $scope.clear = function(){
        $scope.ap = {
            id: '',
            code: '',
            notes: '',
            source: '',
            source_no: '',
            status: '',
            open_date: '',
            due_date: '',
            supplier: '',
            notes: '',
            total_home: '',
            total_idr: '',
            deposit: '',
            deposit_home: '',
            deposit_idr: '',
            tax: '',
            tax_home: '',
            tax_idr: '',
            total_due_home: '',
            total_due_idr: '',
            payment_home: '',
            payment_idr: '',
            current_due_home: '',
            current_due_idr: '',
            currency: '',
            exchange: '',
            adjustment_idr: '',
            adjustment_home: '',
            is_adjusted: ''
        }
        $scope.selected = {
            status: {},
            startperiod: {},
            endperiod : {},
            period: {},
            supplier: {},
            currency: {'selected':$scope.currency[0]},
            deposit: {},
            source: {},
            source_no: {},
            filter_status: [],
            filter_due_date: '',
            filter_month: {},
            filter_year: {},
            filter_supplier: {},
            depositStat: 0,
            taxStat: 0
        }
        $scope.ap.exchange = $scope.currency[0].home_currency_exchange
        $scope.selected.period = $scope.period[0]
        $scope.items = []
        $scope.itemsOri = []
    }

})
.controller('EditableTableApvCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
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
			if (user.isNew && !user.isDeleted){
                if (user.debit>0){
                    sqlitem.push('insert into acc_gl_journal (notes,gl_id,account_id,transc_type,amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'D\','+user.debit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                    if ($scope.ap.is_adjusted=='Y'){
                        sqlitem.push('insert into acc_gl_journal (notes,gl_id,account_id,transc_type,amount,created_by,created_date,notes) values('+
                        user.notes+','+pr_id+','+user.account_id+',\'D\','+($scope.ap.adjustment_idr-$scope.ap.total_idr)+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\',\'Adjustment Entries\')')
                    }
                }
                else if (user.credit>0){
                    sqlitem.push('insert into acc_gl_journal (notes,gl_id,account_id,transc_type,amount,created_by,created_date) values('+
                    user.notes+','+pr_id+','+user.account_id+',\'C\','+user.credit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                    if ($scope.ap.is_adjusted=='Y'){
                        sqlitem.push('insert into acc_gl_journal (notes,gl_id,account_id,transc_type,amount,created_by,created_date,notes) values('+
                        user.notes+','+pr_id+','+user.account_id+',\'C\','+($scope.ap.adjustment_idr-$scope.ap.total_idr)+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\',\'Adjustment Entries\')')
                    }
                }
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_gl_journal where id='+user.p_id)
            }
            else if(!user.isNew){
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri._id+$scope.itemsOri[j].account_id+$scope.itemsOri[j].debit+$scope.itemsOri[j].credit
                        var d2 = user.pid+user.account_id+user.debit+user.credit
                        if(d1 != d2){
                            sqlitem.push('update acc_gl_journal set '+
                            ' account_id = '+user.account_id+',' +
							' notes = "'+user.notes+'",' +
                            ' transc_type = \''+(user.debit>0?'D':'C')+'\',' +
                            ' amount = '+(user.debit>0?user.debit:user.credit)+',' +
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

    $scope.accountUp = function(d,text) {
        //queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        queryService.post('select id,code,name from mst_ledger_account where lower(code) like \''+text.toLowerCase()+'%\' order by id limit 10 ',undefined)
        .then(function(data){
            $scope.account[d-1] = data.data
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
        $scope.total.debit = 0
        $scope.total.credit = 0
        if (t=='debit') $scope.items[d-1].debit = p
        if (t=='credit') $scope.items[d-1].credit = p
        for(var i=0;i<$scope.items.length;i++){
            $scope.total.debit += (parseInt($scope.items[i].debit).toString()=='NaN'?0:parseInt($scope.items[i].debit))
            $scope.total.credit += (parseInt($scope.items[i].credit).toString()=='NaN'?0:parseInt($scope.items[i].credit))
        }
    }
	$scope.notes = function(e,d,p){
        $scope.items[d-1].notes = p
    }
});
