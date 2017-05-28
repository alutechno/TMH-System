
var userController = angular.module('app', []);
userController
.controller('FinGlJournalEntryReportCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    var qstring = 'select a.id, a.code, a.journal_type_id, c.name as journal_code, '+
         'date_format(a.bookkeeping_date,\'%Y-%m-%d\') bookkeeping_date, a.gl_status, e.name as status_name,  '+
         'a.notes, a.ref_account, b.account_id,d.code as account_code, d.name as account_name,  '+
         'case when b.transc_type = \'D\' then b.amount end as debit_amount, '+
         'case when b.transc_type = \'C\' then b.amount end as credit_amount  '+
    'from acc_gl_transaction a '+
    'left join acc_gl_journal b on a.id = b.gl_id '+
    'left join ref_journal_type c on a.journal_type_id = c.id '+
    'left join mst_ledger_account d on b.account_id = d.id '+
    'left join (select * from table_ref '+
                                'where table_name = \'acc_gl_transaction\' '+
                  'and column_name = \'gl_status\') e on a.gl_status = e.value    '+
   'where a.gl_status = \'1\' '

    var qwhere = ''

    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.deps = {}
    $scope.id = 0;
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
        filter_c_period: {},
        filter_start_year: {},
        filter_start_month: {},
        filter_end_year: {},
        filter_end_month: {}
    }

    $scope.c_period = [
        {id: 0, name:'Current Period'},
        {id: 1, name:'Last Month'},
        {id: 2, name:'Custom'}
    ]
    $scope.selected.filter_c_period['selected'] = $scope.c_period[0]

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
    var cd = new Date()
    $scope.selected.filter_start_year['selected'] = {id: cd.getFullYear(),name:cd.getFullYear()}
    $scope.selected.filter_end_year['selected'] = {id: cd.getFullYear(),name:cd.getFullYear()}
    for (var i=0;i<$scope.listMonth.length;i++){
        if (cd.getMonth()+1 == parseInt($scope.listMonth[i].id)){
            $scope.selected.filter_start_month['selected'] = $scope.listMonth[i]
            $scope.selected.filter_end_month['selected'] = $scope.listMonth[i]
        }
    }
    $scope.setCPeriod = function(e){
        console.log(e)
        var cd = new Date()
        if (e.id==0){
            $scope.selected.filter_start_year['selected'] = {id: cd.getFullYear(),name:cd.getFullYear()}
            $scope.selected.filter_end_year['selected'] = {id: cd.getFullYear(),name:cd.getFullYear()}
            for (var i=0;i<$scope.listMonth.length;i++){
                if (cd.getMonth()+1 == parseInt($scope.listMonth[i].id)){
                    $scope.selected.filter_start_month['selected'] = $scope.listMonth[i]
                    $scope.selected.filter_end_month['selected'] = $scope.listMonth[i]
                }
            }

        }
        else if(e.id==1){
            cd = new Date(cd.getFullYear(), cd.getMonth() - 1, 1);
            $scope.selected.filter_start_year['selected'] = {id: cd.getFullYear(),name:cd.getFullYear()}
            $scope.selected.filter_end_year['selected'] = {id: cd.getFullYear(),name:cd.getFullYear()}
            for (var i=0;i<$scope.listMonth.length;i++){
                if (cd.getMonth()+1 == parseInt($scope.listMonth[i].id)){
                    $scope.selected.filter_start_month['selected'] = $scope.listMonth[i]
                    $scope.selected.filter_end_month['selected'] = $scope.listMonth[i]
                }
            }
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

    $scope.filterVal = {
        search: ''
    }
    $scope.showAdvance = false
    $scope.openAdvancedFilter = function(val){
        console.log(val)
        $scope.showAdvance = val
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.nested = {}
    $scope.nested.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.deps[data] = {id:data};
        //console.log(data)
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
                html +=
                '<button class="btn btn-default" title="Detail" ng-click="detail(' + data + ')">' +
                '   <i class="fa fa-list"></i>' +
                '</button>&nbsp;' ;
            html += '</div>'
        }
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
            data.query = qstring + qwhere;
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

    $scope.nested.dtColumns = [];
    if ($scope.el.length>0){
        //$scope.nested.dtColumns.push(DTColumnBuilder.newColumn('supplier_id').withTitle('Action').notSortable()
        //.renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.nested.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('Entry'),
        DTColumnBuilder.newColumn('account_code').withTitle('Account').withOption('width','15%'),
        DTColumnBuilder.newColumn('account_name').withTitle('Account Name').withOption('width','20%'),
        DTColumnBuilder.newColumn('bookkeeping_date').withTitle('Date').withOption('width','10%'),
        DTColumnBuilder.newColumn('notes').withTitle('Remarks'),
        DTColumnBuilder.newColumn('journal_code').withTitle('Journal Code'),
        DTColumnBuilder.newColumn('ref_account').withTitle('Reference'),
        DTColumnBuilder.newColumn('debit_amount').withTitle('Debit'),
        DTColumnBuilder.newColumn('credit_amount').withTitle('Credit')
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

    var qwhereobj = {
        bank_account: '',
        period: ''
    }

    $scope.applyFilter = function(){
        //console.log($scope.selected.filter_month)
        var status = []


        //console.log($scope.selected.filter_cost_center)
        //if ($scope.selected.filter_bank_account.selected){
        //    qwhereobj.bank_acc = ' a.bank_account_id = '+$scope.selected.filter_bank_account.selected.id+ ' '
        //}
        //console.log($scope.selected.filter_warehouse)

        qwhereobj.period = ' (a.bookkeeping_date between \''+$scope.selected.filter_start_year.selected.id+'-'+$scope.selected.filter_start_month.selected.id+'-01\' and '+
        ' \''+$scope.selected.filter_end_year.selected.id+'-'+$scope.selected.filter_end_month.selected.id+'-'+$scope.selected.filter_end_month.selected.last+'\') '
        //console.log(setWhere())
        qwhere = setWhere()
        console.log(qwhere)
        $scope.nested.dtInstance.reloadData(function(obj){
            console.log(obj)
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
        //console.log(strWhere)
        return strWhere
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
