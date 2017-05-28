var trim = function (str) {
    return str.replace(/\t\t+|\n\n+|\s\s+/g, ' ').trim()
};
var toProperCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
angular.module('app', []).controller('FinARCCJournalCtrl', function ($scope, $state, $sce,
    queryService, departmentService, accountTypeService, DTOptionsBuilder,
    DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction, API_URL
) {
    $('#col-folio').hide();
    //
    var qstring = trim(`
		SELECT
            a.*,
            b.code credit_card_code, b.name credit_card_name,
            c.code outlet_type_code, c.name outlet_type_name, d.code folio_code,
            e.transc_type_id, e.transc_remarks, e.transc_charge, e.transc_ref,
            e.debit, e.credit, e.customer_id, e.customer_code, e.customer_title,
            e.customer_first_name, e.customer_last_name,
            f.code pos_order_code, g.code ccard_batch_code,
            format(a.credit_fee_amount,0) credit_fee_amount_,
            format(a.total_amount,0) total_amount_, h.name status_name
        FROM
            acc_ar_ccard_journal a
            LEFT JOIN mst_credit_card b on a.credit_card_id = b.id
            LEFT JOIN ref_ar_outlet_type c on a.outlet_type_id = c.id
            LEFT JOIN fd_guest_folio d on a.folio_id = d.id
            LEFT JOIN (
                SELECT
                    a.*, b.code customer_code, b.title customer_title,
                    b.first_name customer_first_name, b.last_name customer_last_name
                FROM
                    fd_folio_transc_account a
                    LEFT JOIN mst_customer b on a.customer_id = b.id
            ) e on e.folio_id = e.id
            LEFT JOIN pos_orders f on a.pos_order_id = f.id
            LEFT JOIN acc_ar_ccard_batch g on a.ccard_batch_id = g.id
            LEFT JOIN (
            	SELECT value id, name FROM table_ref WHERE table_name='acc_ar_ccard_journal' AND column_name='status'
            ) h on h.id = a.status
        WHERE a.status = 1
    `);
    var qwhere = '';

    $scope.el = $state.current.data || [];
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;

    for (var i = 0; i < $scope.el.length; i++) $scope[$scope.el[i]] = true;

    $scope.fields = [
        "code", "status", "transc_date", "credit_card_id", "card_no",
        "credit_fee_amount", "total_amount", "outlet_type_id", "folio_id",
        "fo_transc_id", "pos_order_id", "ccard_batch_id", "trace_no", "remark"
    ];
    $scope.titles = $scope.fields.map(function (str) {
        return toProperCase(str.replace(/\_/g, " "))
    });
    $scope.DATA = {};
    $scope.data = {};
    $scope.ls = {
        statuses: [],
        credit_cards: [],
        outlet_types: [],
        folios: [],
        fo_transactions: [],
        pos_orders: [],
        ccard_batches: []
    };

    for (var f in $scope.fields) $scope.data[$scope.fields[f]] = '';
    queryService.get(
        `select value id, name from table_ref where table_name='acc_ar_ccard_journal' and column_name='status'`
    ).then(function (res) {
        $scope.ls.statuses = res.data
    });
    queryService.get(
        `select id, code, name, percent_fee from mst_credit_card where status = '1' order by code`
    ).then(function (res) {
        $scope.ls.credit_cards = res.data
    });
    queryService.get(
        `select id, code, name from ref_ar_outlet_type where status = '1' order by code`
    ).then(function (res) {
        $scope.ls.outlet_types = res.data
    });
    queryService.get(
        `select * from fd_folio_transc_account where payment_id in (select id from ref_payment_method where is_credit_card = 'Y')`
    ).then(function (res) {
        $scope.ls.folios = res.data
    });
    queryService.get(`
        select
            c.id, c.code, c.customer_id, d.code customer_code,
            d.title customer_title, d.title customer_first_name,
            d.title customer_last_name, payment_amount
        from
            fd_guest_payment a
            left join ref_payment_method b on a.payment_type_id = b.id
            left join fd_guest_folio c on c.id = a.folio_id
            left join mst_customer d on d.id = c.customer_id
        where b.category in ('MST', 'VSA') and payment_status = 0
    `).then(function (res) {
        $scope.ls.fo_transactions = res.data
    });
    queryService.get(
        `select id, code from pos_orders where status = '1' order by code`
    ).then(function (res) {
        $scope.ls.pos_orders = res.data
    });
    queryService.get(
        `select id, code from acc_ar_ccard_batch where status = '1' order by code`
    ).then(function (res) {
        $scope.ls.ccard_batches = res.data
    });

    $scope.focusinControl = {};
    $scope.fileName = "Account Receivable Credit Card Journal";
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
            html = '<div class="btn-group btn-group-xs">';
            if ($scope.el.indexOf('buttonUpdate') > -1) {
                html += `
                    <button class="btn btn-default" title="Update" ng-click="update(${i})">
                        <i class="fa fa-edit"></i>
                    </button>
                `;
            }
            if ($scope.el.indexOf('buttonDelete') > -1) {
                html += `
                    <button class="btn btn-default" title="Delete" ng-click="delete(${i})">
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
        DTColumnBuilder.newColumn('code').withTitle('CC Journal#').withOption('width', '150px'),
        DTColumnBuilder.newColumn('transc_date').withTitle('Date')
        .renderWith(function (i, type, data, prop) {
            return moment(new Date(data.transc_date)).format('YYYY-MM-DD')
        }).withOption('width', '130px'),
        DTColumnBuilder.newColumn('status').withTitle('Status').withOption('width', '80px'),
        DTColumnBuilder.newColumn('outlet_type_name').withTitle('Outlet').withOption('width', '150px'),
        DTColumnBuilder.newColumn('ccard_batch_code').withTitle('CC Batch#').withOption('width', '150px'),
        DTColumnBuilder.newColumn('credit_card_name').withTitle('CC').withOption('width', '150px'),
        DTColumnBuilder.newColumn('card_no').withTitle('Card No.').withOption('width', '150px'),
        DTColumnBuilder.newColumn('customer_id').withTitle('Guest Name')
        .renderWith(function (i, type, data, prop) {
            var {customer_title, customer_first_name, customer_last_name} = data;
            return [customer_title, customer_first_name, customer_last_name].join(' ')
        }).withOption('width', '150px'),
        DTColumnBuilder.newColumn('trace_no').withTitle('Trace#').withOption('width', '150px'),
        DTColumnBuilder.newColumn('credit_fee_amount_').withTitle('Fee').withOption('width', '150px'),
        DTColumnBuilder.newColumn('total_amount_').withTitle('Total').withOption('width', '150px'),
        //DTColumnBuilder.newColumn('folio_code').withTitle('Folio#').withOption('width', '150px'),
        //DTColumnBuilder.newColumn('fo_transc_code').withTitle('FO Transaction#').withOption('width', '150px'),
        //DTColumnBuilder.newColumn('pos_order_code').withTitle('Order#').withOption('width', '150px'),
        DTColumnBuilder.newColumn('remarks').withTitle('Remarks').withOption('width', '100px')
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

    /* END AD ServerSide */
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
                queryService.post('insert into acc_ar_ccard_journal SET ?', param)
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
                'update acc_ar_ccard_journal SET ? WHERE id=' + $scope.editing.id, param
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
        queryService.post('update acc_ar_ccard_journal SET status=\'2\', ' +
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
    $scope.onChangeTotalAmount = function () {
        var v, p = $scope.data.credit_card_id || {};
        if (p.selected) {
            v = (p.selected.percent_fee / 100) || 0;
        }
        $scope.data.credit_fee_amount = v ? $scope.data.total_amount * v : 0
    };
    $scope.onSelectCC = function () {
        var v = ($scope.data.credit_card_id.selected.percent_fee / 100) || 0;
        if ($scope.data.total_amount && v) {
            $scope.data.credit_fee_amount = $scope.data.total_amount * v;
        }
    };
    $scope.onSelectOutlet = function () {
        var {code} = $scope.data.outlet_type_id.selected;
        code = (trim(code) || '').toLowerCase();
        if (code === 'fo') {
            $('#col-order').hide();
            $('#col-folio').show();
            $('#col-fo-trans').show();
        } else if (code === 'fb') {
            $('#col-folio').hide();
            $('#col-fo-trans').hide();
            $('#col-order').show();
        }
    };
    //
    var date1 = $('#data_transc_date');
    date1.datepicker({
        parentEl: '#form-input',
        showDropdowns: true,
        opens: 'left'
    });
    date1.datepicker('setDate', moment(new Date()).format('YYYY-MM-DD'));
});
