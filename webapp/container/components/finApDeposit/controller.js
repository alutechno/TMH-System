
var userController = angular.module('app', []);
userController
.controller('FinApDepositCtrl',
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
    $scope.trans = []
    $scope.transOri = []
    $scope.child = {}
    var qstring = 'select a.id,a.code, a.home_currency_exchange,a.check_no, '+
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
          'left join ref_currency f on a.used_currency_id = f.id  '
        //'where a.status in (:status1,:status2,:status3)  '+
        //'and a.open_date beetween :date1 and :date2  '+
        //'and a.due_date between :date1and :date2'
    var qwhere = ''
    var qstringt = 'select b.id,a.code,a.open_date,a.status,a.source,a.home_total_amount,b.applied_amount,a.current_due_amount '+
              'from acc_ap_voucher a '+
              'inner join acc_deposit_line_item b on a.id = b.voucher_id '
              //'where b.deposit_id=?'

    var year = ['2015','2016','2017','2018','2019']
    var month = ['01','02','03','04','05','06','07','08','09','10','11','12']
    $scope.period = [
        { id: 0, name: 'Current Month'},
        { id: 1, name: 'Last Month'}
    ]

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
        code: ''
    }

    $scope.selected = {
        status: {},
        startperiod: {},
        endperiod : {},
        period: {},
        supplier: {},
        currency: {},
        bank: {},
        bank_account: {}
    }
    $scope.selected.period = $scope.period[0]
    $scope.status = [
        {id: 0, name: 'Open'},
        {id: 1, name: 'Prepare'},
        {id: 2, name: 'Close'}
    ]

    $scope.status = []
    $scope.statusShow = []
    queryService.get('select value id, value, name from table_ref where table_name = \'acc_cash_deposit\' and column_name = \'status\' order by id ',undefined)
    .then(function(data){
        $scope.status = data.data
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

    $scope.bank = []
    queryService.get('select id,code,name from mst_cash_bank where status = \'1\' order by name ',undefined)
    .then(function(data){
        $scope.bank = data.data
    })
    $scope.bank_account = []
    $scope.setBankAccount = function(e){
        queryService.get('select id,code,name from mst_cash_bank_account where bank_id='+e.id+'  order by name ',undefined)
        .then(function(data){
            $scope.bank_account = data.data
        })
    }


    /*$scope.source = [
        {id:0,code:'R',name:'Receiving'},
        {id:1,code:'O',name:'Other Source'}
    ]*/
    /*queryService.get('select value id,name from table_ref where table_name = \'acc_ap_voucher\' and column_name = \'source\' order by name asc',undefined)
    .then(function(data){
        $scope.source = data.data
    })*/
    $scope.currency = []
    queryService.get('select  id currency_id,code currency_code,name currency_name from ref_currency order by id asc',undefined)
    .then(function(data){
        $scope.currency = data.data
    })

    $scope.tax = []
    queryService.get('select  id ,code ,name ,account_id from mst_taxes where status=\'1\' order by id asc',undefined)
    .then(function(data){
        $scope.tax = data.data
    })




    $scope.filterVal = {
        search: ''
    }

    $scope.isReceiving = true
    $scope.supplier = []
    queryService.post('select id supplier_id,name supplier_name from mst_supplier order by name limit 50',undefined)
    .then(function(data){
        $scope.supplier = data.data
    })
    $scope.findSupplier = function(text){
        queryService.post('select id supplier_id, name supplier_name from mst_supplier where lower(name) like \'%'+text.toLowerCase()+'%\' order by name asc limit 50',undefined)
        .then(function(data){
            $scope.supplier = data.data
        })
    }
    $scope.source_no = []
    $scope.setSource = function(e){
        $scope.ap.source=$scope.selected.source.selected.id
        console.log(e)
        if (e.value == 'RR') {
            $scope.isReceiving = false
            queryService.post('select id,code,cast(concat(\'Amount: \',ifnull(total_amount,\' - \')) as char) total_amount from inv_po_receive order by id desc limit 50',undefined)
            .then(function(data){
                console.log(data.data)
                $scope.source_no = data.data
                //$scope.isReceiving = false
            })
        }
        else $scope.isReceiving = true
    }

    $scope.showAdvance = false
    $scope.openAdvancedFilter = function(val){
        console.log(val)
        $scope.showAdvance = val
    }

    $scope.setReceiving = function(e){
        console.log(e)
        $scope.ap.source_no=$scope.selected.source_no.selected.id
        queryService.post('select a.id,a.po_id,c.name,DATE_FORMAT(a.created_date, \'%Y-%m-%d\') created_date,a.currency_id,d.due_days,d.supplier_id,e.name supplier_name,f.code currency_name,a.total_amount,a.home_currency_exchange exchange, '+
            ' DATE_ADD(a.created_date, INTERVAL d.due_days DAY) due_date '+
            'from inv_po_receive a,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f '+
            'where c.table_name=\'inv_po_receive\' '+
            'and a.received_status=c.value '+
            'and a.po_id=d.id '+
            'and d.supplier_id=e.id '+
            'and a.currency_id=f.id '+
            'and a.id=' + e.id +
            ' order by a.id desc',undefined)
        .then(function(data){
            console.log(data.data)
            $scope.supplier = data.data
            $scope.selected.supplier['selected'] = $scope.supplier[0]
            $scope.selected.currency['selected'] = $scope.supplier[0]
            $scope.ap.exchange = data.data[0].exchange
            $scope.ap.total_idr = data.data[0].total_amount*data.data[0].exchange
            $scope.ap.total_home = $scope.ap.total_idr
            $scope.ap.open_date = data.data[0].created_date
            $scope.ap.due_date = data.data[0].due_date
        })
    }

    $scope.findReceiving = function(text){
        console.log(text)
        queryService.get('select id,code,cast(concat(\'Amount: \',ifnull(total_amount,\' - \')) as char) total_amount from inv_po_receive where lower(code) like \'%'+text.toLowerCase()+'%\' order by id desc limit 50',undefined)
        .then(function(data){
            $scope.currency = data.data
        })

    }
    $scope.setSupplier = function(e){
        console.log(e)
        $scope.ap.supplier_id=$scope.selected.supplier.selected.supplier_id
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
            data.query = qstring + qwhere;
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
        DTColumnBuilder.newColumn('id').withTitle('Transc No'),
        DTColumnBuilder.newColumn('code').withTitle('Doc No').withOption('width', '10%'),
        DTColumnBuilder.newColumn('open_date').withTitle('Open Date').withOption('width', '10%'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier').withOption('width', '20%'),
        //DTColumnBuilder.newColumn('age').withTitle('Age'),
        DTColumnBuilder.newColumn('bank_name').withTitle('Bank'),
        DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account'),
        DTColumnBuilder.newColumn('currency').withTitle('Currency'),
        DTColumnBuilder.newColumn('home_deposit_amount').withTitle('Forex Total'),
        DTColumnBuilder.newColumn('tot_deposit_amount').withTitle('Total'),
        DTColumnBuilder.newColumn('tot_applied_amount').withTitle('Applied'),
        DTColumnBuilder.newColumn('tot_balance_amount').withTitle('Balance')
    );

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

    /*END AD ServerSide*/

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $scope.statusShow.push($scope.status[0])
        $scope.selected.status['selected'] = $scope.status[0]
        $('#form-input').modal('show')
    }
    $scope.setIdr = function(a,b){
        console.log(a+b)
        $scope.ap[b] = parseInt($scope.ap[a]*$scope.ap.exchange)
        $scope.ap.balance_home = $scope.ap.deposit_home-$scope.ap.applied_home
        $scope.ap.balance_idr = $scope.ap.deposit_idr-$scope.ap.applied_idr
    }

    $scope.submit = function(){
        if ($scope.ap.id.length==0){
            //exec creation
            console.log($scope.ap)
            var applied_amount = 0
            var applied_amount_home = 0

            var param = {
                code: $scope.ap.code,
            	check_no: $scope.ap.check,
            	bank_account_id: $scope.selected.bank_account.selected.id,
            	status: $scope.selected.status.selected.id,
            	open_date: $scope.ap.open_date,
            	supplier_id: $scope.selected.supplier.selected.supplier_id,
            	notes: $scope.ap.notes,
            	used_currency_id: $scope.selected.currency.selected.currency_id,
            	home_currency_exchange: $scope.ap.exchange,
            	tot_deposit_amount: $scope.ap.deposit_idr,
            	home_deposit_amount: $scope.ap.deposit_home,
            	tot_applied_amount: $scope.ap.applied_home,
            	home_applied_amount: $scope.ap.applied_idr,
            	tot_balance_amount: $scope.ap.balance_idr,
            	home_balance_amount: $scope.ap.balance_home,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
            }
            console.log(param)

            queryService.post('insert into acc_cash_deposit SET ?',param)
            .then(function (result){
                var qstr = $scope.child.saveTableT(result.data.insertId)
                queryService.post(qstr.join(';'),undefined)
                .then(function (result2){
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){}, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert '+$scope.ap.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                        $scope.clear();
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
            	check_no: $scope.ap.check,
            	bank_account_id: $scope.selected.bank_account.selected.id,
            	status: $scope.selected.status.selected.id,
            	open_date: $scope.ap.open_date,
            	supplier_id: $scope.selected.supplier.selected.supplier_id,
            	notes: $scope.ap.notes,
            	used_currency_id: $scope.selected.currency.selected.currency_id,
            	home_currency_exchange: $scope.ap.exchange,
            	tot_deposit_amount: $scope.ap.deposit_idr,
            	home_deposit_amount: $scope.ap.deposit_home,
            	tot_applied_amount: $scope.ap.applied_home,
            	home_applied_amount: $scope.ap.applied_idr,
            	tot_balance_amount: $scope.ap.balance_idr,
            	home_balance_amount: $scope.ap.balance_home,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
            }
            console.log(param)

            queryService.post('update acc_cash_deposit SET ? WHERE id='+$scope.ap.id ,param)
            .then(function (result){
                if ($scope.selected.status.selected.id=='1'){
                    var qq = 'insert into acc_gl_transaction(bookkeeping_date,code,deposit_id,gl_status,journal_type_id,notes) '+
                     'values(\''+$scope.ap.open_date+'\',\''+$scope.ap.code+'\','+$scope.ap.id+',\'0\',null,\''+$scope.ap.notes+'\');'
                    var q1 = 'insert into acc_gl_transaction'
                    var p1 = {
                        code: $scope.ap.code,
                        bookkeeping_date: $scope.ap.open_date,
                        journal_type_id: null,
                        deposit_id: $scope.ap.id,
                        gl_status: '0',
                        notes: $scope.ap.notes
                    }
                    queryService.post(qq ,undefined)
                    .then(function (result2){
                        var q2 = $scope.child.saveTable(result2.data.insertId)
                        console.log(q2)
                        queryService.post(q2.join(';') ,undefined)
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
                        function(err3){
                            console.log(err2)
                        })
                    },
                    function(err2){
                        console.log(err2)
                    })
                }
                else if($scope.selected.status.selected.id=='2'){
                    var qs = 'update acc_gl_transaction set gl_status = \'1\' where deposit_id = '+$scope.ap.id
                    queryService.post(qs ,undefined)
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
                    function(err3){
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Update: '+err3.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                }
                else {
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
                }

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
        queryService.post(qstring+ ' where a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)
            $('#form-input').modal('show');
            $scope.ap = result.data[0]
            $scope.selected.bank['selected']= {
                id: result.data[0].bank_id,
                name: result.data[0].bank_name
            }
            $scope.selected.bank_account['selected'] = {
                id: result.data[0].bank_account_id,
                name: result.data[0].bank_account
            }
            $scope.selected.supplier['selected'] = {
                supplier_id: result.data[0].supplier_id,
                supplier_name: result.data[0].supplier_name
            }
            $scope.selected.status['selected'] = {
                id: result.data[0].status,
                name: result.data[0].status_name
            }
            $scope.selected.currency['selected'] = {
                currency_id:result.data[0].used_currency_id,
                currency_name: result.data[0].currency
            }
            $scope.ap.check = result.data[0].check_no
            $scope.ap.exchange = result.data[0].home_currency_exchange

            $scope.ap.deposit_home = result.data[0].home_deposit_amount
            $scope.ap.deposit_idr = result.data[0].tot_deposit_amount
            $scope.ap.applied_home = result.data[0].home_applied_amount
            $scope.ap.applied_idr = result.data[0].tot_applied_amount
            $scope.ap.balance_home = result.data[0].home_balance_amount
            $scope.ap.balance_idr = result.data[0].tot_balance_amount
            $scope.statusShow = []
            if (result.data[0].status=="0"){
                $scope.statusShow.push($scope.status[1])
            }
            else if(result.data[0].status=="1"){
                $scope.statusShow.push($scope.status[2])
            }
            queryService.get(qstringt+ ' where b.deposit_id='+obj.id,undefined)
            .then(function(result2){
                var d = result2.data
                console.log(d)
                for (var i=0;i<d.length;i++){
                    $scope.trans.push(
                        {
                            id:(i+1),
                            p_id: d[i].id,
                            code:d[i].code,
                            open_date:d[i].open_date,
                            status: d[i].status,
                            source: d[i].source,
                            home_total_amount: d[i].home_total_amount,
                            total_amount: d[i].total_amount,
                            applied_amount: d[i].applied_amount,
                            current_due_amount: d[i].current_due_amount
                        }
                    )
                }


            },function(err2){
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Failed Fetch Data: '+err2.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
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
        $scope.ap = {
            id: '',
            name: '',
            description: '',
            status: ''
        }
    }

})
.controller('EditableTableApdtCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
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
    $scope.voucher = {}
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.trans.length+1),
            p_id: '',
            code:'',
            open_date:'',
            status: '',
            source: '',
            home_total_amount: '',
            total_amount: '',
            applied_amount: '',
            current_due_amount: '',
            isNew: true
        };
        $scope.trans.push($scope.item)
        queryService.get('select a.id,a.code,a.open_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name '+
            'from acc_ap_voucher a,(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
            	'and column_name = \'status\')b '+
            'where a.status=b.value '+
            'order by id limit 20 ',undefined)
        .then(function(data){
            $scope.voucher[$scope.item.id] = data.data
        })
    };

    // cancel all changes
    $scope.cancel = function() {
        for (var i = $scope.trans.length; i--;) {
            var user = $scope.trans[i];
            // undelete
            if (user.isDeleted) {
                delete user.isDeleted;
            }
            // remove new
            if (user.isNew) {
                $scope.trans.splice(i, 1);
            }
        };
    };


    // save edits
    $scope.child.saveTableT = function(pr_id) {
        console.log('asd')
        var results = [];
        console.log($scope.transOri)

        console.log(JSON.stringify($scope.trans,null,2))
        var sqlitem = []
        for (var i = $scope.trans.length; i--;) {
            var user = $scope.trans[i];
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
            if (user.isNew && !user.isDeleted){
                sqlitem.push('insert into acc_deposit_line_item (deposit_id,voucher_id,applied_amount,created_by,created_date) values('+
                pr_id+','+user.p_id+','+user.applied_amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_deposit_line_item where id='+user.p_id)
            }
            else if(!user.isNew){
                console.log(user)
                for (var j=0;j<$scope.transOri.length;j++){
                    if ($scope.transOri[j].p_id==user.p_id){
                        var d1 = $scope.transOri.p_id+$scope.transOri[j].voucher_id+$scope.itemsOri[j].applied_amount
                        var d2 = user.p_id+user.voucher_id+user.applied_amount
                        if(d1 != d2){
                            sqlitem.push('update acc_deposit_line_item set '+
                            ' voucher_id = '+user.voucher_id+',' +
                            ' applied_amount = '+user.applied_amount+',' +
                            ' home_total_amount = '+user.home_total_amount+',' +
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
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.products = []

    $scope.voucherUp = function(d,text) {
        //queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        queryService.post('select a.id,a.code,a.open_date,a.status,a.source,a.home_total_amount,a.total_amount,a.current_due_amount,b.name status_name '+
            'from acc_ap_voucher a,(select * from table_ref where table_name = \'acc_ap_voucher\'  '+
            	'and column_name = \'status\')b '+
            'where a.status=b.value '+
            'and lower(code) like \''+text.toLowerCase()+'%\' '+
            'order by id limit 20 ',undefined)
        .then(function(data){
            $scope.voucher[d] = data.data
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

    $scope.getVoucher = function(e,d){
        console.log(e)
        $scope.trans[d-1].code = e.code
        $scope.trans[d-1].p_id = e.id
        $scope.trans[d-1].open_date = e.open_date
        $scope.trans[d-1].status_id = e.status_id
        $scope.trans[d-1].status_name = e.status_name
        $scope.trans[d-1].source = e.source
        $scope.trans[d-1].home_total_amount = e.home_total_amount
        $scope.trans[d-1].total_amount = e.total_amount
        $scope.trans[d-1].current_due_amount = e.current_due_amount

    }

    $scope.setValue = function(e,d,p){
        $scope.trans[d-1].applied_amount = p
        $scope.ap.applied_home = 0
        for (var i=0;i<$scope.trans.length;i++){
            $scope.ap.applied_home += parseInt($scope.trans[i].applied_amount)
        }
        $scope.ap.applied_idr = $scope.ap.applied_home*$scope.ap.exchange

    }

})
.controller('EditableTableApdgCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
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
    $scope.account = {}
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
            if (user.isNew && !user.isDeleted){

                if (user.debit>0){
                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'D\','+user.debit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }
                else if (user.credit>0){
                    sqlitem.push('insert into acc_journal_entries (gl_id,account_id,transc_type,amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'D\','+user.credit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }

            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_gl_journal where id='+user.p_id)
            }
            /*else if(!user.isNew){
                console.log(user)
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri._id+$scope.itemsOri[j].account_id+$scope.itemsOri[j].debit+$scope.itemsOri[j].credit
                        var d2 = user.pid+user.account_id+user.debit+user.credit
                        if(d1 != d2){
                            sqlitem.push('update acc_gl_journal set '+
                            ' account_id = '+user.account_id+',' +
                            ' transc_type = '+(user.debit>0?'D':'C')+',' +
                            ' amount = '+user.debit>0?user.debit:user.credit+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
                        }
                    }
                }
            }*/

        }
        console.log($scope.items)
        console.log(sqlitem.join(';'))
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
    $scope.funcAsync = function(e,d){
        console.log('funcAsync')
        console.log($scope.items[d-1].product_id)
        var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
            'from mst_supplier a '+
            'left join inv_prod_price_contract b '+
            'on a.id = b.supplier_id  '+
            'and a.status=1  '+
            'and b.product_id ='+$scope.items[d-1].product_id + ' '+
            'and lower(a.name) like \''+e.toLowerCase()+'%\'' +
            ' order by price desc limit 50'
        //queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
        queryService.post(sqlCtr,undefined)
        .then(function(data){
            $scope.suppliers = data.data
        })
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
        if (t=='debit') $scope.items[d-1].debit = p
        if (t=='credit') $scope.items[d-1].credit = p
    }

});