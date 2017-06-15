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
    $('#col-order').hide();
    //
    var qstring = trim(`
		SELECT
            a.*, i.code fo_transc_code, i.customer_id fo_transc_customer_id,
            i.customer_code fo_transc_customer_code, i.customer_name fo_transc_customer_name,
            i.payment_amount fo_transc_payment_amount,
            b.code credit_card_code, b.name credit_card_name, b.percent_fee,
            c.code outlet_type_code, c.name outlet_type_name,
            /* d.code folio_code, */ e.folio_code,
            e.transc_type_id, e.transc_remarks, e.transc_charge, e.transc_ref,
            e.debit, e.credit, e.customer_id, e.customer_code, e.customer_name,
            f.code pos_order_code, g.code ccard_batch_code,
            format(a.credit_fee_amount,0) credit_fee_amount_,
            format(a.total_amount,0) total_amount_, h.name status_name
        FROM
        acc_ar_ccard_journal a
        LEFT JOIN mst_credit_card b on a.credit_card_id = b.id
        LEFT JOIN ref_ar_outlet_type c on a.outlet_type_id = c.id
        /* LEFT JOIN fd_guest_folio d on a.folio_id = d.id */
        LEFT JOIN (
            SELECT
                a.*, b.code customer_code,
                c.code folio_code,
                TRIM(CONCAT_WS(' ' ,b.title, b.first_name, b.last_name)) customer_name
            FROM
                fd_folio_transc_account a
                LEFT JOIN mst_customer b on a.customer_id = b.id
                LEFT JOIN fd_guest_folio c on a.folio_id = c.id
        ) e on a.folio_id = e.id
        LEFT JOIN pos_orders f on a.pos_order_id = f.id
        LEFT JOIN acc_ar_ccard_batch g on a.ccard_batch_id = g.id
        LEFT JOIN (
            SELECT value id, name FROM table_ref WHERE table_name='acc_ar_ccard_journal' AND column_name='status'
        ) h on h.id = a.status
        LEFT JOIN (
            select
                c.id, c.code, c.customer_id, d.code customer_code, payment_amount,
                TRIM(CONCAT_WS(' ' ,d.title, d.first_name, d.last_name)) customer_name
            from
                fd_guest_payment a
                left join ref_payment_method b on a.payment_type_id = b.id
                left join fd_guest_folio c on c.id = a.folio_id
                left join mst_customer d on d.id = c.customer_id
            where b.category in ('MST', 'VSA') and payment_status = 0
        ) i on i.id = a.fo_transc_id
        /* WHERE a.status = 1 */
    `);
    var qwhere = '';
	$scope.disableAction = false;
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
    queryService.get(trim(`
        select distinct(folio_id), folio_code, customer_name, customer_code
        from (
            select
                a.folio_id,
                b.code folio_code, c.code customer_code,
                TRIM(CONCAT_WS(' ' ,c.title, c.first_name, c.last_name)) customer_name
            from fd_folio_transc_account a
            left join fd_guest_folio b on a.folio_id = b.id
            left join mst_customer c on a.customer_id = c.id
            where
                payment_id in (
                    select id from fd_guest_payment where payment_type_id in (
                        select id from ref_payment_method where is_credit_card = 'Y'
                    )
                )
        ) d
    `)).then(function (res) {
        $scope.ls.folios = res.data
    });
    queryService.get(trim(`
        select
            c.id, c.code, c.customer_id, d.code customer_code,
            payment_amount,
            TRIM(CONCAT_WS(' ' ,d.title, d.first_name, d.last_name)) customer_name
        from
        fd_guest_payment a
        left join ref_payment_method b on a.payment_type_id = b.id
        left join fd_guest_folio c on c.id = a.folio_id
        left join mst_customer d on d.id = c.customer_id
        where b.category in ('MST', 'VSA') and payment_status = 0
    `)).then(function (res) {
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
            if (data.status != 1 && $scope.el.indexOf('buttonDelete') > -1) {
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
        DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '80px'),
        DTColumnBuilder.newColumn('outlet_type_name').withTitle('Outlet').withOption('width', '150px'),
        DTColumnBuilder.newColumn('ccard_batch_code').withTitle('CC Batch#').withOption('width', '150px'),
        DTColumnBuilder.newColumn('credit_card_name').withTitle('CC').withOption('width', '150px'),
        DTColumnBuilder.newColumn('card_no').withTitle('Card No.').withOption('width', '150px'),
        DTColumnBuilder.newColumn('customer_name').withTitle('Guest Name').withOption('width', '150px'),
        DTColumnBuilder.newColumn('trace_no').withTitle('Trace#').withOption('width', '150px'),
        DTColumnBuilder.newColumn('credit_fee_amount_').withTitle('Fee').withOption('width', '150px'),
        DTColumnBuilder.newColumn('total_amount_').withTitle('Total').withOption('width', '150px'),
        //DTColumnBuilder.newColumn('folio_code').withTitle('Folio#').withOption('width', '150px'),
        //DTColumnBuilder.newColumn('fo_transc_code').withTitle('FO Transaction#').withOption('width', '150px'),
        //DTColumnBuilder.newColumn('pos_order_code').withTitle('Order#').withOption('width', '150px'),
        DTColumnBuilder.newColumn('remark').withTitle('Remarks').withOption('width', '100px')
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
		$scope.disableAction = true;
        var param = {};
        var date = globalFunction.currentDate(),
            user = $localStorage.currentUser.name.id;
        for (var key in $scope.data) {
            if ($scope.fields.indexOf(key) > -1) {
                if ($scope.data[key].hasOwnProperty('selected')) {
                    param[key] = $scope.data[key].selected.id
                } else {
                    param[key] = $scope.data[key]
                }
            }
        }
        if (!$scope.data.id) {
            delete param.id;
            //
            param.created_date = date;
            param.created_by = user;
            //
            var sql = `
                START TRANSACTION;

                SET @code=(select next_document_no('CCB','${moment().format('YYYY/MM')}'));

                INSERT INTO acc_ar_ccard_journal (${
                    Object.keys(param)
                }) VALUES (${
                    Object.keys(param).map(function(a){
                        var v = param[a] || '';
                        if (a == 'code') {
                            return '@code'
                        }
                        if (!param[a]) return 'NULL';
                        return v.constructor == Number ? param[a] : `'${param[a]}'`
                    })
                });
            `;
            sql += 'COMMIT;';
            //
            queryService.post(trim(sql)).then(
                function (result) {
					$scope.disableAction = false;
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
					$scope.disableAction = false;
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Insert: ' + err.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                }
            )
        } else { //exec update
            param.modified_date = date;
            param.modified_by = user;

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
				$scope.disableAction = false;
            })
        }
    };
    $scope.update = function (key) {
        $('#form-input').modal('show');
        $scope.editing = $scope.DATA[key];
        queryService.post(qstring + ' AND a.id=' + $scope.editing.id, undefined).then(function (result) {
            var d = result.data[0];
            $scope.data = Object.assign($scope.data, d);
            //
            $scope.data.transc_date = moment(new Date(d.transc_date)).format('YYYY-MM-DD');
            $scope.data.status = {
                selected: {
                    id : d.status,
                    name : d.status_name
                }
            };
            $scope.data.credit_card_id = {
                selected: {
                    id : d.credit_card_id,
                    code : d.credit_card_code,
                    name : d.credit_card_name,
                    percent_fee : d.percent_fee
                }
            };
            $scope.data.outlet_type_id = {
                selected: {
                    id : d.outlet_type_id,
                    code : d.outlet_type_code,
                    name : d.outlet_type_name
                }
            };
            $scope.data.pos_order_id = {
                selected: {
                    id : d.pos_order_id,
                    code : d.pos_order_code
                }
            };
            $scope.data.ccard_batch_id = {
                selected: {
                    id : d.ccard_batch_id,
                    code : d.ccard_batch_code
                }
            };
            $scope.data.folio_id = {
                selected: {
                    folio_id : d.folio_id,
                    folio_code : d.folio_code,
                    customer_id : d.customer_id,
                    customer_code : d.customer_code,
                    customer_name : d.customer_name
                }
            };
            $scope.data.fo_transc_id = {
                selected: {
                    id : d.fo_transc_id,
                    code : d.fo_transc_code,
                    customer_id : d.fo_transc_customer_id,
                    customer_code : d.fo_transc_customer_code,
                    customer_name : d.fo_transc_customer_name,
                    payment_amount : d.fo_transc_payment_amount
                }
            };
            $scope.onSelectOutlet();
        })
    };
    $scope.delete = function (key) {
        $scope.removing = $scope.DATA[key];
        queryService.get(trim(qstring + ' AND a.id=' + $scope.removing.id), undefined)
        .then(function (result) {
            $('#modalDelete').modal('show')
        })
    };
    $scope.execDelete = function () {
        queryService.post('update acc_ar_ccard_journal SET status=\'1\', ' +
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
        var {selected} = $scope.data.credit_card_id;
        selected = selected || {};
        selected.percent_fee = selected.percent_fee || 0;
        var v = (selected.percent_fee / 100) || 0;
        if ($scope.data.total_amount && v) {
            $scope.data.credit_fee_amount = $scope.data.total_amount * v;
        } else {
            $scope.data.credit_fee_amount = 0;
        }
    };
    $scope.onSelectFoTrans = function () {
        var {payment_amount} = $scope.data.fo_transc_id.selected;
        payment_amount = payment_amount || 0;
        $scope.data.total_amount = payment_amount;
        $scope.onSelectCC();
    };
    $scope.onSelectOutlet = function () {
        var {code} = $scope.data.outlet_type_id.selected;
        code = (trim(code) || '').toLowerCase();
        if (code === 'fo') {
            $('#col-order').hide();
            $('#col-folio').show();
            $('#col-fo-trans').show();
            $('#data_total_amount').attr('disabled', 1);
        } else if (code === 'fb') {
            $('#col-folio').hide();
            $('#col-fo-trans').hide();
            $('#col-order').show();
            $('#data_total_amount').removeAttr('disabled');
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
