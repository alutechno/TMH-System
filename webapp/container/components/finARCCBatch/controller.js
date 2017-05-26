var trim = function (str) {
    return str.replace(/\t\t+|\n\n+|\s\s+/g, ' ').trim()
};
var toProperCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
angular.module('app', []).controller('FinARCCBatchCtrl', function ($scope, $state, $sce,
    queryService, departmentService, accountTypeService, DTOptionsBuilder,
    DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction, API_URL
) {
    var qstring = trim(`
        SELECT
            *,
            format(total_amount,0) total_amount_,
            format(fee_amount,0) fee_amount_,
            format(net_due_amount,0) net_due_amount_
        FROM acc_ar_ccard_batch
        WHERE status = 1  
    `);
    var qwhere = '';

    $scope.el = $state.current.data || [];
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;

    for (var i = 0; i < $scope.el.length; i++) $scope[$scope.el[i]] = true;

    $scope.fields = [
        "code", "bank_account_id", "status", "outlet_type_id", "transc_date", "remarks",
        "total_amount", "fee_amount", "net_due_amount", "settle_date", "settle_ref_no"
    ];
    $scope.titles = $scope.fields.map(function (str) {
        return toProperCase(str.replace(/\_/g, " "))
    });
    $scope.DATA = {};
    $scope.data = {};
    $scope.selected = {
        bank_account: {},
        outlet_type: {}
    };
    $scope.bank_accounts = [];
    $scope.outlet_types = [];

    for (var f in $scope.fields) $scope.data[$scope.fields[f]] = '';

    //queryService.get('', undefined).then(function (res) {
    //    $scope.bank_accounts = res.data
    //});
    //queryService.get('', undefined).then(function (res) {
    //    $scope.outlet_types = res.data
    //});

    $scope.focusinControl = {};
    $scope.fileName = "Account Receivable Credit Card Batch";
    $scope.exportExcel = function () {
        queryService.post(trim(`
            select ${$scope.fields.toString()} from (${qstring} ${qwhere}) myAlias
        `), undefined).then(function (res) {
            $scope.exportData = [$scope.titles];
            res.data.forEach(function (d) {
                $scope.exportData.push($scope.fields.map(function (key) {
                    return d[key]
                }))
            });
            $scope.focusinControl.downloadExcel()
        })
    };

    $scope.filterVal = {search: ''};
    $scope.trustAsHtml = function (value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {}; //Use for reloadData
    $scope.actionsHtml = function (i, type, data, meta) {
        var html = '';

        $scope.DATA[i] = data;
        if ($scope.el.length > 0) {
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate') > -1) {
                html += `
                    <button class="btn btn-default" ng-click="update(${i})">
                        <i class="fa fa-edit"></i>
                    </button>
                `;
            }
            if ($scope.el.indexOf('buttonDelete') > -1) {
                html += `
                    <button class="btn btn-default" ng-click="delete(${i})">
                        <i class="fa fa-trash-o"></i>
                    </button>
                `;
            }
            html += '</div>'
        }
        return html
    };

    $scope.createdRow = function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    };

    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL + '/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization": 'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstring + qwhere;
        }
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('responsive', true)
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withPaginationType('full_numbers')
    .withDisplayLength(10)
    .withOption('order', [0, 'asc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length > 0) {
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '80px'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '130px'),
        //DTColumnBuilder.newColumn('bank_account_id').withTitle('Account Bank ID'),
        //DTColumnBuilder.newColumn('outlet_type_id').withTitle('Outlet Type ID'),
        DTColumnBuilder.newColumn('transc_date').withTitle('Date')
        .renderWith(function (i, type, data, prop) {
            return moment(new Date(data.transc_date)).format('YYYY-MM-DD')
        }).withOption('width', '120px'),
        DTColumnBuilder.newColumn('total_amount_').withTitle('Total').withOption('width', '110px'),
        DTColumnBuilder.newColumn('fee_amount_').withTitle('Fee').withOption('width', '110px'),
        DTColumnBuilder.newColumn('net_due_amount_').withTitle('Net Due').withOption('width', '110px'),
        DTColumnBuilder.newColumn('settle_date').withTitle('Settle Date')
        .renderWith(function (i, type, data, prop) {
            return moment(new Date(data.settle_date)).format('YYYY-MM-DD')
        }).withOption('width', '120px'),
        DTColumnBuilder.newColumn('settle_ref_no').withTitle('Settle Ref No.').withOption('width', '110px'),
        DTColumnBuilder.newColumn('remarks').withTitle('Remarks').withOption('width', '120px')
    );

    var qwhereobj = {
        text: ''
    };
    $scope.filter = function (type, event) {
        if (type == 'search') {
            if (event.keyCode == 13) {
                if ($scope.filterVal.search.length > 0) {
                    var fields = $scope.fields.map(function (x) {
                        return `${x} LIKE '%${$scope.filterVal.search}%'`
                    }).join(' OR ');
                    qwhereobj.text = ` ${fields} `
                } else qwhereobj.text = '';
                qwhere = setWhere();
                $scope.dtInstance.reloadData()
            }
        }
        else {
            $scope.dtInstance.reloadData()
        }
    };
    function setWhere() {
        var arrWhere = [];
        var strWhere = '';
        for (var key in qwhereobj) {
            if (qwhereobj[key].length > 0) arrWhere.push(qwhereobj[key])
        }
        if (arrWhere.length > 0) {
            strWhere = ' and ' + arrWhere.join(' and ')
        }
        return strWhere
    }

    /*END AD ServerSide*/
    $scope.openQuickView = function (state) {
        if (state == 'add') {
            $scope.clear();
            queryService.post(`select curr_document_no('CCB','${moment().format('YYYY/MM')}') code`)
            .then(function (res) {
                Object.assign($scope.data, res.data[0]);
                $('#form-input').modal('show')
            });
        } else {
            $('#form-input').modal('show')
        }
    };
    $scope.submit = function () {
        var param = Object.assign({}, $scope.data);
        param.status = 1;
        if (!$scope.data.id) {
            queryService.post(`select next_document_no('CCB','${moment().format('YYYY/MM')}') code`)
            .then(function (res) {
                Object.assign(param, res.data[0]);
                param.created_date = globalFunction.currentDate();
                param.created_by = $localStorage.currentUser.name.id;
                queryService.post('insert into acc_ar_ccard_batch SET ?', param)
                .then(
                    function (result) {
                        $('#form-input').modal('hide');
                        $scope.dtInstance.reloadData();
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert',
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                        $scope.clear()

                    },
                    function (err) {
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Insert: ' + err.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    }
                )
            });

        } else { //exec update
            param.modified_date = globalFunction.currentDate();
            param.modified_by = $localStorage.currentUser.name.id;

            queryService.post(
                'update acc_ar_ccard_batch SET ? WHERE id=' + $scope.editing.id, param
            ).then(function (result) {
                if (result.status = "200") {
                    $('#form-input').modal('hide');
                    $scope.dtInstance.reloadData();
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update',
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear()
                }
                else {
                    console.log('Failed Update')
                }
            })
        }
    };
    $scope.update = function (key) {
        $('#form-input').modal('show');
        $scope.editing = $scope.DATA[key];
        queryService.post(qstring + 'AND a.id=' + $scope.editing.id, undefined).then(function (result) {
            var d = result.data[0];
            $scope.data = Object.assign($scope.data, d);
            $scope.data.transc_date = moment(new Date(d.transc_date)).format('YYYY-MM-DD');
            $scope.data.settle_date = moment(new Date(d.settle_date)).format('YYYY-MM-DD');
        })
    };
    $scope.delete = function (key) {
        $scope.removing = $scope.DATA[key];
        queryService.get(trim(qstring + 'AND a.id=' + $scope.removing.id), undefined)
        .then(function (result) {
            $('#modalDelete').modal('show')
        })
    };
    $scope.execDelete = function () {
        queryService.post('update acc_ar_ccard_batch SET status=\'2\', ' +
            ' modified_by=' + $localStorage.currentUser.name.id + ', ' +
            ' modified_date=\'' + globalFunction.currentDate() + '\' ' +
            ' WHERE id=' + $scope.removing.id, undefined)
        .then(function (result) {
            if (result.status = "200") {
                $('#form-input').modal('hide');
                $scope.dtInstance.reloadData();
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete ' + $scope.data.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
            } else {
                console.log('Delete Failed')
            }
        })
    };
    $scope.clear = function () {
        for (var key in $scope.data) $scope.data[key] = '';
    };
    //
    var date1 = $('#data_transc_date');
    var date2 = $('#data_settle_date');
    date1.datepicker({
        parentEl: '#form-input',
        showDropdowns: true,
        opens: 'left'
    });
    date2.datepicker({
        parentEl: '#form-input',
        showDropdowns: true,
        opens: 'left'
    });

    date1.datepicker('setDate', moment(new Date()).format('YYYY-MM-DD'));
    date2.datepicker('setDate', moment(new Date()).format('YYYY-MM-DD'));
});