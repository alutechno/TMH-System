var trim = function (str) {
    return str.replace(/\t\t+|\n\n+|\s\s+/g, ' ').trim()
};

angular.module('app', []).controller('FoHousekeepingRMCtrl', function ($scope, $state, $sce, $q,
    queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder,
    $localStorage, $compile, $rootScope, globalFunction, API_URL, $templateCache
) {
    var daterangeEl = $('#input-daterange');
    var q = {condition: ''};
    q.query = `
        SELECT * FROM (
            SELECT
                b.status room_status, b.code room_code, b.name room_name, c.name hk_status_name,
                d.code maintenance_type_code, d.name maintenance_type_name, e.code ooo_type_code,
                e.name ooo_type_name, a.*
            FROM
                hk_room_maintenance a
                JOIN mst_room b on a.room_id = b.id
                JOIN (
                    SELECT value, name
                    FROM table_ref
                    WHERE table_name = 'mst_room' AND column_name = 'hk_status'
                ) c on a.hk_status = c.value
                JOIN ref_maintenance_req_type d on a.maintenance_type_id = d.id
                JOIN ref_out_of_order_type e on a.ooo_type_id = e.id
            ORDER BY a.start_date DESC
        ) as x
    `;
    //
    $scope.operation = '';
    $scope.data = {
        //filter form
        table: {}, type: {},
        //new data or update form
        id: '', status: {}, room: {}, orderType: {}, maintenance: {}
    };
    $scope.model = {
        //filter form
        search: '', type: '',
        //new data or update form
        id: '', status: '', room: '', orderType: '', maintenance: '', notes: ''
    };
    $scope.trustAsHtml = function (value) {
        return $sce.trustAsHtml(value);
    };
    $scope.filterStatus = function (type, event) {
        var andCondirion = [], orCondirion = [];
        var {search, type} = $scope.model;
        if (search) {
            Object.keys($scope.columns).forEach(function (col) {
                orCondirion.push(`${col} LIKE '%${search}%'`);
            });
            andCondirion.push(`(${orCondirion.join(' OR ')})`);
        }
        if ((type = type || {}) && type.value) andCondirion.push(`hk_status_name = '${type.name}'`);
        if (andCondirion.length) {
            q.condition = `WHERE ${andCondirion.join(' AND ')}`;
        } else q.condition = '';

        $scope.dtIns.reloadData();
        $scope.dtIns.rerender();
    };
    $scope.elAuthorize = (function () {
        var elm = {};
        for (var e in $state.current.data) elm[$state.current.data[e]] = 1;
        return elm;
    })();
    $scope.actionButtons = function (i, type, data, prop) {
        var group = $('<div class="btn-group btn-group-xs">');
        $scope.data.table[i] = {i, data, prop};
        if (data.hk_status !== 'R' && $scope.elAuthorize.buttonUpdate) {
            group.append(`
                <button class="btn btn-default" title="Update" ng-click="update(data.table['${i}'])">
                    <i class="fa fa-edit"></i>
                </button>
            `);
        }
        if ($scope.elAuthorize.buttonDelete) {
            group.append(`
                <button class="btn btn-default" title="Delete" ng-click="delete(data.table['${i}'])">
                    <i class="fa fa-trash-o"></i>
                </button>
            `);
        }
        return trim(group[0].outerHTML)
    };
    $scope.update = function (d) {
        $scope.openQuickView('edit', d.data);
    };
    $scope.delete = function (d) {
        $scope.openConfirmBox('edit', d.data);
        $scope.deleteId = d.data.id;
    };
    $scope.execDelete = function () {
        var query = `DELETE FROM hk_room_maintenance WHERE id = ${$scope.deleteId}`;
        //
        queryService.post(query).then(function (result) {
            if (result.status = "200") {
                $scope.notification({message: `Failed deleting`});
                $scope.dtIns.reloadData();
                $scope.clearModel()
            } else {
                $scope.notification({
                    message: `Failed deleting`,
                    timeout: -1, type: 'danger'
                });
            }
        })
    }
    $scope.columns = {
        //id : '',
        //request_id : '',
        //room_id : '',
        //room_code: '',
        room_name: 'Room',
        room_status: 'Room status',
        //hk_status : '',
        hk_status_name: 'HK status',
        //maintenance_type_id : '',
        maintenance_type_code: 'Req Code',
        //maintenance_type_name: '',
        //ooo_type_id : '',
        ooo_type_code: 'Order Code',
        //ooo_type_name : '',
        start_date: 'Date',
        //end_date : '',
        //created_date : '',
        //modified_date : '',
        //created_by : '',
        //modified_by : '',
        notes: 'Notes'
    };
    $scope.dtIns = {};
    $scope.dtCol = (function () {
        var columns = !Object.keys($scope.elAuthorize).length ? [] : [
            DTColumnBuilder.newColumn('id').withTitle('Action').renderWith($scope.actionButtons)
            .withOption('width', '80px')
            .notSortable()
        ];
        for (var c in $scope.columns) {
            var column = DTColumnBuilder.newColumn(c).withTitle($scope.columns[c]);
            if (c == 'start_date') {
                column.withOption('width', '80px').renderWith(function (val) {
                    return moment(new Date(val)).format('YYYY-MM-DD')
                })
            }
            if (c == 'room_name') column.withOption('width', '70px');
            if (c == 'room_status') column.withOption('width', '110px');
            if (c == 'hk_status_name') column.withOption('width', '90px');
            if (c == 'maintenance_type_code') column.withOption('width', '90px');
            if (c == 'ooo_type_code') column.withOption('width', '100px');
            columns.push(column);
        }
        return columns;
    })();
    $scope.dtOpt = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL + '/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization": 'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = [trim(q.query), q.condition ? q.condition : ''].join(' ');
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
    .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    });
    //
    $scope.isUpdateOpt = false;
    $scope.clearModel = function () {
        for (var key in $scope.model) {
            $scope.model[key] = '';
        }
    };
    $scope.openConfirmBox = function (data) {
        $('#modalDelete').modal('show')
    };
    $scope.openQuickView = function (state, data) {
        if (state == 'add') {
            $scope.isUpdateOpt = false;
            $scope.clearModel();
        } else {
            $scope.isUpdateOpt = true;
            var {
                created_date, end_date, hk_status, hk_status_name, id, maintenance_type_code,
                maintenance_type_id, maintenance_type_name, modified_by, modified_date, notes,
                ooo_type_code, ooo_type_id, ooo_type_name, request_id, room_code, room_id,
                room_name, room_status, start_date
            } = data;
            $scope.clearModel();
            $scope.model.id = id;
            $scope.model.dateRange = moment(new Date(start_date)).format('YYYY-MM-DD') + ' ~ ' + moment(new Date(end_date)).format('YYYY-MM-DD');
            $scope.model.endDate = moment(new Date(end_date)).format('YYYY-MM-DD');
            $scope.model.startDate = moment(new Date(start_date)).format('YYYY-MM-DD');
            $scope.model.status = {
                value: hk_status,
                name: hk_status_name
            };
            $scope.model.maintenance = {
                code: maintenance_type_code,
                value: maintenance_type_id,
                name: maintenance_type_name
            };
            $scope.model.notes = notes;
            $scope.model.orderType = {
                code: ooo_type_code,
                value: ooo_type_id,
                name: ooo_type_name
            };
            $scope.model.room = {
                code: room_code,
                value: room_id,
                name: room_name,
                status: room_status
            };
        }
        $('#form-input').modal('show')
    };
    $scope.loadRoomInfo = function () {
        console.log(arguments)
    };
    $scope.notification = function ({message, timeout, type}) {
        type = type || 'success';
        timeout = timeout || 2000;
        $('body').pgNotification({
            style: 'flip',
            position: 'top-right',
            message, timeout, type
        }).show();
    };
    $scope.submit = function () {
        var op = $scope.isUpdateOpt ? 'update' : 'insert';
        var {id, status, room, orderType, maintenance, startDate, endDate, notes} = $scope.model;
        var value = {
            id, notes,
            room_id: room.value,
            maintenance_type_id: maintenance.value,
            ooo_type_id: orderType.value,
            start_date: startDate,
            end_date: endDate,
            hk_status: status.value,
            request_id: 'NULL',
            created_by: $localStorage.currentUser.name.id,
            modified_by: $localStorage.currentUser.name.id,
            modified_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        };
        var {
            id, room_id, maintenance_type_id, ooo_type_id, start_date, end_date,
            hk_status, created_by, request_id, modified_by, modified_date
        } = value;
        var query = `
            INSERT INTO hk_room_maintenance (
                room_id, maintenance_type_id,ooo_type_id, notes, start_date,
                end_date, hk_status, created_by
            ) VALUES (
                ${room_id}, ${maintenance_type_id}, ${ooo_type_id}, '${notes}', '${start_date}',
                '${end_date}', '${hk_status}', ${created_by}
            )
        `;
        if (op == 'update') {
            var str = [], updateing = {
                room_id, maintenance_type_id, ooo_type_id, start_date, end_date,
                hk_status, modified_by, modified_date, notes
            };
            for (var u in updateing) {
                var val = updateing[u];
                str.push(val.constructor == String ? `${u} = '${val}'` : `${u} = ${val}`);
            }
            query = `UPDATE hk_room_maintenance SET ${str.join(', ')} WHERE id = ${id}`;
        } else if (op == 'insert') {
            query = trim(query);
        } else {
            query = `DELETE FROM hk_room_maintenance WHERE id = ${id}`;
        }
        $('#form-input').modal('hide');
        //
        queryService.post(query, value)
        .then(function (result) {
            var message = `${op} ${op == 'insert' ? 'new data' : ''}`;
            //JSON.stringify({status, room, orderType, maintenance})
            if (result.status = "200") {
                if (hk_status.toLowerCase() == 'r') {
                    queryService.post(`UPDATE mst_room SET ? WHERE id = ${room_id}`, {hk_status})
                    .then(function (result2) {
                        if (result2.status = "200") {
                            //
                            $scope.notification({message: `Success ${message}`});
                            $scope.dtIns.reloadData();
                            $scope.clearModel()
                        } else {
                            $scope.notification({
                                message: `Failed ${message}`,
                                timeout: -1, type: 'danger'
                            });
                        }
                    })
                } else {
                    $scope.notification({message: `Success ${message}`});
                    $scope.dtIns.reloadData();
                    $scope.clearModel()
                }
            } else {
                $scope.notification({
                    message: `Failed ${message}`,
                    timeout: -1, type: 'danger'
                });
            }
        })
    };
    //
    queryService.get(
        `SELECT value, name, description FROM table_ref WHERE table_name = 'mst_room' AND column_name = 'hk_status'`,
        undefined
    ).then(function (res) {
        $scope.data.status = [].concat(res.data);
        res.data.unshift({name: 'All status', value: ''});
        $scope.data.type = res.data;
    });
    queryService.get(
        `SELECT id as value, code, name FROM mst_room`,
        undefined
    ).then(function (res) {
        $scope.data.room = res.data;
    });
    queryService.get(
        `SELECT id as value, code, name FROM ref_maintenance_req_type`,
        undefined
    ).then(function (res) {
        $scope.data.maintenance = res.data;
    });
    queryService.get(
        `SELECT id as value, code, name FROM ref_out_of_order_type`,
        undefined
    ).then(function (res) {
        $scope.data.orderType = res.data;
    });

    daterangeEl.daterangepicker({
        parentEl: '#form-input',
        showDropdowns: true,
        autoApply: true,
        minDate: '01-01-2001',
        maxDate: moment(new Date(new Date().getTime() + (30 * 24 * 3600000))).format('DD-MM-YYYY'),
        opens: 'left'
    });
    daterangeEl.on('cancel.daterangepicker', function (ev, picker) {
        $scope.model.startDate = '';
        $scope.model.endDate = '';
        $(this).val('');
    });
    daterangeEl.on('apply.daterangepicker', function (ev, picker) {
        $scope.model.startDate = picker.startDate.format('YYYY-MM-DD');
        $scope.model.endDate = picker.endDate.format('YYYY-MM-DD');
        $(this).val(
            [$scope.model.startDate, $scope.model.endDate].join(' ~ ')
        );
    });
});
