
var userController = angular.module('app', []);
userController
.controller('FinApEopCtrl',
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

     //'where a.status = \'3\' '

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
        filter_month: {}
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
    }
    $scope.execProcess = function(){
        console.log('exec')
        var qstr = [
            'update inv_po_receive set received_status = 3, created_date = created_date,modified_date=\''+globalFunction.currentDate()+'\' where created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' and received_status=1 ',
            'update inv_store_request set issued_status = 2, created_date = created_date where created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' and issued_status=1',
            'update inv_stock_opname set status = 3, created_date = created_date where created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' and status=1 ',
            'update inv_credit_to_cost set request_status = 3, created_date = created_date where created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' and request_status=1 '
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
            $scope.nested.reloadReceivingTable()
            $scope.nested.reloadIssuingTable()
            $scope.nested.reloadSoTable()
            $scope.nested.reloadCtcTable()

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

    var qstringdetail ='select a.id,a.code, a.home_currency_exchange,a.check_no, '+
                'DATE_FORMAT(a.open_date,\'%Y-%m-%d\') as open_date, a.status, b.name as \'status_name\', '+
               'a.notes, a.bank_account_id, c.name as \'bank_account\', d.name as \'bank\', '+
               'a.supplier_id, e.name as \'supplier_name\', a.used_currency_id, f.name as \'currency\', '+
               'a.home_deposit_amount, a.home_applied_amount, a.home_balance_amount,  '+
               'a.tot_deposit_amount, a.tot_applied_amount, a.tot_balance_amount, '+
               'format(a.home_deposit_amount,0)hda, format(a.home_applied_amount,0)haa, format(a.home_balance_amount,0)hba,  '+
               'format(a.tot_deposit_amount,0)tda, format(a.tot_applied_amount,0)taa, format(a.tot_balance_amount,0)tba, '+
               'd.id bank_id,d.name bank_name,if(a.used_currency_id=1,\'-\',format(home_deposit_amount,0))hda2, '+
               'DATE_FORMAT(a.issued_date,\'%Y-%m-%d\')issued_date,g.name issued_by_name,DATE_FORMAT(a.created_date,\'%Y-%m-%d\')created_date,h.name created_by_name '+
          'from acc_cash_deposit a '+
          'left join (select value, name from table_ref  '+
                     'where table_name = \'acc_cash_deposit\'  '+
                       'and column_name = \'status\') b on a.status = b.value '+
          'left join mst_cash_bank_account c on a.bank_account_id = c.id '+
          'left join mst_cash_bank d on c.bank_id = d.id '+
          'left join mst_supplier e on a.supplier_id = e.id '+
          'left join ref_currency f on a.used_currency_id = f.id  '+
          'left join user g on a.issued_by=g.id '+
          'left join user h on a.created_by=h.id '
    var qwheredetail = ' where a.open_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
    console.log(qstringdetail+qwheredetail)
    $scope.nested.reloadReceivingTable = function(){
         qwheredetail = ' where a.open_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
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
        DTColumnBuilder.newColumn('open_date').withTitle('Date'),
        DTColumnBuilder.newColumn('supplier_id').withTitle('Supplier ID'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier Name'),
        DTColumnBuilder.newColumn('currency').withTitle('Currency'),
        DTColumnBuilder.newColumn('hda').withTitle('Deposit Amount(IDR)')
    );

})
.controller('issuingCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL,$templateCache,$compile) {
    $scope.details = []
    var qstringdetail ="select a.id,a.deposit_id,a.voucher_id,a.voucher_date,a.applied_amount,format(a.applied_amount,0)am,a.created_date,c.id supplier_id,c.name supplier_name "+
        "from acc_deposit_line_item a, acc_cash_deposit b, mst_supplier c "+
        "where a.deposit_id = b.id "+
        "and b.supplier_id=c.id "
     var qwheredetail = ' and a.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
console.log('issuing:'+qstringdetail+qwheredetail)
    $scope.nested.reloadIssuingTable = function(){
        //qwheredetail = ' where t.supplier_id = '+$scope.id
        //qstringdetail += ' '
        qwheredetail = ' and a.created_date between \''+$scope.filter_period+' 00:00:00\' and \''+$scope.filter_period+' 23:59:59\' ';
        console.log('issuing:'+qstringdetail+qwheredetail)
        $scope.nested.dtIssuingInstance.reloadData()
        queryService.post('select format(sum(applied_amount),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
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
    queryService.post('select format(sum(applied_amount),0)tot from ('+qstringdetail+qwheredetail+')a',undefined)
    .then(function(data){
        $scope.sumIssuing = data.data[0].tot
    })

    $scope.nested.dtIssuingColumns = []
    $scope.nested.dtIssuingColumns.push(
        DTColumnBuilder.newColumn('voucher_id').withTitle('Voucher#'),
        DTColumnBuilder.newColumn('created_date').withTitle('Applied Date'),
        DTColumnBuilder.newColumn('supplier_id').withTitle('Supplier ID'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier Name'),
        DTColumnBuilder.newColumn('am').withTitle('Applied Amount')
    );

})
.controller('soCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL,$templateCache,$compile) {
    $scope.details = []
    var qstringdetail = 'select a.id, a.code, '+
           'DATE_FORMAT(a.open_date,\'%Y-%m-%d\') as open_date, DATE_FORMAT(a.check_due_date,\'%Y-%m-%d\') as check_due_date, '+
           'a.check_no, a.status, e.name as status_name,  '+
           'a.supplier_id, d.name as supplier_name, a.currency_id,  '+
           'f.code as currency_code,f.name as currency_name,a.currency_exchange, a.total_amount, a.home_total_amount, a.bank_account_id, '+
           'format(a.total_amount,0) ta, format(a.home_total_amount,0) hta,'+
           'g.name as bank_account,a.payment_method,h.name payment_method_name,g.bank_id,a.prepare_notes,DATE_FORMAT(a.prepared_date,\'%Y-%m-%d\') prepared_date, '+
           'DATE_FORMAT(a.issued_date,\'%Y-%m-%d\') issued_date,DATE_FORMAT(a.approved_date,\'%Y-%m-%d\') approved_date,DATE_FORMAT(a.created_date,\'%Y-%m-%d\')created_date, '+
           'i.name approved_by_name,j.name prepared_by_name,k.name issued_by_name,l.name created_by_name '+
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
        'where a.payment_method=\'0\' and a.status=3 '
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
        DTColumnBuilder.newColumn('check_due_date').withTitle('Check Due Date'),
        DTColumnBuilder.newColumn('supplier_id').withTitle('Supplier ID'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier Name'),
        DTColumnBuilder.newColumn('currency_code').withTitle('Currency'),
        DTColumnBuilder.newColumn('ta').withTitle('Payment Amount(IDR)')
    );

})
.controller('ctcCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL,$templateCache,$compile) {
    $scope.details = []
    var qstringdetail = 'select a.id, a.code, '+
           'DATE_FORMAT(a.open_date,\'%Y-%m-%d\') as open_date, DATE_FORMAT(a.check_due_date,\'%Y-%m-%d\') as check_due_date, '+
           'a.check_no, a.status, e.name as status_name,  '+
           'a.supplier_id, d.name as supplier_name, a.currency_id,  '+
           'f.code as currency_code,f.name as currency_name,a.currency_exchange, a.total_amount, a.home_total_amount, a.bank_account_id, '+
           'format(a.total_amount,0) ta, format(a.home_total_amount,0) hta,'+
           'g.name as bank_account,a.payment_method,h.name payment_method_name,g.bank_id,a.prepare_notes,DATE_FORMAT(a.prepared_date,\'%Y-%m-%d\') prepared_date, '+
           'DATE_FORMAT(a.issued_date,\'%Y-%m-%d\') issued_date,DATE_FORMAT(a.approved_date,\'%Y-%m-%d\') approved_date,DATE_FORMAT(a.created_date,\'%Y-%m-%d\')created_date, '+
           'i.name approved_by_name,j.name prepared_by_name,k.name issued_by_name,l.name created_by_name '+
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
        'where a.payment_method=\'1\' and a.status=3 '
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
        DTColumnBuilder.newColumn('check_due_date').withTitle('Check Due Date'),
        DTColumnBuilder.newColumn('supplier_id').withTitle('Supplier ID'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier Name'),
        DTColumnBuilder.newColumn('currency_code').withTitle('Currency'),
        DTColumnBuilder.newColumn('ta').withTitle('Payment Amount(IDR)')
    );

})
