var userController = angular.module('app', []);
userController
.controller('FinRevenueGroupCtrl', function ($scope, $state, $sce, queryService, departmentService,
    accountTypeService, DTOptionsBuilder,
    DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction, API_URL
) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
	$scope.disableAction = false;
    for (var i = 0; i < $scope.el.length; i++) {
        $scope[$scope.el[i]] = true;
    }

    var qstring = "select a.id,a.account_id,a.code,a.name,a.short_name,a.description," +
        "a.status,b.status_name,c.code account_code,c.name account_name " +
        "from ref_revenue_group a left join mst_ledger_account c on c.id = a.account_id, " +
        "(select id as status_id, value as status_value,name as status_name from table_ref " +
        "where table_name = 'ref_product_category' and column_name='status') b " +
        "where a.status = b.status_value and a.status!=2 ";
    var qwhere = '';

    $scope.coas = [];
    $scope.users = [];
    $scope.role = {
        selected: []
    };
    $scope.datas = {};
    $scope.id = '';
    $scope.data = {
        id: '',
        code: '',
        name: '',
        description: '',
        status: ''
    };
    $scope.selected = {
        coa: {},
        status: {},
        filter_department: {},
        filter_account_type: {}
    };

    queryService.get('SELECT id, code, name FROM mst_ledger_account WHERE status = 1', undefined)
    .then(function (data) {
        $scope.coas = data.data;
    });
    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc', undefined)
    .then(function (data) {
        $scope.arrActive = data.data
        $scope.selected.status['selected'] = $scope.arrActive[0]
    });
    $scope.focusinControl = {};
    $scope.fileName = "Revenue Group Reference";
    $scope.exportExcel = function () {
        queryService.post('select code,name,account_code,short_name,description,status_name' +
            ' from(' + qstring + qwhere + ')aa order by code', undefined)
        .then(function (data) {
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code", "Name", "Account ID", 'Short Name', 'Description', 'Status']);
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
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function (data, type, full, meta) {
        $scope.datas[data] = {id: data};
        var html = '';
        if ($scope.el.length > 0) {
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate') > -1) {
                html +=
                    '<button class="btn btn-default" title="Update" ng-click="update(datas[\'' + data + '\'])">' +
                    '   <i class="fa fa-edit"></i>' +
                    '</button>&nbsp;';
            }
            if ($scope.el.indexOf('buttonDelete') > -1) {
                html += '<button class="btn btn-default" title="Delete" ng-click="delete(datas[\'' + data + '\'])" )"="">' +
                    '   <i class="fa fa-trash-o"></i>' +
                    '</button>';
            }
            html += '</div>'
        }
        return html
    }
    $scope.createdRow = function (row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }
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
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length > 0) {
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        //DTColumnBuilder.newColumn('code').withTitle('Code Ori').notVisible(),
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '20%'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name'),
        DTColumnBuilder.newColumn('account_id').withTitle('Account ID')
        .renderWith(function (i, type, data, prop) {
            if (data.account_id) {
                return `${data.account_code} - ${data.account_name}`
            }
            return ''
        }).withOption('width', '250px'),
        DTColumnBuilder.newColumn('description').withTitle('Description'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status')
    );

    var qwhereobj = {
        text: '',
        department: '',
        account_type: ''
    };
    $scope.filter = function (type, event) {
        if (type == 'search') {
            if (event.keyCode == 13) {
                if ($scope.filterVal.search.length > 0) qwhereobj.text = ' lower(a.name) like \'%' + $scope.filterVal.search + '%\' '
                else qwhereobj.text = '';
                qwhere = setWhere();

                //if ($scope.filterVal.search.length>0) qwhere = ' and lower(a.name) like
                // "%'+$scope.filterVal.search.toLowerCase()+'%"' else qwhere = ''
                $scope.dtInstance.reloadData()
            }
        }
        else {
            $scope.dtInstance.reloadData()
        }
    }

    $scope.applyFilter = function () {
        if ($scope.selected.filter_department.selected) {
            qwhereobj.department = ' a.dept_id = ' + $scope.selected.filter_department.selected.id + ' '
        }
        if ($scope.selected.filter_account_type.selected) {
            qwhereobj.account_type = ' a.account_type_id = ' + $scope.selected.filter_account_type.selected.id + ' '
        }
        qwhere = setWhere()
        $scope.dtInstance.reloadData()

    }
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
    $scope.openAdvancedFilter = function (val) {

        $scope.showAdvance = val
        if (val == false) {
            $scope.selected.filter_account_type = {}
            $scope.selected.filter_department = {}
        }
    }
    $scope.openQuickView = function (state) {
        if (state == 'add') {
            $scope.clear()
        }
        $('#form-input').modal('show')
    }

    $scope.submit = function () {
		$scope.disableAction = true;
        if ($scope.data.id.length == 0) {
            //exec creation
            var param = {
                code: $scope.data.code,
                name: $scope.data.name,
                account_id: $scope.selected.coa.selected.id,
                short_name: $scope.data.short_name,
                description: $scope.data.description,
                status: $scope.selected.status.selected.id,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }

            queryService.post('insert into ref_revenue_group SET ?', param)
            .then(function (result) {
				$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData()
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert ' + $scope.data.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear()

                },
                function (err) {
					$scope.disableAction = false;
                    console.log(err)
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Insert: ' + err.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })

        }
        else {
            //exec update

            var param = {
                code: $scope.data.code,
                name: $scope.data.name,
                account_id: $scope.selected.coa.selected.id,
                short_name: $scope.data.short_name,
                description: $scope.data.description,
                status: $scope.selected.status.selected.id,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            queryService.post('update ref_revenue_group SET ? WHERE id=' + $scope.data.id, param)
            .then(function (result) {
				$scope.disableAction = false;
                if (result.status = "200") {
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function (obj) {
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update ' + $scope.data.code,
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
    }

    $scope.update = function (obj) {
        $('#form-input').modal('show');
        queryService.get(qstring + ' and a.id=' + obj.id, undefined)
        .then(function (result) {
            $scope.data.id = result.data[0].id
            $scope.data.code = result.data[0].code
            $scope.data.name = result.data[0].name
            $scope.data.short_name = result.data[0].short_name
            $scope.data.description = result.data[0].description
            $scope.data.status = result.data[0].status
            $scope.data.status = result.data[0].status
            $scope.selected.coa.selected = {
                id: result.data[0].account_id,
                code: result.data[0].account_code,
                name: result.data[0].account_name
            }
            $scope.selected.status.selected = {
                id: result.data[0].status,
                name: result.data[0].status_name
            }

        })
    }

    $scope.delete = function (obj) {
        $scope.data.id = obj.id;
        queryService.get(qstring + ' and a.id=' + obj.id, undefined)
        .then(function (result) {
            $scope.data.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function () {
        queryService.post('update ref_revenue_group SET status=\'2\', ' +
            ' modified_by=' + $localStorage.currentUser.name.id + ', ' +
            ' modified_date=\'' + globalFunction.currentDate() + '\' ' +
            ' WHERE id=' + $scope.data.id, undefined)
        .then(function (result) {
            if (result.status = "200") {
                console.log('Success Delete')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function (obj) {
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete ' + $scope.data.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
            }
            else {
                console.log('Delete Failed')
            }
        })
    }

    $scope.clear = function () {
        $scope.data = {
            id: '',
            code: '',
            name: '',
            short_name: '',
            description: '',
            status: ''
        }
    }

})
