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
	    b.code transient_account_code, b.name transient_account_name, c.code gain_loss_curr_account_code,
	    c.name gain_loss_curr_account_name, a.*
	FROM
		ref_ar_config a
		LEFT JOIN mst_ledger_account b on b.id = a.transient_account_id
		LEFT JOIN mst_ledger_account c on c.id = a.gain_loss_curr_account_id 
    WHERE a.status = 1 `;
    var qwhere = '';

    $scope.users = [];
    $scope.role = {
        selected: []
    };

    $scope.datas = {};
    $scope.id = '';
    $scope.data = {
        id: '',
        status: '',
        transient_account: null,
        gain_loss_curr_account: null
    };

    $scope.selected = {
        status: {},
        filter_department: {},
        filter_account_type: {},
        transient_account: {},
        gain_loss_curr_account: {}
    };
    $scope.ar_accounts = [];
    queryService.get('select id, code, name from mst_ledger_account where status = \'1\' and parent_id is not null order by code', undefined)
    .then(function (data) {
        $scope.ar_accounts = data.data
    });

    $scope.focusinControl = {};
    $scope.fileName = "Customer Type Reference";
    $scope.exportExcel = function () {
        queryService.post(trim(`
            select
                id, transient_account_id, transient_account_code, transient_account_name,
                gain_loss_curr_account_id, gain_loss_curr_account_code, gain_loss_curr_account_name
            from (${qstring} ${qwhere}) xxx order by id
        `), undefined)
        .then(function (data) {
            $scope.exportData = [];
            //Header
            $scope.exportData.push([
                `id`, `transient_account_id`, `transient_account_code`, `transient_account_name`,
                `gain_loss_curr_account_id`, `gain_loss_curr_account_code`, `gain_loss_curr_account_name`
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
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('transient_account_code')
        .withTitle('Transient Account').renderWith(function (i, type, data, prop) {
            return `${data.transient_account_code} : ${data.transient_account_name}`
        }),
        DTColumnBuilder.newColumn('gain_loss_curr_account_code')
        .withTitle('Gain Loss Current Account').renderWith(function (i, type, data, prop) {
            return `${data.gain_loss_curr_account_code} : ${data.gain_loss_curr_account_name}`
        }),
        DTColumnBuilder.newColumn('created_date')
        .withTitle('Date Created').renderWith(function (i, type, data, prop) {
            return moment(new Date(data.created_date)).format('YYYY-MM-DD H:mm:ss')
        })
    );

    var qwhereobj = {
        text: ''
    };
    $scope.filter = function (type, event) {
        if (type == 'search') {
            if (event.keyCode == 13) {
                if ($scope.filterVal.search.length > 0) {
                    var fields = ["a.transient_account_id", "b.code", "b.name", "a.gain_loss_curr_account_id", "c.code", "c.name"];
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
    $scope.applyFilter = function () {
        if ($scope.selected.filter_department.selected) {
            qwhereobj.department = ' a.dept_id = ' + $scope.selected.filter_department.selected.id + ' '
        }
        if ($scope.selected.filter_account_type.selected) {
            qwhereobj.account_type = ' a.account_type_id = ' + $scope.selected.filter_account_type.selected.id + ' '
        }
        qwhere = setWhere();
        $scope.dtInstance.reloadData()

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
                status: 1,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id,
                transient_account_id: $scope.selected.transient_account.selected.id,
                gain_loss_curr_account_id: $scope.selected.gain_loss_curr_account.selected.id
            };

            queryService.post('insert into ref_ar_config SET ?', param)
            .then(function (result) {
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData()
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
                })

        } else { //exec update
            var param = {
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id,
                transient_account_id: $scope.selected.transient_account.selected.id,
                gain_loss_curr_account_id: $scope.selected.gain_loss_curr_account.selected.id
            }
            queryService.post('update ref_ar_config SET ? WHERE id=' + $scope.data.id, param)
            .then(function (result) {
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
    $scope.update = function (obj) {
        $('#form-input').modal('show');
        queryService.post(qstring + 'AND a.id=' + obj.id, undefined)
        .then(function (result) {
            $scope.data.id = result.data[0].id;
            $scope.selected.transient_account.selected = {
                id: result.data[0].transient_account_id,
                name: result.data[0].transient_account_name,
                code: result.data[0].transient_account_code
            }
            $scope.selected.gain_loss_curr_account.selected = {
                id: result.data[0].gain_loss_curr_account_id,
                name: result.data[0].gain_loss_curr_account_name,
                code: result.data[0].gain_loss_curr_account_code
            }
        })
    };
    $scope.delete = function (obj) {
        $scope.data.id = obj.id;
        queryService.get(trim(qstring + 'AND a.id=' + obj.id), undefined)
        .then(function (result) {
            $('#modalDelete').modal('show')
        })
    };
    $scope.execDelete = function () {
        queryService.post('update ref_ar_config SET status=\'2\', ' +
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
            status: ''
        }
    };
})
