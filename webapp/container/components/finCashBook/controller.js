
var userController = angular.module('app', []);
userController
.controller('FinCashBookCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    var qstring = 'select a.id,a.currency_id,a.book_date,a.opening_amount,a.debit_amount,a.credit_amount, '+
    	'a.closing_amount,a.account_id,b.name account_name,b.code account_code '+
        //'b.gl_account_id,b.ap_clearance_account_id, d.code gl_account_code, d.name gl_account_name, '+
        //'e.code ap_account_code, e.name ap_account_name,f.home_currency_exchange '+
     'from acc_cash_book_closing a '+
    //'left join mst_cash_bank_account b on b.id = a.bank_account_id '+
    //'left join mst_bank c on c.id = b.bank_id '+
    'left join mst_ledger_account b on b.id = a.account_id '+
    //'left join mst_ledger_account e on b.ap_clearance_account_id = e.id '+
    'left join ref_currency f on a.currency_id = f.id '
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
        filter_month: {},
        filter_year: {},
        filter_bank_account: {}
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
    $scope.bank_account = []
    queryService.get('select id,name from mst_cash_bank_account where status=1',undefined)
    .then(function(data){
        console.log(data)
        $scope.bank_account = data.data
    })

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
                '<button class="btn btn-default" ng-click="detail(' + data + ')">' +
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
        $scope.nested.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.nested.dtColumns.push(
        DTColumnBuilder.newColumn('account_code').withTitle('Acc Code'),
        DTColumnBuilder.newColumn('account_name').withTitle('Acc Name').withOption('width','15%'),
        DTColumnBuilder.newColumn('book_date').withTitle('Transc Date').withOption('width','15%'),
        DTColumnBuilder.newColumn('home_currency_exchange').withTitle('exchange'),
        DTColumnBuilder.newColumn('opening_amount').withTitle('opening'),
        DTColumnBuilder.newColumn('debit_amount').withTitle('debit'),
        DTColumnBuilder.newColumn('credit_amount').withTitle('credit'),
        DTColumnBuilder.newColumn('closing_amount').withTitle('closing')
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
        console.log($scope.selected.filter_month)
        var status = []


        //console.log($scope.selected.filter_cost_center)
        if ($scope.selected.filter_bank_account.selected){
            qwhereobj.bank_acc = ' a.bank_account_id = '+$scope.selected.filter_bank_account.selected.id+ ' '
        }
        //console.log($scope.selected.filter_warehouse)

        qwhereobj.period = ' (a.book_date between \''+$scope.selected.filter_year.selected.id+'-'+$scope.selected.filter_month.selected.id+'-01\' and '+
        ' \''+$scope.selected.filter_year.selected.id+'-'+$scope.selected.filter_month.selected.id+'-'+$scope.selected.filter_month.selected.last+'\') '
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
            strWhere = ' where ' + arrWhere.join(' and ')
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
    var qstringdetail = 'select a.id,a.bank_account_id,a.currency_id,a.book_date,a.opening_amount,a.debit_amount,a.credit_amount, '+
    	'a.closing_amount,b.code bank_account_code, b.name bank_account_name,c.name bank_name,b.bank_id bank_id, '+
        'b.gl_account_id,b.ap_clearance_account_id, d.code gl_account_code, d.name gl_account_name, '+
        'e.code ap_account_code, e.name ap_account_name,f.home_currency_exchange, f.name currency_name '+
     'from acc_cash_bank_closing a '+
    'left join mst_cash_bank_account b on b.id = a.bank_account_id '+
    'left join mst_bank c on c.id = b.bank_id '+
    'left join mst_ledger_account d on b.gl_account_id = d.id '+
    'left join mst_ledger_account e on b.ap_clearance_account_id = e.id '+
    'left join ref_currency f on a.currency_id = f.id '

    var qwheredetail = ''
    $scope.nested.runDetail = function(){
        qwheredetail = ' where a.id = '+$scope.id
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
            data.query = qstringdetail + (qwheredetail.length==0?' where a.id=0':qwheredetail);
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
        DTColumnBuilder.newColumn('bank_name').withTitle('Bank'),
        DTColumnBuilder.newColumn('bank_account_name').withTitle('Bank Account'),
        DTColumnBuilder.newColumn('book_date').withTitle('Transc Date'),
        DTColumnBuilder.newColumn('gl_account_code').withTitle('gl'),
        DTColumnBuilder.newColumn('ap_account_code').withTitle('ap clearance'),
        DTColumnBuilder.newColumn('currency_name').withTitle('currency_name'),
        DTColumnBuilder.newColumn('home_currency_exchange').withTitle('exchange'),
        DTColumnBuilder.newColumn('opening_amount').withTitle('opening'),
        DTColumnBuilder.newColumn('debit_amount').withTitle('debit'),
        DTColumnBuilder.newColumn('credit_amount').withTitle('credit'),
        DTColumnBuilder.newColumn('closing_amount').withTitle('closing')
    );

});
