var rounD = function (val) {
    return (Math.round(val * 100) / 100);
};
var curR = function (val) {
    return val.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
}
var trim = function (str) {
    return str.replace(/\t\t+|\n\n+|\s\s+/g, ' ').trim()
};
angular.module('app', []).controller('FoInfoRICtrl', function ($scope, $state, $sce, $q,
    queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder,
    $localStorage, $compile, $rootScope, globalFunction, API_URL, $templateCache
) {
    $scope.activeView = '';
    $scope.view = {
        available: '', onhand: '', revenue: '', rate: '', detail: '', block: '', mice: ''
    };
    $scope.model = {startDate: '', endDate: '', dateRange: ''};
    $scope.dateRange = $('#input-daterange');
    //
    $scope.dateRange.daterangepicker({
        parentEl: '#form-input',
        showDropdowns: true,
        autoApply: true,
        minDate: '01-01-2001',
        maxDate: moment(new Date(new Date().getTime() + (30 * 24 * 3600000))).format('DD-MM-YYYY'),
        opens: 'left'
    });
    $scope.dateRange.on('cancel.daterangepicker', function (ev, picker) {
        $scope.model.startDate = '';
        $scope.model.endDate = '';
        $(this).val('');
    });
    $scope.dateRange.on('apply.daterangepicker', function (ev, picker) {
        $scope.model.startDate = picker.startDate.format('YYYY-MM-DD');
        $scope.model.endDate = picker.endDate.format('YYYY-MM-DD');
        $(this).val(
            [$scope.model.startDate, $scope.model.endDate].join(' ~ ')
        );
    });
    //
    $scope.setActiveView = function (name) {
        $scope.activeView = name;
        for (var v in $scope.view) {
            $scope.view[v] = v == name ? 'active' : '';
        }
        if (!$scope.model.endDate) {
            var t = new Date(),
                y = new Date(new Date().getTime() + (3 * 24 * 3600000)),
                s = moment(t).format('YYYY-MM-DD'); //'2017-04-04',
                e = moment(y).format('YYYY-MM-DD'); //'2017-04-06'

            $scope.model.startDate = s;
            $scope.model.endDate = e;
            $scope.model.dateRange = [s, e].join(' ~ ');
        }
        $scope.filter();
    };
    $scope.setQuery = function () {
        var k = $scope.activeView;
        var a = $scope.dates.map(function (date, i) {
            if (k == 'onhand') {
                return `SUM(${k}${i}) '${date}'`
            } else if (k == 'revenue') {
                return `SUM(${k}${i})*(SUM(room_rate_amount) + SUM(extra_bed_charge_amount)) '${date}'`
            } else if (k == 'rate') {
                return `SUM(${k}${i}) 'onhand-${date}', ((b.total-SUM(${k}${i}))*(SUM(room_rate_amount) + SUM(extra_bed_charge_amount))) '${date}'`
            } else { //k == 'available'
                return `b.total-SUM(${k}${i}) '${date}'`;
            }
        }).join(', ');
        var b = $scope.dates.map(function (date, i) {
            return `CASE WHEN '${date}' BETWEEN arrival_date AND departure_date THEN 1 END AS ${k}${i}`;
        }).join(', ');
        //
        return trim(`
            SELECT
                a.room_type_id, b.name AS description, b.total, SUM(flat_rate) package,
                (SUM(room_rate_amount) + SUM(extra_bed_charge_amount)) room_rate,
                SUM(num_of_extra_bed) extra_bed, SUM(discount_amount) discount, ${a}
            FROM 
            (
                SELECT
                    room_type_id, arrival_date, departure_date, room_rate_amount, num_of_extra_bed,
                    extra_bed_charge_amount, discount_amount,
                    flat_rate, ${b}
                FROM
                    fd_guest_folio gf, mst_room_rate_package room_pack, mst_package pack
                WHERE
                    NOW() -INTERVAL 30 DAY < departure_date 
                    AND NOW()-INTERVAL 20 DAY >arrival_date
                    AND gf.room_rate_id=room_pack.room_rate_id
                    AND room_pack.package_id=pack.id
            ) a,
            (
                SELECT 
                    room_type_id, b.name, count(1) total
                FROM
                    mst_room a, ref_room_type b 
                WHERE
                    a.room_type_id=b.id
                GROUP BY
                    room_type_id
            ) b
            WHERE
                a.room_type_id=b.room_type_id
            GROUP BY
                room_type_id
        `);
    };

    $scope.dtIns = {};
    $scope.filter = function () {
        var {startDate, endDate} = $scope.model;
        var dateDiff = moment(new Date(endDate)).diff(moment(new Date(startDate)));
        var dateGap = moment.duration(dateDiff).asDays();
        $scope.dates = [];
        for (var c = 0; c <= dateGap; c++) {
            var t = new Date(startDate).getTime() + (c * 24 * 3600000);
            $scope.dates.push(moment(new Date(t)).format('YYYY-MM-DD'));
        }
        $scope.query = $scope.setQuery();

        if (Object.keys($scope.dtIns).length) {
            $scope.dtIns.reloadData()
        }

        $scope.dtCol = [
            DTColumnBuilder.newColumn('description').withTitle('Description')
            .withOption('width', '180px').renderWith(function (i, type, data, prop) {
                return `<b>${data.description}</b>`
            })
        ].concat($scope.dates.map(function (date) {
            return DTColumnBuilder.newColumn(date)
            .withTitle(date).withOption('width', '100px').withOption('fixedColumns', true)
            .renderWith(function (i, type, data, prop) {
                var r = ['revenue', 'rate'];
                var val = data[date];

                if ($scope.activeView == 'available' && val == null) {
                    val = data.total;
                } else if (r.indexOf($scope.activeView) > -1) {
                    if ($scope.activeView == 'rate') {
                        val = data.room_rate;
                    }
                    return `<div class="text-right">${curR(rounD(val || 0))}</div>`
                }
                return `<div class="text-right">${val || 0}</div>`;
            })
        }));
        $scope.dtOpt = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: API_URL + '/apisql/datatable',
            type: 'POST',
            headers: {
                "authorization": 'Basic ' + $localStorage.mediaToken
            },
            data: function (data) {
                data.query = $scope.query
            },
            complete: $scope.onLoadedDatable
        })
        .withDataProp('data')
        //.withOption('scrollY', '100%')
        //.withOption('scrollX', '100%')
        //.withOption('scrollCollapse', true)
        .withOption('paging', false)
        .withOption('lengthChange', false)
        .withOption('paging', false)
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('bLengthChange', false)
        .withOption('bFilter', false)
        .withOption('responsive', true)
        .withPaginationType('full_numbers')
        .withDisplayLength(100)
        .withOption('order', [0, 'asc'])
        .withOption('createdRow', function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        })
        //.withFixedColumns({ leftColumns: 1 });
    };
    $scope.calculate = function () {
        var mode = $scope.activeView;
        var data = $scope.dtIns.DataTable.rows().data();
        var agg = {};
        //
        $scope.dates.forEach(function (date) {
            var oo = {
                available: 0,
                extra_bed: 0,
                onhand: 0,
                total: 0,
                room_rate: 0,
                package: 0,
                discount: 0,
                tara: 0,
                bruto: 0,
                extra_bed: 0,
                _meta_: []
            };
            $.each(data, function (i, d) {
                var z = d[date], o = {
                    'total': d.total,
                    'extra_bed': d.extra_bed,
                    'room_rate': d.room_rate,
                    'package': d.package,
                    'discount': d.discount
                };

                if (mode == 'available') {
                    o.available = z == null ? o.total : z;
                    o.onhand = o.total - o.available;
                } else if (mode == 'onhand') {
                    o.onhand = z == null ? 0 : z;
                    o.available = o.total - o.onhand;
                } else if (mode == 'revenue') {
                    o.onhand = z / o.room_rate;
                    o.available = o.total - o.onhand;
                } else if (mode == 'rate') {
                    o.onhand = d[`onhand-${date}`] || 0;
                    o.available = o.total - o.onhand;
                }
                o.bruto = o.room_rate * o.onhand;
                o.package_val = (d.room_rate * d.package / 100) * o.onhand;
                o.discount_val = (d.room_rate * d.discount / 100) * o.onhand;
                o.tara = o.package_val + o.discount_val;
                //
                oo.onhand += o.onhand;
                oo.available += o.available;
                oo.extra_bed += o.extra_bed;
                oo.total += o.total;
                oo.room_rate += o.room_rate;
                oo.bruto += o.bruto;
                oo.package += o.package_val;
                oo.discount += o.discount_val;
                oo.tara += o.tara;
                oo._meta_.push(o);
            });

            oo.occupancy = oo.onhand / oo.total * 100;
            oo.netto = oo.bruto - (oo.package + oo.discount);
            oo.avg_netto = isNaN(oo.netto / oo.onhand) ? 0 : (oo.netto / oo.onhand);
            oo.avg_bruto = isNaN(oo.bruto / oo.onhand) ? 0 : (oo.bruto / oo.onhand);
            oo.delta_avg = oo.avg_bruto - oo.avg_netto;
            //
            agg[date] = oo;
        });
        return agg;
    };
    $scope.onLoadedDatable = function () {
        $scope.data = $scope.calculate();
        var foot = $('<tfoot style="background-color: #fdf7f0;">');
        var tr = {};
        tr.available = $('<tr>');
        tr.onhand = $('<tr>');
        tr.extraBed = $('<tr>');
        tr.occupancy = $('<tr>');
        tr.totalRoomRate = $('<tr>');
        tr.discount = $('<tr>');
        tr.package = $('<tr>');
        tr.totalNetRoomRevenue = $('<tr>');
        tr.averageRoomRate = $('<tr>');
        tr.averageNetRoomRate = $('<tr>');
        tr.roomRevenuePAR = $('<tr>');
        //
        tr.available.append('<td class="bold p-t-5 p-r-20 p-l-20">Available</td>');
        tr.onhand.append('<td class="bold p-t-5 p-r-20 p-l-20">Onhand</td>');
        tr.extraBed.append('<td class="p-t-5 p-r-20 p-l-40" style="font-size: 11px !important;">Extra bed</td>');
        tr.occupancy.append('<td class="bold p-t-5 p-r-20 p-l-20">% Occupancy</td>');
        tr.totalRoomRate.append('<td class="p-t-5 p-r-20 p-l-20">Total Room Rate</td>');
        tr.discount.append(
            '<td class="p-t-5 p-r-20 p-l-40" style="font-size: 11px !important;">Discount</td>'
        );
        tr.package.append('<td class="p-t-5 p-r-20 p-l-40" style="font-size: 11px !important;">Package</td>');
        tr.totalNetRoomRevenue.append('<td class="p-t-5 p-r-20 p-l-20">Total Net Room Revenue</td>');
        tr.averageRoomRate.append('<td class="p-t-5 p-r-20 p-l-20">Average Room Rate</td>');
        tr.averageNetRoomRate.append('<td class="p-t-5 p-r-20 p-l-20">Average Net Room Rate</td>');
        tr.roomRevenuePAR.append('<td class="p-t-5 p-r-20 p-l-20">Room Revenue PAR</td>');

        for (var t in tr) foot.append(tr[t]);
        for (var date in $scope.data) {
            var data = $scope.data[date];
            var {
                available, onhand, extra_bed, occupancy, room_rate, bruto, discount,
                package, netto, avg_bruto, avg_netto, delta_avg, tara
            } = data;
            tr.available.append(`<td class="p-r-20 p-l-20 text-right">${rounD(available)}</td>`);
            tr.onhand.append(`<td class="p-r-20 p-l-20 text-right">${rounD(onhand)}</td>`);
            tr.extraBed.append(`<td class="p-r-20 p-l-20 text-right">${rounD(extra_bed)}</td>`);
            tr.occupancy.append(`<td class="p-r-20 p-l-20 text-right">${rounD(occupancy)} %</td>`);
            tr.totalRoomRate.append(`<td class="p-r-20 p-l-20 text-right">${curR(rounD(bruto))}</td>`);
            tr.discount.append(`<td class="p-r-20 p-l-20 text-right">${curR(rounD(discount))}</td>`);
            tr.package.append(`<td class="p-r-20 p-l-20 text-right">${curR(rounD(package))}</td>`);
            tr.totalNetRoomRevenue.append(`<td class="p-r-20 p-l-20 text-right">${curR(rounD(netto))}</td>`);
            tr.averageRoomRate.append(`<td class="p-r-20 p-l-20 text-right">${curR(rounD(avg_bruto))}</td>`);
            tr.averageNetRoomRate.append(`<td class="p-r-20 p-l-20 text-right">${curR(rounD(avg_netto))}</td>`);
            tr.roomRevenuePAR.append(`<td class="p-r-20 p-l-20 text-right">${curR(rounD(delta_avg))}</td>`);
        }
        $($scope.dtIns.dataTable[0]).find('tfoot').remove();
        $($scope.dtIns.dataTable[0]).append(foot);
        $('.dataTables_info').parent().remove();
    }
});
