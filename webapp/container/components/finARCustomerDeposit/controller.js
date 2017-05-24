var trim = function (str) {
    return str.replace(/\t\t+|\n\n+|\s\s+/g, ' ').trim()
};
var toProperCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
angular.module('app', []).controller('FinARCustomerDepositCtrl', function ($scope, $state, $sce,
    queryService, departmentService, accountTypeService, DTOptionsBuilder,
    DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction, API_URL
) {
    $('#col-folio').hide();
    //
    var qstring = trim(`
        select
            a.*, DATEDIFF(now(),a.open_date) age, (a.deposit_amount - a.applied_amount) total_balance,
            b.code customer_code, b.title customer_title, b.first_name customer_first_name, b.last_name customer_last_name,
            c.code bank_account_code, c.name bank_account_name, c.short_name bank_account_short_name,
            d.code used_currency_code, d.name used_currency_name, d.home_currency_exchange used_currency_home_exchange, d.selling_rate used_currency_selling_rate,
            e.code credit_card_code, e.name credit_card_name,
            f.code outlet_type_code, f.name outlet_type_name,
            g.name status_name,
            format(a.currency_exchange,0) currency_exchange_, 
            format(a.home_deposit_amount,0) home_deposit_amount_, 
            format(a.deposit_amount,0) deposit_amount_, 
            format(a.home_applied_amount,0) home_applied_amount_, 
            format(a.applied_amount,0) applied_amount_, 
            format(d.home_currency_exchange,0) used_currency_home_exchange_, 
            format((a.deposit_amount - a.applied_amount),0) total_balance_
        from
            acc_ar_deposit a
            left join mst_customer b on a.customer_id = b.id
            left join mst_cash_bank_account c on a.bank_account_id = c.id
            left join ref_currency d on a.used_currency_id = d.id
            left join mst_credit_card e on a.credit_card_id = e.id
            left join ref_ar_outlet_type f on a.outlet_type_id = f.id
            left join (
                select id, value code, name from table_ref where table_name='acc_ar_deposit' and column_name='status'
            ) g on a.status = g.code 
        where c.status = 1 and d.status = 'Y' and a.status != 2 
    `);
    var qwhere = '';

    $scope.el = $state.current.data || [];
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;

    for (var i = 0; i < $scope.el.length; i++) $scope[$scope.el[i]] = true;

    $scope.fields = [ //mysql table columns
        `id`, `code`, `open_date`, `status`, `notes`, `customer_id`, `bank_account_id`,
        `credit_card_id`, `card_no`, `outlet_type_id`, `used_currency_id`,
        `currency_exchange`, `home_deposit_amount`, `deposit_amount`, `home_applied_amount`,
        `applied_amount` //`created_date`, `modified_date`, `created_by`, `modified_by`

    ];
    $scope.titles = $scope.fields.map(function (str) {
        return toProperCase(str.replace(/\_/g, " "))
    });
    $scope.DATA = {};
    $scope.data = {
        home_total_balance: 0,
        total_balance: 0
    };
    $scope.dataChild = {};
    $scope.ls = {
        statuses: [],
        outlet_types: [],
        customers: [],
        banks: [],
        credit_cards: [],
        currencies: [],
        invoices: []
    };
    $scope.now = new Date();
    $scope.df_now = moment($scope.now).format('YYYY-MM-DD');

    for (var f in $scope.fields) $scope.data[$scope.fields[f]] = '';
    queryService.get(
        `select value id, name from table_ref where table_name='acc_ar_deposit' and column_name='status'`
    ).then(function (res) {
        $scope.ls.statuses = res.data
    });
    queryService.get(
        `select id, code, name from ref_ar_outlet_type where status = '1' order by code`
    ).then(function (res) {
        $scope.ls.outlet_types = res.data
    });
    queryService.get(
        `select id, code, title, first_name, last_name from mst_customer order by code`
    ).then(function (res) {
        $scope.ls.customers = res.data
    });
    queryService.get(
        `select id, code, name, short_name from mst_cash_bank_account order by code`
    ).then(function (res) {
        $scope.ls.banks = res.data
    });
    queryService.get(
        `select id, code, name from mst_credit_card where status = '1' order by code`
    ).then(function (res) {
        $scope.ls.credit_cards = res.data
    });
    queryService.get(
        `select id, code, name, home_currency_exchange, selling_rate from ref_currency where status='Y'`
    ).then(function (res) {
        $scope.ls.currencies = res.data
    });

    $scope.focusinControl = {};
    $scope.fileName = "Account Receivable Customer Deposit";
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
    .withOption('autoWidth', true)
    .withOption('processing', true)
    .withOption('serverSide', true)
    //.withOption('responsive', true)
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
        DTColumnBuilder.newColumn('open_date').withTitle('Date').withOption('width', '100px')
        .renderWith(function (i, type, data, prop) {
            return moment(new Date(data.open_date)).format('YYYY-MM-DD')
        }),
        DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '130px'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '100px'),
        DTColumnBuilder.newColumn('customer_id').withTitle('Customer')
        .renderWith(function (i, type, data, prop) {
            return [data.customer_title, data.customer_first_name, data.customer_last_name].join(' ');
        }).withOption('width', '200px'),
        DTColumnBuilder.newColumn('age').withTitle('Age').withOption('width', '50px'),
        DTColumnBuilder.newColumn('bank_account_id').withTitle('Bank')
        .renderWith(function (i, type, data, prop) {
            return [data.bank_account_code, data.bank_account_name].join(' - ');
        }).withOption('width', '300px'),
        DTColumnBuilder.newColumn('used_currency_id').withTitle('$').withOption('width', '50px')
        .renderWith(function (i, type, data, prop) {
            return data.used_currency_code;
        }).withOption('width', '80px'),
        DTColumnBuilder.newColumn('deposit_amount_').withTitle('Total'),
        DTColumnBuilder.newColumn('applied_amount_').withTitle('Applied'),
        DTColumnBuilder.newColumn('total_balance_').withTitle('Balance')
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
            $scope.editing = {};
            $scope.clear();
        }
        $('#form-input').modal('show')
    };
    $scope.submit = function () {
        var param = {};
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
            var date = globalFunction.currentDate(),
                user = $localStorage.currentUser.name.id;
            //
            param.created_date = date;
            param.created_by = user;
            //
            var sql = `
                START TRANSACTION;
                
                SET @code=(select next_document_no('CDE','${moment().format('YYYY/MM')}'));
                
                INSERT INTO acc_ar_deposit (${
                    Object.keys(param)
                }) VALUES (${
                    Object.keys(param).map(function(a){
                        var v = param[a] || '';
                        if (a == 'code') {
                            return '@code'
                        }
                        return v.constructor == Number ? param[a] : `'${param[a]}'`
                    })
                });
                
                SET @id=(SELECT last_insert_id());
            `;
            $scope.dataChildren = $scope.dataChildren || [];
            $scope.dataChildren.forEach(function (child) {
                var {id, code, total_amount} = child;
                sql += `
                    UPDATE acc_ar_invoice
                    SET 
                        deposit_amount = ${child.isDeleted ? 0 : total_amount},
                        modified_date = '${date}',
                        modified_by = ${user}
                    WHERE id = ${id};
                `;
                if (child.isDeleted) {
                    sql += `
                        DELETE FROM acc_ar_deposit_line_item
                        WHERE deposit_id = @id AND invoice_id = ${id};
                    `
                } else {
                    sql += `
                        INSERT INTO acc_ar_deposit_line_item (
                            deposit_id,invoice_id,status,created_date,created_by
                        ) VALUES (
                            @id, ${id}, 1, '${date}', ${user}
                        ) ON DUPLICATE KEY UPDATE
                        modified_date = '${date}',
                        modified_by = ${user};
                    `
                }
            });
            sql += `COMMIT;`;
            //
            queryService.post(trim(sql)).then(
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
        } else { //exec update
            delete param.id;
            var date = globalFunction.currentDate(),
                user = $localStorage.currentUser.name.id;
            //
            param.modified_date = date;
            param.modified_by = user;
            //
            var sql = `
                START TRANSACTION;
                UPDATE acc_ar_deposit SET ${
                    Object.keys(param).map(function (key) {
                        var val = param[key] || '';
                        return `${key} = ${val.constructor == String ? `'${val}'` : val}`
                    }).join(',')
                } WHERE id = ${$scope.editing.id};
            `;
            $scope.dataChildren = $scope.dataChildren || [];
            $scope.dataChildren.forEach(function (child) {
                var {id, code, total_amount} = child;
                sql += `
                    UPDATE acc_ar_invoice
                    SET 
                        deposit_amount = ${child.isDeleted ? 0 : total_amount},
                        modified_date = '${date}',
                        modified_by = ${user}
                    WHERE id = ${id};
                `;
                if (child.isDeleted) {
                    sql += `
                        DELETE FROM acc_ar_deposit_line_item
                        WHERE deposit_id = ${$scope.editing.id} AND invoice_id = ${id};
                    `
                } else {
                    sql += `
                        INSERT INTO acc_ar_deposit_line_item (
                            deposit_id,invoice_id,status,created_date,created_by
                        ) VALUES (
                            ${$scope.editing.id}, ${id}, 1, '${date}', ${user}
                        ) ON DUPLICATE KEY UPDATE
                        modified_date = '${date}',
                        modified_by = ${user};
                    `
                }
            });
            sql += `COMMIT;`;
            //
            queryService.post(trim(sql)).then(function (result) {
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
        queryService.post(qstring + ' AND a.id=' + $scope.editing.id, undefined).then(function (result) {
            var d = result.data[0];
            $scope.data = Object.assign($scope.data, d);
            //
            $scope.data.open_date = moment(new Date(d.open_date)).format('YYYY-MM-DD');
            $scope.data.bank_account_id = {
                selected: {
                    id : d.bank_account_id,
                    code : d.bank_account_code,
                    name : d.bank_account_name,
                    short_name : d.bank_account_short_name
                }
            };
            $scope.data.outlet_type_id = {
                selected: {
                    id : d.outlet_type_id,
                    code : d.outlet_type_code,
                    name : d.outlet_type_name
                }
            };
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
                    name : d.credit_card_name
                }
            };
            $scope.data.outlet_type_id = {
                selected: {
                    id : d.outlet_type_id,
                    code : d.outlet_type_code,
                    name : d.outlet_type_name
                }
            };
            $scope.data.used_currency_id = {
                selected: {
                    id : d.used_currency_id,
                    code : d.used_currency_code,
                    name : d.used_currency_name,
                    home_currency_exchange : d.used_currency_home_exchange
                }
            };
            $scope.data.customer_id = {
                selected: {
                    id : d.customer_id,
                    code : d.customer_code,
                    title : d.customer_title,
                    first_name : d.customer_first_name,
                    last_name : d.customer_last_name
                }
            };
            $scope.selectCurrency();
            $scope.selectCustomer();
            $scope.changeDeposit();
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
        var user = $localStorage.currentUser.name.id;
        var date = globalFunction.currentDate();
        var deposit_id = $scope.removing.id;
        var sql = `
            START TRANSACTION;
            UPDATE acc_ar_deposit SET
                status = 2, modified_by = ${user}, modified_date = '${date}'
            WHERE id = ${deposit_id};
        `;
        $scope.dataChildren = $scope.dataChildren || [];
        $scope.dataChildren.forEach(function (child) {
            var {id, code, total_amount} = child;
            sql += `
                UPDATE acc_ar_invoice
                SET 
                    deposit_amount = 0,
                    modified_date = '${date}',
                    modified_by = ${user}
                WHERE id = ${id};
                
                DELETE FROM acc_ar_deposit_line_item
                WHERE deposit_id = ${deposit_id} AND invoice_id = ${id};
            `;
        });
        sql += `COMMIT;`;

        queryService.post(trim(sql)).then(function (result) {
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
        queryService.post(`select curr_document_no('CDE','${moment().format('YYYY/MM')}') code`)
        .then(function (res) {
            Object.assign($scope.data, res.data[0]);
        });
    };
    //
    $scope.filterItems = function(item){
        return item.isDeleted !== true;
    };
    $scope.selectCurrency = function () {
        var {selected} = $scope.data.used_currency_id;
        var val = selected.home_currency_exchange;
        var myCat = $('[myCat]');

        $scope.data.currency_exchange = val;
        myCat.attr('disabled', 1);
        if (val === 1) {
            $scope.data.home_deposit_amount = 0;
            $($('[myCat="right"]')[0]).removeAttr('disabled');
        } else {
            $scope.data.deposit_amount = 0;
            $($('[myCat="left"]')[0]).removeAttr('disabled');
        }
    };
    $scope.changeDeposit = function () {
        var ex = $scope.data.currency_exchange;
        var val = $scope.data.home_deposit_amount;
        if (ex && val) {
            $scope.data.deposit_amount = ex * val
        }
        $scope.changeAppliedDeposit();
    };
    $scope.changeAppliedDeposit = function () {
        var deposit = $scope.data.deposit_amount;
        if (($scope.dataChildren || []).length) {
            var sum = 0;
            $scope.dataChildren.forEach(function (a) {
                if (!a.isDeleted) sum += parseFloat(a.deposit_amount || 0)
            });
            $scope.data.applied_amount = sum;
            $scope.data.total_balance = deposit - sum;
        }
    };
    $scope.selectCustomer = function () {
        var {selected} = $scope.data.customer_id;
        var {id} = selected;
        //
        queryService.get(trim(`
            select a.* 
            from 
                acc_ar_invoice a, acc_ar_deposit_line_item b
            where
                a.id = b.invoice_id and 
                a.status = 2 and 
                a.customer_id = 1 and 
                (
                    b.deposit_id=${($scope.editing||{}).id||'\'\''} or 
                    (deposit_amount is null and deposit_amount = 0)
                )
        `)).then(function (res) {
            $scope.dataChild = {};
            res.data.forEach(function (item) {
                $scope.dataChild[item.id] = false;
            });
            $scope.applyItem = function(item){
                $scope.dataChild[item.id] = false;
            };
            $scope.editItem = function(item){
                $scope.dataChild[item.id] = true;
            };
            $scope.removeItem = function(item){
                //delete $scope.dataChild[item.id];
                item.isDeleted = true;
                $scope.changeDeposit();
            };
            $scope.dataChildren = res.data;
        });
    };
    //
    var date1 = $('#data_open_date');
    date1.datepicker({
        parentEl: '#form-input',
        showDropdowns: true,
        opens: 'left'
    });
    date1.datepicker('setDate', $scope.df_now);
});