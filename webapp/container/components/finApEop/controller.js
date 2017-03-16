
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
