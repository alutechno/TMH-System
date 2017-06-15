
var userController = angular.module('app', []);
userController
.controller('FinGlRecurringCtrl',
function($scope, $state, $sce, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
	$scope.disableAction = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []
    $scope.items = []
    $scope.itemsOri = []
    $scope.child = {}
    $scope.posting = false
    var qstring = 'select a.id, a.name, a.description, a.frequency_id, b.name as \'frequency_name\', '+
               'a.last_posted, a.next_due, a.over_due_count, a.status,  '+
               'c.name as \'status_name\', a.journal_type_id, d.name as journal_type,  '+
               'a.notes, ref_account,  '+
               'sum(case when e.transc_type = \'D\' then e.last_amount else 0 end) as last_debit,  '+
               'sum(case when e.transc_type = \'C\' then e.last_amount else 0 end) as last_credit '+
      'from acc_recurring_journal a '+
      'left join ref_recurring_frequency b on a.frequency_id = b.id '+
      'left join (select value, name, description '+
                   'from table_ref  '+
                              'where table_name = \'acc_recurring_journal\' '+
                    'and column_name = \'status\') c on a.status = c.value '+
      'left join ref_journal_type d on d.id = a.journal_type_id '+
      'left join acc_recurring_entries e on a.id = e.recurring_id ';
     var qgroup = ' group by a.id  '
        //'where a.status in (:status1,:status2,:status3)  '+
        //'and a.open_date beetween :date1 and :date2  '+
        //'and a.due_date between :date1and :date2'
    var qwhere = ''

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
        code: '',
        notes: ''
    }

    $scope.selected = {
        status: {},
        frequency: {},
        journal_code: {},
        gl_status: {}
    }

    $scope.status = []
    $scope.statusShow = []
    queryService.get('select value id, value, name from table_ref where table_name = \'acc_recurring_journal\' and column_name = \'status\' order by id ',undefined)
    .then(function(data){
        $scope.status = data.data
    })

    $scope.gl_status = []
    queryService.get('select * from table_ref where table_name = \'acc_gl_transaction\' and column_name = \'gl_status\' order by id ',undefined)
    .then(function(data){
        $scope.gl_status = data.data
        $scope.selected.gl_status['selected'] = $scope.gl_status[0]
    })


    $scope.frequency = []
    queryService.get('select id,name from ref_recurring_frequency where status = \'1\' order by id',undefined)
    .then(function(data){
        $scope.frequency = data.data
    })

    $scope.jornal_code = []
    queryService.get('select * from ref_journal_type where status = \'1\' order by id',undefined)
    .then(function(data){
        $scope.journal_code = data.data
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
            if ($scope.el.indexOf('postingTransaction')>-1){
                html +=
                '<button class="btn btn-default" title="Post Recurring Journal" ng-click="postRecurring(cats[\'' + data + '\'])">' +
                '   <i class="fa fa-archive"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(cats[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(cats[\'' + data + '\'])" )"="">' +
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
        DTColumnBuilder.newColumn('id').withTitle('ID'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '20%'),
        DTColumnBuilder.newColumn('description').withTitle('Description').withOption('width', '20%'),
        DTColumnBuilder.newColumn('frequency_name').withTitle('Frequency'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('journal_type').withTitle('Journal Type'),
        DTColumnBuilder.newColumn('notes').withTitle('Notes'),
        DTColumnBuilder.newColumn('ref_account').withTitle('Ref Account'),
        DTColumnBuilder.newColumn('last_posted').withTitle('Last Posted').withOption('width', '10%'),
        DTColumnBuilder.newColumn('over_due_count').withTitle('Over Due').withOption('width', '10%'),
        DTColumnBuilder.newColumn('next_due').withTitle('Next Due').withOption('width', '10%')
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
        $scope.selected.status['selected']=$scope.status[0]
        $('#form-input').modal('show')
        $scope.posting=false
    }

    $scope.submit = function(){
		$scope.disableAction = true;
        if ($scope.ap.id.length==0){
            //exec creation
            console.log($scope.ap)

            var param = {
                name: $scope.ap.name,
                description:$scope.ap.description,
                frequency_id: $scope.selected.frequency.selected.id,
                status: $scope.selected.status.selected.id,
                journal_type_id: $scope.selected.journal_code.selected.id,
                notes:$scope.ap.notes,
                ref_account: $scope.ap.ref_account,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
            }
            console.log(param)
            queryService.post('insert into acc_recurring_journal SET ?',param)
            .then(function (result){
                var qd = $scope.child.saveTable(result.data.insertId);
                console.log(qd)
                queryService.post(qd.join(';') ,undefined)
                .then(function (result3){
					$scope.disableAction = false;
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            // console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert '+$scope.ap.name,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                },
                function (err3){
					$scope.disableAction = false;
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
				$scope.disableAction = false;
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
            var param = {}
            if ($scope.posting == false){
                param = {
                    name: $scope.ap.name,
                    description:$scope.ap.description,
                    frequency_id: $scope.selected.frequency.selected.id,
                    status: $scope.selected.status.selected.id,
                    journal_type_id: $scope.selected.journal_code.selected.id,
                    notes:$scope.ap.notes,
                    ref_account: $scope.ap.ref_account,
                    created_by: $localStorage.currentUser.name.id,
                    created_date: globalFunction.currentDate()
                }
            }
            else if ($scope.posting==true){
                param = {
                    last_posted: globalFunction.currentDate(),
                    next_due: globalFunction.next30Day()
                }
            }

            console.log(param)
            //queryService.post('insert into acc_ap_voucher SET ?',param)
            queryService.post('update acc_recurring_journal SET ? WHERE id='+$scope.ap.id ,param)
            .then(function (result){
                if ($scope.posting==false){
                    var qd = $scope.child.saveTable($scope.ap.id);
                    console.log(qd)
                    if (qd.length>0){
                        queryService.post(qd.join(';') ,undefined)
                        .then(function (result3){
							$scope.disableAction = false;
                                $('#form-input').modal('hide')
                                $scope.dtInstance.reloadData(function(obj){
                                    // console.log(obj)
                                }, false)
                                $('body').pgNotification({
                                    style: 'flip',
                                    message: 'Success Update '+$scope.ap.name,
                                    position: 'top-right',
                                    timeout: 2000,
                                    type: 'success'
                                }).show();
                                $scope.posting = false
                        },
                        function (err3){
							$scope.disableAction = false;
                            $('#form-input').pgNotification({
                                style: 'flip',
                                message: 'Error Update: '+err3.code,
                                position: 'top-right',
                                timeout: 2000,
                                type: 'danger'
                            }).show();
                        })
                    }
                    else{
						$scope.disableAction = false;
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            // console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Update '+$scope.ap.name,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                        $scope.posting = false
                    }

                }
                else {
                    var param2 = {
                        code: $scope.ap.doc_no,
                        journal_type_id: $scope.selected.journal_code.selected.id,
                        bookkeeping_date: $scope.ap.date,
                        gl_status: $scope.selected.gl_status.selected.id,
                        notes: $scope.ap.notes,
                        ref_account: $scope.ap.ref_account,
                        source: 'Recurring'
                    }
                    queryService.post('insert into acc_gl_transaction SET ?' ,param2)
                    .then(function (result2){
                        var qd = $scope.child.saveJournalTable($scope.ap.id,result2.data.insertId);
                        console.log(qd)
                        queryService.post(qd.join(';') ,undefined)
                        .then(function (result3){
							$scope.disableAction = false;
                                $('#form-input').modal('hide')
                                $scope.dtInstance.reloadData(function(obj){
                                    // console.log(obj)
                                }, false)
                                $('body').pgNotification({
                                    style: 'flip',
                                    message: 'Success Posting '+$scope.ap.name,
                                    position: 'top-right',
                                    timeout: 2000,
                                    type: 'success'
                                }).show();
                                $scope.posting = false
                        },
                        function (err3){
							$scope.disableAction = false;
                            $('#form-input').pgNotification({
                                style: 'flip',
                                message: 'Error Posting: '+err3.code,
                                position: 'top-right',
                                timeout: 2000,
                                type: 'danger'
                            }).show();
                        })
                    },
                    function(err2){
						$scope.disableAction = false;
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Update: '+err2.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                }

            },
            function (err){
				$scope.disableAction = false;
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
        $scope.posting=false
        console.log(qstring+ ' where a.id='+obj.id)
        queryService.post(qstring+ ' where a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)
            $('#form-input').modal('show');
            $scope.ap = result.data[0]

            for (var i=0;i<$scope.status.length;i++){
                if ($scope.status[i].id==result.data[0].status){
                    $scope.selected.status['selected'] = $scope.status[i]
                }
            }
            $scope.selected.frequency['selected'] = {
                id: result.data[0].frequency_id,
                name: result.data[0].frequency_name
            }
            $scope.selected.journal_code['selected'] = {
                id: result.data[0].journal_type_id,
                name: result.data[0].journal_type
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
            var qd = 'select b.id,b.account_id, c.name account_name,c.code account_code, b.transc_type, b.last_amount amount '+
                  'from acc_recurring_journal a '+
                  'left join acc_recurring_entries b on a.id = b.recurring_id '+
                  'left join mst_ledger_account c on b.account_id = c.id '+
                 'where a.id =  '+$scope.ap.id
            queryService.post(qd,undefined)
            .then(function(result2){
                console.log(result2)
                var d = result2.data
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
                }
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

    $scope.postRecurring = function(obj){
        console.log(qstring+ ' where a.id='+obj.id)
        $scope.posting = true
        var dt = new Date()

        var ym = dt.getFullYear() + '/' + (dt.getMonth()<9?'0':'') + (dt.getMonth()+1)
        console.log(ym)
        queryService.post('select cast(concat(\'RJ/\',date_format(date(now()),\'%Y/%m/%d\'), \'/\', lpad(seq(\'RJ\',\''+ym+'\'),4,\'0\')) as char) as code ',undefined)
        .then(function(data){
            console.log(data)
            $scope.ap.doc_no = data.data[0].code
        })
        queryService.post(qstring+ ' where a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)
            $('#form-input').modal('show');
            $scope.ap = result.data[0]

            for (var i=0;i<$scope.status.length;i++){
                if ($scope.status[i].id==result.data[0].status){
                    $scope.selected.status['selected'] = $scope.status[i]
                }
            }
            $scope.selected.frequency['selected'] = {
                id: result.data[0].frequency_id,
                name: result.data[0].frequency_name
            }
            $scope.selected.journal_code['selected'] = {
                id: result.data[0].journal_type_id,
                name: result.data[0].journal_type
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
            var qd = 'select b.id,b.account_id, c.name account_name,c.code account_code, b.transc_type, b.last_amount amount '+
                  'from acc_recurring_journal a '+
                  'left join acc_recurring_entries b on a.id = b.recurring_id '+
                  'left join mst_ledger_account c on b.account_id = c.id '+
                 'where a.id =  '+$scope.ap.id
            queryService.post(qd,undefined)
            .then(function(result2){
                console.log(result2)
                var d = result2.data
                for (var i=0;i<d.length;i++){
                    $scope.items.push(
                        {
                            id:(i+1),
                            p_id: d[i].id,
                            account_id:d[i].account_id,
                            account_code:d[i].account_code,
                            account_name: d[i].account_name,
                            debit: d[i].transc_type=='D'?d[i].amount:'',
                            credit: d[i].transc_type=='C'?d[i].amount:'',
                            isNew: true
                        }
                    )
                }
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
        /*productCategoryService.get(obj.id)
        .then(function(result){
            $scope.cat.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })*/
    }

    $scope.execDelete = function(){
        /*queryService.post('update ref_product_category set status=2 where id='+$scope.cat.id,undefined)
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
        })*/
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
                    sqlitem.push('insert into acc_recurring_entries (recurring_id,account_id,transc_type,last_amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'D\','+user.debit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }
                else if (user.credit>0){
                    sqlitem.push('insert into acc_recurring_entries (recurring_id,account_id,transc_type,last_amount,created_by,created_date) values('+
                    pr_id+','+user.account_id+',\'C\','+user.credit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }

            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from acc_recurring_entries where id='+user.p_id)
            }
            else if(!user.isNew){
                console.log(user)
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri._id+$scope.itemsOri[j].account_id+$scope.itemsOri[j].debit+$scope.itemsOri[j].credit
                        var d2 = user.pid+user.account_id+user.debit+user.credit
                        if(d1 != d2){
                            sqlitem.push('update acc_recurring_entries set '+
                            ' account_id = '+user.account_id+',' +
                            ' transc_type = \''+(user.debit>0?'D':'C')+'\',' +
                            ' last_amount = '+(user.debit>0?user.debit:user.credit)+',' +
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

    $scope.child.saveJournalTable = function(pr_id,journal_id) {
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
                    journal_id+','+user.account_id+',\'D\','+user.debit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                    sqlitem.push('update acc_recurring_entries set last_amount='+user.debit+' where recurring_id ='+pr_id+' and id = '+user.p_id)
                }
                else if (user.credit>0){
                    sqlitem.push('insert into acc_gl_journal (gl_id,account_id,transc_type,amount,created_by,created_date) values('+
                    journal_id+','+user.account_id+',\'C\','+user.credit+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                    sqlitem.push('update acc_recurring_entries set last_amount='+user.credit+' where recurring_id ='+pr_id+' and id = '+user.p_id)
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
                            sqlitem.push('update acc_recurring_entries set '+
                            ' account_id = '+user.account_id+',' +
                            ' transc_type = \''+(user.debit>0?'D':'C')+'\',' +
                            ' last_amount = '+(user.debit>0?user.debit:user.credit)+',' +
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
