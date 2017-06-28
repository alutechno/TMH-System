
var userController = angular.module('app', []);
userController
.controller('FinApRMutationCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    var qstring = 'select supplier_id, b.name as supplier_name, d.name as supplier_type, '+
          'previous_balance, new_voucher, cash_payment,  '+
          '(previous_balance + new_voucher - cash_payment) as ending_balance '+
     'from ( '+
                   'select supplier_id, sum(previous_balance) as previous_balance, sum(new_voucher) as new_voucher, '+
                                  'sum(cash_payment) as cash_payment '+
                         'from ( '+
                                   'select period, supplier_id, currency_id, closing_balance as previous_balance, 0 as new_voucher, '+
                                                  '0 as cash_payment, 0 as adjustment '+
                                         'from acc_ap_closing '+
                                        'where period = \'2016-12-31\' '+
                                   'union all   '+
                                   'select open_date, supplier_id, currency_id, 0 as previous, total_amount as new_voucher, '+
                                                '0 as cash_payment, 0 as adjustment '+
                                         'from acc_ap_voucher a '+
                                        'where open_date between \'2017-01-01\' and \'2017-01-31\' '+
                                        'union all     '+
                                        'select open_date, supplier_id, currency_id, 0 as previous, 0 as new_voucher, '+
                                                '0 as cash_payment, total_amount as adjustment '+
                                         'from acc_cash_payment a '+
                                        'where prepared_date between \'2017-01-01\' and \'2017-01-31\' '+
                                  ') as a '+
                        'group by supplier_id '+
                  ') as a '+
         'left join mst_supplier b on a.supplier_id = b.id '+
     'left join ref_supplier_type c on b.supplier_type_id = c.id '+
     'left join mst_ledger_account d on c.payable_account_id = d.id '
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
    $scope.focusinControl = {};
    $scope.fileName = "AP Mutation Report";
    $scope.exportExcel = function(){
        DTColumnBuilder.newColumn('supplier_id').withTitle('Supplier Id'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Name').withOption('width','15%'),
        DTColumnBuilder.newColumn('supplier_type').withTitle('Supplier Type').withOption('width','10%'),
        DTColumnBuilder.newColumn('previous_balance').withTitle('Previous'),
        DTColumnBuilder.newColumn('new_voucher').withTitle('New Voucher'),
        DTColumnBuilder.newColumn('cash_payment').withTitle('Cash'),
        DTColumnBuilder.newColumn('ending_balance').withTitle('Ending')
        queryService.post('select supplier_id,supplier_name,supplier_type,previous_balance,new_voucher,cash_payment,ending_balance from('+qstring + qwhere+')aa ',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Supplier ID","Supplier Name", 'Supplier Type',"Previous",'New Voucher', 'Cash','Ending']);
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
    $scope.nested = {}
    $scope.nested.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.deps[data] = {id:data};
        //console.log(data)
        var html = ''
        /*if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
                html +=
                '<button class="btn btn-default" ng-click="detail(' + data + ')">' +
                '   <i class="fa fa-list"></i>' +
                '</button>&nbsp;' ;
            html += '</div>'
        }*/
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
        DTColumnBuilder.newColumn('supplier_id').withTitle('Supplier Id'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Name').withOption('width','15%'),
        DTColumnBuilder.newColumn('supplier_type').withTitle('Supplier Type').withOption('width','10%'),
        DTColumnBuilder.newColumn('previous_balance').withTitle('Previous'),
        DTColumnBuilder.newColumn('new_voucher').withTitle('New Voucher'),
        DTColumnBuilder.newColumn('cash_payment').withTitle('Cash'),
        DTColumnBuilder.newColumn('ending_balance').withTitle('Ending')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' where lower(a.supplier_name) like "%'+$scope.filterVal.search.toLowerCase()+'%"'
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
/*.controller('DetailApraCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction,DTOptionsBuilder,DTColumnBuilder,DTColumnDefBuilder,API_URL) {
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

});*/
