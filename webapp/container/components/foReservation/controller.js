
var userController = angular.module('app', []);
userController
.controller('FoReservationCtrl',
function($scope, $state, $sce,$q, queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.el = [];
    $scope.updateState = false;
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.profile = {
        form: {},
        action: {}
    }
    $scope.remark = {
        form: {},
        action: {}
    }
    $scope.additional = {
        form: {},
        action: {}
    }
    $scope.direction = {
        form: {},
        action: {}
    }
    var qstring = "select a.id folio_id, a.code folio_code,concat(b.first_name, b.last_name, ',') guest_name,b.first_name,b.last_name, a.room_type_id,d.name room_type, "+
      "a.room_id, e.name room_no, concat(e.fo_status,e.hk_status) room_status, a.check_in_time, a.check_out_time, date_format(date_add(a.arrival_date,interval a.num_of_nights day),'%Y-%m-%d')out_date, "+
      "date_format(a.arrival_date,'%Y-%m-%d')arrival_date,date_format(a.departure_date,'%Y-%m-%d')departure_date,a.check_in_limit_time,a.actual_check_in_time,a.actual_check_out_time, "+
      "if(reservation_type='I','Individual','House Guest') reservation_type_name,a.commission_amount,a.agent_id,a.payment_type_id, "+
      "a.member_id,a.customer_id,a.address,a.vip_type_id,a.cust_company_id,a.is_inside_allotment,a.is_comp_extra_bed, "+
      "a.room_rate_id,a.num_of_extra_bed,a.extra_bed_charge_amount,a.late_check_out_charge,a.discount_percent,a.is_room_only, "+
      "a.currency_id,a.card_no,a.card_valid_until_year,a.card_valid_until_month, a.voucher,a.segment_type_id, a.source_type_id, "+
      "a.is_honeymoon,a.origin_country_id,a.origin_city_id,a.dest_city_id,a.check_in_type_id,a.check_out_type_id,b.mobile_phone,b.phone_no phone,b.email, "+
      "a.num_of_nights,a.num_of_stays, a.num_of_pax, a.num_of_child, a.reservation_status,  "+
      "w.name reservation_status_name, g.code room_rate_code, a.room_rate_amount, a.discount_amount,  "+
      "k.name cust_segment, n.name nationality, a.reservation_type, a.mice_id, t.closing_amount balance, "+
      "if(isnull(c.name),'Individual',c.name) company_name, f.name vip_type, a.cancellation_type_id, r.name cancellation_type_name, "+
      "u.remarks guest_check_in_remarks,ae.remarks guest_cashier_remarks, x.check_in_remarks mice_check_in_remarks,ad.name source_type_name, "+
      "if(a.is_room_only='Y','Yes','No')is_room_only_name,if(a.is_comp_extra_bed='Y','Yes','No')is_comp_extra_bed_name, "+
      "if(a.is_honeymoon='Y','Yes','No')is_honeymoon_name,if(a.late_check_out_charge>0,'Yes','No')late_co, ab.name origin_city,ac.name dest_city, "+
      "y.name check_in_type_name,z.name check_out_type_name,a.prev_room_type_id,p.name prev_room_type_name,b.title,i.name payment_type_name,aa.name currency_name, "+
      "u.remarks remarks_cashier,u.id remarks_cashier_id,ae.remarks remarks_check_in,ae.id remarks_check_in_id, "+
      "af.remarks remarks_drop,af.id remarks_drop_id,ag.remarks remarks_locator,ag.id remarks_locator_id,ah.remarks remarks_prefered,ah.id remarks_prefered_id, "+
      "ai.remarks remarks_pickup,ai.id remarks_pickup_id,aj.remarks remarks_room_message,aj.id remarks_room_message_id "+
      "from fd_guest_folio a "+
      "left join mst_customer b on a.customer_id = b.id "+
      "left join mst_cust_company c on a.cust_company_id = c.id "+
      "left join ref_room_type d on a.room_type_id = d.id "+
      "left join ref_room_type p on a.prev_room_type_id = p.id "+
      "left join mst_room e on a.room_id = e.id "+
      "left join ref_vip_type f on a.vip_type_id = f.id "+
      "left join mst_room_rate g on a.room_rate_id = g.id "+
      "left join mst_room_rate_line_item h on a.room_type_id = h.room_type_id and a.room_rate_id = h.room_rate_id "+
      "left join ref_payment_method i on a.payment_type_id = i.id "+
      "left join ref_segment_type k on a.segment_type_id = k.id "+
      "left join ref_country n on a.origin_country_id = n.id "+
      "left join ref_cancellation_type r on a.cancellation_type_id = r.id "+
      "left join fd_mice_reservation s on a.mice_id = s.id "+
      "left join fd_mice_deposit t on a.mice_id = t.mice_id "+
      "left join (select a.id, a.folio_id, remarks "+
      "	from fd_folio_remarks a "+
      "    where a.remark_type_id = 1) u on a.id = u.folio_id "+
      "left join (select a.id, a.folio_id, remarks "+
      "	from fd_folio_remarks a "+
      "    where a.remark_type_id = 2) ae on a.id = ae.folio_id "+
      "left join (select a.id, a.folio_id, remarks "+
      "	from fd_folio_remarks a "+
      "    where a.remark_type_id = 3) af on a.id = af.folio_id "+
      "left join (select a.id, a.folio_id, remarks "+
      "	from fd_folio_remarks a "+
      "    where a.remark_type_id = 4) ag on a.id = ag.folio_id "+
      "left join (select a.id, a.folio_id, remarks "+
      "	from fd_folio_remarks a "+
      "    where a.remark_type_id = 5) ah on a.id = ah.folio_id "+
      "left join (select a.id, a.folio_id, remarks "+
      "	from fd_folio_remarks a "+
      "    where a.remark_type_id = 6) ai on a.id = ai.folio_id "+
      "left join (select a.id, a.folio_id, remarks "+
      "	from fd_folio_remarks a "+
      "    where a.remark_type_id = 7) aj on a.id = aj.folio_id "+
      " left join (select a.id, a.folio_id,  "+
      "    group_concat(concat_ws('|', b.name, b.legend_image_name,  "+
      "    b.legend_image_uri, b.legend_image_path),',') legend "+
      "    from fd_folio_legend a "+
      " left join ref_guest_legend b on a.legend_id = b.id "+
        "group by a.folio_id) v on a.id = v.folio_id         "+
      "left join (select value, name from table_ref where table_name = 'fd_guest_folio' "+
        "and column_name = 'reservation_status') w on a.reservation_status = w.value "+
      "left join fd_mice_remarks x on a.mice_id = x.mice_id "+
      "left join ref_check_in y on a.check_in_type_id = y.id "+
      "left join ref_check_in z on a.check_out_type_id = z.id "+
      "left join ref_currency aa on a.currency_id = aa.id "+
      "left join ref_kabupaten ab on a.origin_city_id = ab.id "+
      "left join ref_kabupaten ac on a.dest_city_id = ac.id "+
      "left join ref_source_type ad on a.source_type_id = ad.id ";
    var qwhere = ''
    $scope.activeForm = 'reservation'
    $scope.activeClass={
        reservation: 'active',
        inhouse: '',
        checkout: '',
        house: '',
        canceled: ''
    }

    $scope.selected = {
        status: {},
        filter_department: {},
        filter_account_type: {},
        reservation_status: {}
    }

    $scope.setActiveForm = function(a){
        $scope.activeForm = a
        for (var key in $scope.activeClass){
            $scope.activeClass[key] = ''
        }
        $scope.activeClass[a] = 'active'

        if (a=='reservation'){
            qstring = "select a.id folio_id, a.code folio_code,concat(b.first_name, b.last_name, ',') guest_name,b.first_name,b.last_name, a.room_type_id,d.name room_type, "+
              "a.room_id, e.name room_no, concat(e.fo_status,e.hk_status) room_status, a.check_in_time, a.check_out_time, date_format(date_add(a.arrival_date,interval a.num_of_nights day),'%Y-%m-%d')out_date, "+
              "date_format(a.arrival_date,'%Y-%m-%d')arrival_date,date_format(a.departure_date,'%Y-%m-%d')departure_date,a.check_in_limit_time,a.actual_check_in_time,a.actual_check_out_time, "+
              "if(reservation_type='I','Individual','House Guest') reservation_type_name,a.commission_amount,a.agent_id,a.payment_type_id, "+
              "a.member_id,a.customer_id,a.address,a.vip_type_id,a.cust_company_id,a.is_inside_allotment,a.is_comp_extra_bed, "+
              "a.room_rate_id,a.num_of_extra_bed,a.extra_bed_charge_amount,a.late_check_out_charge,a.discount_percent,a.is_room_only, "+
              "a.currency_id,a.card_no,a.card_valid_until_year,a.card_valid_until_month, a.voucher,a.segment_type_id, a.source_type_id, "+
              "a.is_honeymoon,a.origin_country_id,a.origin_city_id,a.dest_city_id,a.check_in_type_id,a.check_out_type_id,b.mobile_phone,b.phone_no phone,b.email, "+
              "a.num_of_nights,a.num_of_stays, a.num_of_pax, a.num_of_child, a.reservation_status,  "+
              "w.name reservation_status_name, g.code room_rate_code, a.room_rate_amount, a.discount_amount,  "+
              "k.name cust_segment, n.name nationality, a.reservation_type, a.mice_id, t.closing_amount balance, "+
              "if(isnull(c.name),'Individual',c.name) company_name, f.name vip_type, a.cancellation_type_id, r.name cancellation_type_name, "+
              "u.remarks guest_check_in_remarks,ae.remarks guest_cashier_remarks, x.check_in_remarks mice_check_in_remarks,ad.name source_type_name, "+
              "if(a.is_room_only='Y','Yes','No')is_room_only_name,if(a.is_comp_extra_bed='Y','Yes','No')is_comp_extra_bed_name, "+
              "if(a.is_honeymoon='Y','Yes','No')is_honeymoon_name,if(a.late_check_out_charge>0,'Yes','No')late_co, ab.name origin_city,ac.name dest_city, "+
              "y.name check_in_type_name,z.name check_out_type_name,a.prev_room_type_id,p.name prev_room_type_name,b.title,i.name payment_type_name,aa.name currency_name, "+
              "u.remarks remarks_cashier,u.id remarks_cashier_id,ae.remarks remarks_check_in,ae.id remarks_check_in_id, "+
              "af.remarks remarks_drop,af.id remarks_drop_id,ag.remarks remarks_locator,ag.id remarks_locator_id,ah.remarks remarks_prefered,ah.id remarks_prefered_id, "+
              "ai.remarks remarks_pickup,ai.id remarks_pickup_id,aj.remarks remarks_room_message,aj.id remarks_room_message_id "+
              "from fd_guest_folio a "+
              "left join mst_customer b on a.customer_id = b.id "+
              "left join mst_cust_company c on a.cust_company_id = c.id "+
              "left join ref_room_type d on a.room_type_id = d.id "+
              "left join ref_room_type p on a.prev_room_type_id = p.id "+
              "left join mst_room e on a.room_id = e.id "+
              "left join ref_vip_type f on a.vip_type_id = f.id "+
              "left join mst_room_rate g on a.room_rate_id = g.id "+
              "left join mst_room_rate_line_item h on a.room_type_id = h.room_type_id and a.room_rate_id = h.room_rate_id "+
              "left join ref_payment_method i on a.payment_type_id = i.id "+
              "left join ref_segment_type k on a.segment_type_id = k.id "+
              "left join ref_country n on a.origin_country_id = n.id "+
              "left join ref_cancellation_type r on a.cancellation_type_id = r.id "+
              "left join fd_mice_reservation s on a.mice_id = s.id "+
              "left join fd_mice_deposit t on a.mice_id = t.mice_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 1) u on a.id = u.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 2) ae on a.id = ae.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 3) af on a.id = af.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 4) ag on a.id = ag.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 5) ah on a.id = ah.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 6) ai on a.id = ai.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 7) aj on a.id = aj.folio_id "+
              " left join (select a.id, a.folio_id,  "+
              "    group_concat(concat_ws('|', b.name, b.legend_image_name,  "+
              "    b.legend_image_uri, b.legend_image_path),',') legend "+
              "    from fd_folio_legend a "+
              " left join ref_guest_legend b on a.legend_id = b.id "+
                "group by a.folio_id) v on a.id = v.folio_id         "+
              "left join (select value, name from table_ref where table_name = 'fd_guest_folio' "+
                "and column_name = 'reservation_status') w on a.reservation_status = w.value "+
              "left join fd_mice_remarks x on a.mice_id = x.mice_id "+
              "left join ref_check_in y on a.check_in_type_id = y.id "+
              "left join ref_check_in z on a.check_out_type_id = z.id "+
              "left join ref_currency aa on a.currency_id = aa.id "+
              "left join ref_kabupaten ab on a.origin_city_id = ab.id "+
              "left join ref_kabupaten ac on a.dest_city_id = ac.id "+
              "left join ref_source_type ad on a.source_type_id = ad.id ";
              console.log(qstring)
            $scope.profile.form.gf.folio_type = '1'
        }
        else if (a=='inhouse'){
            qstring = "select a.id folio_id, a.code folio_code,concat(b.first_name, b.last_name, ',') guest_name,b.first_name,b.last_name, a.room_type_id,d.name room_type, "+
              "a.room_id, e.name room_no, concat(e.fo_status,e.hk_status) room_status, a.check_in_time, a.check_out_time, date_format(date_add(a.arrival_date,interval a.num_of_nights day),'%Y-%m-%d')out_date, "+
              "date_format(a.arrival_date,'%Y-%m-%d')arrival_date,date_format(a.departure_date,'%Y-%m-%d')departure_date,a.check_in_limit_time,a.actual_check_in_time,a.actual_check_out_time, "+
              "if(reservation_type='I','Individual','House Guest') reservation_type_name,a.commission_amount,a.agent_id,a.payment_type_id, "+
              "a.member_id,a.customer_id,a.address,a.vip_type_id,a.cust_company_id,a.is_inside_allotment,a.is_comp_extra_bed, "+
              "a.room_rate_id,a.num_of_extra_bed,a.extra_bed_charge_amount,a.late_check_out_charge,a.discount_percent,a.is_room_only, "+
              "a.currency_id,a.card_no,a.card_valid_until_year,a.card_valid_until_month, a.voucher,a.segment_type_id, a.source_type_id, "+
              "a.is_honeymoon,a.origin_country_id,a.origin_city_id,a.dest_city_id,a.check_in_type_id,a.check_out_type_id,b.mobile_phone,b.phone_no phone,b.email, "+
              "a.num_of_nights,a.num_of_stays, a.num_of_pax, a.num_of_child, a.reservation_status,  "+
              "w.name reservation_status_name, g.code room_rate_code, a.room_rate_amount, a.discount_amount,  "+
              "k.name cust_segment, n.name nationality, a.reservation_type, a.mice_id, t.closing_amount balance, "+
              "if(isnull(c.name),'Individual',c.name) company_name, f.name vip_type, a.cancellation_type_id, r.name cancellation_type_name, "+
              "u.remarks guest_check_in_remarks,ae.remarks guest_cashier_remarks, x.check_in_remarks mice_check_in_remarks,ad.name source_type_name, "+
              "if(a.is_room_only='Y','Yes','No')is_room_only_name,if(a.is_comp_extra_bed='Y','Yes','No')is_comp_extra_bed_name, "+
              "if(a.is_honeymoon='Y','Yes','No')is_honeymoon_name,if(a.late_check_out_charge>0,'Yes','No')late_co, ab.name origin_city,ac.name dest_city, "+
              "y.name check_in_type_name,z.name check_out_type_name,a.prev_room_type_id,p.name prev_room_type_name,b.title,i.name payment_type_name,aa.name currency_name, "+
              "u.remarks remarks_cashier,u.id remarks_cashier_id,ae.remarks remarks_check_in,ae.id remarks_check_in_id, "+
              "af.remarks remarks_drop,af.id remarks_drop_id,ag.remarks remarks_locator,ag.id remarks_locator_id,ah.remarks remarks_prefered,ah.id remarks_prefered_id, "+
              "ai.remarks remarks_pickup,ai.id remarks_pickup_id,aj.remarks remarks_room_message,aj.id remarks_room_message_id "+
              "from fd_guest_folio a "+
              "left join mst_customer b on a.customer_id = b.id "+
              "left join mst_cust_company c on a.cust_company_id = c.id "+
              "left join ref_room_type d on a.room_type_id = d.id "+
              "left join ref_room_type p on a.prev_room_type_id = p.id "+
              "left join mst_room e on a.room_id = e.id "+
              "left join ref_vip_type f on a.vip_type_id = f.id "+
              "left join mst_room_rate g on a.room_rate_id = g.id "+
              "left join mst_room_rate_line_item h on a.room_type_id = h.room_type_id and a.room_rate_id = h.room_rate_id "+
              "left join ref_payment_method i on a.payment_type_id = i.id "+
              "left join ref_segment_type k on a.segment_type_id = k.id "+
              "left join ref_country n on a.origin_country_id = n.id "+
              "left join ref_cancellation_type r on a.cancellation_type_id = r.id "+
              "left join fd_mice_reservation s on a.mice_id = s.id "+
              "left join fd_mice_deposit t on a.mice_id = t.mice_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 1) u on a.id = u.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 2) ae on a.id = ae.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 3) af on a.id = af.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 4) ag on a.id = ag.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 5) ah on a.id = ah.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 6) ai on a.id = ai.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 7) aj on a.id = aj.folio_id "+
              " left join (select a.id, a.folio_id,  "+
              "    group_concat(concat_ws('|', b.name, b.legend_image_name,  "+
              "    b.legend_image_uri, b.legend_image_path),',') legend "+
              "    from fd_folio_legend a "+
              " left join ref_guest_legend b on a.legend_id = b.id "+
                "group by a.folio_id) v on a.id = v.folio_id         "+
              "left join (select value, name from table_ref where table_name = 'fd_guest_folio' "+
                "and column_name = 'reservation_status') w on a.reservation_status = w.value "+
              "left join fd_mice_remarks x on a.mice_id = x.mice_id "+
              "left join ref_check_in y on a.check_in_type_id = y.id "+
              "left join ref_check_in z on a.check_out_type_id = z.id "+
              "left join ref_currency aa on a.currency_id = aa.id "+
              "left join ref_kabupaten ab on a.origin_city_id = ab.id "+
              "left join ref_kabupaten ac on a.dest_city_id = ac.id "+
              "left join ref_source_type ad on a.source_type_id = ad.id where a.reservation_status=4 ";
        }
        else if (a=='checkout'){
            qstring = "select a.id folio_id, a.code folio_code,concat(b.first_name, b.last_name, ',') guest_name,b.first_name,b.last_name, a.room_type_id,d.name room_type, "+
              "a.room_id, e.name room_no, concat(e.fo_status,e.hk_status) room_status, a.check_in_time, a.check_out_time, date_format(date_add(a.arrival_date,interval a.num_of_nights day),'%Y-%m-%d')out_date, "+
              "date_format(a.arrival_date,'%Y-%m-%d')arrival_date,date_format(a.departure_date,'%Y-%m-%d')departure_date,a.check_in_limit_time,a.actual_check_in_time,a.actual_check_out_time, "+
              "if(reservation_type='I','Individual','House Guest') reservation_type_name,a.commission_amount,a.agent_id,a.payment_type_id, "+
              "a.member_id,a.customer_id,a.address,a.vip_type_id,a.cust_company_id,a.is_inside_allotment,a.is_comp_extra_bed, "+
              "a.room_rate_id,a.num_of_extra_bed,a.extra_bed_charge_amount,a.late_check_out_charge,a.discount_percent,a.is_room_only, "+
              "a.currency_id,a.card_no,a.card_valid_until_year,a.card_valid_until_month, a.voucher,a.segment_type_id, a.source_type_id, "+
              "a.is_honeymoon,a.origin_country_id,a.origin_city_id,a.dest_city_id,a.check_in_type_id,a.check_out_type_id,b.mobile_phone,b.phone_no phone,b.email, "+
              "a.num_of_nights,a.num_of_stays, a.num_of_pax, a.num_of_child, a.reservation_status,  "+
              "w.name reservation_status_name, g.code room_rate_code, a.room_rate_amount, a.discount_amount,  "+
              "k.name cust_segment, n.name nationality, a.reservation_type, a.mice_id, t.closing_amount balance, "+
              "if(isnull(c.name),'Individual',c.name) company_name, f.name vip_type, a.cancellation_type_id, r.name cancellation_type_name, "+
              "u.remarks guest_check_in_remarks,ae.remarks guest_cashier_remarks, x.check_in_remarks mice_check_in_remarks,ad.name source_type_name, "+
              "if(a.is_room_only='Y','Yes','No')is_room_only_name,if(a.is_comp_extra_bed='Y','Yes','No')is_comp_extra_bed_name, "+
              "if(a.is_honeymoon='Y','Yes','No')is_honeymoon_name,if(a.late_check_out_charge>0,'Yes','No')late_co, ab.name origin_city,ac.name dest_city, "+
              "y.name check_in_type_name,z.name check_out_type_name,a.prev_room_type_id,p.name prev_room_type_name,b.title,i.name payment_type_name,aa.name currency_name, "+
              "u.remarks remarks_cashier,u.id remarks_cashier_id,ae.remarks remarks_check_in,ae.id remarks_check_in_id, "+
              "af.remarks remarks_drop,af.id remarks_drop_id,ag.remarks remarks_locator,ag.id remarks_locator_id,ah.remarks remarks_prefered,ah.id remarks_prefered_id, "+
              "ai.remarks remarks_pickup,ai.id remarks_pickup_id,aj.remarks remarks_room_message,aj.id remarks_room_message_id "+
              "from fd_guest_folio a "+
              "left join mst_customer b on a.customer_id = b.id "+
              "left join mst_cust_company c on a.cust_company_id = c.id "+
              "left join ref_room_type d on a.room_type_id = d.id "+
              "left join ref_room_type p on a.prev_room_type_id = p.id "+
              "left join mst_room e on a.room_id = e.id "+
              "left join ref_vip_type f on a.vip_type_id = f.id "+
              "left join mst_room_rate g on a.room_rate_id = g.id "+
              "left join mst_room_rate_line_item h on a.room_type_id = h.room_type_id and a.room_rate_id = h.room_rate_id "+
              "left join ref_payment_method i on a.payment_type_id = i.id "+
              "left join ref_segment_type k on a.segment_type_id = k.id "+
              "left join ref_country n on a.origin_country_id = n.id "+
              "left join ref_cancellation_type r on a.cancellation_type_id = r.id "+
              "left join fd_mice_reservation s on a.mice_id = s.id "+
              "left join fd_mice_deposit t on a.mice_id = t.mice_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 1) u on a.id = u.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 2) ae on a.id = ae.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 3) af on a.id = af.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 4) ag on a.id = ag.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 5) ah on a.id = ah.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 6) ai on a.id = ai.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 7) aj on a.id = aj.folio_id "+
              " left join (select a.id, a.folio_id,  "+
              "    group_concat(concat_ws('|', b.name, b.legend_image_name,  "+
              "    b.legend_image_uri, b.legend_image_path),',') legend "+
              "    from fd_folio_legend a "+
              " left join ref_guest_legend b on a.legend_id = b.id "+
                "group by a.folio_id) v on a.id = v.folio_id         "+
              "left join (select value, name from table_ref where table_name = 'fd_guest_folio' "+
                "and column_name = 'reservation_status') w on a.reservation_status = w.value "+
              "left join fd_mice_remarks x on a.mice_id = x.mice_id "+
              "left join ref_check_in y on a.check_in_type_id = y.id "+
              "left join ref_check_in z on a.check_out_type_id = z.id "+
              "left join ref_currency aa on a.currency_id = aa.id "+
              "left join ref_kabupaten ab on a.origin_city_id = ab.id "+
              "left join ref_kabupaten ac on a.dest_city_id = ac.id "+
              "left join ref_source_type ad on a.source_type_id = ad.id where a.reservation_status=5 ";
        }
        else if (a=='house'){
            qstring = "select a.id,a.code,a.name,a.description,a.status,b.status_name from ref_check_in a, "+
                "(select id as status_id, value as status_value,name as status_name  "+
                    "from table_ref  "+
                    "where table_name = 'ref_product_category' and column_name='status')b "+
                "where a.status = b.status_value and a.status!=2 "
        }
        else if (a=='canceled'){
            qstring = "select a.id folio_id, a.code folio_code,concat(b.first_name, b.last_name, ',') guest_name,b.first_name,b.last_name, a.room_type_id,d.name room_type, "+
              "a.room_id, e.name room_no, concat(e.fo_status,e.hk_status) room_status, a.check_in_time, a.check_out_time, date_format(date_add(a.arrival_date,interval a.num_of_nights day),'%Y-%m-%d')out_date, "+
              "date_format(a.arrival_date,'%Y-%m-%d')arrival_date,date_format(a.departure_date,'%Y-%m-%d')departure_date,a.check_in_limit_time,a.actual_check_in_time,a.actual_check_out_time, "+
              "if(reservation_type='I','Individual','House Guest') reservation_type_name,a.commission_amount,a.agent_id,a.payment_type_id, "+
              "a.member_id,a.customer_id,a.address,a.vip_type_id,a.cust_company_id,a.is_inside_allotment,a.is_comp_extra_bed, "+
              "a.room_rate_id,a.num_of_extra_bed,a.extra_bed_charge_amount,a.late_check_out_charge,a.discount_percent,a.is_room_only, "+
              "a.currency_id,a.card_no,a.card_valid_until_year,a.card_valid_until_month, a.voucher,a.segment_type_id, a.source_type_id, "+
              "a.is_honeymoon,a.origin_country_id,a.origin_city_id,a.dest_city_id,a.check_in_type_id,a.check_out_type_id,b.mobile_phone,b.phone_no phone,b.email, "+
              "a.num_of_nights,a.num_of_stays, a.num_of_pax, a.num_of_child, a.reservation_status,  "+
              "w.name reservation_status_name, g.code room_rate_code, a.room_rate_amount, a.discount_amount,  "+
              "k.name cust_segment, n.name nationality, a.reservation_type, a.mice_id, t.closing_amount balance, "+
              "if(isnull(c.name),'Individual',c.name) company_name, f.name vip_type, a.cancellation_type_id, r.name cancellation_type_name, "+
              "u.remarks guest_check_in_remarks,ae.remarks guest_cashier_remarks, x.check_in_remarks mice_check_in_remarks,ad.name source_type_name, "+
              "if(a.is_room_only='Y','Yes','No')is_room_only_name,if(a.is_comp_extra_bed='Y','Yes','No')is_comp_extra_bed_name, "+
              "if(a.is_honeymoon='Y','Yes','No')is_honeymoon_name,if(a.late_check_out_charge>0,'Yes','No')late_co, ab.name origin_city,ac.name dest_city, "+
              "y.name check_in_type_name,z.name check_out_type_name,a.prev_room_type_id,p.name prev_room_type_name,b.title,i.name payment_type_name,aa.name currency_name, "+
              "u.remarks remarks_cashier,u.id remarks_cashier_id,ae.remarks remarks_check_in,ae.id remarks_check_in_id, "+
              "af.remarks remarks_drop,af.id remarks_drop_id,ag.remarks remarks_locator,ag.id remarks_locator_id,ah.remarks remarks_prefered,ah.id remarks_prefered_id, "+
              "ai.remarks remarks_pickup,ai.id remarks_pickup_id,aj.remarks remarks_room_message,aj.id remarks_room_message_id "+
              "from fd_guest_folio a "+
              "left join mst_customer b on a.customer_id = b.id "+
              "left join mst_cust_company c on a.cust_company_id = c.id "+
              "left join ref_room_type d on a.room_type_id = d.id "+
              "left join ref_room_type p on a.prev_room_type_id = p.id "+
              "left join mst_room e on a.room_id = e.id "+
              "left join ref_vip_type f on a.vip_type_id = f.id "+
              "left join mst_room_rate g on a.room_rate_id = g.id "+
              "left join mst_room_rate_line_item h on a.room_type_id = h.room_type_id and a.room_rate_id = h.room_rate_id "+
              "left join ref_payment_method i on a.payment_type_id = i.id "+
              "left join ref_segment_type k on a.segment_type_id = k.id "+
              "left join ref_country n on a.origin_country_id = n.id "+
              "left join ref_cancellation_type r on a.cancellation_type_id = r.id "+
              "left join fd_mice_reservation s on a.mice_id = s.id "+
              "left join fd_mice_deposit t on a.mice_id = t.mice_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 1) u on a.id = u.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 2) ae on a.id = ae.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 3) af on a.id = af.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 4) ag on a.id = ag.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 5) ah on a.id = ah.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 6) ai on a.id = ai.folio_id "+
              "left join (select a.id, a.folio_id, remarks "+
              "	from fd_folio_remarks a "+
              "    where a.remark_type_id = 7) aj on a.id = aj.folio_id "+
              " left join (select a.id, a.folio_id,  "+
              "    group_concat(concat_ws('|', b.name, b.legend_image_name,  "+
              "    b.legend_image_uri, b.legend_image_path),',') legend "+
              "    from fd_folio_legend a "+
              " left join ref_guest_legend b on a.legend_id = b.id "+
                "group by a.folio_id) v on a.id = v.folio_id         "+
              "left join (select value, name from table_ref where table_name = 'fd_guest_folio' "+
                "and column_name = 'reservation_status') w on a.reservation_status = w.value "+
              "left join fd_mice_remarks x on a.mice_id = x.mice_id "+
              "left join ref_check_in y on a.check_in_type_id = y.id "+
              "left join ref_check_in z on a.check_out_type_id = z.id "+
              "left join ref_currency aa on a.currency_id = aa.id "+
              "left join ref_kabupaten ab on a.origin_city_id = ab.id "+
              "left join ref_kabupaten ac on a.dest_city_id = ac.id "+
              "left join ref_source_type ad on a.source_type_id = ad.id where a.reservation_status=6 ";
        }

        $scope.dtInstance.reloadData(function(obj){}, false)

    }
    //$scope.setActiveForm('reservation')
    $scope.child = {
        profile: {},
        additional: {}
    }

    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.coas = {}
    $scope.id = '';


    $scope.focusinControl = {};
    $scope.fileName = "Check in By Reference";
    $scope.exportExcel = function(){

        queryService.post('select code,name,description,status_name from('+qstring + qwhere+')aa order by code',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code", "Name", 'Description','Status']);
            //Data
            for(var i=0;i<data.data.length;i++){
                var arr = []
                for (var key in data.data[i]){
                    arr.push(data.data[i][key])
                }
                $scope.exportData.push(arr)
            }
            $scope.focusinControl.downloadExcel()
        })
    }

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.coas[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(coas[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(coas[\'' + data + '\'])" )"="">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';
            }
            html += '</div>'
        }
        return html
    }
    $scope.colGuest = function(data,type,full,meta){
        return full.guest_name + '<br /> <small>Remarks:'+full.guest_check_in_remarks+'</small>'
    }
    $scope.colRoom = function(data,type,full,meta){
        return full.room_no + '<br /> <small>Type:'+full.room_type+' | Status:'+full.room_status+'</small>'
    }
    $scope.colIn = function(data,type,full,meta){
        console.log(full)
        return full.arrival_date + '<br /> <small>Nights: '+full.num_of_nights+'</small>'
    }
    $scope.colOut = function(data,type,full,meta){
        return full.out_date + '<br /> <small>Pax: '+full.num_of_pax+' | Child:'+full.num_of_child+'</small>'
    }
    $scope.colCompany = function(data,type,full,meta){
        return full.company_name + '<br /> <small>Remarks: '+full.mice_check_in_remarks+' </small>'
    }
    $scope.colFolio = function(data,type,full,meta){
        return full.folio_code + '<br /> <small>Status: '+full.reservation_status_name+' </small>'
    }
    $scope.colRate = function(data,type,full,meta){
        return full.room_rate_code + '<br /> <small>Charge: '+full.room_rate_amount+' </small>'
    }

    $scope.createdRow = function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
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
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('folio_id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        //DTColumnBuilder.newColumn('code').withTitle('Code Ori').notVisible(),
        DTColumnBuilder.newColumn('folio_id').withTitle('ID'),
    );
    $scope.dtColumns.push(DTColumnBuilder.newColumn('guest_name').withTitle('Guest Name <br /> <small>remarks</small>').notSortable()
    .renderWith($scope.colGuest).withOption('width', '20%'))
    $scope.dtColumns.push(DTColumnBuilder.newColumn('room_no').withTitle('Room <br /> Type|Status').notSortable()
    .renderWith($scope.colRoom).withOption('width', '15%'))
    $scope.dtColumns.push(DTColumnBuilder.newColumn('arrival_date').withTitle('In <br /> Nights').notSortable()
    .renderWith($scope.colIn).withOption('width', '15%'))
    $scope.dtColumns.push(DTColumnBuilder.newColumn('out_date').withTitle('Out <br /> <small>pax | child<small>').notSortable()
    .renderWith($scope.colOut).withOption('width', '15%'))
    $scope.dtColumns.push(DTColumnBuilder.newColumn('company_name').withTitle('Company <br /> <small>remark<small>').notSortable()
    .renderWith($scope.colCompany).withOption('width', '20%'))
    $scope.dtColumns.push(DTColumnBuilder.newColumn('folio_code').withTitle('Folio <br /> <small>status<small>').notSortable()
    .renderWith($scope.colFolio).withOption('width', '10%'))
    $scope.dtColumns.push(DTColumnBuilder.newColumn('room_rate_code').withTitle('rate code <br /> <small>rate amount<small>').notSortable()
    .renderWith($scope.colRate).withOption('width', '10%'))

    var qwhereobj = {
        text: '',
        department: '',
        account_type: ''
    }
    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhereobj.text = ' lower(a.name) like \'%'+$scope.filterVal.search+'%\' '
                else qwhereobj.text = ''
                qwhere = setWhere()

                //if ($scope.filterVal.search.length>0) qwhere = ' and lower(a.name) like "%'+$scope.filterVal.search.toLowerCase()+'%"'
                //else qwhere = ''
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }
        else {
            $scope.dtInstance.reloadData(function(obj){
                console.log(obj)
            }, false)
        }
    }

    $scope.applyFilter = function(){
        //console.log($scope.selected.filter_status)

        //console.log($scope.selected.filter_cost_center)
        if ($scope.selected.filter_department.selected){
            qwhereobj.department = ' a.dept_id = '+$scope.selected.filter_department.selected.id+ ' '
        }
        if ($scope.selected.filter_account_type.selected){
            qwhereobj.account_type = ' a.account_type_id = '+$scope.selected.filter_account_type.selected.id+ ' '
        }
        //console.log(setWhere())
        qwhere = setWhere()
        $scope.dtInstance.reloadData(function(obj){
            console.log(obj)
        }, false)

    }
    function setWhere(){
        var arrWhere = []
        var strWhere = ''
        for (var key in qwhereobj){
            if (qwhereobj[key].length>0) arrWhere.push(qwhereobj[key])
        }
        if (arrWhere.length>0){
            strWhere = ' and ' + arrWhere.join(' and ')
        }
        //console.log(strWhere)
        return strWhere
    }

    /*END AD ServerSide*/
    $scope.openAdvancedFilter = function(val){

        $scope.showAdvance = val
        if (val==false){
            $scope.selected.filter_account_type = {}
            $scope.selected.filter_department = {}
        }
    }
    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $scope.updateState = false
        $('#form-input').modal('show')
        console.log($scope.profile.form)
        $scope.profile.form.setCode();

    }

    $scope.submit = function(type){
        if (type=='profile'){
            $scope.profile.action.submit()
            .then(function(message){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: message,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
            },
            function(err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }
        else if(type=='remark'){
            $scope.remark.action.submit()
            .then(function(message){
                //$('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: message,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
            },
            function(err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }
        else if(type=='additional'){
            $scope.additional.action.submit()
            .then(function(message){
                //$('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: message,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
            },
            function(err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }

    }
    $scope.update = function(obj){
        $scope.updateState = true;
        $('#form-input').modal('show');
        //$('#coa_code').prop('disabled', true);

        // console.log(obj)
        queryService.post(qstring+ ' where a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)


            $scope.profile.form.gf.id= result.data[0].folio_id;
            $scope.remark.form.gf.id= result.data[0].folio_id;
            $scope.additional.form.gf.id= result.data[0].folio_id;


            $scope.profile.form.gf.code= result.data[0].folio_code ;
            $scope.profile.form.gf.folio_type= result.data[0].folio_type ;
            $scope.profile.form.gf.arrival_date= result.data[0].arrival_date ;
            $scope.profile.form.gf.departure_date= result.data[0].departure_date ;
            $scope.profile.form.gf.num_of_nights= result.data[0].num_of_nights ;
            $scope.profile.form.gf.num_of_stays= result.data[0].num_of_stays ;
            $scope.profile.form.gf.check_in_time= result.data[0].check_in_time ;
            $scope.profile.form.gf.check_in_limit_time= result.data[0].check_in_limit_time ;
            $scope.profile.form.gf.check_out_time= result.data[0].check_out_time ;
            $scope.profile.form.gf.actual_check_in_time= result.data[0].actual_check_in_time ;
            $scope.profile.form.gf.actual_check_out_time= result.data[0].actual_check_out_time ;
            $scope.profile.form.gf.reservation_status= result.data[0].reservation_status ;
            $scope.profile.form.gf.reservation_type= result.data[0].reservation_type ;
            $scope.profile.form.gf.mice_id= result.data[0].mice_id ;
            $scope.profile.form.gf.member_id= result.data[0].member_id ;
            $scope.profile.form.gf.room_type_id= result.data[0].room_type_id ;
            $scope.profile.form.gf.room_id= result.data[0].room_id ;
            $scope.profile.form.gf.prev_room_type_id= result.data[0].prev_room_type_id ;
            $scope.profile.form.gf.prev_room_id= result.data[0].prev_room_id ;
            $scope.profile.form.gf.customer_id= result.data[0].customer_id ;
            $scope.profile.form.gf.address= result.data[0].address ;
            $scope.profile.form.gf.num_of_pax= result.data[0].num_of_pax ;
            $scope.profile.form.gf.num_of_child= result.data[0].num_of_child ;
            $scope.profile.form.gf.vip_type_id= result.data[0].vip_type_id ;
            $scope.profile.form.gf.cust_company_id= result.data[0].cust_company_id ;
            $scope.profile.form.gf.is_inside_allotment= result.data[0].is_inside_allotment ;
            $scope.profile.form.gf.room_rate_id= result.data[0].room_rate_id ;
            $scope.profile.form.gf.room_rate_code= result.data[0].room_rate_code ;
            $scope.profile.form.gf.room_rate_amount= result.data[0].room_rate_amount ;
            $scope.profile.form.gf.num_of_extra_bed= result.data[0].num_of_extra_bed ;
            $scope.profile.form.gf.extra_bed_charge_amount= result.data[0].extra_bed_charge_amount ;
            $scope.profile.form.gf.late_check_out_charge= result.data[0].late_check_out_charge ;
            $scope.profile.form.gf.discount_percent= result.data[0].discount_percent ;
            $scope.profile.form.gf.discount_amount= result.data[0].discount_amount ;
            $scope.profile.form.gf.is_room_only= result.data[0].is_room_only ;
            $scope.profile.form.gf.is_comp_extra_bed= result.data[0].is_comp_extra_bed ;
            $scope.profile.form.gf.commission_amount= result.data[0].commission_amount ;
            $scope.profile.form.gf.agent_id= result.data[0].agent_id ;
            $scope.profile.form.gf.payment_type_id= result.data[0].payment_type_id ;
            $scope.profile.form.gf.currency_id= result.data[0].currency_id ;
            $scope.profile.form.gf.card_no= result.data[0].card_no ;
            $scope.profile.form.gf.card_valid_until_year= result.data[0].card_valid_until_year ;
            $scope.profile.form.gf.card_valid_until_month= result.data[0].card_valid_until_month ;
            $scope.profile.form.gf.voucher= result.data[0].voucher ;
            $scope.profile.form.gf.segment_type_id= result.data[0].segment_type_id ;
            $scope.profile.form.gf.source_type_id= result.data[0].source_type_id ;
            $scope.profile.form.gf.is_honeymoon= result.data[0].is_honeymoon ;
            $scope.profile.form.gf.origin_country_id= result.data[0].origin_country_id ;
            $scope.profile.form.gf.origin_city_id= result.data[0].origin_city_id ;
            $scope.profile.form.gf.dest_country_id= result.data[0].dest_country_id ;
            $scope.profile.form.gf.dest_city_id= result.data[0].dest_city_id ;
            $scope.profile.form.gf.check_in_type_id= result.data[0].check_in_type_id ;
            $scope.profile.form.gf.check_out_type_id= result.data[0].check_out_type_id ;
            $scope.profile.form.gf.checked_in_by= result.data[0].checked_in_by ;
            $scope.profile.form.gf.checked_out_by= result.data[0].checked_out_by ;
            $scope.profile.form.gf.mobile_phone= result.data[0].mobile_phone ;
            $scope.profile.form.gf.phone= result.data[0].phone ;
            $scope.profile.form.gf.email= result.data[0].email ;
            $scope.profile.form.gf.cancellation_type_id= result.data[0].cancellation_type_id ;
            $scope.profile.form.gf.cancellation_date= result.data[0].cancellation_date ;
            $scope.profile.form.gf.cancellation_remarks= result.data[0].cancellation_remarks;
            $scope.profile.form.gf.first_name = result.data[0].first_name;
            $scope.profile.form.gf.last_name = result.data[0].last_name;
            $scope.profile.form.gf.remarks_cashier = result.data[0].guest_cashier_remarks;
            $scope.profile.form.gf.remarks_check_in = result.data[0].guest_check_in_remarks;
            $scope.profile.form.gf.guest_name = result.data[0].guest_name;
            $scope.profile.form.gf.title = result.data[0].title;
            $scope.profile.form.gf.room_no = result.data[0].room_no;
            $scope.profile.form.gf.room_type_name = result.data[0].room_type;
            $scope.profile.form.gf.company_name = result.data[0].company_name;
            $scope.profile.form.gf.reservation_status_name = result.data[0].reservation_status_name;

            $scope.profile.form.selected.reservation_status['selected'] = {id:result.data[0].reservation_status,name:result.data[0].reservation_status_name}
            //$scope.selected.member['selected']
            $scope.profile.form.selected.reservation_type['selected'] = {id:result.data[0].reservation_type,name:result.data[0].reservation_type_name}
            $scope.profile.form.selected.room_type['selected'] = {id:result.data[0].room_type_id,name:result.data[0].room_type}
            $scope.profile.form.selected.prev_room_type['selected'] = {id:result.data[0].prev_room_type_id,name:result.data[0].prev_room_type_name}
            $scope.profile.form.selected.block = {}
            queryService.get("select a.id,code,name,fo_status,hk_status,concat('Status:',fo_status,hk_status)status_name, b.feature, a.room_type_id "+
                "from mst_room a "+
                "left join (select room_id,cast(group_concat(feature_id) as char) as feature  "+
                "from mst_room_owned_feature) b on b.room_id = a.id where a.id="+result.data[0].room_id+" order by name asc ",undefined)
            .then(function(data){
                console.log(data.data[0])
                $scope.profile.form.selected.room['selected'] = data.data[0]

            })
            $scope.profile.form.selected.room_feature = []
            $scope.profile.form.selected.customer['selected'] = {id:result.data[0].customer_id,name:result.data[0].guest_name}
            $scope.profile.form.selected.title['selected'] = {id:result.data[0].title,name: result.data[0].title}
            $scope.profile.form.selected.vip_type['selected'] = {id:result.data[0].vip_type_id,name: result.data[0].vip_type}
            $scope.profile.form.selected.company['selected'] = {id:result.data[0].cust_company_id,name: result.data[0].company_name}
            $scope.profile.form.selected.room_rate['selected'] = {id:result.data[0].room_rate_id,name:result.data[0].room_rate_code}
            $scope.profile.form.selected.late_co['selected'] = {id:(result.data[0].late_check_out_charge>0?'Y':'N'),name:(result.data[0].late_check_out_charge>0?'Yes':'No')}
            $scope.profile.form.selected.is_room_only['selected'] = {id:result.data[0].is_room_only,name:(result.data[0].is_room_only=='Y'?'Yes':'No')}
            $scope.profile.form.selected.is_comp_extra_bed['selected'] = {id:result.data[0].is_comp_extra_bed,name:(result.data[0].is_comp_extra_bed=='Y'?'Yes':'No')}
            //$scope.selected.agent['selected'] = ''
            $scope.profile.form.selected.payment_type['selected'] = {id:result.data[0].payment_type_id,name:result.data[0].payment_type_name}
            $scope.profile.form.selected.currency['selected'] = {id:result.data[0].currency_id,name:result.data[0].currency_name}
            $scope.profile.form.selected.card_valid_until_year['selected'] = {id:result.data[0].card_valid_until_year,name: result.data[0].card_valid_until_year}
            $scope.profile.form.selected.card_valid_until_year['selected'] = {id:result.data[0].card_valid_until_year,name: result.data[0].card_valid_until_year}
            $scope.profile.form.selected.segment_type['selected'] = {id:result.data[0].segment_type_id,name:result.data[0].cust_segment}
            $scope.profile.form.selected.source_type['selected'] = {id:result.data[0].source_type_id,name:result.data[0].source_type_name}
            $scope.profile.form.selected.origin_country['selected'] = {id:result.data[0].origin_country_id,name:result.data[0].nationality}
            $scope.profile.form.selected.is_honeymoon['selected'] = {id:result.data[0].is_honeymoon,name:(result.data[0].is_honeymoon=='Y'?'Yes':'No')}
            $scope.profile.form.selected.origin_city['selected'] = {id:result.data[0].origin_city_id,name:result.data[0].nationality}
            $scope.profile.form.selected.dest_city['selected'] = {id:result.data[0].dest_city_id,name:result.data[0].dest_city}
            $scope.profile.form.selected.check_in_type['selected'] = {id:result.data[0].check_in_type_id,name:result.data[0].check_in_type_name}
            $scope.profile.form.selected.check_out_type['selected'] = {id:result.data[0].check_out_type_id,name:result.data[0].check_out_type_name}



            $scope.profile.form.gf.remarks_cashier = result.data[0].remarks_cashier;
            $scope.profile.form.gf.remarks_cashier_id = result.data[0].remarks_cashier_id;
            $scope.profile.form.gf.remarks_check_in = result.data[0].remarks_check_in;
            $scope.profile.form.gf.remarks_check_in_id = result.data[0].remarks_check_in_id;

            $scope.remark.form.gf.remarks_cashier = result.data[0].remarks_cashier;
            $scope.remark.form.gf.remarks_cashier_id = result.data[0].remarks_cashier_id;
            $scope.remark.form.gf.remarks_check_in = result.data[0].remarks_check_in;
            $scope.remark.form.gf.remarks_check_in_id = result.data[0].remarks_check_in_id;
            $scope.remark.form.gf.remarks_drop = result.data[0].remarks_drop;
            $scope.remark.form.gf.remarks_drop_id = result.data[0].remarks_drop_id;
            $scope.remark.form.gf.remarks_locator = result.data[0].remarks_locator;
            $scope.remark.form.gf.remarks_locator_id = result.data[0].remarks_locator_id;
            $scope.remark.form.gf.remarks_prefered = result.data[0].remarks_prefered;
            $scope.remark.form.gf.remarks_prefered_id = result.data[0].remarks_prefered_id;
            $scope.remark.form.gf.remarks_pickup = result.data[0].remarks_pickup;
            $scope.remark.form.gf.remarks_pickup_id = result.data[0].remarks_pickup_id;
            $scope.remark.form.gf.remarks_room_message = result.data[0].remarks_room_message;
            $scope.remark.form.gf.remarks_room_message_id = result.data[0].remarks_room_message_id;

            queryService.get("select a.*,b.name newspaper_name "+
                "from fd_folio_adds a "+
                "left join mst_newspaper b on a.newspaper_id = b.id "+
                "where folio_id = "+result.data[0].folio_id,undefined)
            .then(function(data){
                console.log('addupdate',data.data[0]);
                if (data.data[0]){
                    $scope.additional.form.gf = data.data[0];
                    $scope.additional.form.selected.newspaper['selected'] = {id:data.data[0].newspaper_id,name: data.data[0].newspaper_name}
                    if (data.data[0].pay_tv_status == 1) $scope.additional.form.selected.pay_tv['selected'] = {id:'1',name:'Allow'}
                    else $scope.additional.form.selected.pay_tv['selected'] ={id:'2',name:'Blocked'}
                    if (data.data[0].internet_code_status == 1) $scope.additional.form.selected.internet_code['selected'] = {id:'1',name: 'Blocked'}
                    else if (data.data[0].internet_code_status == 2) $scope.additional.form.selected.internet_code['selected'] = {id:'2',name: 'Pre Paid'}
                    else if (data.data[0].internet_code_status == 3) $scope.additional.form.selected.internet_code['selected'] = {id:'3',name: 'Post Paid'}
                }




            })
        })
    }

    $scope.delete = function(obj){
        $scope.coa.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.coa.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }
    $scope.execCheckIn = function(){
        queryService.post('update fd_guest_folio SET reservation_status=\'4\', '+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.gf.id ,undefined)
        .then(function (result){
            console.log(result)
            if (result.status = "200"){
                console.log('Success Delete')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Guest '+$scope.gf.guest_name+' success Check In',
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
            }
            else {
                console.log('check in Failed')
            }
        },
        function err(err){
            console.log(err)
        })
    }
    $scope.execCheckOut = function(){
        queryService.post('update fd_guest_folio SET reservation_status=\'5\', '+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.gf.id ,undefined)
        .then(function (result){
            console.log(result)
            if (result.status = "200"){
                console.log('Success Delete')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Guest '+$scope.gf.guest_name+' success Check In',
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
            }
            else {
                console.log('check in Failed')
            }
        },
        function err(err){
            console.log(err)
        })
    }
    $scope.execCancel = function(){
        queryService.post('update fd_guest_folio SET reservation_status=\'6\', '+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.gf.id ,undefined)
        .then(function (result){
            console.log(result)
            if (result.status = "200"){
                console.log('Success Delete')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Guest '+$scope.gf.guest_name+' success Check In',
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
            }
            else {
                console.log('check in Failed')
            }
        },
        function err(err){
            console.log(err)
        })
    }

    $scope.execDelete = function(){
        queryService.post('update ref_check_in SET status=\'2\', '+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.coa.id ,undefined)
        .then(function (result){
            if (result.status = "200"){
                console.log('Success Delete')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.coa.name,
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

    $scope.clear = function(){
        $scope.gf = {
            id: '',
            code: '',
            folio_type: '',
            arrival_date: '',
            departure_date: '',
            num_of_nights: '',
            num_of_stays: '',
            check_in_time: '',
            check_in_limit_time: '',
            check_out_time: '',
            actual_check_in_time: '',
            actual_check_out_time: '',
            reservation_status: '',
            reservation_type: '',
            mice_id: '',
            member_id: '',
            room_type_id: '',
            room_id: '',
            prev_room_type_id: '',
            prev_room_id: '',
            customer_id: '',
            address: '',
            num_of_pax: '',
            num_of_child: '',
            vip_type_id: '',
            cust_company_id: '',
            is_inside_allotment: '',
            room_rate_id: '',
            room_rate_code: '',
            room_rate_amount: '',
            num_of_extra_bed: '',
            extra_bed_charge_amount: '',
            late_check_out_charge: '',
            discount_percent: '',
            discount_amount: '',
            is_room_only: '',
            is_comp_extra_bed: '',
            commission_amount: '',
            agent_id: '',
            payment_type_id: '',
            currency_id: '',
            card_no: '',
            card_valid_until_year: '',
            card_valid_until_month: '',
            voucher: '',
            segment_type_id: '',
            source_type_id: '',
            is_honeymoon: '',
            origin_country_id: '',
            origin_city_id: '',
            dest_country_id: '',
            dest_city_id: '',
            check_in_type_id: '',
            check_out_type_id: '',
            checked_in_by: '',
            checked_out_by: '',
            mobile_phone: '',
            phone: '',
            email: '',
            cancellation_type_id: '',
            cancellation_date: '',
            cancellation_remarks: ''
        }
    }

})
.controller('FoReservationProfileCtrl',
function($scope, $state, $sce,$q, queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    var qstring = "select a.id,a.code,a.name,a.description,a.status,b.status_name from ref_check_in a, "+
        "(select id as status_id, value as status_value,name as status_name  "+
            "from table_ref  "+
            "where table_name = 'ref_product_category' and column_name='status')b "+
        "where a.status = b.status_value and a.status!=2 "
    var qwhere = ''

    $scope.profile.form.gf = {
        id: '',
        code: '',
        folio_type: '',
        arrival_date: '',
        departure_date: '',
        num_of_nights: '',
        num_of_stays: '',
        check_in_time: '',
        check_in_limit_time: '',
        check_out_time: '',
        actual_check_in_time: '',
        actual_check_out_time: '',
        reservation_status: '',
        reservation_type: '',
        mice_id: '',
        member_id: '',
        room_type_id: '',
        room_id: '',
        prev_room_type_id: '',
        prev_room_id: '',
        customer_id: '',
        address: '',
        num_of_pax: '',
        num_of_child: '',
        vip_type_id: '',
        cust_company_id: '',
        is_inside_allotment: '',
        room_rate_id: '',
        room_rate_amount: '',
        num_of_extra_bed: '',
        extra_bed_charge_amount: '',
        late_check_out_charge: '',
        discount_percent: '',
        discount_amount: '',
        is_room_only: '',
        is_comp_extra_bed: '',
        commission_amount: '',
        agent_id: '',
        payment_type_id: '',
        currency_id: '',
        card_no: '',
        card_valid_until_year: '',
        card_valid_until_month: '',
        voucher: '',
        segment_type_id: '',
        source_type_id: '',
        is_honeymoon: '',
        origin_country_id: '',
        origin_city_id: '',
        dest_country_id: '',
        dest_city_id: '',
        check_in_type_id: '',
        check_out_type_id: '',
        checked_in_by: '',
        checked_out_by: '',
        mobile_phone: '',
        phone: '',
        email: '',
        cancellation_type_id: '',
        cancellation_date: '',
        cancellation_remarks: '',
        remarks_cashier: '',
        remarks_check_in: ''
    }

    $scope.profile.form.selected = {
        status: {},
        filter_department: {},
        filter_account_type: {},
        reservation_status: {},
        member: {},
        reservation_type: {},
        room_type: {},
        prev_room_type: {},
        block: {},
        room: {},
        room_feature: [],
        customer: {},
        title: {},
        vip_type: {},
        company: {},
        room_rate: {},
        late_co: {},
        is_room_only: {},
        is_comp_extra_bed: {},
        agent: {},
        payment_type: {},
        currency: {},
        card_valid_until_month: {},
        card_valid_until_year: {},
        segment_type: {},
        source_type: {},
        origin_country: {},
        is_honeymoon: {},
        origin_city: {},
        dest_city: {},
        check_in_type: {},
        check_out_type: {}
    }
    $scope.profile.form.reservation_status = []
    queryService.get('select value as id,name from table_ref where table_name = \'fd_guest_folio\' and column_name=\'reservation_status\' and value in(0,1,2,3) order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.reservation_status = data.data
    })
    $scope.profile.form.member = []
    //???UNK

    $scope.profile.form.reservation_type = [{
        id: 'I',
        name: 'Individual'
    }]
    $scope.profile.form.selected.reservation_type['selected'] = $scope.profile.form.reservation_type[0]
    $scope.profile.form.setCode = function(){
        queryService.post("select cast(lpad(seq('"+$scope.profile.form.selected.reservation_type.selected.id+"','"+$scope.profile.form.selected.reservation_type.selected.id+"'),8,'0') as char) as code ",undefined)
        .then(function(data){
            console.log(data)
            $scope.profile.form.gf.code = data.data[0].code
        })
    }

    $scope.profile.form.room_type = []
    queryService.get('select id,name from ref_room_type order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.room_type = data.data
    })

    $scope.profile.form.block = []
    queryService.get('select id,name from fd_mice_room_blocking order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.room_type = data.data
    })

    $scope.profile.form.room = []
    $scope.profile.form.roomOri = []
    queryService.get("select a.id,code,name,fo_status,hk_status,concat('Status:',fo_status,hk_status)status_name, b.feature, a.room_type_id "+
        "from mst_room a "+
        "left join (select room_id,cast(group_concat(feature_id) as char) as feature  "+
        "from mst_room_owned_feature) b on b.room_id =a.id order by name asc ",undefined)
    .then(function(data){
        $scope.profile.form.room = data.data
        $scope.profile.form.roomOri = data.data
    })

    $scope.profile.form.room_feature = []
    queryService.get('select id,name from ref_building_feature order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.room_feature = data.data
    })

    $scope.profile.form.customer = []
    queryService.get('select id,concat(first_name,\' \',last_name)as name from mst_customer order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.customer = data.data
    })

    $scope.profile.form.title = [
        {id: 'Mr',name:'Mr'},
        {id: 'Mrs',name:'Mrs'}
    ]

    $scope.profile.form.vip_type = []
    queryService.get('select id,name from ref_vip_type order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.vip_type = data.data
    })

    $scope.profile.form.company = []
    queryService.get('select id,name from mst_cust_company order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.company = data.data
    })

    $scope.profile.form.room_rate = []
    queryService.get('select id,code as name from mst_room_rate order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.room_rate = data.data
    })

    $scope.profile.form.yesno = [{id:'Y',name:'Yes'},{id:'N',name:'No'}]
    $scope.profile.form.selected.late_co['selected'] = $scope.profile.form.yesno[1]
    $scope.profile.form.selected.is_room_only['selected'] = $scope.profile.form.yesno[1]
    $scope.profile.form.selected.is_comp_extra_bed['selected'] = $scope.profile.form.yesno[1]
    $scope.profile.form.selected.is_honeymoon['selected'] = $scope.profile.form.yesno[1]

    $scope.profile.form.agent = []
    queryService.get('select id,name from mst_sales_agent order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.agent = data.data
    })

    $scope.profile.form.payment_type = []
    queryService.get('select id,name from ref_payment_method order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.payment_type = data.data
    })

    $scope.profile.form.currency = []
    queryService.get('select id,name from ref_currency order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.currency = data.data
    })

    $scope.profile.form.month = [
        {id: '01',name: 'January'},
        {id: '02',name: 'February'},
        {id: '03',name: 'March'},
        {id: '04',name: 'April'},
        {id: '05',name: 'May'},
        {id: '06',name: 'June'},
        {id: '07',name: 'July'},
        {id: '08',name: 'August'},
        {id: '09',name: 'September'},
        {id: '10',name: 'October'},
        {id: '11',name: 'November'},
        {id: '12',name: 'December'}
    ]

    $scope.profile.form.year = [
        {id: '2017',name:'2017'},
        {id: '2018',name:'2018'},
        {id: '2019',name:'2019'},
        {id: '2020',name:'2020'},
        {id: '2021',name:'2021'},
        {id: '2022',name:'2022'},
        {id: '2023',name:'2023'},
        {id: '2024',name:'2024'},
        {id: '2025',name:'2025'},
        {id: '2026',name:'2026'},
        {id: '2027',name:'2027'},
        {id: '2028',name:'2028'},
        {id: '2029',name:'2029'},
        {id: '2030',name:'2030'}
    ]

    $scope.profile.form.segment_type = []
    queryService.get('select id,name from ref_segment_type order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.segment_type = data.data
    })

    $scope.profile.form.source_type = []
    queryService.get('select id,name from ref_source_type order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.source_type = data.data
    })

    $scope.profile.form.country = []
    queryService.get('select id,name from ref_country order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.country = data.data
    })

    $scope.profile.form.city = []
    queryService.get('select id,name from ref_kabupaten order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.city = data.data
    })

    $scope.profile.form.check_in_type = []
    queryService.get('select id,name from ref_check_in order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.check_in_type = data.data
    })

    $scope.profile.form.check_out_type = []
    queryService.get('select id,name from ref_check_out order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.check_out_type = data.data
    })

    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.arrActive = data.data
        $scope.profile.form.selected.status['selected'] = $scope.profile.form.arrActive[0]
    })

    $scope.profile.form.setNights = function(){
        if ($scope.profile.form.gf.arrival_date.length>0 && $scope.profile.form.gf.departure_date.length>0){
            var date1 = new Date($scope.profile.form.gf.arrival_date);
            var date2 = new Date($scope.profile.form.gf.departure_date);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            $scope.profile.form.gf.night = diffDays
        }
    }

    $scope.profile.form.showRoom = function(){
        console.log('showRoom')
    }

    $scope.profile.form.updateRoomList = function() {
        var qwrl = []
        $scope.profile.form.room = []
        if ($scope.profile.form.selected.room_type.selected){
            console.log($scope.profile.form.selected.room_type.selected)
            console.log($scope.profile.form.roomOri)
            for (var i=0;i<$scope.profile.form.roomOri.length;i++){
                if ($scope.profile.form.selected.room_type.selected.id == $scope.profile.form.roomOri[i].room_type_id){
                    $scope.profile.form.room.push($scope.profile.form.roomOri[i])
                }
            }
        }
        if ($scope.profile.form.selected.room_feature.length>0){
            console.log($scope.profile.form.selected.room_feature)
            for (var i=0;i<$scope.profile.form.selected.room_feature.length;i++){
                for (var j=0;j<$scope.profile.form.roomOri.length;j++){
                    if($scope.profile.form.roomOri[j].feature!=null){
                        if ($scope.profile.form.roomOri[j].feature.indexOf($scope.profile.form.selected.room_feature[i].id)){
                            $scope.profile.form.room.push($scope.profile.form.roomOri[j])
                        }
                    }
                }
            }

        }
        if ($scope.profile.form.room.length==0) $scope.profile.form.room=$scope.profile.form.roomOri
        console.log(dist($scope.profile.form.room,'id'))
        $scope.profile.form.room = dist($scope.profile.form.room,'id')

    }
    function dist(array,field){
        var arr = {};

        for ( var i=0, len=array.length; i < len; i++ )
            arr[array[i][field]] = array[i];

        arrays = new Array();
        for ( var key in arr )
            arrays.push(arr[key]);
        return arrays
    }

    $scope.profile.action.checkInModal = function(){
        console.log($scope.profile.form.gf)
        $('#modalCheckIn').modal('show')

    }
    $scope.profile.action.checkOutModal = function(){
        console.log($scope.profile.form.gf)
        $('#modalCheckOut').modal('show')

    }
    $scope.profile.action.cancelModal = function(){
        console.log($scope.profile.form.gf)
        $('#modalCancel').modal('show')

    }
    $scope.profile.action.test = function(){
        console.log($scope.profile.form.gf.id)
        //console.log($scope.additional.param)
    }

    $scope.profile.action.submit = function(){
        var defer = $q.defer();
        if ($scope.gf.id.length==0){
            //exec creation

            var param = {
                code: $scope.profile.form.code,
                folio_type: '1',
                arrival_date: $scope.profile.form.gf.arrival_date,
                departure_date: $scope.profile.form.gf.departure_date,
                num_of_nights: $scope.profile.form.gf.num_of_nights,
                num_of_stays: $scope.profile.form.gf.num_of_stays,
                check_in_time: $scope.profile.form.gf.check_in_time,
                check_in_limit_time: $scope.profile.form.gf.check_in_limit_time,
                check_out_time: $scope.profile.form.gf.check_out_time,
                actual_check_in_time: $scope.profile.form.gf.actual_check_in_time,
                actual_check_out_time: $scope.profile.form.gf.actual_check_out_time,
                reservation_status: ($scope.profile.form.selected.reservation_status.selected?$scope.profile.form.selected.reservation_status.selected.id:null),
                reservation_type: ($scope.profile.form.selected.reservation_type.selected?$scope.profile.form.selected.reservation_type.selected.id:null),
                mice_id: null,
                member_id: ($scope.profile.form.selected.member?$scope.profile.form.selected.member.id:null),
                room_type_id: ($scope.profile.form.selected.room_type.selected?$scope.profile.form.selected.room_type.selected.id:null),
                room_id: ($scope.profile.form.selected.room.selected?$scope.profile.form.selected.room.selected.id:null),
                prev_room_type_id: null,
                prev_room_id: null,
                customer_id: ($scope.profile.form.selected.customer.selected?$scope.profile.form.selected.customer.selected.id:null),
                address: null,
                num_of_pax: $scope.profile.form.gf.num_of_pax,
                num_of_child: $scope.profile.form.gf.num_of_child,
                vip_type_id: ($scope.profile.form.selected.vip_type.selected?$scope.profile.form.selected.vip_type.selected.id:null),
                cust_company_id: ($scope.profile.form.selected.company.selected?$scope.profile.form.selected.company.selected.id:null),
                //is_inside_allotment: ($scope.selected.is_inside_allotment.selected?$scope.selected.is_inside_allotment.selected.id:null),
                room_rate_id: ($scope.profile.form.selected.room_rate.selected?$scope.profile.form.selected.room_rate.selected.id:null),
                room_rate_amount: $scope.profile.form.gf.room_rate_amount,
                num_of_extra_bed: $scope.profile.form.gf.num_of_extra_bed,
                extra_bed_charge_amount: $scope.profile.form.gf.extra_bed_charge_amount,
                late_check_out_charge: $scope.profile.form.gf.late_check_out_charge,
                discount_percent: $scope.profile.form.gf.discount_percent,
                discount_amount: $scope.profile.form.gf.discount_amount,
                is_room_only: ($scope.profile.form.selected.is_room_only.selected?$scope.profile.form.selected.is_room_only.selected.id:null),
                is_comp_extra_bed: ($scope.profile.form.selected.is_comp_extra_bed.selected?$scope.profile.form.selected.is_comp_extra_bed.selected.id:null),
                commission_amount: $scope.profile.form.gf.commission_amount,
                agent_id: ($scope.profile.form.selected.agent.selected?$scope.profile.form.selected.agent.selected.id:null),
                payment_type_id: ($scope.profile.form.selected.payment_type.selected?$scope.profile.form.selected.payment_type.selected.id:null),
                currency_id: ($scope.profile.form.selected.currency.selected?$scope.profile.form.selected.currency.selected.id:null),
                card_no: $scope.profile.form.gf.card_no,
                card_valid_until_year: ($scope.profile.form.selected.card_valid_until_year.selected?$scope.profile.form.selected.card_valid_until_year.selected.id:null),
                card_valid_until_month: ($scope.profile.form.selected.card_valid_until_month.selected?$scope.profile.form.selected.card_valid_until_month.selected.id:null),
                voucher: $scope.profile.form.gf.voucher,
                segment_type_id: ($scope.profile.form.selected.segment_type.selected?$scope.profile.form.selected.segment_type.selected.id:null),
                source_type_id: ($scope.profile.form.selected.source_type.selected?$scope.profile.form.selected.source_type.selected.id:null),
                is_honeymoon: ($scope.profile.form.selected.is_honeymoon.selected?$scope.profile.form.selected.is_honeymoon.selected.id:null),
                origin_country_id: ($scope.profile.form.selected.origin_country.selected?$scope.profile.form.selected.origin_country.selected.id:null),
                origin_city_id: ($scope.profile.form.selected.origin_city.selected?$scope.profile.form.selected.origin_city.selected.id:null),
                dest_country_id: null,
                dest_city_id: ($scope.profile.form.selected.dest_city.selected?$scope.profile.form.selected.dest_city.selected.id:null),
                check_in_type_id: ($scope.profile.form.selected.check_in_type.selected?$scope.profile.form.selected.check_in_type.selected.id:null),
                check_out_type_id: ($scope.profile.form.selected.check_out_type.selected?$scope.profile.form.selected.check_out_type.selected.id:null),
                checked_in_by: null,
                checked_out_by: null,
                mobile_phone: $scope.profile.form.gf.mobile_phone,
                phone: $scope.profile.form.gf.phone,
                email: $scope.profile.form.gf.email,
                //cancellation_type_id: ($scope.selected.cancellation_type.selected?$scope.selected.cancellation_type.selected.id:null),
                //cancellation_date: $scope.gf.cancellation_date,
                //cancellation_remarks: $scope.gf.cancellation_remarks,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }

            console.log(param)

            if(!$scope.profile.form.selected.customer.selected){
                var param_cust = {
                    title:$scope.profile.form.selected.title.selected.id,
                    first_name: $scope.profile.form.gf.first_name,
                    last_name: $scope.profile.form.gf.last_name,
                    birth_date: $scope.profile.form.gf.birth_date,
                    country_id: ($scope.profile.form.selected.origin_country.selected?$scope.profile.form.selected.origin_country.selected.id:null),
                    province_id: null,
                    city_id: ($scope.profile.form.selected.origin_city.selected?$scope.profile.form.selected.origin_city.selected.id:null),
                    status: '1',
                    sales_agent_id: ($scope.profile.form.selected.agent.selected?$scope.profile.form.selected.agent.selected.id:null),
                    mobile_phone: $scope.profile.form.gf.mobile_phone,
                    phone_no: $scope.profile.form.gf.phone,
                    email: $scope.profile.form.gf.email,
                    created_date: globalFunction.currentDate(),
                    created_by: $localStorage.currentUser.name.id
                }
                console.log(param_cust)
                queryService.post('insert into mst_customer SET ?',param_cust)
                .then(function (resultx){
                    console.log('success customer',resultx)
                    param['customer_id'] = resultx.data.insertId;
                    queryService.post('insert into fd_guest_folio SET ?',param)
                    .then(function (result){
                        var param_remark = [[result.data.insertId,2,$scope.profile.form.gf.remarks_cashier,globalFunction.currentDate(),$localStorage.currentUser.name.id],
                            [result.data.insertId,1,$scope.profile.form.gf.remarks_check_in,globalFunction.currentDate(),$localStorage.currentUser.name.id]]
                        console.log(param_remark)

                        queryService.post('insert into fd_folio_remarks(folio_id,remark_type_id,remarks,created_date,created_by) VALUES ?',[param_remark])
                        .then(function (result2){
                            defer.resolve('Success Reservation for '+$scope.gf.first_name);
                        },
                        function (err2){
                            defer.reject('Error Insert: '+err2.code);
                        })
                    },
                    function (err){
                        console.log(err)
                        defer.reject('Error Insert: '+err.code);
                    })
                },
                function (errx){
                    defer.reject('Error Insert Customer: '+errx.code);
                    console.log('error customer',errx)
                })
            }
            else {
                queryService.post('insert into fd_guest_folio SET ?',param)
                .then(function (result){
                    var param_remark = [[result.data.insertId,2,$scope.profile.form.gf.remarks_cashier,globalFunction.currentDate(),$localStorage.currentUser.name.id],
                        [result.data.insertId,1,$scope.profile.form.gf.remarks_check_in,globalFunction.currentDate(),$localStorage.currentUser.name.id]]
                    console.log(param_remark)

                    queryService.post('insert into fd_folio_remarks(folio_id,remark_type_id,remarks,created_date,created_by) VALUES ?',[param_remark])
                    .then(function (result2){
                        defer.resolve('Success Reservation for '+$scope.gf.first_name);
                    },
                    function (err2){
                        defer.reject('Error Insert: '+err2.code);
                    })
                },
                function (err){
                    defer.reject('Error Insert: '+err.code);
                })
            }

        }
        else {
            //exec update
            var param = {
                code: $scope.profile.form.gf.code,
                folio_type: '1',
                arrival_date: $scope.profile.form.gf.arrival_date,
                departure_date: $scope.profile.form.gf.departure_date,
                num_of_nights: $scope.profile.form.gf.num_of_nights,
                num_of_stays: $scope.profile.form.gf.num_of_stays,
                check_in_time: $scope.profile.form.gf.check_in_time,
                check_in_limit_time: $scope.profile.form.gf.check_in_limit_time,
                check_out_time: $scope.profile.form.gf.check_out_time,
                actual_check_in_time: $scope.profile.form.gf.actual_check_in_time,
                actual_check_out_time: $scope.profile.form.gf.actual_check_out_time,
                reservation_status: ($scope.profile.form.selected.reservation_status.selected?$scope.profile.form.selected.reservation_status.selected.id:null),
                reservation_type: ($scope.profile.form.selected.reservation_type.selected?$scope.profile.form.selected.reservation_type.selected.id:null),
                mice_id: null,
                member_id: ($scope.profile.form.selected.member?$scope.profile.form.selected.member.id:null),
                room_type_id: ($scope.profile.form.selected.room_type.selected?$scope.profile.form.selected.room_type.selected.id:null),
                room_id: ($scope.profile.form.selected.room.selected?$scope.profile.form.selected.room.selected.id:null),
                prev_room_type_id: null,
                prev_room_id: null,
                customer_id: ($scope.profile.form.selected.customer.selected?$scope.profile.form.selected.customer.selected.id:null),
                address: null,
                num_of_pax: $scope.profile.form.gf.num_of_pax,
                num_of_child: $scope.profile.form.gf.num_of_child,
                vip_type_id: ($scope.profile.form.selected.vip_type.selected?$scope.profile.form.selected.vip_type.selected.id:null),
                cust_company_id: ($scope.profile.form.selected.company.selected?$scope.profile.form.selected.company.selected.id:null),
                //is_inside_allotment: ($scope.selected.is_inside_allotment.selected?$scope.selected.is_inside_allotment.selected.id:null),
                room_rate_id: ($scope.profile.form.selected.room_rate.selected?$scope.profile.form.selected.room_rate.selected.id:null),
                room_rate_amount: $scope.profile.form.gf.room_rate_amount,
                num_of_extra_bed: $scope.profile.form.gf.num_of_extra_bed,
                extra_bed_charge_amount: $scope.profile.form.gf.extra_bed_charge_amount,
                late_check_out_charge: $scope.profile.form.gf.late_check_out_charge,
                discount_percent: $scope.profile.form.gf.discount_percent,
                discount_amount: $scope.profile.form.gf.discount_amount,
                is_room_only: ($scope.profile.form.selected.is_room_only.selected?$scope.profile.form.selected.is_room_only.selected.id:null),
                is_comp_extra_bed: ($scope.profile.form.selected.is_comp_extra_bed.selected?$scope.profile.form.selected.is_comp_extra_bed.selected.id:null),
                commission_amount: $scope.profile.form.gf.commission_amount,
                agent_id: ($scope.profile.form.selected.agent.selected?$scope.profile.form.selected.agent.selected.id:null),
                payment_type_id: ($scope.profile.form.selected.payment_type.selected?$scope.profile.form.selected.payment_type.selected.id:null),
                currency_id: ($scope.profile.form.selected.currency.selected?$scope.profile.form.selected.currency.selected.id:null),
                card_no: $scope.profile.form.gf.card_no,
                card_valid_until_year: ($scope.profile.form.selected.card_valid_until_year.selected?$scope.profile.form.selected.card_valid_until_year.selected.id:null),
                card_valid_until_month: ($scope.profile.form.selected.card_valid_until_month.selected?$scope.profile.form.selected.card_valid_until_month.selected.id:null),
                voucher: $scope.profile.form.gf.voucher,
                segment_type_id: ($scope.profile.form.selected.segment_type.selected?$scope.profile.form.selected.segment_type.selected.id:null),
                source_type_id: ($scope.profile.form.selected.source_type.selected?$scope.profile.form.selected.source_type.selected.id:null),
                is_honeymoon: ($scope.profile.form.selected.is_honeymoon.selected?$scope.profile.form.selected.is_honeymoon.selected.id:null),
                origin_country_id: ($scope.profile.form.selected.origin_country.selected?$scope.profile.form.selected.origin_country.selected.id:null),
                origin_city_id: ($scope.profile.form.selected.origin_city.selected?$scope.profile.form.selected.origin_city.selected.id:null),
                dest_country_id: null,
                dest_city_id: ($scope.profile.form.selected.dest_city.selected?$scope.profile.form.selected.dest_city.selected.id:null),
                check_in_type_id: ($scope.profile.form.selected.check_in_type.selected?$scope.profile.form.selected.check_in_type.selected.id:null),
                check_out_type_id: ($scope.profile.form.selected.check_out_type.selected?$scope.profile.form.selected.check_out_type.selected.id:null),
                checked_in_by: null,
                checked_out_by: null,
                mobile_phone: $scope.profile.form.gf.mobile_phone,
                phone: $scope.profile.form.gf.phone,
                email: $scope.profile.form.gf.email,
                //cancellation_type_id: ($scope.selected.cancellation_type.selected?$scope.selected.cancellation_type.selected.id:null),
                //cancellation_date: $scope.gf.cancellation_date,
                //cancellation_remarks: $scope.gf.cancellation_remarks,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }

            if ($scope.profile.form.selected.prev_room_type.selected){
                param.prev_room_type_id = $scope.profile.form.gf.room_type_id
                param.room_type_id = $scope.profile.form.selected.prev_room_type.selected.id
            }
            if($scope.profile.form.selected.room.selected.id!=$scope.profile.form.gf.room_id){
                param.prev_room_id = $scope.profile.form.gf.room_id
                param.room_id = $scope.profile.form.selected.room.selected.id
            }

            console.log(param)


                var param_cust = {
                    title:$scope.profile.form.selected.title.selected.id,
                    first_name: $scope.profile.form.gf.first_name,
                    last_name: $scope.profile.form.gf.last_name,
                    birth_date: $scope.profile.form.gf.birth_date,
                    country_id: ($scope.profile.form.selected.origin_country.selected?$scope.profile.form.selected.origin_country.selected.id:null),
                    province_id: null,
                    city_id: ($scope.profile.form.selected.origin_city.selected?$scope.profile.form.selected.origin_city.selected.id:null),
                    status: '1',
                    sales_agent_id: ($scope.profile.form.selected.agent.selected?$scope.profile.form.selected.agent.selected.id:null),
                    mobile_phone: $scope.profile.form.gf.mobile_phone,
                    phone_no: $scope.profile.form.gf.phone,
                    email: $scope.profile.form.gf.email,
                    modified_date: globalFunction.currentDate(),
                    modified_by: $localStorage.currentUser.name.id
                }
                console.log(param_cust)
                queryService.post('update mst_customer SET ? where id='+$scope.profile.form.gf.customer_id,param_cust)
                .then(function (resultx){
                    console.log('success customer',resultx)
                    queryService.post('update fd_guest_folio SET ? where id='+$scope.profile.form.gf.id,param)
                    .then(function (result){
                        var param_remark1 = {
                            //folio_id:$scope.gf.id,
                            //remark_type_id: 1,
                            remarks: $scope.profile.form.gf.remarks_check_in,
                            modified_date:globalFunction.currentDate() ,
                            modified_by:$localStorage.currentUser.name.id
                        }
                        var param_remark2 = {
                            //folio_id:$scope.gf.id,
                            //remark_type_id: 2,
                            remarks: $scope.profile.form.gf.remarks_cashier,
                            modified_date:globalFunction.currentDate() ,
                            modified_by:$localStorage.currentUser.name.id
                        }
                        //var param_remark = [[result.data.insertId,2,$scope.gf.remarks_cashier,globalFunction.currentDate(),$localStorage.currentUser.name.id],
                        //    [result.data.insertId,1,$scope.gf.remarks_check_in,globalFunction.currentDate(),$localStorage.currentUser.name.id]]
                    },
                    function (err){
                        defer.reject('Error Insert: '+err.code);

                    })
                },
                function (errx){
                    console.log('error customer',errx)
                })

        }
        return defer.promise;
    }

})
.controller('FoReservationAdditionalCtrl',
function($scope, $state, $sce, queryService, $q,departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.additional.form.gf = {
        folio_id: '',
        transfer_folio_id: '',
        internet_code_status: '',
        pay_tv_status: '',
        deposit_box_id: '',
        deposit_box_notes: '',
        newspaper_id: '',
        car_no: '',
        total_car: '',
        amenities_notes: '',
        fruit_notes: '',
        is_closed_transc: '0',
        is_cash_transc_only: '0',
        is_incognito: '0',
        is_sleep_out: '0',
        is_lock_minibar: '0',
        is_block_phone: '0',
        is_no_alcohol_in_pos: '0',
        is_sick_guest: '0',
        is_handicap_guest: '0',
        is_reject_for_cleaning: '0',
        is_door_double_lock: '0'

    }
    $scope.additional.form.selected = {
        newspaper: {},
        pay_tv: {},
        internet_code: {}
    }
    $scope.additional.form.internetCode = [
        {id:'1',name: 'Blocked'},
        {id:'2',name: 'Pre Paid'},
        {id:'3',name: 'Post Paid'}
    ]
    $scope.additional.form.payTv = [
        {id:'1',name:'Allow'},
        {id:'2',name:'Blocked'}
    ]
    $scope.additional.form.newspaper = []
    queryService.get('select id,code,name from mst_newspaper where status!=2 order by id  ',undefined)
    .then(function(data){
        $scope.additional.form.newspaper = data.data
    })
    $scope.additional.action.submit = function(){
        var defer = $q.defer();
        //exec update
        var qcommand = ''
        var param = {}
        queryService.get('select count(1) cnt from fd_folio_adds where folio_id=  '+$scope.additional.form.gf.id,undefined)
        .then(function(data){
            if (data.data[0].cnt>0){
                //update
                qcommand = 'update fd_folio_adds set ? where folio_id='+$scope.additional.form.gf.id
                param = {
                    //folio_id: '',
                    //transfer_folio_id: '',
                    internet_code_status: $scope.additional.form.gf.internet_code_status,
                    pay_tv_status: $scope.additional.form.gf.pay_tv_status,
                    deposit_box_id: ($scope.additional.form.gf.deposit_box_id.toString().length>0?$scope.additional.form.gf.deposit_box_id:null),
                    deposit_box_notes: $scope.additional.form.gf.deposit_box_notes,
                    newspaper_id: ($scope.additional.form.gf.newspaper_id.toString().length>0?$scope.additional.form.gf.newspaper_id:null),
                    car_no: $scope.additional.form.gf.car_no,
                    total_car: $scope.additional.form.gf.total_car,
                    amenities_notes: $scope.additional.form.gf.amenities_notes,
                    fruit_notes: $scope.additional.form.gf.fruit_notes,
                    is_closed_transc: $scope.additional.form.gf.is_closed_transc,
                    is_cash_transc_only: $scope.additional.form.gf.is_cash_transc_only,
                    is_incognito: $scope.additional.form.gf.is_incognito,
                    is_sleep_out: $scope.additional.form.gf.is_sleep_out,
                    is_lock_minibar: $scope.additional.form.gf.is_lock_minibar,
                    is_block_phone: $scope.additional.form.gf.is_block_phone,
                    is_no_alcohol_in_pos: $scope.additional.form.gf.is_no_alcohol_in_pos,
                    is_sick_guest: $scope.additional.form.gf.is_sick_guest,
                    is_handicap_guest: $scope.additional.form.gf.is_handicap_guest,
                    is_reject_for_cleaning: $scope.additional.form.gf.is_reject_for_cleaning,
                    is_door_double_lock: $scope.additional.form.gf.is_door_double_lock,
                    modified_date: globalFunction.currentDate(),
                    modified_by: $localStorage.currentUser.name.id

                }
            }
            else {
                //insert
                qcommand = 'insert into fd_folio_adds set ?'
                param = {
                    folio_id: $scope.additional.form.gf.id,
                    //transfer_folio_id: '',
                    internet_code_status: $scope.additional.form.gf.internet_code_status,
                    pay_tv_status: $scope.additional.form.gf.pay_tv_status,
                    deposit_box_id: ($scope.additional.form.gf.deposit_box_id.toString().length>0?$scope.additional.form.gf.deposit_box_id:null),
                    deposit_box_notes: $scope.additional.form.gf.deposit_box_notes,
                    newspaper_id: ($scope.additional.form.gf.newspaper_id.toString().length>0?$scope.additional.form.gf.newspaper_id:null),
                    car_no: $scope.additional.form.gf.car_no,
                    total_car: $scope.additional.form.gf.total_car,
                    amenities_notes: $scope.additional.form.gf.amenities_notes,
                    fruit_notes: $scope.additional.form.gf.fruit_notes,
                    is_closed_transc: $scope.additional.form.gf.is_closed_transc,
                    is_cash_transc_only: $scope.additional.form.gf.is_cash_transc_only,
                    is_incognito: $scope.additional.form.gf.is_incognito,
                    is_sleep_out: $scope.additional.form.gf.is_sleep_out,
                    is_lock_minibar: $scope.additional.form.gf.is_lock_minibar,
                    is_block_phone: $scope.additional.form.gf.is_block_phone,
                    is_no_alcohol_in_pos: $scope.additional.form.gf.is_no_alcohol_in_pos,
                    is_sick_guest: $scope.additional.form.gf.is_sick_guest,
                    is_handicap_guest: $scope.additional.form.gf.is_handicap_guest,
                    is_reject_for_cleaning: $scope.additional.form.gf.is_reject_for_cleaning,
                    is_door_double_lock: $scope.additional.form.gf.is_door_double_lock,
                    created_date: globalFunction.currentDate(),
                    created_by: $localStorage.currentUser.name.id

                }
            }
            console.log('additional',data)
            queryService.post(qcommand,param)
            .then(function (result2){
                defer.resolve('Success Update Additional Data');

            },
            function (err2){
                defer.reject('Error Insert: '+err2.code);


            })
        })


        //queryService.post('update fd_folio_remarks SET ? where folio_id='+$scope.gf.id+' and remark_type_id=1;update fd_folio_remarks SET ? where folio_id='+$scope.gf.id+' and remark_type_id=2',[param_remark1,param_remark2])

         return defer.promise;
    }
})
.controller('FoReservationRemarksCtrl',
function($scope, $state, $sce, $q,queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    var qstring = "select a.id,a.code,a.name,a.description,a.status,b.status_name from ref_check_in a, "+
        "(select id as status_id, value as status_value,name as status_name  "+
            "from table_ref  "+
            "where table_name = 'ref_product_category' and column_name='status')b "+
        "where a.status = b.status_value and a.status!=2 "
    var qwhere = ''
    $scope.remark.form.gf = {
        id: ''
    }
    $scope.remark.action.submit = function(){
        var defer = $q.defer();
        //exec update
        var sqlrmk = []

        sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
            ' values('+$scope.remark.form.gf.remarks_cashier_id+','+$scope.remark.form.gf.id+',1,\''+$scope.remark.form.gf.remarks_cashier+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
            ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.remark.form.gf.remarks_cashier+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
        )
        sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
            ' values('+$scope.remark.form.gf.remarks_check_in_id+','+$scope.remark.form.gf.id+',2,\''+$scope.remark.form.gf.remarks_check_in+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
            ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.remark.form.gf.remarks_check_in+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
        )
        sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
            ' values('+$scope.remark.form.gf.remarks_drop_id+','+$scope.remark.form.gf.id+',3,\''+$scope.remark.form.gf.remarks_drop+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
            ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.remark.form.gf.remarks_drop+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
        )
        sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
            ' values('+$scope.remark.form.gf.remarks_locator_id+','+$scope.remark.form.gf.id+',4,\''+$scope.remark.form.gf.remarks_locator+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
            ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.remark.form.gf.remarks_locator+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
        )
        sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
            ' values('+$scope.remark.form.gf.remarks_prefered_id+','+$scope.remark.form.gf.id+',5,\''+$scope.remark.form.gf.remarks_prefered+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
            ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.remark.form.gf.remarks_prefered+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
        )
        sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
            ' values('+$scope.remark.form.gf.remarks_pickup_id+','+$scope.remark.form.gf.id+',6,\''+$scope.remark.form.gf.remarks_pickup+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
            ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.remark.form.gf.remarks_pickup+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
        )
        sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
            ' values('+$scope.remark.form.gf.remarks_room_message_id+','+$scope.remark.form.gf.id+',7,\''+$scope.remark.form.gf.remarks_room_message+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
            ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.remark.form.gf.remarks_room_message+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
        )

        //queryService.post('update fd_folio_remarks SET ? where folio_id='+$scope.gf.id+' and remark_type_id=1;update fd_folio_remarks SET ? where folio_id='+$scope.gf.id+' and remark_type_id=2',[param_remark1,param_remark2])
        queryService.post(sqlrmk.join(';'),undefined)
        .then(function (result2){
            defer.resolve('Success Update Remark');

        },
        function (err2){
            defer.reject('Error Insert: '+err2.code);


        })
         return defer.promise;
    }

})
.controller('FoReservationDirectionsCtrl',
function($scope, $state, $sce, queryService, $q,departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.direction.form.gf = {
        folio_id: '',
        transfer_folio_id: '',
        internet_code_status: '',
        pay_tv_status: '',
        deposit_box_id: '',
        deposit_box_notes: '',
        newspaper_id: '',
        car_no: '',
        total_car: '',
        amenities_notes: '',
        fruit_notes: '',
        is_closed_transc: '0',
        is_cash_transc_only: '0',
        is_incognito: '0',
        is_sleep_out: '0',
        is_lock_minibar: '0',
        is_block_phone: '0',
        is_no_alcohol_in_pos: '0',
        is_sick_guest: '0',
        is_handicap_guest: '0',
        is_reject_for_cleaning: '0',
        is_door_double_lock: '0'

    }
    $scope.additional.form.selected = {
        newspaper: {},
        pay_tv: {},
        internet_code: {}
    }
    $scope.additional.form.internetCode = [
        {id:'1',name: 'Blocked'},
        {id:'2',name: 'Pre Paid'},
        {id:'3',name: 'Post Paid'}
    ]
    $scope.additional.form.payTv = [
        {id:'1',name:'Allow'},
        {id:'2',name:'Blocked'}
    ]
    $scope.additional.form.newspaper = []
    queryService.get('select id,code,name from mst_newspaper where status!=2 order by id  ',undefined)
    .then(function(data){
        $scope.additional.form.newspaper = data.data
    })
    $scope.additional.action.submit = function(){
        var defer = $q.defer();
        //exec update
        var qcommand = ''
        var param = {}
        queryService.get('select count(1) cnt from fd_folio_adds where folio_id=  '+$scope.additional.form.gf.id,undefined)
        .then(function(data){
            if (data.data[0].cnt>0){
                //update
                qcommand = 'update fd_folio_adds set ? where folio_id='+$scope.additional.form.gf.id
                param = {
                    //folio_id: '',
                    //transfer_folio_id: '',
                    internet_code_status: $scope.additional.form.gf.internet_code_status,
                    pay_tv_status: $scope.additional.form.gf.pay_tv_status,
                    deposit_box_id: ($scope.additional.form.gf.deposit_box_id.toString().length>0?$scope.additional.form.gf.deposit_box_id:null),
                    deposit_box_notes: $scope.additional.form.gf.deposit_box_notes,
                    newspaper_id: ($scope.additional.form.gf.newspaper_id.toString().length>0?$scope.additional.form.gf.newspaper_id:null),
                    car_no: $scope.additional.form.gf.car_no,
                    total_car: $scope.additional.form.gf.total_car,
                    amenities_notes: $scope.additional.form.gf.amenities_notes,
                    fruit_notes: $scope.additional.form.gf.fruit_notes,
                    is_closed_transc: $scope.additional.form.gf.is_closed_transc,
                    is_cash_transc_only: $scope.additional.form.gf.is_cash_transc_only,
                    is_incognito: $scope.additional.form.gf.is_incognito,
                    is_sleep_out: $scope.additional.form.gf.is_sleep_out,
                    is_lock_minibar: $scope.additional.form.gf.is_lock_minibar,
                    is_block_phone: $scope.additional.form.gf.is_block_phone,
                    is_no_alcohol_in_pos: $scope.additional.form.gf.is_no_alcohol_in_pos,
                    is_sick_guest: $scope.additional.form.gf.is_sick_guest,
                    is_handicap_guest: $scope.additional.form.gf.is_handicap_guest,
                    is_reject_for_cleaning: $scope.additional.form.gf.is_reject_for_cleaning,
                    is_door_double_lock: $scope.additional.form.gf.is_door_double_lock,
                    modified_date: globalFunction.currentDate(),
                    modified_by: $localStorage.currentUser.name.id

                }
            }
            else {
                //insert
                qcommand = 'insert into fd_folio_adds set ?'
                param = {
                    folio_id: $scope.additional.form.gf.id,
                    //transfer_folio_id: '',
                    internet_code_status: $scope.additional.form.gf.internet_code_status,
                    pay_tv_status: $scope.additional.form.gf.pay_tv_status,
                    deposit_box_id: ($scope.additional.form.gf.deposit_box_id.toString().length>0?$scope.additional.form.gf.deposit_box_id:null),
                    deposit_box_notes: $scope.additional.form.gf.deposit_box_notes,
                    newspaper_id: ($scope.additional.form.gf.newspaper_id.toString().length>0?$scope.additional.form.gf.newspaper_id:null),
                    car_no: $scope.additional.form.gf.car_no,
                    total_car: $scope.additional.form.gf.total_car,
                    amenities_notes: $scope.additional.form.gf.amenities_notes,
                    fruit_notes: $scope.additional.form.gf.fruit_notes,
                    is_closed_transc: $scope.additional.form.gf.is_closed_transc,
                    is_cash_transc_only: $scope.additional.form.gf.is_cash_transc_only,
                    is_incognito: $scope.additional.form.gf.is_incognito,
                    is_sleep_out: $scope.additional.form.gf.is_sleep_out,
                    is_lock_minibar: $scope.additional.form.gf.is_lock_minibar,
                    is_block_phone: $scope.additional.form.gf.is_block_phone,
                    is_no_alcohol_in_pos: $scope.additional.form.gf.is_no_alcohol_in_pos,
                    is_sick_guest: $scope.additional.form.gf.is_sick_guest,
                    is_handicap_guest: $scope.additional.form.gf.is_handicap_guest,
                    is_reject_for_cleaning: $scope.additional.form.gf.is_reject_for_cleaning,
                    is_door_double_lock: $scope.additional.form.gf.is_door_double_lock,
                    created_date: globalFunction.currentDate(),
                    created_by: $localStorage.currentUser.name.id

                }
            }
            console.log('additional',data)
            queryService.post(qcommand,param)
            .then(function (result2){
                defer.resolve('Success Update Additional Data');

            },
            function (err2){
                defer.reject('Error Insert: '+err2.code);


            })
        })


        //queryService.post('update fd_folio_remarks SET ? where folio_id='+$scope.gf.id+' and remark_type_id=1;update fd_folio_remarks SET ? where folio_id='+$scope.gf.id+' and remark_type_id=2',[param_remark1,param_remark2])

         return defer.promise;
    }
})
