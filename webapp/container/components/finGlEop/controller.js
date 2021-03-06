
var userController = angular.module('app', []);
userController
.controller('FinGlEop',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.bbExec = {}
    $scope.totalOpen = 1
    $scope.totalUnbalance = 1

     //'where a.status = \'3\' '
     $scope.changeState = function () {
        //$state.go('app.fin.gltransaction', {stateParamKey: exampleParam});
        $('#modalProcess').modal('hide')
        setTimeout(function(){$state.go('app.fin.gltransaction', {
            currentYear: $scope.selected.current_year.selected.id,status: 'open',

            currentMonth: $scope.selected.current_month.selected.id,
            nextYear: $scope.selected.next_year.selected.id,
            nextMonth: $scope.selected.next_month.selected.id
        });},1000);
        //$state.go('app.fin.gltransaction');

    };

    $scope.setTotal = function(a){
        console.log(a)
        var firstDay = $scope.selected.current_year.selected.id+'-'+$scope.selected.current_month.selected.id+'-01 00:00:00'
        var ld = new Date($scope.selected.current_year.selected.id, parseInt($scope.selected.current_month.selected.id)+1, 0);
        var lastDay = ld.getFullYear()+'-'+ (("0" + (ld.getMonth() + 1)).slice(-2)) + '-'+(("0" + ld.getDate()).slice(-2))+' 23:59:59'

        queryService.post("select count(1)total from acc_gl_transaction where gl_status=0 and bookkeeping_date between '"+firstDay+"' and '"+lastDay+"'",undefined)
        .then(function(data){
            console.log(data)
            $scope.totalOpen = data.data[0].total
        })
    }

    var qwhere = ''

    $scope.users = []
    $scope.sdetail = false

    $scope.role = {
        selected: []
    };

    $scope.deps = {}
    $scope.id = 0;
    $scope.type = '';
    $scope.department = {
        id: '',
        code: '',
        name: '',
        short_name: '',
        description: '',
        status: ''
    }


    $scope.selected = {
        dep: {},
        filter_year: {},
        filter_month: {},
        current_year: {},
        current_month: {},
        next_year: {},
        next_month: {}
    }
    $scope.filter_period = globalFunction.currentDate().split(' ')[0]
    var d = new Date($scope.filter_period);
    d.setDate(d.getDate() + 1)
    $scope.filter_period_plus = d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2)
    //$scope.filter_period_plus = new Date($scope.filter_period)




    $scope.arrActive = [
        {
            id: 1,
            name: 'Yes'
        },
        {
            id: 0,
            name: 'No'
        }
    ]
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
    $scope.period = [
        { id: 0, name: 'Current Month'},
        { id: 1, name: 'Last Month'}
    ]
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

    $scope.setDefaultPeriod = function(){
        var d = new Date();
        $scope.selected.current_year['selected'] = {id:d.getFullYear(),name:d.getFullYear()}
        var m = d.getMonth();
        for (var i=0;i<$scope.listMonth.length;i++){
            if(d.getMonth() == parseInt($scope.listMonth[i].id)){
                $scope.selected.current_month['selected']=  $scope.listMonth[i]
            }
        }
        var nd = addMonths(new Date(),1);
        //nd = nd.setMonth(nd.getMonth() + 1);
        console.log(d)
        console.log(nd)
        $scope.selected.next_year['selected'] = {id:nd.getFullYear(),name:nd.getFullYear()}
        var m = nd.getMonth();
        for (var i=0;i<$scope.listMonth.length;i++){
            if(nd.getMonth() == parseInt($scope.listMonth[i].id)){
                $scope.selected.next_month['selected']=  $scope.listMonth[i]
            }
        }
    }
    function addMonths (date, count) {
        if (date && count) {
            var m, d = (date = new Date(+date)).getDate()

            date.setMonth(date.getMonth() + count, 1)
            m = date.getMonth()
            date.setDate(d)
            if (date.getMonth() !== m) date.setDate(0)
        }
        return date
    }
    $scope.setDefaultPeriod()

    $scope.setPeriod = function(){
        var d = new Date($scope.filter_period);
        d.setDate(d.getDate() + 1)
        $scope.filter_period_plus = d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2)
        $scope.nested.reloadReceivingTable()
        $scope.nested.reloadIssuingTable()
        $scope.nested.reloadSoTable()
        $scope.nested.reloadCtcTable()
    }


    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.nested = {}
    //$scope.nested.reloadReceivingTable()
    $scope.createdRow = function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }
    $scope.createdRow2 = function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' where lower(t.supplier_name) like "%'+$scope.filterVal.search.toLowerCase()+'%"'
                else qwhere = ''
                $scope.nested.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }
        else {
            $scope.nested.dtInstance.reloadData(function(obj){
                console.log(obj)
            }, false)
        }
    }

    /*END AD ServerSide*/

    $scope.processData = function(){
        $('#modalProcess').modal('show')
        $scope.setTotal()
    }
    $scope.execProcess = function(){
        console.log('exec')
        
       var firstDay = $scope.selected.current_year.selected.id+'-'+$scope.selected.current_month.selected.id+'-01 00:00:00'
       var ld = new Date($scope.selected.current_year.selected.id, parseInt($scope.selected.current_month.selected.id)+1, 0);
       var lastDay = ld.getFullYear()+'-'+ (("0" + (ld.getMonth() + 1)).slice(-2)) + '-'+(("0" + ld.getDate()).slice(-2))+' 23:59:59'
       queryService.post("select max(period)prd from acc_trial_balance where period != '"+lastDay.split(' ')[0]+"'",undefined)
       .then(function(data){
           console.log(data)
           var period = data.data[0].period
           var qstr = [
               "delete from acc_trial_balance where period="+lastDay.split(' ')[0],
               "insert into acc_trial_balance (period, account_id, account_no, account_name, account_type_id, account_type, "+
                                                "opening_balance, debit_amount, credit_amount, closing_balance) "+
               "select '"+lastDay.split(' ')[0]+"' as period, "+
                   "a.id account_id, a.code account_no, a.name account_name, "+
                   "a.account_type_id, d.name account_type,  "+
                   "ifnull(b.closing_balance,0) as opening_balance, "+
                   "ifnull(c.debit_amount,0) debit_amount, ifnull(c.credit_amount,0) credit_amount, "+
                   "if(d.saldo_normal='C',(ifnull(b.closing_balance,0) + ifnull(c.credit_amount,0) - ifnull(c.debit_amount,0)),"+
                   "(ifnull(b.closing_balance,0) - ifnull(c.credit_amount,0) + ifnull(c.debit_amount,0))) as closing_balance "+
              "from mst_ledger_account a "+
              "left join (select account_id, closing_balance from acc_trial_balance  "+
                   "where period = '"+period+"') b on b.account_id = a.id "+
              "left join (select y.account_id, "+
                    "sum(case when y.transc_type = 'D' then y.amount else 0 end) debit_amount, "+
                    "sum(case when y.transc_type = 'C' then y.amount else 0 end) credit_amount "+
                           "from acc_gl_transaction x "+
                               "left join acc_gl_journal y on x.id = y.gl_id "+
                              "where x.bookkeeping_date between '"+firstDay.split(' ')[0]+"' and '"+lastDay.split(' ')[0]+"'  "+
                              "group by y.account_id "+
                   ") c on c.account_id = a.id "+
              "left join ref_ledger_account_type d on d.id = a.account_type_id"

           ]
           console.log(qstr.join(';\n'))
           queryService.post(qstr.join(';'),undefined)
           .then(function (result){
               $('body').pgNotification({
                   style: 'flip',
                   message: 'Success Closing ',
                   position: 'top-right',
                   timeout: 2000,
                   type: 'success'
               }).show();
               /*$scope.nested.reloadReceivingTable()
               $scope.nested.reloadIssuingTable()
               $scope.nested.reloadSoTable()
               $scope.nested.reloadCtcTable()*/

           },
           function (err){
               $('#body').pgNotification({
                   style: 'flip',
                   message: 'Error Closing: '+err.code,
                   position: 'top-right',
                   timeout: 2000,
                   type: 'danger'
               }).show();
           })
       })


    }
    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
    }



    $scope.clear = function(){
        $scope.department = {
            id: '',
            code: '',
            name: '',
            short_name: '',
            description: '',
            status: ''
        }
    }

})
.controller('receivingCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL,$templateCache,$compile) {
    console.log('rcv')
    $scope.details = []

    var qstringdetail ='select * from (select aa.*,g.name warehouse_name,h.name cost_center_name from( '+
        'select a.id,a.code,a.po_id,a.received_status status_id,c.name status_name,a.created_date,'+
        'a.currency_id,d.supplier_id,e.name supplier_name,f.code currency_code,format(a.total_amount,0)total_amount,a.total_amount t_amt,a.receive_notes notes,d.warehouse_id,'+
        'd.cost_center_id,d.delivery_date,a.home_currency_exchange '+
        'from inv_po_receive a,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f '+
        'where c.table_name=\'inv_po_receive\'  '+
        'and a.received_status=c.value  '+
        'and a.po_id=d.id  '+
        'and d.supplier_id=e.id  '+
        'and a.currency_id=f.id) as aa '+
        'left join mst_warehouse g on aa.warehouse_id = g.id '+
        'left join mst_cost_center h on aa.cost_center_id = h.id ) z '
    var qwheredetail = ' where z.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
    console.log(qstringdetail+qwheredetail)
    $scope.nested.reloadReceivingTable = function(){
         qwheredetail = ' where z.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
         console.log('rcv:'+qstringdetail+qwheredetail)

        $scope.nested.dtReceivingInstance.reloadData()
        queryService.post('select format(sum(t_amt),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
        .then(function(data){
            $scope.sumReceiving = data.data[0].tot
        })
    }
    $scope.nested.dtReceivingInstance = {}

    $scope.nested.dtReceivingOptions =DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstringdetail + qwheredetail;
        }
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withPaginationType('full_numbers')
    .withOption('order', [0, 'desc'])
    .withDisplayLength(10)
    .withOption('scrollX',true)
    .withOption('createdRow', $scope.createdRow)
    .withOption('footerCallback', function (tfoot, data) {
            if (data.length > 0) {
                // Need to call $apply in order to call the next digest
                $scope.$apply(function () {
                    console.log(data)

                    var footer = $templateCache.get('tableFooterReceiving'),
                            $tfoot = angular.element(tfoot),
                            content = $compile(footer)($scope);
                    $tfoot.html(content)
                });
            }
        });
    queryService.post('select format(sum(t_amt),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
    .then(function(data){
        $scope.sumReceiving = data.data[0].tot
    })
        //$scope.sumReceiving = 100;
    $scope.nested.dtReceivingColumns = []
    $scope.nested.dtReceivingColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('No'),
        DTColumnBuilder.newColumn('code').withTitle('Document'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier'),
        DTColumnBuilder.newColumn('warehouse_name').withTitle('Location'),
        DTColumnBuilder.newColumn('cost_center_name').withTitle('Cost Center'),
        DTColumnBuilder.newColumn('total_amount').withTitle('amount')
    );

})
.controller('issuingCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL,$templateCache,$compile) {
    $scope.details = []
    var qstringdetail = 'select a.id,a.code,a.request_status,c.name request_status_name,a.issued_status,b.name issued_status_name,a.required_date,a.origin_warehouse_id,d.name warehouse_name,a.dest_cost_center_id,e.name cost_center_name,a.request_notes, '+
        ' 0 as total_amount '+
        'from inv_store_request a,(select value,name from table_ref where table_name=\'inv_store_request\' and column_name=\'issued_status\') b, '+
        '(select value,name from table_ref where table_name=\'inv_store_request\' and column_name=\'request_status\') c,mst_warehouse d,mst_cost_center e '+
        'where a.request_status=c.value '+
        'and a.issued_status=b.value '+
        'and a.origin_warehouse_id=d.id '+
        'and a.dest_cost_center_id=e.id '
     var qwheredetail = ' and a.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
console.log('issuing:'+qstringdetail+qwheredetail)
    $scope.nested.reloadIssuingTable = function(){
        //qwheredetail = ' where t.supplier_id = '+$scope.id
        //qstringdetail += ' '
        qwheredetail = ' and a.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
        console.log('issuing:'+qstringdetail+qwheredetail)
        $scope.nested.dtIssuingInstance.reloadData()
        queryService.post('select format(sum(total_amount),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
        .then(function(data){
            $scope.sumIssuing = data.data[0].tot
        })
    }
    $scope.nested.dtIssuingInstance = {}

    $scope.nested.dtIssuingOptions =DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstringdetail+qwheredetail ;
        }
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withPaginationType('full_numbers')
    .withOption('order', [0, 'desc'])
    .withDisplayLength(10)
    .withOption('scrollX',true)
    .withOption('createdRow', $scope.createdRow)
    .withOption('footerCallback', function (tfoot, data) {
            if (data.length > 0) {
                // Need to call $apply in order to call the next digest
                $scope.$apply(function () {
                    console.log(data)

                    var footer = $templateCache.get('tableFooterIssuing'),
                            $tfoot = angular.element(tfoot),
                            content = $compile(footer)($scope);
                    $tfoot.html(content)
                });
            }
        });
    queryService.post('select format(sum(total_amount),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
    .then(function(data){
        $scope.sumIssuing = data.data[0].tot
    })

    $scope.nested.dtIssuingColumns = []
    $scope.nested.dtIssuingColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('No'),
        DTColumnBuilder.newColumn('code').withTitle('Document'),
        DTColumnBuilder.newColumn('issued_status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('cost_center_name').withTitle('cost center'),
        DTColumnBuilder.newColumn('warehouse_name').withTitle('location'),
        DTColumnBuilder.newColumn('total_amount').withTitle('amount')
    );

})
.controller('soCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL,$templateCache,$compile) {
    $scope.details = []
    var qstringdetail = 'select a.id,a.code,a.warehouse_id,a.status,a.total_amount,a.created_date,b.name warehouse_name,c.name status_name '+
        'from inv_stock_opname a,mst_warehouse b, (select value, name from table_ref where table_name = \'inv_stock_opname\' and column_name = \'status\')c '+
        'where a.warehouse_id = b.id '+
        'and a.status = c.value '
     var qwheredetail = ' and a.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
     console.log('so:'+qstringdetail+qwheredetail)
    $scope.nested.reloadSoTable = function(){
        //qwheredetail = ' where t.supplier_id = '+$scope.id
        //qstringdetail += ' '
        qwheredetail = ' and a.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
        console.log('so:'+qstringdetail+qwheredetail)
        $scope.nested.dtSoInstance.reloadData()
        queryService.post('select format(sum(total_amount),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
        .then(function(data){
            console.log(data)
            $scope.sumSo = data.data[0].tot
        })
    }
    $scope.nested.dtSoInstance = {}

    $scope.nested.dtSoOptions =DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstringdetail+qwheredetail ;
        }
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withPaginationType('full_numbers')
    .withOption('order', [0, 'desc'])
    .withDisplayLength(10)
    .withOption('scrollX',true)
    .withOption('createdRow', $scope.createdRow)
    .withOption('footerCallback', function (tfoot, data) {
            if (data.length > 0) {
                // Need to call $apply in order to call the next digest
                $scope.$apply(function () {
                    console.log(data)

                    var footer = $templateCache.get('tableFooterSo'),
                            $tfoot = angular.element(tfoot),
                            content = $compile(footer)($scope);
                    $tfoot.html(content)
                });
            }
        });
    queryService.post('select format(sum(total_amount),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
    .then(function(data){
        console.log(data)
        $scope.sumSo = data.data[0].tot
    })

    $scope.nested.dtSoColumns = []
    $scope.nested.dtSoColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('No'),
        DTColumnBuilder.newColumn('code').withTitle('Document'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('warehouse_name').withTitle('location'),
        DTColumnBuilder.newColumn('total_amount').withTitle('amount')
    );

})
.controller('ctcCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL,$templateCache,$compile) {
    $scope.details = []
    var qstringdetail = 'select a.id,a.code,a.request_status,b.name request_status_name,a.transc_date,a.credit_to_cost_center_id,d.name cost_orig_name,a.debt_to_cost_center_id,e.name cost_dest_name,a.total_amount,a.transc_notes '+
        'from inv_credit_to_cost a,(select value,name from table_ref where table_name=\'inv_credit_to_cost\' and column_name=\'request_status\') b,mst_cost_center d,mst_cost_center e '+
        'where a.request_status=b.value '+
        'and a.credit_to_cost_center_id=d.id '+
        'and a.debt_to_cost_center_id=e.id '
     var qwheredetail = ' and a.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
console.log('ctc:'+qstringdetail+qwheredetail)
    $scope.nested.reloadCtcTable = function(){
        //qwheredetail = ' where t.supplier_id = '+$scope.id
        //qstringdetail += ' '
         qwheredetail = ' and a.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
        console.log('ctc:'+qstringdetail+qwheredetail)
        $scope.nested.dtCtcInstance.reloadData()
        queryService.post('select format(sum(total_amount),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
        .then(function(data){
            console.log(data)
            $scope.sumCtc = data.data[0].tot
        })
    }
    $scope.nested.dtCtcInstance = {}

    $scope.nested.dtCtcOptions =DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstringdetail+qwheredetail ;
        }
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withPaginationType('full_numbers')
    .withOption('order', [0, 'desc'])
    .withDisplayLength(10)
    .withOption('scrollX',true)
    .withOption('createdRow', $scope.createdRow)
    .withOption('footerCallback', function (tfoot, data) {
            if (data.length > 0) {
                // Need to call $apply in order to call the next digest
                $scope.$apply(function () {
                    console.log(data)

                    var footer = $templateCache.get('tableFooterCtc'),
                            $tfoot = angular.element(tfoot),
                            content = $compile(footer)($scope);
                    $tfoot.html(content)
                });
            }
        });
    queryService.post('select format(sum(total_amount),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
    .then(function(data){
        console.log(data)
        $scope.sumCtc = data.data[0].tot
    })

    $scope.nested.dtCtcColumns = []
    $scope.nested.dtCtcColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('No'),
        DTColumnBuilder.newColumn('code').withTitle('Document'),
        DTColumnBuilder.newColumn('request_status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('cost_orig_name').withTitle('Credit'),
        DTColumnBuilder.newColumn('cost_dest_name').withTitle('Debit'),
        DTColumnBuilder.newColumn('total_amount').withTitle('amount')
    );

})
