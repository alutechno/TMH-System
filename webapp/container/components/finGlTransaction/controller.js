
var userController = angular.module('app', []);
userController
.controller('FinGlTransactionCtrl',
function($scope, $state, $sce, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
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
    $scope.account = {}
    $scope.accounts = []
    $scope.total_debit = 0
    $scope.total_credit = 0
    var qstring = 'select a.id, a.code, a.journal_type_id, date_format(a.bookkeeping_date,\'%Y-%m-%d\')bookkeeping_date, a.gl_status status, c.name as status_name, '+
         'a.notes, a.ref_account,d.code journal_type_code, d.name journal_type_name, '+
         'sum(case when b.transc_type = \'D\' then b.amount else 0 end) as debit_amount, '+
         'sum(case when b.transc_type = \'C\' then b.amount else 0 end) as credit_amount, '+
         '(sum(case when b.transc_type = \'D\' then b.amount else 0 end) - sum(case when b.transc_type = \'C\' then b.amount else 0 end)) balance '+
    'from acc_gl_transaction a '+
    'left join acc_gl_journal b on b.gl_id = a.id '+
    'left join (select * from table_ref '+
                'where table_name = \'acc_gl_transaction\'  '+
                  'and column_name = \'gl_status\') c on a.gl_status = c.value '+
	'left join ref_journal_type d on a.journal_type_id = d.id  '
        //'where a.status in (:status1,:status2,:status3)  '+
        //'and a.open_date beetween :date1 and :date2  '+
        //'and a.due_date between :date1and :date2'
    var qwhere = ''
    var qgroup = ' group by a.id, a.code, a.journal_type_id, a.bookkeeping_date, a.gl_status, c.name, a.notes, a.ref_account '

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

    /*for (var i=0;i<year.length;i++){
        for (var j=0;j<month.length;j++){
            $scope.period.push({id:year[i]+month[j],name:year[i]+'-'+month[j]})
        }
    }*/
    console.log($scope.period)

    $scope.role = {
        selected: []
    };

    $scope.cats = {}
    $scope.id = '';
    $scope.ap = {
        id: '',
        code: '',
        notes: ''
    }

    $scope.selected = {
        status: {},
        journal_type: {},
        filter_year: {},
        filter_month: {},
        filter_status: [],
        filter_journal: {},
        filter_source: {}
    }
    var cd = new Date()
    $scope.selected.filter_year['selected'] = {id: cd.getFullYear(),name:cd.getFullYear()}
    for (var i=0;i<$scope.listMonth.length;i++){
        if (cd.getMonth()+1 == parseInt($scope.listMonth[i].id)){
            $scope.selected.filter_month['selected'] = $scope.listMonth[i]
        }
    }
    //$scope.selected.filter_month['selected'] = {id: (cd.getMonth()<10?'0'+(cd.getMonth()+1):(cd.getMonth()+1)),name:(cd.getMonth()<10?'0'+(cd.getMonth()+1):(cd.getMonth()+1)),last:}

    queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
    .then(function(data){
        $scope.accounts = data.data
    })

    $scope.status = []
    $scope.statusShow = []
    queryService.get('select value id, value, name from table_ref where table_name = \'acc_gl_transaction\' and column_name = \'gl_status\' order by id ',undefined)
    .then(function(data){
        $scope.status = data.data
    })
    $scope.listSource = []
    queryService.get('select value id, value, name from table_ref where table_name = \'acc_gl_transaction\' and column_name = \'source\' order by id ',undefined)
    .then(function(data){
        $scope.listSource = data.data
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

    $scope.journal_type = []
    queryService.get('select * from ref_journal_type where status = \'1\' order by id ',undefined)
    .then(function(data){
        $scope.journal_type = data.data
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
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.cats[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(cats[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(cats[\'' + data + '\'])" )"="">' +
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

    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstring + qwhere + qgroup;
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
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('Transc#'),
        DTColumnBuilder.newColumn('code').withTitle('Document#').withOption('width', '20%'),
        DTColumnBuilder.newColumn('journal_type_code').withTitle('Journal Code').withOption('width', '10%'),
        DTColumnBuilder.newColumn('bookkeeping_date').withTitle('Date').withOption('width', '10%'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '5%'),
        DTColumnBuilder.newColumn('notes').withTitle('Notes'),
        DTColumnBuilder.newColumn('ref_account').withTitle('Ref Account'),
        DTColumnBuilder.newColumn('debit_amount').withTitle('Total Debit'),
        DTColumnBuilder.newColumn('credit_amount').withTitle('Total Credit').withOption('width', '10%'),
        DTColumnBuilder.newColumn('balance').withTitle('Balance').withOption('width', '10%')
    );

    var qwhereobj = {
        status: '',
        journal: '',
        period: ''
    }

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere += ' where name="'+$scope.filterVal.search+'"'
                else qwhere = ''
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }
        else {
            $scope.dtInstance.reloadData(function(obj){
                console.log(obj)
            }, false)
        }
    }

    $scope.applyFilter = function(){
        console.log($scope.selected.filter_month)
        var status = []
        if ($scope.selected.filter_status.length>0){
            for (var i=0;i<$scope.selected.filter_status.length;i++){
                status.push($scope.selected.filter_status[i].id)
            }
            qwhereobj.status = ' a.gl_status in('+status.join(',')+') '
        }

        //console.log($scope.selected.filter_cost_center)
        if ($scope.selected.filter_journal.selected){
            qwhereobj.journal = ' a.journal_type_id = '+$scope.selected.filter_journal.selected.id+ ' '
        }
        //console.log($scope.selected.filter_warehouse)

        qwhereobj.period = ' (a.bookkeeping_date between \''+$scope.selected.filter_year.selected.id+'-'+$scope.selected.filter_month.selected.id+'-01\' and '+
        ' \''+$scope.selected.filter_year.selected.id+'-'+$scope.selected.filter_month.selected.id+'-'+$scope.selected.filter_month.selected.last+'\') '
        //console.log(setWhere())
        qwhere = setWhere()
        console.log(qwhere)
        $scope.dtInstance.reloadData(function(obj){
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
        $scope.statusShow.push($scope.status[0])
        $scope.selected.status['selected']=$scope.status[0]
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
        if ($scope.ap.id.length==0){
            //exec creation
            console.log($scope.ap)

            var param = {
                code: $scope.ap.code,
                journal_type_id: $scope.selected.journal_type.selected.id,
                bookkeeping_date: $scope.ap.bookkeeping_date,
                gl_status: $scope.selected.status.selected.id,
                notes: $scope.ap.notes,
                ref_account: $scope.ap.ref_account
            }
            console.log(param)
            queryService.post('insert into acc_gl_transaction SET ?',param)
            .then(function (result){

                var qd = $scope.child.saveTable(result.data.insertId);
                console.log(qd)
                queryService.post(qd.join(';') ,undefined)
                .then(function (result3){
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            // console.log(obj)
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
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Update: '+err3.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })

            },
            function (err){
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
                journal_type_id: $scope.selected.journal_type.selected.id,
                bookkeeping_date: $scope.ap.bookkeeping_date,
                gl_status: $scope.selected.status.selected.id,
                notes: $scope.ap.notes,
                ref_account: $scope.ap.ref_account
            }
            console.log(param)
            //queryService.post('insert into acc_ap_voucher SET ?',param)
            queryService.post('update acc_gl_transaction SET ? WHERE id='+$scope.ap.id ,param)
            .then(function (result){
                var qd = $scope.child.saveTable($scope.ap.id);
                console.log(qd)
                queryService.post(qd.join(';') ,undefined)
                .then(function (result3){
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            // console.log(obj)
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
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Update: '+err3.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            },
            function (err){
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

    $scope.update = function(obj){
        console.log(qstring+ ' where a.id='+obj.id)
        queryService.post(qstring+ ' where a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)
            $('#form-input').modal('show');
            $scope.ap = result.data[0]
            $scope.selected.journal_type['selected'] = {
                id: result.data[0].journal_type_id,
                name: result.data[0].journal_type_name
            }

            for (var i=0;i<$scope.status.length;i++){
                if ($scope.status[i].id==result.data[0].status){
                    $scope.selected.status['selected'] = $scope.status[i]
                }
            }
            $scope.statusShow = []
            if (result.data[0].status=="0"){
                $scope.statusShow.push($scope.status[1])
            }
            else if(result.data[0].status=="1"){
                $scope.statusShow.push($scope.status[2])
            }
            $scope.items = []
            $scope.itemsOri = []
            var qd = 'select a.*, b.name account_name,b.code account_code '+
                  'from acc_gl_journal a '+
                  'left join mst_ledger_account b on a.account_id = b.id '+
                  'where gl_id='+$scope.ap.id
            queryService.get(qd,undefined)
            .then(function(result2){
                console.log(result2)
                var d = result2.data
                var d1 = 0,c1=0

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
                    d1 += d[i].transc_type=='D'?d[i].amount:0
                    c1 += d[i].transc_type=='C'?d[i].amount:0
                    $scope.account[i+1] = $scope.accounts

                }
                $scope.total_debit = d1
                $scope.total_credit = c1
                $scope.ap.debit = d1
                $scope.ap.credit = c1
                $scope.ap.balance = d1-c1
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

    $scope.execDelete = function(){
        queryService.post('update ref_product_category set status=2 where id='+$scope.cat.id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
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
        $scope.cat = {
            id: '',
            name: '',
            description: '',
            status: ''
        }
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
        console.log(id)
        var filtered = $filter('filter')($scope.items, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

    // add user

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
        console.log('asd')
        var results = [];
        console.log($scope.itemsOri)

        console.log(JSON.stringify($scope.items,null,2))
        var sqlitem = []
        var d=0,c=0;
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
            console.log(user)
            // actually delete user
            /*if (user.isDeleted) {
                $scope.items.splice(i, 1);
            }*/
            // mark as not new
            /*if (user.isNew) {
                user.isNew = false;
            }*/

            // send on server
            //results.push($http.post('/saveUser', user));
            //d += (user.debit.length>0?parseFloat(user.debit):0);
            //c += (user.credit.length>0?parseFloat(user.credit):0);
            if (user.isNew && !user.isDeleted){

                if (user.debit>0){
                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'D\','+user.debit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }
                else if (user.credit>0){
                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'C\','+user.credit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }

            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_gl_journal where id='+user.p_id)
            }
            else if(!user.isNew){
                console.log(user)
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri._id+$scope.itemsOri[j].account_id+$scope.itemsOri[j].debit+$scope.itemsOri[j].credit
                        var d2 = user.pid+user.account_id+user.debit+user.credit
                        if(d1 != d2){
                            sqlitem.push('update acc_gl_journal set '+
                            ' account_id = '+user.account_id+',' +
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
        console.log($scope.items)
        console.log(sqlitem.join(';'))
        $scope.ap.debit = $scope.total_debit;
        $scope.ap.credit = $scope.total_credit;
        $scope.ap.balance = $scope.ap.debit-$scope.ap.credit;
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
            $scope.account[d] = data.data
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
        console.log(e)
        $scope.items[d-1].account_id = e.id
        $scope.items[d-1].account_code = e.code
        $scope.items[d-1].account_name = e.name

    }

    $scope.getProductPriceSupplier = function(e,d){
        console.log(e)
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
        console.log(e)
        console.log(d)
        console.log(p)
        console.log(t)
        $scope.total_debit = 0
        $scope.total_credit = 0
        if (t=='debit') {
            $scope.items[d-1].debit = p
            //$scope.total_debit += parseFloat(p)
        }
        if (t=='credit') {
            $scope.items[d-1].credit = p
            //$scope.total_credit += $scope.total_credit+parseFloat(p)
        }
        for (var i=0;i<$scope.items.length;i++){
            console.log('debit:'+$scope.items[i].debit+';credit:'+$scope.items[i].credit)
            $scope.total_debit= $scope.total_debit + (parseInt($scope.items[i].debit)>0?parseFloat($scope.items[i].debit):0)
            $scope.total_credit= $scope.total_credit+ (parseInt($scope.items[i].credit)>0?parseFloat($scope.items[i].credit):0)
            console.log('totdebit:'+$scope.total_debit+';totcredit:'+$scope.total_debit)
        }

    }

});