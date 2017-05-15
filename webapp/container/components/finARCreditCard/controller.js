var trim = function (str) {
    return str.replace(/\t\t+|\n\n+|\s\s+/g, ' ').trim()
};
angular.module('app', []).controller('FinARCreditCardCtrl', function ($scope, $state, $sce,
    queryService, departmentService, accountTypeService, DTOptionsBuilder,
    DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction, API_URL
) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i = 0; i < $scope.el.length; i++) {
        $scope[$scope.el[i]] = true;
    }

    var qstring = `
    SELECT
        /* id, code, name, short_name, description, status, percent_fee, doc_type_id */
        a.*, b.name bank_account_name, b.code bank_account_code, b.short_name bank_account_codename,
        c.name ar_account_name, c.code ar_account_code, c.name fee_account_name, c.code fee_account_code
    FROM 
        mst_credit_card a
        LEFT JOIN mst_cash_bank_account b on b.id = a.bank_account_id
        LEFT JOIN mst_ledger_account c on c.id = a.ar_account_id
        LEFT JOIN mst_ledger_account d on d.id = a.fee_account_id 
    WHERE a.status = 1 AND b.status = 1 AND c.status = 1 AND d.status = 1 `;
    var qwhere = '';

    $scope.users = [];
    $scope.role = {
        selected: []
    };

    $scope.datas = {};
    $scope.id = '';
    $scope.data = {
        id: '',
        name: '',
        code: '',
        codename: '',
        description: '',
        status: '',
        percentfee: '',
        bank_account: null,
        ar_account: null,
        fee_account: null
    };

    $scope.selected = {
        bank_account: {},
        ar_account: {},
        fee_account: {}
    };
    $scope.mst_cash_bank_accounts = [];
    $scope.mst_ledger_accounts = [];
    queryService.get('select id, code, name from mst_ledger_account where status = \'1\' and parent_id is not null order by code', undefined)
    .then(function (data) {
        $scope.mst_ledger_accounts = data.data
    });
    queryService.get(`select id, code, name, short_name from mst_cash_bank_account where status = '1'`, undefined)
    .then(function (data) {
        $scope.mst_cash_bank_accounts = data.data
    });

    $scope.focusinControl = {};
    $scope.fileName = "Account Receivable CC";
    $scope.exportExcel = function () {
        queryService.post(trim(`
            select
                id,code,name,short_name,description,status,percent_fee,doc_type_id,
                bank_account_id,bank_account_name,bank_account_code,bank_account_codename,
                ar_account_id,ar_account_name,ar_account_code,
                fee_account_id,fee_account_name,fee_account_code,
                created_date,modified_date,created_by,modified_by
            from (${qstring} ${qwhere}) xxx order by id
        `), undefined)
        .then(function (data) {
            $scope.exportData = [];
            //Header
            $scope.exportData.push([
                "id", "code", "name", "short_name", "description", "status", "percent_fee",
                "doc_type_id", "bank_account_id", "bank_account_name", "bank_account_code",
                "bank_account_codename", " ar_account_id", "ar_account_name", "ar_account_code",
                "fee_account_id", "fee_account_name", "fee_account_code",
                "created_date", "modified_date", "created_by", "modified_by"
            ]);
            //Data
            for (var i = 0; i < data.data.length; i++) {
                var arr = []
                for (var key in data.data[i]) {
                    arr.push(data.data[i][key])
                }
                $scope.exportData.push(arr)
            }
            $scope.focusinControl.downloadExcel()
        })
    };

    $scope.filterVal = {
        search: ''
    };
    $scope.trustAsHtml = function (value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {}; //Use for reloadData
    $scope.actionsHtml = function (data, type, full, meta) {
        $scope.datas[data] = {id: data};
        var html = ''
        if ($scope.el.length > 0) {
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate') > -1) {
                html +=
                    '<button class="btn btn-default" ng-click="update(datas[\'' + data + '\'])">' +
                    '   <i class="fa fa-edit"></i>' +
                    '</button>&nbsp;';
            }
            if ($scope.el.indexOf('buttonDelete') > -1) {
                html += '<button class="btn btn-default" ng-click="delete(datas[\'' + data + '\'])" )"="">' +
                    '   <i class="fa fa-trash-o"></i>' +
                    '</button>';
            }
            html += '</div>'
        }
        return html
    };

    $scope.createdRow = function (row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
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
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withPaginationType('full_numbers')
    .withDisplayLength(10)
    .withOption('order', [0, 'asc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length > 0) {
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '70px'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '100px'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '120px'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name').withOption('width', '100px'),
        DTColumnBuilder.newColumn('description').withTitle('Desc').withOption('width', '120px'),
        DTColumnBuilder.newColumn('percent_fee').withTitle('Percent Fee').withOption('width', '100px'),
        DTColumnBuilder.newColumn('bank_account_code').withTitle('Bank Account')
        .renderWith(function (i, type, data, prop) {
            var e = `${data.bank_account_code} : ${data.bank_account_name}`;
            return e.length > 25 ? e.substr(0, 22) + '...' : e;
        }).withOption('width', '200px'),
        DTColumnBuilder.newColumn('ar_account_code').withTitle('Receivable Account')
        .renderWith(function (i, type, data, prop) {
            var e = `${data.ar_account_code} : ${data.ar_account_name}`;
            return e.length > 25 ? e.substr(0, 22) + '...' : e;
        }).withOption('width', '200px'),
        DTColumnBuilder.newColumn('fee_account_code').withTitle('Fee Account')
        .renderWith(function (i, type, data, prop) {
            var e = `${data.fee_account_code} : ${data.fee_account_name}`;
            return e.length > 25 ? e.substr(0, 22) + '...' : e;
        }).withOption('width', '200px')
    );

    var qwhereobj = {
        text: ''
    };
    $scope.filter = function (type, event) {
        if (type == 'search') {
            if (event.keyCode == 13) {
                if ($scope.filterVal.search.length > 0) {
                    var fields = [
                        "a.id", "a.code", "a.name", "a.short_name", "a.description",
                        "a.status", "a.percent_fee", "a.doc_type_id", "b.name",
                        "b.code", "b.short_name", "c.name", "c.code", "c.name", "c.code"
                    ];
                    fields = fields.map(function(x){
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
        var arrWhere = []
        var strWhere = ''
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
            $scope.clear()
        }
        $('#form-input').modal('show')
    };
    $scope.submit = function () {
        if ($scope.data.id.length == 0) {
            var param = { //exec insertion
                id: $scope.data.id,
                name: $scope.data.name,
                code: $scope.data.code,
                short_name: $scope.data.codename,
                description: $scope.data.description,
                percent_fee: $scope.data.percentfee,
                status: 1,
                bank_account_id: $scope.selected.bank_account.selected.id,
                ar_account_id: $scope.selected.ar_account.selected.id,
                fee_account_id: $scope.selected.fee_account.selected.id,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            };

            queryService.post('insert into mst_credit_card SET ?', param)
            .then(function (result) {
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData()
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert ' + $scope.data.name,
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
                })

        } else { //exec update
            var param = {
                name: $scope.data.name,
                code: $scope.data.code,
                short_name: $scope.data.codename,
                description: $scope.data.description,
                percent_fee: $scope.data.percentfee,
                bank_account_id: $scope.selected.bank_account.selected.id,
                ar_account_id: $scope.selected.ar_account.selected.id,
                fee_account_id: $scope.selected.fee_account.selected.id,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            queryService.post('update mst_credit_card SET ? WHERE id=' + $scope.data.id, param)
            .then(function (result) {
                if (result.status = "200") {
                    $('#form-input').modal('hide');
                    $scope.dtInstance.reloadData();
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update ' + $scope.data.name,
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
    $scope.update = function (obj) {
        $('#form-input').modal('show');
        queryService.post(qstring + 'AND a.id=' + obj.id, undefined)
        .then(function (result) {
            $scope.data.id = result.data[0].id;
            $scope.data.code = result.data[0].code;
            $scope.data.name = result.data[0].name;
            $scope.data.codename = result.data[0].short_name;
            $scope.data.description = result.data[0].description;
            $scope.data.percentfee = result.data[0].percent_fee;
            $scope.selected.bank_account.selected = {
                id: result.data[0].bank_account_id,
                name: result.data[0].bank_account_name,
                code: result.data[0].bank_account_code
            }
            $scope.selected.ar_account.selected = {
                id: result.data[0].ar_account_id,
                name: result.data[0].ar_account_name,
                code: result.data[0].ar_account_code
            }
            $scope.selected.fee_account.selected = {
                id: result.data[0].fee_account_id,
                name: result.data[0].fee_account_name,
                code: result.data[0].fee_account_code
            }
        })
    };
    $scope.delete = function (obj) {
        $scope.data.id = obj.id;
        queryService.get(trim(qstring + 'AND a.id=' + obj.id), undefined)
        .then(function (result) {
            $scope.data.name = '"' + result.data[0].code + ' : ' + result.data[0].name + '"';
            $('#modalDelete').modal('show')
        })
    };
    $scope.execDelete = function () {
        queryService.post('update mst_credit_card SET status=\'2\', ' +
            ' modified_by=' + $localStorage.currentUser.name.id + ', ' +
            ' modified_date=\'' + globalFunction.currentDate() + '\' ' +
            ' WHERE id=' + $scope.data.id, undefined)
        .then(function (result) {
            if (result.status = "200") {
                $('#form-input').modal('hide');
                $scope.dtInstance.reloadData()
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
        $scope.data = {
            id: '',
            name: '',
            code: '',
            codename: '',
            description: '',
            status: '',
            percentfee: '',
            bank_account: null,
            ar_account: null,
            fee_account: null
        }
    };
})
