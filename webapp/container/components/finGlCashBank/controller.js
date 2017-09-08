
var userController = angular.module('app', []);
userController
.controller('FinGlCashBankCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    var qstring = 'select a.id,a.bank_account_id,a.currency_id,date_format(a.book_date,\'%Y-%m-%d\')book_date,a.opening_amount,a.debit_amount,a.credit_amount, '+
    	'a.closing_amount,b.code bank_account_code, b.name bank_account_name,c.name bank_name,b.bank_id bank_id, '+
        'b.gl_account_id,b.ap_clearance_account_id, d.code gl_account_code, d.name gl_account_name, '+
        'e.code ap_account_code, e.name ap_account_name,f.home_currency_exchange '+
     'from acc_cash_bank_closing a '+
    'left join mst_cash_bank_account b on b.id = a.bank_account_id '+
    'left join mst_cash_bank c on c.id = b.bank_id '+
    'left join mst_ledger_account d on b.gl_account_id = d.id '+
    'left join mst_ledger_account e on b.ap_clearance_account_id = e.id '+
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
    $scope.bb = {
        id: '',
        date: '',
        opening: '',
        closing: '',
        amount: 0,
        check_no: '',
        reference_no:''
    }

    $scope.selected = {
        dep: {},
        filter_month: {},
        filter_year: {},
        filter_bank_account: {},
        bank: {},
        bank_account: {},
        supplier: {}
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
    $scope.transc_type = [
        {
            id: 1,
            name: 'Credit',
            code: 'C'
        },
        {
            id: 0,
            name: 'Debit',
            code: 'D'
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
        $scope.deps[data] = full;
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
        $scope.nested.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.nested.dtColumns.push(
        DTColumnBuilder.newColumn('bank_name').withTitle('Bank'),
        DTColumnBuilder.newColumn('bank_account_name').withTitle('Bank Account').withOption('width','15%'),
        DTColumnBuilder.newColumn('book_date').withTitle('Transc Date').withOption('width','15%'),
        //DTColumnBuilder.newColumn('home_currency_exchange').withTitle('exchange'),
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
        $('#form-detail').modal('show')
    }
    $scope.openInitial = function(state){
        $('#form-initial').modal('show')
    }
    $scope.openTransaction = function(state){
        $('#form-detail-input').modal('show')
    }
    $scope.clearBB = function(){
        $scope.selected.bank_account = {};
        $scope.bb.date = '';
        $scope.selected.supplier = {};
        $scope.bb.check_no = '';
        $scope.bb.reference_no = '';
        $scope.bb.notes = '';
        $scope.bb.amount = 0;
    }
    $scope.submit = function(){
        var param = {
            bank_account_id:$scope.selected.bank_account.selected.id,
            book_date:$scope.bb.date,
            supplier_id:$scope.selected.supplier.selected.supplier_id,
            check_no:$scope.bb.check_no,
            reference_no:$scope.bb.reference_no,
            notes:$scope.bb.notes,
            transc_type:'C',
            total_amount: $scope.bb.amount,
            created_by:$localStorage.currentUser.name.id
        }
        console.log('insert', param);
        queryService.post('insert into acc_cash_bank_book SET ?',param)
        .then(function (result){
            console.log(result)
            var qstr = 'insert into acc_cash_bank_closing (bank_account_id,book_date,opening_amount,debit_amount,credit_amount,closing_amount) values ('+
            $scope.selected.bank_account.selected.id+', \''+$scope.bb.date+'\', 0, 0,'+$scope.bb.amount+','+$scope.bb.amount+')'+
            'on duplicate key update debit_amount = debit_amount + 0, credit_amount = credit_amount + '+$scope.bb.amount+', closing_amount = opening_amount + debit_amount - '+$scope.bb.amount

            queryService.post(qstr,undefined)
            .then(function (result2){
                $('#form-detail-input').modal('hide')
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Entry to Bank Book ',
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clearBB();
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


        })
    }
    $scope.execInitial = function(){
        var param = {
            bank_account_id:$scope.selected.bank_account.selected.id,
            book_date: $scope.bb.date,
            opening_amount: $scope.bb.amount,
            closing_amount: $scope.bb.amount,
            created_by: $localStorage.currentUser.name.id
        }
        queryService.post('insert into acc_cash_bank_closing SET ?',param)
        .then(function (result){
            //$('#form-initial').modal('hide')
            $scope.nested.dtInstance.reloadData(function(obj){}, false)
            $('body').pgNotification({
                style: 'flip',
                message: 'Success Add Initial Data ',
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
                message: 'Error Entry Initial Data: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.detail = function(ids){
        $scope.id = ids
        $scope.showDetail();
        $('#form-detail').modal('show');
    }
    $scope.showDetail = function(){
        console.log('detail',$scope.id,$scope.deps)
        var q = "select a.id,a.bank_account_id,date_format(a.book_date,\'%Y-%m-%d\')book_date,a.supplier_id,b.name supplier,a.check_no,a.reference_no,transc_type,notes,total_amount, "+
            "if(transc_type='D',total_amount,'-')debit,if(transc_type='C',total_amount,'-')credit,c.name bank_account_name, d.name bank_name "+
            "from acc_cash_bank_book a "+
            "left join mst_supplier b on a.supplier_id=b.id "+
            "left join mst_cash_bank_account c on a.bank_account_id = c.id "+
            "left join mst_cash_bank d on c.bank_id = d.id "+
            "where a.book_date = '"+$scope.deps[$scope.id].book_date+"' "+
            "and a.bank_account_id ="+$scope.deps[$scope.id].bank_account_id;
        console.log(q)
        queryService.post(q,undefined)
        .then(function (result){
            //$('#form-initial').modal('hide')
            console.log('success',result);
            $scope.details = result.data
        },
        function (err){
            console.log('error',err)
        })
    }
    $scope.bbDetails = {}
    $scope.editBbDetail = function(ids){
        console.log('editBbDetail',ids,$scope.details)
        for (var i=0;i<$scope.details.length;i++){
            if ($scope.details[i].id==ids){
                $scope.bbDetails = $scope.details[i]
            }
        }

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
    'left join mst_cash_bank c on c.id = b.bank_id '+
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
