
var userController = angular.module('app', []);
userController
.controller('FoReservationMiceCtrl',
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
    $scope.venue = {
        form: {},
        action: {}
    }
    $scope.member = {
        form: {},
        action: {}
    }
    var qstringOri = "select a.id, a.code, date_format(a.arrival_date,'%Y-%m-%d')arrival_date, date_format(a.departure_date,'%Y-%m-%d')departure_date, "+
        "a.num_of_nights_stay, a.reservation_status, date_format(a.drop_date,'%Y-%m-%d')drop_date, "+
    	"a.num_of_room_nights, a.num_of_picked_up, a.num_of_pax, a.num_of_child, a.revenue_amount, a.discount_amount,  "+
        "a.package_amount, a.master_folio_id, a.cust_name, a.num_of_room, a.expected_pax, a.expected_child,  "+
        "a.cust_company_id, a.address, a.mice_series_id, a.room_rate_id, a.discount_percent, a.payment_type_id,  "+
        "a.extra_bed_amount, a.segment_type_id, a.source_type_id, a.origin_country_id, a.origin_city_id,  "+
        "a.dest_country_id, a.dest_city_id, a.pension_id, a.voucher_no, a.contact_person, a.mobile_phone, a.phone_no,  "+
        "a.fax_no, a.email, a.commission_per_room, a.sales_agent_id, a.is_block_member_phone, a.is_lock_member_minibar,  "+
        "a.is_transaction_only, a.pay_tv_status, a.check_in_type_id, a.check_out_type_id, a.checked_out_time, "+
        "a.checked_out_by, a.created_date, a.modified_date, a.created_by, a.modified_by, "+
        "b.name reservation_status_name,c.name company_name,c.address company_address,d.name room_rate_name, "+
        "e.name payment_type_name,f.name segment_type_name,g.name origin_country_name, "+
        "h.cashier_remarks,h.check_in_remarks,h.drop_remarks,h.pickup_remarks, "+
        "j.name origin_city_name,k.name dest_city_name, "+
        "l.name source_type_name,m.name pension_name,date_format(date_add(a.arrival_date,interval a.num_of_nights_stay day),'%Y-%m-%d')co_date "+
    "from fd_mice_reservation a "+
    "left join (select value id, name from table_ref where table_name = 'fd_mice_reservation' and column_name = 'reservation_status') b on a.reservation_status = b.id "+
    "left join mst_cust_company c on a.cust_company_id = c.id "+
    "left join mst_room_rate d on a.room_rate_id = d.id "+
    "left join ref_payment_method e on a.payment_type_id = e.id "+
    "left join ref_segment_type f on a.segment_type_id = f.id "+
    "left join ref_country g on a.origin_country_id = g.id "+
    "left join fd_mice_remarks h on a.id = h.mice_id "+
    "left join ref_kabupaten j on a.origin_city_id = j.id "+
    "left join ref_kabupaten k on a.dest_city_id = k.id  "+
    "left join ref_source_type l on a.source_type_id = l.id "+
    "left join ref_pension m on a.pension_id = m.id ";
    var qwhere = ''
    var qstring = qstringOri + " where a.reservation_status in('0','1','2') "
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
            /*qstring = "select a.id folio_id, a.code folio_code,concat(b.first_name, b.last_name, ',') guest_name,b.first_name,b.last_name, a.room_type_id,d.name room_type, "+
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
              "left join ref_source_type ad on a.source_type_id = ad.id ";*/
              qstring = qstringOri+ " where a.reservation_status in ('0','1','2') "
              console.log(qstring)
            $scope.profile.form.gf.folio_type = '1'
        }
        else if (a=='inhouse'){
              qstring = qstringOri + " where a.reservation_status = 4 "
        }
        else if (a=='checkout'){
              qstring = qstringOri + " where a.reservation_status = 5 "
        }
        else if (a=='canceled'){
              qstring = qstringOri + " where a.reservation_status = 6 "
        }
        else if (a=='all'){

              qstring = qstringOri + " where a.reservation_status in ('0','1','2','3','4','5','6')  "
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
                '<button class="btn btn-default" title="Update" ng-click="update(coas[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(coas[\'' + data + '\'])" )"="">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';
            }
            html += '</div>'
        }
        return html
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
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        //DTColumnBuilder.newColumn('code').withTitle('Code Ori').notVisible(),
        DTColumnBuilder.newColumn('code').withTitle('Folio'),
        DTColumnBuilder.newColumn('cust_name').withTitle('Name'),
        DTColumnBuilder.newColumn('company_name').withTitle('Company'),
        DTColumnBuilder.newColumn('reservation_status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('room_rate_name').withTitle('Rate'),
        DTColumnBuilder.newColumn('arrival_date').withTitle('Arrival'),
        DTColumnBuilder.newColumn('co_date').withTitle('Out'),
        DTColumnBuilder.newColumn('drop_date').withTitle('Drop'),
        DTColumnBuilder.newColumn('num_of_room').withTitle('Room'),
        DTColumnBuilder.newColumn('num_of_pax').withTitle('Pax'),
        DTColumnBuilder.newColumn('num_of_picked_up').withTitle('Picked Up'),
        DTColumnBuilder.newColumn('revenue_amount').withTitle('Revenue')
    );


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
            console.log('submit profile')
            $scope.profile.action.submit()
            .then(function(message){
                console.log('profile success')
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
                console.log('profile err')
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
        else if(type=='venue'){
            $scope.venue.action.submit()
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
        else if(type=='member'){
            $scope.member.action.submit()
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
        queryService.post(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)


            $scope.profile.form.gf.id= result.data[0].id;
            $scope.remark.form.gf.id= result.data[0].id;
            $scope.venue.form.gf.id= result.data[0].id;
            $scope.venue.action.show($scope.venue.form.gf.id);
            //$scope.additional.form.gf.id= result.data[0].folio_id;


            $scope.profile.form.gf.code= result.data[0].folio_code ;
            $scope.profile.form.gf.arrival_date= result.data[0].arrival_date ;
            $scope.profile.form.gf.departure_date= result.data[0].departure_date ;
            $scope.profile.form.gf.drop_date= result.data[0].drop_date ;

            $scope.profile.form.gf.num_of_nights_stay= result.data[0].num_of_nights_stay ;
            $scope.profile.form.gf.num_of_room_nights= result.data[0].num_of_room_nights ;

            $scope.profile.form.gf.num_of_picked_up= result.data[0].num_of_picked_up ;
            $scope.profile.form.gf.num_of_pax= result.data[0].num_of_pax ;
            $scope.profile.form.gf.num_of_child= result.data[0].num_of_child ;
            $scope.profile.form.gf.revenue_amount= result.data[0].revenue_amount ;
            $scope.profile.form.gf.discount_amount= result.data[0].discount_amount ;
            $scope.profile.form.gf.package_amount= result.data[0].package_amount ;
            $scope.profile.form.gf.cust_name= result.data[0].cust_name ;
            $scope.profile.form.gf.num_of_room= result.data[0].num_of_room ;
            $scope.profile.form.gf.expected_pax= result.data[0].expected_pax ;
            $scope.profile.form.gf.expected_child= result.data[0].expected_child ;
            $scope.profile.form.gf.address= result.data[0].address ;
            $scope.profile.form.gf.discount_percent= result.data[0].discount_percent ;
            $scope.profile.form.gf.voucher_no= result.data[0].voucher_no ;
            $scope.profile.form.gf.contact_person= result.data[0].contact_person ;
            $scope.profile.form.gf.mobile_phone= result.data[0].mobile_phone ;
            $scope.profile.form.gf.phone_no= result.data[0].phone_no ;
            $scope.profile.form.gf.fax_no= result.data[0].fax_no ;
            $scope.profile.form.gf.email= result.data[0].email ;
            $scope.profile.form.gf.commission_per_room= result.data[0].commission_per_room ;

            $scope.profile.form.selected.reservation_status['selected'] = {id:result.data[0].reservation_status,name:result.data[0].reservation_status_name}
            $scope.profile.form.selected.company['selected'] = {id:result.data[0].cust_company_id,name: result.data[0].company_name}
            $scope.profile.form.selected.mice_series['selected'] = {id:result.data[0].mice_series_id,name: result.data[0].mice_series_name}
            $scope.profile.form.selected.room_rate['selected'] = {id:result.data[0].room_rate_id,name:result.data[0].room_rate_name}
            $scope.profile.form.selected.pay_by['selected'] = {id:result.data[0].payment_type_id,name:result.data[0].payment_type_name}
            $scope.profile.form.selected.segment_type['selected'] = {id:result.data[0].segment_type_id,name:result.data[0].cust_segment}
            $scope.profile.form.selected.source_type['selected'] = {id:result.data[0].source_type_id,name:result.data[0].source_type_name}
            $scope.profile.form.selected.origin_country['selected'] = {id:result.data[0].origin_country_id,name:result.data[0].nationality}
            $scope.profile.form.selected.origin_city['selected'] = {id:result.data[0].origin_city_id,name:result.data[0].nationality}
            $scope.profile.form.selected.dest_city['selected'] = {id:result.data[0].dest_city_id,name:result.data[0].dest_city}
            $scope.profile.form.selected.pension['selected'] = {id:result.data[0].pension_id,name:result.data[0].pension_name}
            $scope.profile.form.selected.agent['selected'] = {id:result.data[0].sales_agent_id,name:result.data[0].sales_agent_name}
            if (result.data[0].pay_tv_status == 1) $scope.profile.form.selected.pay_tv['selected'] = {id:'1',name:'Allow'}
            else $scope.profile.form.selected.pay_tv['selected'] ={id:'2',name:'Blocked'}
            $scope.profile.form.selected.is_block_phone['selected'] = result.data[0].is_block_member_phone
            $scope.profile.form.selected.is_lock_minibar['selected'] = result.data[0].is_lock_member_minibar
            $scope.profile.form.selected.is_cash_transc_only['selected'] = result.data[0].is_transaction_only
            $scope.profile.form.gf.remarks_cashier = result.data[0].cashier_remarks;
            $scope.profile.form.gf.remarks_check_in = result.data[0].check_in_remarks;
            $scope.remark.form.gf.remarks_cashier = result.data[0].cashier_remarks;
            $scope.remark.form.gf.remarks_check_in = result.data[0].check_in_remarks;
            $scope.remark.form.gf.remarks_drop = result.data[0].drop_remarks;
            $scope.remark.form.gf.remarks_pickup = result.data[0].pickup_remarks;

            $scope.member.form.getMember(result.data[0].id);




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
        queryService.post('update fd_mice_reservation SET reservation_status=\'4\', '+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.profile.form.gf.id ,undefined)
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
                    message: 'Success Check In',
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
        queryService.post('update fd_mice_reservation SET reservation_status=\'5\', '+
        ' checked_out_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.profile.form.gf.id ,undefined)
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
                    message: 'Success Check Out',
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
        queryService.post('update fd_mice_reservation SET reservation_status=\'6\', '+
        //' cancellation_remarks=\''+$scope.profile.form.gf.cancellation_remarks+'\', ' +
        //' cancellation_type_id='+$scope.profile.form.selected.cancellation_type.selected.id+', ' +
        //' cancellation_date=\''+globalFunction.currentDate()+'\', ' +
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.profile.form.gf.id ,undefined)
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
                    message: 'Success Cancelled',
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
        arrival_date: '',
        departure_date: '',
        num_of_nights_stay: '',
        reservation_status: '',
        drop_date: '',
        num_of_room_nights: '',
        num_of_picked_up: '',
        num_of_pax: '',
        num_of_child: '',
        revenue_amount: '',
        discount_amount: '',
        package_amount: '',
        master_folio_id: '',
        cust_name: '',
        num_of_room: '',
        expected_pax: '',
        expected_child: '',
        cust_company_id: '',
        address: '',
        mice_series_id: '',
        room_rate_id: '',
        discount_percent: '',
        payment_type_id: '',
        extra_bed_amount: '',
        segment_type_id: '',
        source_type_id: '',
        origin_country_id: '',
        origin_city_id: '',
        dest_country_id: '',
        dest_city_id: '',
        pension_id: '',
        voucher_no: '',
        contact_person: '',
        mobile_phone: '',
        phone_no: '',
        fax_no: '',
        email: '',
        commission_per_room: '',
        sales_agent_id: '',
        is_block_member_phone: '',
        is_lock_member_minibar: '',
        is_transaction_only: '',
        pay_tv_status: '',
        check_in_type_id: '',
        check_out_type_id: '',
        checked_out_time: '',
        checked_out_by: '',
        created_date: '',
        modified_date: '',
        created_by: '',
        modified_by: ''
    }

    $scope.profile.form.selected = {
        status: {},
        filter_department: {},
        filter_account_type: {},
        cancellation_type: {},
        reservation_status: {},
        reservation_type: {},
        company: {},
        mice_series: {},
        room_rate: {},
        pay_by: {},
        currency: {},
        segment_type: {},
        source_type: {},
        origin_city: {},
        dest_city: {},
        origin_country: {},
        pension: {},
        agent: {},
        is_lock_minibar: "N",
        is_block_phone: "N",
        is_cash_transc_only: "Y",
        pay_tv: {}
    }
    $scope.profile.form.cancellation_type = []
    queryService.get('select id,name from ref_cancellation_type where status=1 order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.cancellation_type = data.data
        $scope.profile.form.selected.cancellation_type['selected'] = $scope.profile.form.cancellation_type[0]
    })
    $scope.profile.form.reservation_status = []
    queryService.get('select value as id,name from table_ref where table_name = \'fd_mice_reservation\' and column_name=\'reservation_status\' and value in(0,1,2,3) order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.reservation_status = data.data
    })

    $scope.profile.form.company = []
    queryService.get('select id,name from mst_cust_company order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.company = data.data
    })
    $scope.profile.form.mice_series = []
    queryService.get('select id,name from ref_mice_series order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.mice_series = data.data
    })
    $scope.profile.form.room_rate = []
    queryService.get('select id,code as name from mst_room_rate order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.room_rate = data.data
    })
    $scope.profile.form.pay_by = []
    queryService.get('select id,name from ref_payment_method order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.pay_by = data.data
    })

    $scope.profile.form.currency = []
    queryService.get('select id,name from ref_currency order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.currency = data.data
    })
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
    $scope.profile.form.pension = []
    queryService.get('select id,name from ref_pension order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.pension = data.data
    })
    $scope.profile.form.agent = []
    queryService.get('select id,name from mst_sales_agent order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.agent = data.data
    })
    $scope.profile.form.pay_tv = [
        {id:'1',name:'Allow'},
        {id:'2',name:'Blocked'}
    ]
    $scope.profile.form.setCode = function(){
        queryService.post("select cast(lpad(seq('M','M'),8,'0') as char) as code ",undefined)
        .then(function(data){
            console.log(data)
            $scope.profile.form.gf.code = data.data[0].code
        })
    }

    //----Batas--??


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

    $scope.profile.form.getCustomer= function(){
        queryService.get('select id,concat(first_name,\' \',last_name)as name, first_name, last_name,title,date_format(birth_date,\'%Y-%m-%d\') from mst_customer where id='+$scope.profile.form.selected.customer.selected.id,undefined)
        .then(function(data){
            $scope.profile.form.gf.first_name = data.data[0].first_name
            $scope.profile.form.gf.last_name = data.data[0].last_name
            $scope.profile.form.selected.title['selected'] = {id:data.data[0].title,name:data.data[0].title}
            $scope.profile.form.gf.birth_date = data.data[0].birth_date
        })
    }
    $scope.profile.form.getRoomRate= function(){
        /*queryService.post("select a.id, a.name,b.rate_1_person,b.rate_2_person,rate_3_person,rate_4_person "+
            "from mst_room_rate a "+
            "left join mst_room_rate_line_item b on a.id = b.room_rate_id "+
            "and room_type_id="+($scope.profile.form.selected.room_type.selected?$scope.profile.form.selected.room_type.selected.id:'0')+
            " where a.id="+($scope.profile.form.selected.room_rate.selected?$scope.profile.form.selected.room_rate.selected.id:'0') ,undefined)
        .then(function(data){
            console.log(data.data)
            if(data.data.length>0){
                if ($scope.profile.form.gf.num_of_pax==1){
                    $scope.profile.form.gf.room_rate_amount = data.data[0].rate_1_person;
                }
                else if ($scope.profile.form.gf.num_of_pax==2){
                    $scope.profile.form.gf.room_rate_amount = data.data[0].rate_2_person;
                }
                else if ($scope.profile.form.gf.num_of_pax==3){
                    $scope.profile.form.gf.room_rate_amount = data.data[0].rate_3_person;
                }
                else if ($scope.profile.form.gf.num_of_pax==4){
                    $scope.profile.form.gf.room_rate_amount = data.data[0].rate_4_person;
                }
                else {
                    $scope.profile.form.gf.room_rate_amount = data.data[0].rate_1_person;
                }
            }



        })*/
    }
    $scope.profile.form.getCompanyDesc = function(){

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
        if ($scope.profile.form.gf.id.length==0){
            //exec creation

            var param = {
                code: $scope.profile.form.gf.code,
                arrival_date: $scope.profile.form.gf.arrival_date,
                departure_date: $scope.profile.form.gf.departure_date,
                num_of_nights_stay: $scope.profile.form.gf.num_of_nights_stay,
                reservation_status: ($scope.profile.form.selected.reservation_status.selected?$scope.profile.form.selected.reservation_status.selected.id:null),
                drop_date: $scope.profile.form.gf.drop_date,
                num_of_room_nights: $scope.profile.form.gf.num_of_room_nights,
                num_of_picked_up: $scope.profile.form.gf.num_of_picked_up,
                num_of_pax: $scope.profile.form.gf.num_of_pax,
                num_of_child: $scope.profile.form.gf.num_of_child,
                revenue_amount: $scope.profile.form.gf.revenue_amount,
                discount_amount: $scope.profile.form.gf.discount_amount,
                package_amount: $scope.profile.form.gf.package_amount,
                //master_folio_id: $scope.profile.form.gf.code,
                cust_name: $scope.profile.form.gf.cust_name,
                num_of_room: $scope.profile.form.gf.num_of_room,
                expected_pax: $scope.profile.form.gf.expected_pax,
                expected_child: $scope.profile.form.gf.expected_child,
                cust_company_id: ($scope.profile.form.selected.company.selected?$scope.profile.form.selected.company.selected.id:null),
                address: $scope.profile.form.gf.address,
                mice_series_id: ($scope.profile.form.selected.mice_series.selected?$scope.profile.form.selected.mice_series.selected.id:null),
                room_rate_id: ($scope.profile.form.selected.room_rate.selected?$scope.profile.form.selected.room_rate.selected.id:null),
                discount_percent: $scope.profile.form.gf.discount_percent,
                payment_type_id: ($scope.profile.form.selected.pay_by.selected?$scope.profile.form.selected.pay_by.selected.id:null),
                extra_bed_amount: $scope.profile.form.gf.extra_bed_amount,
                segment_type_id: ($scope.profile.form.selected.segment_type.selected?$scope.profile.form.selected.segment_type.selected.id:null),
                source_type_id: ($scope.profile.form.selected.source_type.selected?$scope.profile.form.selected.source_type.selected.id:null),
                origin_country_id: ($scope.profile.form.selected.origin_country.selected?$scope.profile.form.selected.origin_country.selected.id:null),
                origin_city_id: ($scope.profile.form.selected.origin_city.selected?$scope.profile.form.selected.origin_city.selected.id:null),
                //dest_country_id: ($scope.profile.form.selected.dest_country.selected?$scope.profile.form.selected.dest_country.selected.id:null),
                dest_city_id: ($scope.profile.form.selected.dest_city.selected?$scope.profile.form.selected.dest_city.selected.id:null),
                pension_id: ($scope.profile.form.selected.pension.selected?$scope.profile.form.selected.pension.selected.id:null),
                voucher_no: $scope.profile.form.gf.voucher_no,
                contact_person: $scope.profile.form.gf.contact_person,
                mobile_phone: $scope.profile.form.gf.mobile_phone,
                phone_no: $scope.profile.form.gf.phone_no,
                fax_no: $scope.profile.form.gf.fax_no,
                email: $scope.profile.form.gf.email,
                commission_per_room: $scope.profile.form.gf.commission_per_room,
                sales_agent_id: ($scope.profile.form.selected.agent.selected?$scope.profile.form.selected.agent.selected.id:null),
                is_block_member_phone: $scope.profile.form.selected.is_block_phone,
                is_lock_member_minibar: $scope.profile.form.selected.is_lock_minibar,
                is_transaction_only: $scope.profile.form.selected.is_cash_transc_only,
                pay_tv_status: ($scope.profile.form.selected.pay_tv.selected?$scope.profile.form.selected.pay_tv.selected.id:null),
                check_in_type_id: null,
                check_out_type_id: null,
                checked_out_time: null,
                checked_out_by: null,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id


            }

            console.log(param)
            //defer.resolve('Success Reservation for '+$scope.profile.form.gf.code);

            queryService.post('insert into fd_mice_reservation SET ?',param)
            .then(function (result){
                var param_remark = {
                    mice_id:result.data.insertId,
                    cashier_remarks:$scope.profile.form.gf.remarks_cashier,
                    check_in_remarks:$scope.profile.form.gf.remarks_check_in,
                }
                console.log(param_remark)

                queryService.post('insert into fd_mice_remarks SET ?',param_remark)
                .then(function (result2){
                    defer.resolve('Success Reservation for '+$scope.profile.form.gf.code);
                },
                function (err2){
                    defer.reject('Error Insert: '+err2.code);
                })
            },
            function (err){
                defer.reject('Error Insert: '+err.code);
            })

        }
        else {
            //exec update
            var param = {
                code: $scope.profile.form.gf.code,
                arrival_date: $scope.profile.form.gf.arrival_date,
                departure_date: $scope.profile.form.gf.departure_date,
                num_of_nights_stay: $scope.profile.form.gf.num_of_nights_stay,
                reservation_status: ($scope.profile.form.selected.reservation_status.selected?$scope.profile.form.selected.reservation_status.selected.id:null),
                drop_date: $scope.profile.form.gf.drop_date,
                num_of_room_nights: $scope.profile.form.gf.num_of_room_nights,
                num_of_picked_up: $scope.profile.form.gf.num_of_picked_up,
                num_of_pax: $scope.profile.form.gf.num_of_pax,
                num_of_child: $scope.profile.form.gf.num_of_child,
                revenue_amount: $scope.profile.form.gf.revenue_amount,
                discount_amount: $scope.profile.form.gf.discount_amount,
                package_amount: $scope.profile.form.gf.package_amount,
                //master_folio_id: $scope.profile.form.gf.code,
                cust_name: $scope.profile.form.gf.cust_name,
                num_of_room: $scope.profile.form.gf.num_of_room,
                expected_pax: $scope.profile.form.gf.expected_pax,
                expected_child: $scope.profile.form.gf.expected_child,
                cust_company_id: ($scope.profile.form.selected.company.selected?$scope.profile.form.selected.company.selected.id:null),
                address: $scope.profile.form.gf.address,
                mice_series_id: ($scope.profile.form.selected.mice_series.selected?$scope.profile.form.selected.mice_series.selected.id:null),
                room_rate_id: ($scope.profile.form.selected.room_rate.selected?$scope.profile.form.selected.room_rate.selected.id:null),
                discount_percent: $scope.profile.form.gf.discount_percent,
                payment_type_id: ($scope.profile.form.selected.pay_by.selected?$scope.profile.form.selected.pay_by.selected.id:null),
                extra_bed_amount: $scope.profile.form.gf.extra_bed_amount,
                segment_type_id: ($scope.profile.form.selected.segment_type.selected?$scope.profile.form.selected.segment_type.selected.id:null),
                source_type_id: ($scope.profile.form.selected.source_type.selected?$scope.profile.form.selected.source_type.selected.id:null),
                origin_country_id: ($scope.profile.form.selected.origin_country.selected?$scope.profile.form.selected.origin_country.selected.id:null),
                origin_city_id: ($scope.profile.form.selected.origin_city.selected?$scope.profile.form.selected.origin_city.selected.id:null),
                //dest_country_id: ($scope.profile.form.selected.dest_country.selected?$scope.profile.form.selected.dest_country.selected.id:null),
                dest_city_id: ($scope.profile.form.selected.dest_city.selected?$scope.profile.form.selected.dest_city.selected.id:null),
                pension_id: ($scope.profile.form.selected.pension.selected?$scope.profile.form.selected.pension.selected.id:null),
                voucher_no: $scope.profile.form.gf.voucher_no,
                contact_person: $scope.profile.form.gf.contact_person,
                mobile_phone: $scope.profile.form.gf.mobile_phone,
                phone_no: $scope.profile.form.gf.phone_no,
                fax_no: $scope.profile.form.gf.fax_no,
                email: $scope.profile.form.gf.email,
                commission_per_room: $scope.profile.form.gf.commission_per_room,
                sales_agent_id: ($scope.profile.form.selected.agent.selected?$scope.profile.form.selected.agent.selected.id:null),
                is_block_member_phone: $scope.profile.form.selected.is_block_phone,
                is_lock_member_minibar: $scope.profile.form.selected.is_lock_minibar,
                is_transaction_only: $scope.profile.form.selected.is_cash_transc_only,
                pay_tv_status: ($scope.profile.form.selected.pay_tv.selected?$scope.profile.form.selected.pay_tv.selected.id:null),
                check_in_type_id: null,
                check_out_type_id: null,
                checked_out_time: null,
                checked_out_by: null,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id


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
                    queryService.post('update fd_mice_reservation SET ? where id='+$scope.profile.form.gf.id,param)
                    .then(function (result){

                        defer.resolve('Success Update');
                        //var param_remark = [[result.data.insertId,2,$scope.gf.remarks_cashier,globalFunction.currentDate(),$localStorage.currentUser.name.id],
                        //    [result.data.insertId,1,$scope.gf.remarks_check_in,globalFunction.currentDate(),$localStorage.currentUser.name.id]]
                    },
                    function (err){
                        defer.reject('Error Insert: '+err.code);

                    })


        }
        return defer.promise;
    }

})
.controller('FoReservationBlockingCtrl',
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
        sqlrmk = ["update fd_mice_remarks set cashier_remarks='"+$scope.remark.form.gf.remarks_cashier+"', "+
            "check_in_remarks='"+$scope.remark.form.gf.remarks_check_in+"', drop_remarks='"+$scope.remark.form.gf.remarks_drop+"',"+
            "pickup_remarks='"+$scope.remark.form.gf.remarks_pickup+"' where mice_id="+$scope.profile.form.gf.id]

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
.controller('FoReservationMemberCtrl',
function($scope, $state, $sce, queryService, $q,departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.member.form.listMember = [];
    $scope.member.form.getMember = function(ids){
        queryService.post("select a.id, a.customer_id,a.num_of_pax,a.num_of_child, "+
        	"date_format(a.arrival_date,'%Y-%m-%d')arrival_date,date_format(a.departure_date,'%Y-%m-%d')departure_date, "+
        	"a.room_rate_id,a.room_rate_amount,concat(b.first_name, ' ',b.last_name) guest_name,b.first_name,b.last_name,a.room_id,c.name room_name, "+
        	"d.name room_rate_name,e.name room_type_name,c.room_type_id,a.reservation_status,w.name reservation_status_name,a.num_of_nights, "+
            "a.num_of_extra_bed extra_bed,a.discount_amount discount,a.room_rate_amount,a.segment_type_id,k.name segment_type_name, "+
            "a.payment_type_id,i.name payment_type_name,b.id_card_number id_number,a.card_no,a.card_valid_until_year,a.card_valid_until_month, "+
            "b.title,date_format(b.birth_date,'%Y-%m-%d')birth_date,a.address,a.origin_country_id,a.origin_city_id,a.dest_city_id, "+
            "u.remarks remarks_cashier,u.id remarks_cashier_id,ae.remarks remarks_check_in,ae.id remarks_check_in_id, "+
            "n.name origin_country_name,o.name origin_city_name,p.name dest_city_name "+
        "from fd_guest_folio a "+
        "left join mst_customer b on a.customer_id = b.id "+
        "left join mst_room c on a.room_id = c.id "+
        "left join mst_room_rate d on a.room_rate_id = d.id "+
        "left join ref_room_type e on c.room_type_id = e.id "+
        "left join (select value, name from table_ref where table_name = 'fd_guest_folio' "+
          "and column_name = 'reservation_status') w on a.reservation_status = w.value "+
        "left join ref_segment_type k on a.segment_type_id = k.id "+
        "left join ref_payment_method i on a.payment_type_id = i.id "+
        "left join ref_country n on a.origin_country_id = n.id "+
        "left join ref_kabupaten o on a.origin_city_id = o.id "+
        "left join ref_country p on a.dest_city_id = p.id "+
        "left join (select a.id, a.folio_id, remarks "+
        " from fd_folio_remarks a "+
        " where a.remark_type_id = 1) u on a.id = u.folio_id "+
        "left join (select a.id, a.folio_id, remarks "+
        "	from fd_folio_remarks a "+
        "    where a.remark_type_id = 2) ae on a.id = ae.folio_id "+
        " where a.mice_id="+ids,undefined)
        .then(function(data){
            $scope.member.form.listMember = [];
            $scope.member.form.listMember = data.data;
        })
    }
    $scope.member.action.updateMember = function(ids){
        console.log(ids)
        for(var i=0;i<$scope.member.form.listMember.length;i++){
            console.log(ids+'+'+$scope.member.form.listMember[i]['id'])
            if(ids==$scope.member.form.listMember[i]['id']){
                console.log('match',$scope.member.form.listMember[i])
                $scope.member.form.gf.folio_id = $scope.member.form.listMember[i].id;

                $scope.member.form.gf.arrival_date = $scope.member.form.listMember[i].arrival_date;
                $scope.member.form.gf.selected.reservation_status = {id:$scope.member.form.listMember[i].reservation_status,name:$scope.member.form.listMember[i].reservation_status_name};
                $scope.member.form.gf.num_of_nights = $scope.member.form.listMember[i].num_of_nights;
                $scope.member.form.gf.selected.room_type = {id:$scope.member.form.listMember[i].room_type_id,name:$scope.member.form.listMember[i].room_type_name};
                $scope.member.form.gf.departure_date = $scope.member.form.listMember[i].departure_date;
                $scope.member.form.gf.selected.room = {id:$scope.member.form.listMember[i].room_id,name:$scope.member.form.listMember[i].room_name};
                $scope.member.form.gf.num_of_pax= $scope.member.form.listMember[i].num_of_pax;
                $scope.member.form.gf.num_of_child = $scope.member.form.listMember[i].num_of_child;
                $scope.member.form.gf.extra_bed = $scope.member.form.listMember[i].extra_bed;
                $scope.member.form.gf.discount = $scope.member.form.listMember[i].discount;
                $scope.member.form.gf.room_rate_amount = $scope.member.form.listMember[i].room_rate_amount;
                $scope.member.form.gf.selected.segment_type = {id:$scope.member.form.listMember[i].segment_type_id,name:$scope.member.form.listMember[i].segment_type_name};
                $scope.member.form.gf.selected.paid_by= {id:$scope.member.form.listMember[i].payment_type_id,name:$scope.member.form.listMember[i].payment_type_name};
                $scope.member.form.gf.card_no = $scope.member.form.listMember[i].card_no;
                $scope.member.form.gf.valid_until = $scope.member.form.listMember[i].valid_until;
                $scope.member.form.gf.credit_limit = $scope.member.form.listMember[i].credit_limit;

                $scope.member.form.gf.customer_id = $scope.member.form.listMember[i].customer_id;
                $scope.member.form.gf.first_name = $scope.member.form.listMember[i].first_name;
                $scope.member.form.gf.last_name = $scope.member.form.listMember[i].last_name;
                $scope.member.form.gf.selected.title = {id:$scope.member.form.listMember[i].title,name:$scope.member.form.listMember[i].title}
                $scope.member.form.gf.birth_date = $scope.member.form.listMember[i].birth_date;
                $scope.member.form.gf.address = $scope.member.form.listMember[i].address;
                $scope.member.form.gf.id_number = $scope.member.form.listMember[i].id_number;
                $scope.member.form.gf.selected.country = {id:$scope.member.form.listMember[i].origin_country_id,name:$scope.member.form.listMember[i].origin_country_name};
                $scope.member.form.gf.selected.city_origin = {id:$scope.member.form.listMember[i].origin_city_id,name:$scope.member.form.listMember[i].origin_city_name};
                $scope.member.form.gf.selected.city_dest = {id:$scope.member.form.listMember[i].dest_city_id,name:$scope.member.form.listMember[i].dest_city_name};

                $scope.member.form.gf.cashier_remarks = $scope.member.form.listMember[i].remarks_cashier;
                $scope.member.form.gf.cashier_remarks_id = $scope.member.form.listMember[i].remarks_cashier_id;
                $scope.member.form.gf.check_in_remarks = $scope.member.form.listMember[i].remarks_check_in;
                $scope.member.form.gf.check_in_remarks_id = $scope.member.form.listMember[i].remarks_check_in_id;
                $scope.getCity();
            }
        }
    }

    $scope.member.form.gf = {
        arrival_date: '',
        departure_date: '',
        first_name: '',
        last_name: '',
        num_of_pax: '',
        num_of_child: '',
        num_of_room:'',
        selected: {
            room_type: {},
            country: {},
            city: {},
            segment_type: {}
        }

    }
    $scope.member.room = []
    $scope.member.action.getRoom = function(){
        queryService.post('select id,name from mst_room where room_type_id='+$scope.member.form.gf.selected.room_type.id+' and fo_status=\'V\' order by name asc',undefined)
        .then(function(data){
            console.log(data.data)
            $scope.member.room = data.data
        })
    }
    $scope.member.title = [
        {id: 'Mr',name:'Mr'},
        {id: 'Mrs',name:'Mrs'}
    ]

    $scope.member.room_type = [];
    queryService.get('select id,code,name from ref_room_type where status=1 order by id  ',undefined)
    .then(function(data){
        console.log('roomtype',data.data)
        $scope.member.room_type = data.data
    })

    $scope.member.country = [];
    queryService.get('select id,name from ref_country order by id  ',undefined)
    .then(function(data){
        $scope.member.country = data.data
    })
    $scope.member.city = [];
    $scope.getCity = function(){
        console.log($scope.member.form.gf.selected.country)
        queryService.get('select id,name from ref_kabupaten where country_id='+$scope.member.form.gf.selected.country.id+' order by id  ',undefined)
        .then(function(data){
            $scope.member.city = data.data
        })
    }
    $scope.member.action.roomAssign = function(){
        console.log('mice_id',$scope.profile.form.gf.id);
        console.log('is_allowed_dirty',$scope.member.form.gf.is_allowed_dirty)
        console.log('room_start',$scope.member.form.gf.room_start_no)
    }
    $scope.member.action.submitUm = function(){
        console.log('mice_id',$scope.profile.form.gf.id);
        var param = {
            arrival_date: $scope.member.form.gf.arrival_date,
            reservation_status: $scope.member.form.gf.selected.reservation_status.id,
            num_of_nights: $scope.member.form.gf.num_of_nights,
            room_type_id: $scope.member.form.gf.selected.room_type.id,
            departure_date: $scope.member.form.gf.departure_date,
            room_id: $scope.member.form.gf.selected.room.id,
            num_of_pax: $scope.member.form.gf.num_of_pax,
            num_of_child: $scope.member.form.gf.num_of_child,
            num_of_extra_bed: $scope.member.form.gf.extra_bed,
            discount_amount: $scope.member.form.gf.discount,
            room_rate_amount: $scope.member.form.gf.room_rate_amount,
            segment_type_id: $scope.member.form.gf.selected.segment_type.id,
            payment_type_id: $scope.member.form.gf.selected.paid_by.id,
            card_no: $scope.member.form.gf.card_no,
            //valid_until: $scope.member.form.gf.valid_until,
            origin_country_id: $scope.member.form.gf.selected.country.id,
            origin_city_id: $scope.member.form.gf.selected.city_origin.id,
            dest_city_id: $scope.member.form.gf.selected.city_dest.id,
            //credit_limit: $scope.member.form.gf.credit_limit,
            modified_by:$localStorage.currentUser.name.id,
            modified_date:globalFunction.currentDate()
        }
        var paramCust = {
            first_name: $scope.member.form.gf.first_name,
            last_name: $scope.member.form.gf.last_name,
            title: $scope.member.form.gf.selected.title.id,
            birth_date: $scope.member.form.gf.birth_date,
            //sex: $scope.member.form.gf.selected.sex.id,
            address: $scope.member.form.gf.address,
            id_card_number: $scope.member.form.gf.id_number,
            country_id: $scope.member.form.gf.selected.country.id,
            city_id: $scope.member.form.gf.selected.city_origin.id,
            modified_by:$localStorage.currentUser.name.id,
            modified_date:globalFunction.currentDate()
        }
        var paramRemarks = {
            cashier_remarks: $scope.member.form.gf.cashier_remarks,
            check_in_remarks: $scope.member.form.gf.check_in_remarks
        }
        var sqlrmk = []

        sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
            ' values('+$scope.member.form.gf.cashier_remarks_id+','+$scope.member.form.gf.folio_id+',1,\''+$scope.member.form.gf.cashier_remarks+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
            ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.member.form.gf.cashier_remarks+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
        )
        sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
            ' values('+$scope.member.form.gf.check_in_remarks_id+','+$scope.member.form.gf.folio_id+',2,\''+$scope.member.form.gf.check_in_remarks+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
            ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.member.form.gf.check_in_remarks+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
        )
        queryService.post(sqlrmk.join(';'),undefined)
        .then(function (result2){
            console.log('Success Update Remark');
        },
        function (err2){
            console.log('Error Insert: '+err2.code);
        });

        queryService.post('update mst_customer SET ? where id='+$scope.member.form.gf.customer_id,paramCust)
        .then(function (resultx){
            console.log('success customer',resultx)
        },
        function (errx){
            console.log('error customer',errx)
        })
        queryService.post('update fd_guest_folio SET ? where id='+$scope.member.form.gf.folio_id,param)
        .then(function (result){
            console.log('Success Update');
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success Update Folio',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.member.form.getMember($scope.profile.form.gf.id)
        },
        function (err){
            console.log('Error Insert: '+err.code);
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Update Folio:'+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'error'
            }).show();
        })
    }

    $scope.member.action.submit = function(){
        var defer = $q.defer();
        //exec update
        var qcommand = ''
        var param = []
        var code = Math.floor(Math.random()*90000) + 10000;
        for (var i=0;i<$scope.member.form.gf.num_of_room;i++){
            /*param.push({
                first_name: $scope.member.form.gf.first_name,
                last_name: $scope.member.form.gf.last_name,
                country_id: $scope.member.form.gf.selected.country.id,
                city_id: $scope.member.form.gf.selected.city.id
            })*/
            param.push([
                'AT-'+code.toString(),
                $scope.member.form.gf.first_name,$scope.member.form.gf.last_name,
                $scope.member.form.gf.selected.country.id,$scope.member.form.gf.selected.city.id
            ])
        }
        queryService.post('insert into mst_customer(code,first_name,last_name,country_id,city_id) VALUES ?',[param])
        .then(function (result2){
            console.log(result2)

            var param2 = "insert into fd_guest_folio(customer_id,arrival_date,departure_date,num_of_pax,num_of_child,origin_country_id,origin_city_id,segment_type_id,mice_id,room_type_id)"+
            "select id,'"+$scope.member.form.gf.arrival_date+"','"+$scope.member.form.gf.departure_date+"',"+$scope.member.form.gf.num_of_pax+","+$scope.member.form.gf.num_of_child+", "+
            " "+$scope.member.form.gf.selected.country.id+","+$scope.member.form.gf.selected.city.id+","+$scope.member.form.gf.selected.segment_type.id+
            " ,"+$scope.profile.form.gf.id+","+$scope.member.form.gf.selected.room_type.id+" "+
            "from mst_customer where code='AT-"+code+"' "
            queryService.post(param2,undefined)
            .then(function (result3){
                console.log(result3)
                $scope.member.form.getMember($scope.profile.form.gf.id);
                defer.resolve('Success Quick Fill Member Data');
            },
            function (err3){
                defer.reject('Error Insert: '+err3.code);
            })
        },
        function (err2){
            defer.reject('Error Insert: '+err2.code);
        })
        return defer.promise;
    }
})
.controller('FoReservationVenueCtrl',
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
    $scope.venue.form.gf = {
        id: ''
    }
    $scope.venue.form.selected = {
        venue: {},
        pension: {}
    }
    $scope.venue.form.venue = []
    queryService.get('select a.id,b.name from mst_venue_layout_capacity a,mst_venue b where a.venue_id=b.id',undefined)
    .then(function(data){
        $scope.venue.form.venue = data.data
    })
    $scope.venue.form.pension = []
    queryService.get('select id,name from ref_pension where status=1 order by name asc',undefined)
    .then(function(data){
        $scope.venue.form.pension = data.data
    })
    $scope.venue.form.venue_data = []
    $scope.venue.action.show = function(id){
        queryService.post("select a.id,a.code,a.mice_id,a.venue_id,a.pension_id,a.pension_in_charge,date_format(a.start_date,'%Y-%m-%d')start_date,date_format(a.end_date,'%Y-%m-%d')end_date,a.start_time,a.end_time, "+
            "a.num_of_pax,a.remarks,a.description, b.name venue_name,c.name pension_name "+
            " from fd_mice_booked_venues a "+
            "left join (select a.id,b.name from mst_venue_layout_capacity a,mst_venue b where a.venue_id=b.id) b on a.venue_id = b.id "+
            "left join ref_pension c on a.pension_id = c.id "+
            "where mice_id = "+id,undefined)
        .then(function(data){
            $scope.venue.form.venue_data = data.data
        })
    }

    $scope.venue.action.submit = function(){
        var defer = $q.defer();
        //exec update
        console.log($scope.venue.form)


        var param = {
            code:null,
            mice_id:$scope.venue.form.gf.id,
            venue_id:$scope.venue.form.selected.venue.selected.id,
            pension_id:$scope.venue.form.selected.pension.selected.id,
            pension_in_charge:$scope.venue.form.gf.pic,
            start_date:$scope.venue.form.gf.start_date,
            end_date:$scope.venue.form.gf.end_date,
            start_time:$scope.venue.form.gf.start_time,
            end_time:$scope.venue.form.gf.end_time,
            num_of_pax:$scope.venue.form.gf.num_of_pax,
            remarks:$scope.venue.form.gf.remarks,
            //description:$scope.venue.form.gf.description,
            created_date: globalFunction.currentDate(),
            created_by: $localStorage.currentUser.name.id
        }
        queryService.post('insert into fd_mice_booked_venues SET ?',param)
        .then(function (result2){
            defer.resolve('Success Insert Venue');
            $scope.venue.action.show($scope.venue.form.gf.id);

        },
        function (err2){
            defer.reject('Error Insert: '+err2.code);


        })

        defer.resolve('Success Update Venue');
        /*var sqlrmk = []
        sqlrmk = ["update fd_mice_remarks set cashier_remarks='"+$scope.remark.form.gf.remarks_cashier+"', "+
            "check_in_remarks='"+$scope.remark.form.gf.remarks_check_in+"', drop_remarks='"+$scope.remark.form.gf.remarks_drop+"',"+
            "pickup_remarks='"+$scope.remark.form.gf.remarks_pickup+"' where mice_id="+$scope.profile.form.gf.id]

        //queryService.post('update fd_folio_remarks SET ? where folio_id='+$scope.gf.id+' and remark_type_id=1;update fd_folio_remarks SET ? where folio_id='+$scope.gf.id+' and remark_type_id=2',[param_remark1,param_remark2])
        queryService.post(sqlrmk.join(';'),undefined)
        .then(function (result2){
            defer.resolve('Success Update Remark');

        },
        function (err2){
            defer.reject('Error Insert: '+err2.code);


        })*/
         return defer.promise;
    }

})
