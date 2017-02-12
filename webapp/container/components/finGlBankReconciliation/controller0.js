
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
    var qstringPayable = 'select a.id,\'payable\' as type,a.bank_account_id, b.name as bank_account, c.name as bank, f.name as currency, '+
           'a.check_no, a.supplier_id, d.name as supplier_name, DATE_FORMAT(a.issued_date,\'%Y-%m-%d\') as issued_date,  '+
           'a.status, e.name as status_name, a.home_total_amount, a.total_amount, a.reconciled_date '+
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
           'DATE_FORMAT(a.issued_date,\'%Y-%m-%d\') as issued_date, a.status, e.name as status_name, a.home_deposit_amount, a.reconcile_date reconciled_date '+
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
        dep: {}
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

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.nested = {}
    $scope.nested.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.deps[data] = {id:data};
        console.log(data)
        console.log(type)
        console.log(full)
        console.log(meta)
        var html = ''
            html = '<div class="btn-group btn-group-xs">'
            html +=
            '<button class="btn btn-default" ng-click="detail(' + data + ')">' +
            '   <i class="fa fa-list"></i>' +
            '</button>&nbsp;' ;
            html +=
            '<button class="btn btn-default" ng-click="bankbook(' + full.id + ',\''+full.type+'\')">' +
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

    $scope.createdRow = function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    $scope.nested.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstringPayable + qwhere;
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
        .withDOM('r<"H"lf><"datatable-scroll"t><"F"ip>')
    .withOption('scrollX',true)
    .withOption('createdRow', $scope.createdRow);

    $scope.nested.dtColumns = [];
    if ($scope.el.length>0){
        $scope.nested.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.nested.dtColumns.push(
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

    $scope.createdDepRow = function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }
    $scope.nested.dtDepInstance = {} //Use for reloadData

    $scope.nested.dtDepOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstringDeposit + qwhere;
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
    //.withDOM('r<"H"lf><"datatable-scroll"t><"F"ip>')
    .withOption('scrollX',true)

    .withOption('autoWidth',false)
    .withOption('responsive',true)
    //.withOption('sScrollX','100%')
    //.withOption('sScrollXInner' ,'100%')

    .withOption('createdRow', $scope.createdDepRow);

    $scope.nested.dtDepColumns = [];
    if ($scope.el.length>0){
        $scope.nested.dtDepColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '20%'))
    }
    $scope.nested.dtDepColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('Entry'),
        DTColumnBuilder.newColumn('bank').withTitle('Bank'),
        DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account'),
        //DTColumnBuilder.newColumn('account_name').withTitle('Account Name'),
        DTColumnBuilder.newColumn('currency').withTitle('currency').withOption('width','200px'),
        DTColumnBuilder.newColumn('check_no').withTitle('Check'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('supplier').withOption('width','200px'),
        DTColumnBuilder.newColumn('issued_date').withTitle('date'),
        DTColumnBuilder.newColumn('reconciled_date').withTitle('reconcile'),
        DTColumnBuilder.newColumn('status_name').withTitle('status'),
        DTColumnBuilder.newColumn('home_deposit_amount').withTitle('amount')
    );

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

    $scope.detail = function(ids){
        $scope.id = ids
        $scope.nested.runDetail();
        $('#form-input').modal('show')
    }
    $scope.reconcile = function(ids, type){
        $scope.id = ids
        $scope.type = type
        //$scope.nested.runDetail();
        $('#modalReconcile').modal('show')
    }
    $scope.bankbook = function(ids, type){
        $scope.id = ids
        $scope.type = type
        //$scope.nested.runDetail();
        $('#modalBankBook').modal('show')
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
.controller('DetailApraCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL) {
    $scope.details = []
    var qstringdetail = 'select * from ( '+
        'select supplier_id, b.name as supplier_name, account_id, c.name as transc_type, '+
        'source,DATE_FORMAT(due_date,\'%Y-%m-%d\') due_date,source_no,voucher_id,DATE_FORMAT(open_date,\'%Y-%m-%d\') open_date, '+
                 'current, over30, over60, over90, total,age '+
            'from ( '+
                          'select supplier_id, account_id,source,due_date,source_no,voucher_id,open_date,age, '+
                                         'sum(case when status = \'1\'or (status = \'2\' and age <= 30) then amount end) as current, '+
                                         'sum(case when status = \'2\' and age between 31 and 60 then amount end) as over30, '+
                                         'sum(case when status = \'2\' and age between 61 and 90 then amount end) as over60, '+
                                         'sum(case when status = \'2\' and age > 90 then amount end) as over90, '+
                         'sum(amount) as total '+
                           'from ( '+
                                          'select a.supplier_id, a.status, c.account_id, c.amount,  '+
                                                         'datediff(current_date(),a.open_date) as age, '+
                                                         'a.source, a.due_date,a.code source_no,a.id voucher_id,a.open_date '+
                                                'from acc_ap_voucher a '+
                                                'left join acc_gl_transaction b on a.id = b.voucher_id '+
                                                'left join acc_gl_journal c on b.id = c.gl_id and c.transc_type = \'C\' '+
                                           //'#where a.open_date=? '+
                                            //'#    and a.used_currency_id=?  '+
                                        ') as a '+
                         'group by supplier_id, account_id '+
                        ') as a '+
           'left join mst_supplier b on a.supplier_id = b.id '+
           'left join mst_ledger_account c on a.account_id = c.id '+
           ')t '
    var qwheredetail = ''
    $scope.nested.runDetail = function(){
        qwheredetail = ' where t.supplier_id = '+$scope.id
        $scope.nested.dtDetailInstance.reloadData()
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
            data.query = qstringdetail + (qwheredetail.length==0?' where t.supplier_id=0':qwheredetail);
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
    $scope.nested.dtDetailColumns.push(
        DTColumnBuilder.newColumn('voucher_id').withTitle('Voucher'),
        DTColumnBuilder.newColumn('open_date').withTitle('Open Date'),
        DTColumnBuilder.newColumn('due_date').withTitle('Due Date'),
        DTColumnBuilder.newColumn('age').withTitle('age'),
        DTColumnBuilder.newColumn('source').withTitle('source'),
        DTColumnBuilder.newColumn('source_no').withTitle('source_no'),
        DTColumnBuilder.newColumn('current').withTitle('Current'),
        DTColumnBuilder.newColumn('over30').withTitle('Over 30 Days'),
        DTColumnBuilder.newColumn('over60').withTitle('Over 60 Days'),
        DTColumnBuilder.newColumn('over90').withTitle('Over 90 Days'),
        DTColumnBuilder.newColumn('total').withTitle('Total')
    );

});
