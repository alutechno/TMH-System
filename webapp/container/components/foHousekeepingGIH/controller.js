function setQuery(query, adder) {
    return [
        query.replace(/\t\t+|\n\n+|\s\s+/g, ' ').trim(),
        adder ? adder : ''
    ].join(' ')
}
function Fn(name) {
    return function ($scope, $state, $sce, $q, queryService, departmentService,
        accountTypeService, DTOptionsBuilder, DTColumnBuilder,
        $localStorage, $compile, $rootScope, globalFunction, API_URL, $templateCache
    ) {
        var args = {};
        for (var i in arguments) args[arguments.callee.$inject[i]] = arguments[i];
        Fn[name](args);
    }
}
Fn.FoHousekeepingGIHCtrl = function (args) {
    var q = {};
    var {$scope, DTOptionsBuilder, API_URL, $localStorage, DTColumnBuilder, $compile} = args;
    //
    $scope.colConfig = {
        guest_name: {
            width: '20%',
            aria: 'Guest Name <br /> <small>remarks</small>',
            renderer: function (data, type, full, meta) {
                return full.guest_name + '<br /> <small>Remarks:' + full.guest_check_in_remarks + '</small>'
            }
        },
        room_no: {
            width: '15%',
            aria: 'Room <br /> Type|Status',
            renderer: function (data, type, full, meta) {
                return full.room_no + '<br /> <small>Type:' + full.room_type + ' | Status:' + full.room_status + '</small>'
            }
        },
        arrival_date: {
            width: '15%',
            aria: 'In <br /> Nights',
            renderer: function (data, type, full, meta) {
                console.log(full)
                return full.arrival_date + '<br /> <small>Nights: ' + full.num_of_nights + '</small>'
            }
        },
        out_date: {
            width: '15%',
            aria: 'Out <br /> <small>pax | child<small>',
            renderer: function (data, type, full, meta) {
                return full.out_date + '<br /> <small>Pax: ' + full.num_of_pax + ' | Child:' + full.num_of_child + '</small>'
            }
        },
        company_name: {
            width: '20%',
            aria: 'Company <br /> <small>remark<small>',
            renderer: function (data, type, full, meta) {
                return full.company_name + '<br /> <small>Remarks: ' + full.mice_check_in_remarks + ' </small>'
            }
        },
        folio_code: {
            width: '20%',
            aria: 'Folio <br /> <small>status<small>',
            renderer: function (data, type, full, meta) {
                return full.folio_code + '<br /> <small>Status: ' + full.reservation_status_name + ' </small>'
            }
        },
        room_rate_code: {
            width: '10%',
            aria: 'rate code <br /> <small>rate amount<small>',
            renderer: function (data, type, full, meta) {
                return full.room_rate_code + '<br /> <small>Charge: ' + full.room_rate_amount + ' </small>'
            }
        },
    };
    $scope.activeView = {
        name: 'In House',
        key: 'inhouse'
    };
    $scope.view = {
        inhouse: {name: 'In House', tab: 'active', adder: 4},
        checkout: {name: 'Checkout', tab: '', adder: 5},
        house: {name: 'House', tab: ''},
        canceled: {name: 'Canceled', tab: '', adder: 6}
    };
    $scope.setActiveView = function (key) {
        $scope.activeView.name = $scope.view[key].name;
        $scope.activeView.key = key;
        for (var k in $scope.view) {
            $scope.view[k].tab = key == k ? 'active' : ''
        }
        $scope.dtInsGIH.reloadData();
        $scope.dtInsGIH.rerender()
    };
    //
    q.condition = '';
    q.query = `
        select 
            a.id folio_id, a.code folio_code,concat(b.first_name, b.last_name, ',') guest_name,
            b.first_name,b.last_name, a.room_type_id,d.name room_type, a.room_id, e.name room_no,
            concat(e.fo_status,e.hk_status) room_status, a.check_in_time, a.check_out_time,
            date_format(date_add(a.arrival_date,interval a.num_of_nights day),'%Y-%m-%d')out_date,
            date_format(a.arrival_date,'%Y-%m-%d')arrival_date,
            date_format(a.departure_date,'%Y-%m-%d')departure_date,
            a.check_in_limit_time,a.actual_check_in_time,a.actual_check_out_time, 
            if(reservation_type='I','Individual','House Guest') reservation_type_name,
            a.commission_amount,a.agent_id,a.payment_type_id, a.member_id,a.customer_id,a.address,
            a.vip_type_id,a.cust_company_id,a.is_inside_allotment,a.is_comp_extra_bed,
            a.room_rate_id,a.num_of_extra_bed,a.extra_bed_charge_amount,a.late_check_out_charge,
            a.discount_percent,a.is_room_only, a.currency_id,a.card_no,a.card_valid_until_year,
            a.card_valid_until_month, a.voucher,a.segment_type_id, a.source_type_id,
            a.is_honeymoon,a.origin_country_id,a.origin_city_id,a.dest_city_id,a.check_in_type_id,
            a.check_out_type_id,b.mobile_phone,b.phone_no phone,b.email, a.num_of_nights,
            a.num_of_stays, a.num_of_pax, a.num_of_child, a.reservation_status,
            w.name reservation_status_name, g.code room_rate_code, a.room_rate_amount,
            a.discount_amount, k.name cust_segment, n.name nationality, a.reservation_type,
            a.mice_id, t.closing_amount balance,
            if(isnull(c.name),'Individual',c.name) company_name, 
            f.name vip_type, a.cancellation_type_id, r.name cancellation_type_name, 
            u.remarks guest_check_in_remarks,ae.remarks guest_cashier_remarks, 
            x.check_in_remarks mice_check_in_remarks,ad.name source_type_name, 
            if(a.is_room_only='Y','Yes','No')is_room_only_name,
            if(a.is_comp_extra_bed='Y','Yes','No')is_comp_extra_bed_name, 
            if(a.is_honeymoon='Y','Yes','No')is_honeymoon_name,
            if(a.late_check_out_charge>0,'Yes','No')late_co, ab.name origin_city,ac.name dest_city, 
            y.name check_in_type_name,z.name check_out_type_name,a.prev_room_type_id,
            p.name prev_room_type_name,b.title,i.name payment_type_name,aa.name currency_name, 
            u.remarks remarks_cashier,u.id remarks_cashier_id,ae.remarks remarks_check_in,
            ae.id remarks_check_in_id, af.remarks remarks_drop,af.id remarks_drop_id,
            ag.remarks remarks_locator,ag.id remarks_locator_id,ah.remarks remarks_prefered,
            ah.id remarks_prefered_id, ai.remarks remarks_pickup,ai.id remarks_pickup_id,
            aj.remarks remarks_room_message,aj.id remarks_room_message_id
        from
            fd_guest_folio a 
            left join mst_customer b on a.customer_id = b.id
            left join mst_cust_company c on a.cust_company_id = c.id
            left join ref_room_type d on a.room_type_id = d.id
            left join ref_room_type p on a.prev_room_type_id = p.id
            left join mst_room e on a.room_id = e.id
            left join ref_vip_type f on a.vip_type_id = f.id
            left join mst_room_rate g on a.room_rate_id = g.id
            left join mst_room_rate_line_item h on a.room_type_id = h.room_type_id and a.room_rate_id = h.room_rate_id
            left join ref_payment_method i on a.payment_type_id = i.id
            left join ref_segment_type k on a.segment_type_id = k.id
            left join ref_country n on a.origin_country_id = n.id 
            left join ref_cancellation_type r on a.cancellation_type_id = r.id
            left join fd_mice_reservation s on a.mice_id = s.id
            left join fd_mice_deposit t on a.mice_id = t.mice_id
            left join (
                select a.id, a.folio_id, remarks
                from fd_folio_remarks a
                where a.remark_type_id = 1
            ) u on a.id = u.folio_id
            left join (
                select a.id, a.folio_id, remarks
                from fd_folio_remarks a
                where a.remark_type_id = 2
            ) ae on a.id = ae.folio_id
            left join (
                select a.id, a.folio_id, remarks
                from fd_folio_remarks a
                where a.remark_type_id = 3
            ) af on a.id = af.folio_id
            left join (
                select a.id, a.folio_id, remarks 
                from fd_folio_remarks a 
                where a.remark_type_id = 4
            ) ag on a.id = ag.folio_id
            left join (
                select a.id, a.folio_id, remarks
                from fd_folio_remarks a 
                where a.remark_type_id = 5
            ) ah on a.id = ah.folio_id
            left join (
                select a.id, a.folio_id, remarks 
                from fd_folio_remarks a 
                where a.remark_type_id = 6
            ) ai on a.id = ai.folio_id
            left join (
                select a.id, a.folio_id, remarks
                from fd_folio_remarks a 
                where a.remark_type_id = 7
            ) aj on a.id = aj.folio_id
            left join (
                select
                    a.id, a.folio_id, group_concat(concat_ws('|', b.name, b.legend_image_name, b.legend_image_uri, b.legend_image_path),',') legend
                    from
                        fd_folio_legend a
                        left join ref_guest_legend b on a.legend_id = b.id group by a.folio_id
            ) v on a.id = v.folio_id
            left join (
                select value, name
                from table_ref
                where table_name = 'fd_guest_folio' and column_name = 'reservation_status'
            ) w on a.reservation_status = w.value
            left join fd_mice_remarks x on a.mice_id = x.mice_id
            left join ref_check_in y on a.check_in_type_id = y.id
            left join ref_check_in z on a.check_out_type_id = z.id
            left join ref_currency aa on a.currency_id = aa.id
            left join ref_kabupaten ab on a.origin_city_id = ab.id
            left join ref_kabupaten ac on a.dest_city_id = ac.id
            left join ref_source_type ad on a.source_type_id = ad.id
        where
            a.reservation_status = 
    `;
    //
    $scope.dtInsGIH = {};
    $scope.dtColGIH = Object.keys($scope.colConfig).map(function (key) {
        var el = $scope.colConfig[key];
        return DTColumnBuilder.newColumn(key).withTitle(el.aria)
        .notSortable().renderWith(el.renderer).withOption('width', el.width);
    });
    $scope.dtOptGIH = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL + '/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization": 'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            var current = $scope.activeView.key;
            if ( current == 'house') {
                data.query = `select a.id,a.code,a.name,a.description,a.status,b.status_name from ref_check_in a, (select id as status_id, value as status_value,name as status_name from table_ref where table_name = 'ref_product_category' and column_name='status')b where a.status = b.status_value and a.status!=2`;
            } else {
                data.query = setQuery(q.query, $scope.view[current].adder);
            }
        }
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    })
    .withOption('responsive', true)
    .withPaginationType('full_numbers')
    .withDisplayLength(10);
};
//
angular.module('app', []).controller('FoHousekeepingGIHCtrl', Fn('FoHousekeepingGIHCtrl'));