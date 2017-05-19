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
            f.code pos_order_code, g.code ccard_batch_code
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
        WHERE a.status = 1
    `);
    var qwhere = '';

    $scope.el = $state.current.data || [];
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;

    for (var i = 0; i < $scope.el.length; i++) $scope[$scope.el[i]] = true;

    $scope.fields = [
        "code", "transc_date", "credit_card_id", "card_no", "credit_fee_amount", "total_amount",
        "outlet_type_id", "folio_id", "fo_transc_id", "pos_order_id", "ccard_batch_id", "trace_no",
        "remarks"
    ];
    $scope.titles = $scope.fields.map(function (str) {
        return toProperCase(str.replace(/\_/g, " "))
    });
    $scope.DATA = {};
    $scope.data = {};
    $scope.ls = {
        credit_cards: [],
        outlet_types: [],
        folios: [],
        pos_orders: [],
        ccard_batches: []
    };

    for (var f in $scope.fields) $scope.data[$scope.fields[f]] = '';
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
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '130px'),
        DTColumnBuilder.newColumn('transc_date').withTitle('Transaction Date')
        .renderWith(function (i, type, data, prop) {
            return moment(new Date(data.transc_date)).format('YYYY-MM-DD')
        }),
        DTColumnBuilder.newColumn('credit_card_id').withTitle('credit_card_id'),
        DTColumnBuilder.newColumn('card_no').withTitle('card_no'),
        DTColumnBuilder.newColumn('credit_fee_amount').withTitle('credit_fee_amount'),
        DTColumnBuilder.newColumn('total_amount').withTitle('total_amount'),
        DTColumnBuilder.newColumn('outlet_type_id').withTitle('outlet_type_id'),
        DTColumnBuilder.newColumn('folio_id').withTitle('folio_id'),
        DTColumnBuilder.newColumn('fo_transc_id').withTitle('fo_transc_id'),
        DTColumnBuilder.newColumn('pos_order_id').withTitle('pos_order_id'),
        DTColumnBuilder.newColumn('ccard_batch_id').withTitle('ccard_batch_id'),
        DTColumnBuilder.newColumn('trace_no').withTitle('trace_no'),
        DTColumnBuilder.newColumn('remarks').withTitle('Remarks')
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
        console.log(code)
        if (code === 'fo') {
            $('#col-order').hide();
            $('#col-folio').show();
        } else if (code === 'fb') {
            $('#col-folio').hide();
            $('#col-order').show();
        } else {
            $('#col-order').hide();
            $('#col-folio').hide();
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