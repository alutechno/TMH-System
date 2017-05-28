
var userController = angular.module('app', []);
userController
.controller('FinGlBankReconciliationCtrl',
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
    var qstringPayable = 'select a.id,\'payable\' as type,a.bank_account_id, b.name as bank_account, c.name as bank, f.name as currency, '+
           'a.check_no, a.supplier_id, d.name as supplier_name, DATE_FORMAT(a.issued_date,\'%Y-%m-%d\') as issued_date,  '+
           'a.status, e.name as status_name, a.home_total_amount, a.total_amount, DATE_FORMAT(a.reconciled_date,\'%Y-%m-%d\') as reconciled_date,a.reconciled_by '+
      'from acc_cash_payment a '+
      'left join mst_cash_bank_account b on b.id = a.bank_account_id '+
      'left join mst_bank c on c.id = b.bank_id '+
      'left join mst_supplier d on d.id = a.supplier_id '+
      'left join (select value, name from table_ref '+
                  'where table_name = \'acc_cash_payment\' '+
                    'and column_name = \'status\') e on e.value = a.status     '+
      'left join ref_currency f on f.id = b.currency_id                  '
     //'where a.status = \'3\' '
     var qstringDeposit = 'select a.id,\'deposit\' as type,a.bank_account_id, b.name as bank_account, c.name as bank, f.name as currency, '+
           'a.check_no, a.supplier_id, d.name as supplier_name,  '+
           'DATE_FORMAT(a.issued_date,\'%Y-%m-%d\') as issued_date, a.status, e.name as status_name, a.home_deposit_amount total_amount, a.reconcile_date reconciled_date '+
      'from acc_cash_deposit a '+
      'left join mst_cash_bank_account b on b.id = a.bank_account_id '+
      'left join mst_bank c on c.id = b.bank_id '+
      'left join mst_supplier d on d.id = a.supplier_id '+
      'left join (select value, name from table_ref '+
                  'where table_name = \'acc_cash_deposit\' '+
                    'and column_name = \'status\') e on e.value = a.status     '+
      'left join ref_currency f on f.id = b.currency_id '
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
    var cd = new Date()
    $scope.selected.filter_year['selected'] = {id: cd.getFullYear(),name:cd.getFullYear()}
    for (var i=0;i<$scope.listMonth.length;i++){
        if (cd.getMonth()+1 == parseInt($scope.listMonth[i].id)){
            $scope.selected.filter_month['selected'] = $scope.listMonth[i]
        }
    }

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
        $scope.nested.reloadPayableTable()
        $scope.nested.reloadDepositTable()
    }

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.nested = {}
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

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
    }

    $scope.detail = function(ids,type){
        $scope.id = ids
        $scope.sdetail = true
        $scope.nested.runDetail(ids,type);
        $('#form-input').modal('show')
    }
    $scope.recon = {date:''}
    $scope.reconcile = function(ids, type){
        console.log($scope.selected.filter_year.selected.name)
        $scope.minimum = $scope.selected.filter_year.selected.name+ '-'+$scope.selected.filter_month.selected.name+'-01'
        $scope.id = ids
        $scope.type = type
        //$scope.nested.runDetail();
        $('#modalReconcile').modal('show')
    }
    $scope.spanReconcile = false
    $scope.execReconcile = function(ids,type){
        console.log(ids)
        console.log(type)
        console.log($scope.recon.date)
        if ($scope.recon.date.length>0){
            var sql = ''
            if (type=='payable'){
                sql = 'update acc_cash_payment set status = 4, reconciled_date = \''+$scope.recon.date+'\' where id = '+ids
            }
            else if (type=='deposit'){
                sql = 'update acc_cash_deposit set status = 4, reconcile_date = \''+$scope.recon.date+'\' where id = '+ids
            }
            queryService.post(sql,undefined)
            .then(function (result){
                console.log(result)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Reconcile  '+ids,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                if (type=='payable'){
                    $scope.nested.reloadPayableTable();
                }
                else if (type=='deposit'){
                    $scope.nested.reloadDepositTable();
                }
            },
            function (err){
                console.log(err)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }
        else {
            $('body').pgNotification({
                style: 'flip',
                message: 'Cannot Execute, Reconcile Date is Empty',
                position: 'top-right',
                timeout: 3000,
                type: 'danger'
            }).show();
        }

    }
    $scope.bankbook = function(obj, type){
        console.log(obj)
        console.log(type)
        $scope.id = obj.id
        $scope.type = type
        //$scope.nested.runDetail();
        $('#modalBankBook').modal('show')
    }
    $scope.execBankBook = function(id,type){
        console.log('execbb')
        console.log($scope.bbExec[id])
        console.log(type)
        var sql = 'insert into acc_cash_bank_book set ?'
	    var param = {
            bank_account_id: $scope.bbExec[id].bank_account_id,
        	book_date: $scope.bbExec[id].issued_date,
        	customer_id: null,
        	supplier_id: $scope.bbExec[id].supplier_id,
        	check_no: $scope.bbExec[id].check_no,
        	//notes: $scope.bbExec[id].notes
        	//reference_no: ?
        	transc_type: 'C',
        	total_amount: $scope.bbExec[id].total_amount,
        	status: '1',
        	reconcile_date: $scope.bbExec[id].reconciled_date,
        	reconcile_by: $scope.bbExec[id].reconciled_by
        }
        queryService.post('insert into acc_cash_bank_book SET ?',param)
        .then(function (result){
            console.log(result)
            var qstr = 'insert into acc_cash_bank_closing (bank_account_id,book_date,opening_amount,debit_amount,credit_amount,closing_amount) values ('+
            $scope.bbExec[id].bank_account_id+', \''+globalFunction.currentDate()+'\', 0, 0,'+$scope.bbExec[id].total_amount+','+$scope.bbExec[id].total_amount+')'+
            'on duplicate key update debit_amount = debit_amount + 0, credit_amount = credit_amount + '+$scope.bbExec[id].total_amount+', closing_amount = opening_amount + debit_amount - '+$scope.bbExec[id].total_amount

            queryService.post(qstr,undefined)
            .then(function (result2){
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Entry to Bank Book ',
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
            },
            function (err2){
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
            console.log(err)
            $('#modalBankBookReplace').modal('show')

        })

    }
    $scope.execBankBookReplace = function(id,type){
        console.log('execbb')
        console.log($scope.bbExec[id])
        console.log(type)
        var param = {
            bank_account_id: $scope.bbExec[id].bank_account_id,
        	book_date: $scope.bbExec[id].issued_date,
        	customer_id: null,
        	supplier_id: $scope.bbExec[id].supplier_id,
        	check_no: $scope.bbExec[id].check_no,
        	//notes: $scope.bbExec[id].notes
        	//reference_no: ?
        	transc_type: 'C',
        	total_amount: $scope.bbExec[id].total_amount,
        	status: '1',
        	reconcile_date: $scope.bbExec[id].reconciled_date,
        	reconcile_by: $scope.bbExec[id].reconciled_by
        }
        queryService.post('update acc_cash_bank_book SET ? where id='+id,param)
        .then(function (result){
            console.log(result)
            var qstr = 'insert into acc_cash_bank_closing (bank_account_id,book_date,opening_amount,debit_amount,credit_amount,closing_amount) values ('+
            $scope.bbExec[id].bank_account_id+', \''+globalFunction.currentDate()+'\', 0, 0,'+$scope.bbExec[id].total_amount+','+$scope.bbExec[id].total_amount+')'+
            'on duplicate key update debit_amount = debit_amount + 0, credit_amount = credit_amount + '+$scope.bbExec[id].total_amount+', closing_amount = opening_amount + debit_amount - '+$scope.bbExec[id].total_amount

            queryService.post(qstr,undefined)
            .then(function (result2){
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Entry to Bank Book ',
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
            },
            function (err2){
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
            console.log(err)
            $('body').pgNotification({
                style: 'flip',
                message: 'Error Insert: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

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
.controller('table1', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL) {
    $scope.details = []
    var qstringdetail ='select a.id,\'payable\' as type,a.bank_account_id, b.name as bank_account, c.name as bank, f.name as currency, '+
           'a.check_no, a.supplier_id, d.name as supplier_name, DATE_FORMAT(a.issued_date,\'%Y-%m-%d\') as issued_date,  '+
           'a.status, e.name as status_name, a.home_total_amount, a.total_amount, DATE_FORMAT(a.reconciled_date ,\'%Y-%m-%d\') as reconciled_date,a.reconcled_by reconciled_by '+
      'from acc_cash_payment a '+
      'left join mst_cash_bank_account b on b.id = a.bank_account_id '+
      'left join mst_bank c on c.id = b.bank_id '+
      'left join mst_supplier d on d.id = a.supplier_id '+
      'left join (select value, name from table_ref '+
                  'where table_name = \'acc_cash_payment\' '+
                    'and column_name = \'status\') e on e.value = a.status     '+
      'left join ref_currency f on f.id = b.currency_id                  '
    var qwheredetail = ' where a.issued_date between \''+$scope.selected.filter_year.selected.name+'-'+$scope.selected.filter_month.selected.name+'-01\' and '+
     ' \''+$scope.selected.filter_year.selected.name+'-'+$scope.selected.filter_month.selected.name+'-'+$scope.selected.filter_month.selected.last+'\' '
    $scope.nested.reloadPayableTable = function(){
        qwheredetail = ' where a.issued_date between \''+$scope.selected.filter_year.selected.name+'-'+$scope.selected.filter_month.selected.name+'-01\' and '+
         ' \''+$scope.selected.filter_year.selected.name+'-'+$scope.selected.filter_month.selected.name+'-'+$scope.selected.filter_month.selected.last+'\' '
         console.log(qstringdetail)
         console.log(qwheredetail)
        $scope.nested.dtPayableInstance.reloadData()
    }
    $scope.nested.dtPayableInstance = {}

    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.bbExec[full.id] = full;
        console.log(data)
        console.log(type)
        console.log(full)
        console.log(meta)
        var html = ''
            html = '<div class="btn-group btn-group-xs">'
            html +=
            '<button class="btn btn-default" title="Detail" ng-click="detail(' + data + ',\'payable\')">' +
            '   <i class="fa fa-list"></i>' +
            '</button>&nbsp;' ;
            html +=
            '<button class="btn btn-default" title="Bank Book" ng-click="bankbook(bbExec[' + full.id + '],\''+full.type+'\')">' +
            '   <i class="fa fa-flash"></i>' +
            '</button>&nbsp;' ;
        if (full.reconciled_date==null){
            html+='<button class="btn btn-default" title="Reconcile" ng-click="reconcile(' + full.id + ',\''+full.type+'\')">' +
            '   <i class="fa fa-check"></i>' +
            '</button>&nbsp;' ;
        }
            html += '</div>'

        return html
    }

    $scope.nested.dtPayableOptions =DTOptionsBuilder.newOptions()
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
    .withOption('createdRow', $scope.createdRow);

    $scope.nested.dtPayableColumns = []
    if ($scope.el.length>0){
        $scope.nested.dtPayableColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.nested.dtPayableColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('Entry'),
        DTColumnBuilder.newColumn('bank').withTitle('Bank'),
        DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account'),
        //DTColumnBuilder.newColumn('account_name').withTitle('Account Name'),
        DTColumnBuilder.newColumn('currency').withTitle('currency').withOption('width','10%'),
        DTColumnBuilder.newColumn('check_no').withTitle('Check'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('supplier'),
        DTColumnBuilder.newColumn('issued_date').withTitle('date'),
        DTColumnBuilder.newColumn('reconciled_date').withTitle('reconcile'),
        DTColumnBuilder.newColumn('status_name').withTitle('status'),
        DTColumnBuilder.newColumn('total_amount').withTitle('amount')
    );

})
.controller('table2', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL) {
    $scope.details = []
    var qstringdetail = 'select a.id,\'deposit\' as type,a.bank_account_id, b.name as bank_account, c.name as bank, f.name as currency, '+
          'a.check_no, a.supplier_id, d.name as supplier_name,  '+
          'DATE_FORMAT(a.issued_date,\'%Y-%m-%d\') as issued_date, a.status, e.name as status_name, a.home_deposit_amount total_amount, DATE_FORMAT(a.reconcile_date,\'%Y-%m-%d\') reconciled_date,reconcile_by reconciled_by '+
     'from acc_cash_deposit a '+
     'left join mst_cash_bank_account b on b.id = a.bank_account_id '+
     'left join mst_bank c on c.id = b.bank_id '+
     'left join mst_supplier d on d.id = a.supplier_id '+
     'left join (select value, name from table_ref '+
                 'where table_name = \'acc_cash_deposit\' '+
                   'and column_name = \'status\') e on e.value = a.status     '+
     'left join ref_currency f on f.id = b.currency_id '
     var qwheredetail = ' where a.issued_date between \''+$scope.selected.filter_year.selected.name+'-'+$scope.selected.filter_month.selected.name+'-01\' and '+
      ' \''+$scope.selected.filter_year.selected.name+'-'+$scope.selected.filter_month.selected.name+'-'+$scope.selected.filter_month.selected.last+'\' '

    $scope.nested.reloadDepositTable = function(){
        //qwheredetail = ' where t.supplier_id = '+$scope.id
        qstringdetail += ' '
        qwheredetail = ' where a.issued_date between \''+$scope.selected.filter_year.selected.name+'-'+$scope.selected.filter_month.selected.name+'-01\' and '+
         ' \''+$scope.selected.filter_year.selected.name+'-'+$scope.selected.filter_month.selected.name+'-'+$scope.selected.filter_month.selected.last+'\' '
        $scope.nested.dtDepositInstance.reloadData()
    }
    $scope.nested.dtDepositInstance = {}
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.bbExec[full.id] = full;
        //console.log(data)
        //console.log(type)
        //console.log(full)
        //console.log(meta)
        var html = ''
            html = '<div class="btn-group btn-group-xs">'
            html +=
            '<button class="btn btn-default" ng-click="detail(' + data + ',\'deposit\')">' +
            '   <i class="fa fa-list"></i>' +
            '</button>&nbsp;' ;
            html +=
            '<button class="btn btn-default" ng-click="bankbook(bbExec[' + full.id + '],\''+full.type+'\')">' +
            '   <i class="fa fa-flash"></i>' +
            '</button>&nbsp;' ;
        if (full.reconciled_date==null){
            html+='<button class="btn btn-default" ng-click="reconcile(' + full.id + ',\''+full.type+'\')">' +
            '   <i class="fa fa-check"></i>' +
            '</button>&nbsp;' ;
        }
            html += '</div>'

        return html
    }

    $scope.nested.dtDepositOptions =DTOptionsBuilder.newOptions()
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

    $scope.nested.dtDepositColumns = []
    if ($scope.el.length>0){
        $scope.nested.dtDepositColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '20%'))
    }
    $scope.nested.dtDepositColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('Entry'),
        DTColumnBuilder.newColumn('bank').withTitle('Bank'),
        DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account'),
        //DTColumnBuilder.newColumn('account_name').withTitle('Account Name'),
        DTColumnBuilder.newColumn('currency').withTitle('currency').withOption('width','10%'),
        DTColumnBuilder.newColumn('check_no').withTitle('Check'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('supplier'),
        DTColumnBuilder.newColumn('issued_date').withTitle('date'),
        DTColumnBuilder.newColumn('reconciled_date').withTitle('reconcile'),
        DTColumnBuilder.newColumn('status_name').withTitle('status'),
        DTColumnBuilder.newColumn('total_amount').withTitle('amount')
    );

})

.controller('DetailApraCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL) {
    $scope.details = []
    var qstring = 'select 1 as id'
    $scope.nested.runDetail = function(ids,type){
        console.log(type)

        if (type == 'payable') {
            qstring = 'select a.id, a.code, '+
                   'DATE_FORMAT(a.open_date,\'%Y-%m-%d\') as open_date, DATE_FORMAT(a.check_due_date,\'%Y-%m-%d\') as check_due_date, '+
                   'a.check_no, a.status, e.name as status_name,  '+
                   'a.supplier_id, d.name as supplier_name, a.currency_id,  '+
                   'f.code as currency_code,f.name as currency_name,a.currency_exchange, a.total_amount, a.home_total_amount, a.bank_account_id, '+
                   'g.name as bank_account,a.payment_method,h.name payment_method_name,g.bank_id,a.prepare_notes,a.prepared_date '+
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
                                            'where a.id = '+ids
        }
        else if (type == 'deposit'){
            qstring = 'select a.id,a.code, a.home_currency_exchange,a.check_no, '+
                        'DATE_FORMAT(a.open_date,\'%Y-%m-%d\') as open_date, a.status, b.name as \'status_name\', '+
                       'a.notes, a.bank_account_id, c.name as \'bank_account\', d.name as \'bank\', '+
                       'a.supplier_id, e.name as \'supplier_name\', a.used_currency_id, f.name as \'currency\', '+
                       'a.home_deposit_amount, a.home_applied_amount, a.home_balance_amount,  '+
                       'a.tot_deposit_amount, a.tot_applied_amount, a.tot_balance_amount, '+
                       'd.id bank_id,d.name bank_name '+
                  'from acc_cash_deposit a '+
                  'left join (select value, name from table_ref  '+
                             'where table_name = \'acc_cash_deposit\'  '+
                               'and column_name = \'status\') b on a.status = b.value '+
                  'left join mst_cash_bank_account c on a.bank_account_id = c.id '+
                  'left join mst_cash_bank d on c.bank_id = d.id '+
                  'left join mst_supplier e on a.supplier_id = e.id '+
                  'left join ref_currency f on a.used_currency_id = f.id  '+
                  'where a.id = '+ids
        }


        $scope.nested.dtDetailInstance = {}

        $scope.nested.dtDetailOptions =DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: API_URL+'/apisql/datatable',
            type: 'POST',
            headers: {
                "authorization":  'Basic ' + $localStorage.mediaToken
            },
            data: function (data) {
                data.query = qstring;
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

        $scope.nested.dtDetailColumns = []
        if (type == 'payable'){
            $scope.nested.dtDetailColumns.push(
                DTColumnBuilder.newColumn('id').withTitle('Transc No'),
                DTColumnBuilder.newColumn('code').withTitle('Doc No').withOption('width', '10%'),
                DTColumnBuilder.newColumn('check_no').withTitle('Check No').withOption('width', '10%'),
                DTColumnBuilder.newColumn('open_date').withTitle('Open Date').withOption('width', '10%'),
                DTColumnBuilder.newColumn('check_due_date').withTitle('Due Date').withOption('width', '10%'),
                DTColumnBuilder.newColumn('status_name').withTitle('Status'),
                DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier').withOption('width', '20%'),
                DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account'),
                DTColumnBuilder.newColumn('currency_code').withTitle('Currency'),
                DTColumnBuilder.newColumn('home_total_amount').withTitle('Forex Total'),
                DTColumnBuilder.newColumn('total_amount').withTitle('Total')
            );
        }
        else if (type == 'deposit'){
            $scope.nested.dtDetailColumns.push(
                DTColumnBuilder.newColumn('id').withTitle('Transc No'),
                DTColumnBuilder.newColumn('code').withTitle('Doc No').withOption('width', '10%'),
                DTColumnBuilder.newColumn('open_date').withTitle('Open Date').withOption('width', '10%'),
                DTColumnBuilder.newColumn('status_name').withTitle('Status'),
                DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier').withOption('width', '20%'),
                DTColumnBuilder.newColumn('bank_name').withTitle('Bank'),
                DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account'),
                DTColumnBuilder.newColumn('currency').withTitle('Currency'),
                DTColumnBuilder.newColumn('home_deposit_amount').withTitle('Forex Total'),
                DTColumnBuilder.newColumn('tot_deposit_amount').withTitle('Total'),
                DTColumnBuilder.newColumn('tot_applied_amount').withTitle('Applied'),
                DTColumnBuilder.newColumn('tot_balance_amount').withTitle('Balance')
            )
        }
        else {
            $scope.nested.dtDetailColumns.push(
                DTColumnBuilder.newColumn('id').withTitle('Transc No')
            )
        }


    }




});
