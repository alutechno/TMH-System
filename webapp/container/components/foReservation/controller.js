
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
    $scope.deposit = {
        form: {},
        action: {}
    }
    $scope.direction = {
        form: {},
        action: {}
    }
    $scope.account = {
        form: {},
        action: {}
    }
    $scope.message = {
        form: {},
        action: {}
    }
    var qstringOri = "select a.id folio_id, a.code folio_code,concat(b.first_name, ' ',b.last_name) guest_name,b.first_name,b.last_name, a.room_type_id,d.name room_type, "+
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
      "ai.remarks remarks_pickup,ai.id remarks_pickup_id,aj.remarks remarks_room_message,aj.id remarks_room_message_id, "+
      "date_format(a.check_out_date,'%Y-%m-%d')check_out_date "+
      "from fd_guest_folio a "+
      "left join mst_customer b on a.customer_id = b.id "+
      "left join mst_cust_company c on a.cust_company_id = c.id "+
      "left join mst_room e on a.room_id = e.id "+
      "left join mst_room ee on a.prev_room_id = ee.id "+
      "left join ref_room_type d on e.room_type_id = d.id "+
      "left join ref_room_type p on ee.room_type_id = p.id "+
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
      " from fd_folio_remarks a "+
      " where a.remark_type_id = 1) u on a.id = u.folio_id "+
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
    //var qstring = qstringOri + " where a.reservation_status in('0','1','2','3') "
    var qstring = qstringOri + " where a.reservation_status in('0','1','2','3','4','5','6') "
    $scope.activeForm = 'all'
    $scope.activeClass={
        all: 'active',
        reservation: '',
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
        console.log($scope.activeForm)

        if (a=='all'){

              qstring = qstringOri
              console.log(qstring)
            $scope.profile.form.gf.folio_type = '1'
        }
        else if (a=='reservation'){

              qstring = qstringOri+ " where a.reservation_status in ('0','1','2','3') "
              console.log(qstring)
            $scope.profile.form.gf.folio_type = '1'
        }
        else if (a=='inhouse'){

              qstring = qstringOri + " where a.reservation_status = 4 "
        }
        else if (a=='checkout'){

              qstring = qstringOri + " where a.reservation_status = 5 "
        }
        else if (a=='house'){
            qstring = qstringOri + " where a.reservation_type = 'H' and a.reservation_status is null "
            /*qstring = "select a.id,a.code,a.name,a.description,a.status,b.status_name from ref_check_in a, "+
                "(select id as status_id, value as status_value,name as status_name  "+
                    "from table_ref  "+
                    "where table_name = 'ref_product_category' and column_name='status')b "+
                "where a.status = b.status_value and a.status!=2 "*/
        }
        else if (a=='canceled'){

              qstring = qstringOri + " where a.reservation_status = 6 "
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
                if (full.reservation_type=='H'){
                    html +=
                    '<button class="btn btn-default" title="Update House" ng-click="updateHouse(coas[\'' + data + '\'])">' +
                    '   <i class="fa fa-edit"></i>' +
                    '</button>&nbsp;' ;
                }
                else {
                    html +=
                    '<button class="btn btn-default" title="Update" ng-click="update(coas[\'' + data + '\'])">' +
                    '   <i class="fa fa-edit"></i>' +
                    '</button>&nbsp;' ;
                }

            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                if (full.reservation_type=='H'){
                    html +=
                    '<button class="btn btn-default" title="Delete House" ng-click="deleteHouse(coas[\'' + data + '\'])">' +
                    '   <i class="fa fa-trash-o"></i>' +
                    '</button>&nbsp;' ;
                }
                else {
                    html+='<button class="btn btn-default" title="Delete" ng-click="delete(coas[\'' + data + '\'])" )"="">' +
                    '   <i class="fa fa-trash-o"></i>' +
                    '</button>';
                }
            }
            html += '</div>'
        }
        return html
    }
    $scope.color = {
        '0': 'orange',
        '1': 'orange',
        '2': 'orange',
        '3': 'orange',
        '4': 'blue',
        '5': 'green',
        '6': 'red',
        'else': 'black'

    }
    $scope.colGuest = function(data,type,full,meta){
        return '<span style="color:'+$scope.color[full.reservation_status]+'">'+full.guest_name+'</span>' + '<br /> <small style="color:'+$scope.color[full.reservation_status]+'">Remarks:'+full.guest_check_in_remarks+'</small>'
    }
    $scope.colRoom = function(data,type,full,meta){
        return '<span style="color:'+$scope.color[full.reservation_status]+'">'+full.room_no+'</span>' + '<br /> <small style="color:'+$scope.color[full.reservation_status]+'">Type:'+full.room_type+' | Status:'+full.room_status+'</small>'
    }
    $scope.colIn = function(data,type,full,meta){
        //console.log(full)
        return '<span style="color:'+$scope.color[full.reservation_status]+'">'+full.arrival_date+'</span>' + '<br /> <small style="color:'+$scope.color[full.reservation_status]+'">Nights: '+full.num_of_nights+'</small>'
    }
    $scope.colOut = function(data,type,full,meta){
        return '<span style="color:'+$scope.color[full.reservation_status]+'">'+full.out_date+'</span>' + '<br /> <small style="color:'+$scope.color[full.reservation_status]+'">Pax: '+full.num_of_pax+' | Child:'+full.num_of_child+'</small>'
    }
    $scope.colCompany = function(data,type,full,meta){
        return '<span style="color:'+$scope.color[full.reservation_status]+'">'+full.company_name+'</span>' + '<br /> <small style="color:'+$scope.color[full.reservation_status]+'">Remarks: '+full.mice_check_in_remarks+' </small>'
    }
    $scope.colFolio = function(data,type,full,meta){
        return '<span style="color:'+$scope.color[full.reservation_status]+'">'+full.folio_code +'</span>'+ '<br /> <small style="color:'+$scope.color[full.reservation_status]+'">Status: '+full.reservation_status_name+' </small>'
    }
    $scope.colRate = function(data,type,full,meta){
        return '<span style="color:'+$scope.color[full.reservation_status]+'">'+full.room_rate_code+'</span>' + '<br /> <small style="color:'+$scope.color[full.reservation_status]+'">Charge: '+full.room_rate_amount+' </small>'
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
        DTColumnBuilder.newColumn('folio_id').withTitle('ID')
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
                if ($scope.filterVal.search.length>0) qwhereobj.text = " (lower(a.code) like '%"+$scope.filterVal.search+"%' or lower(concat(b.first_name, ' ',b.last_name)) like '%"+$scope.filterVal.search+"%' or lower(if(isnull(c.name),'Individual',c.name)) like '%"+$scope.filterVal.search+"%') ";
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
    $scope.openQuickViewHouse = function(state){
        $('#form-input-house').modal('show')
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
                    message: 'Error Add Additional Folio: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }
        else if(type=='deposit'){
            $scope.deposit.action.submit()
            .then(function(message){
                //$('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: message,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();

            },
            function(err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Add Deposit: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }

    }
    $scope.house = {
        id: '',
        code: '',
        name: '',
        check_out: '',
        selected: {
            company: {},
            currency: {},
            payment_type: {}
        },
        remarks_cashier: '',
        remarks_reception: ''
    }
    $scope.submitHouse = function(){
        console.log('submitHouse',$scope.house.id)
        if ($scope.house.id.length==0){
            //exec creation
            var date1 = new Date(globalFunction.currentDate());
            var date2 = new Date($scope.house.check_out);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            $scope.profile.form.gf.night = diffDays

            var param = {
                //code: $scope.house.code,
                folio_type: '1',
                arrival_date: globalFunction.currentDate(),
                //departure_date: globalFunction.currentDate(),
                num_of_nights: diffDays,
                num_of_stays: diffDays,
                check_out_date: $scope.house.check_out,
                //check_in_time: $scope.profile.form.gf.check_in_time,
                //check_in_limit_time: $scope.profile.form.gf.check_in_limit_time,
                //check_out_time: $scope.profile.form.gf.check_out_time,
                //actual_check_in_time: $scope.profile.form.gf.actual_check_in_time,
                //actual_check_out_time: $scope.profile.form.gf.actual_check_out_time,
                //reservation_status: ($scope.profile.form.selected.reservation_status.selected?$scope.profile.form.selected.reservation_status.selected.id:null),
                reservation_type: 'H',
                cust_company_id: ($scope.house.selected.company.selected?$scope.house.selected.company.selected.id:null),
                payment_type_id: ($scope.house.selected.payment_type.selected?$scope.house.selected.payment_type.selected.id:null),
                currency_id: ($scope.house.selected.currency.selected?$scope.house.selected.currency.selected.id:null),
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }

            console.log(param)
            var param_cust = {
                first_name: '',
                last_name: $scope.house.name,
                status: '1',
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }
            console.log(param_cust)
            queryService.post('insert into mst_customer SET ?',param_cust)
            .then(function (resultx){
                param['customer_id'] = resultx.data.insertId;
                queryService.post('insert into fd_guest_folio SET ?',param)
                .then(function (result){
                    var param_remark = [[result.data.insertId,2,$scope.house.remarks_cashier,globalFunction.currentDate(),$localStorage.currentUser.name.id],
                        [result.data.insertId,1,$scope.house.remarks_reception,globalFunction.currentDate(),$localStorage.currentUser.name.id]]
                    console.log(param_remark)

                    queryService.post('insert into fd_folio_remarks(folio_id,remark_type_id,remarks,created_date,created_by) VALUES ?',[param_remark])
                    .then(function (result2){
                        $('#form-input-house').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'House Guest Inserted',
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                        $scope.house = {
                            id: '',
                            code: '',
                            name: '',
                            check_out: '',
                            selected: {
                                company: {},
                                currency: {},
                                payment_type: {}
                            },
                            remarks_cashier: '',
                            remarks_reception: ''
                        }
                    },
                    function (err2){
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Insert: '+err2.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                },
                function (err){
                    console.log(err)
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Insert: '+err.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            },function(errx){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert Customer: '+errx.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })


        }
        else {
            //exec update
            var date1 = new Date(globalFunction.currentDate());
            var date2 = new Date($scope.house.check_out);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            $scope.profile.form.gf.night = diffDays

            var param = {
                //code: $scope.house.code,
                folio_type: '1',
                arrival_date: globalFunction.currentDate(),
                //departure_date: globalFunction.currentDate(),
                num_of_nights: diffDays,
                num_of_stays: diffDays,
                check_out_date: $scope.house.check_out,
                //check_in_time: $scope.profile.form.gf.check_in_time,
                //check_in_limit_time: $scope.profile.form.gf.check_in_limit_time,
                //check_out_time: $scope.profile.form.gf.check_out_time,
                //actual_check_in_time: $scope.profile.form.gf.actual_check_in_time,
                //actual_check_out_time: $scope.profile.form.gf.actual_check_out_time,
                //reservation_status: ($scope.profile.form.selected.reservation_status.selected?$scope.profile.form.selected.reservation_status.selected.id:null),
                reservation_type: 'H',
                cust_company_id: ($scope.house.selected.company.selected?$scope.house.selected.company.selected.id:null),
                payment_type_id: ($scope.house.selected.payment_type.selected?$scope.house.selected.payment_type.selected.id:null),
                currency_id: ($scope.house.selected.currency.selected?$scope.house.selected.currency.selected.id:null),
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }

            console.log(param)
            var param_cust = {
                //first_name: '',
                last_name: $scope.house.name,
                status: '1',
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            console.log(param_cust)
            queryService.post('update mst_customer SET ? where id='+$scope.house.customer_id,param_cust)
            .then(function (resultx){
                queryService.post('update fd_guest_folio SET ? where id='+$scope.house.id,param)
                .then(function (result){
                    sqlrmk = []
                    sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
                        ' values('+$scope.house.remarks_cashier_id+','+$scope.house.id+',1,\''+$scope.house.remarks_cashier+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
                        ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.house.remarks_cashier+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
                    )
                    sqlrmk.push('insert into fd_folio_remarks(id,folio_id,remark_type_id,remarks,created_date,created_by) '+
                        ' values('+$scope.house.remarks_reception_id+','+$scope.house.id+',2,\''+$scope.house.remarks_reception+'\',\''+globalFunction.currentDate()+'\','+$localStorage.currentUser.name.id+') '+
                        ' ON DUPLICATE KEY UPDATE remarks=\''+$scope.house.remarks_reception+'\',modified_date=\''+globalFunction.currentDate()+'\',modified_by='+$localStorage.currentUser.name.id+' '
                    )
                    console.log(sqlrmk)

                    queryService.post(sqlrmk.join(';'),undefined)
                    .then(function (result2){
                        $('#form-input-house').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'House Guest Updated',
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                        $scope.house = {
                            id: '',
                            code: '',
                            name: '',
                            check_out: '',
                            selected: {
                                company: {},
                                currency: {},
                                payment_type: {}
                            },
                            remarks_cashier: '',
                            remarks_reception: ''
                        }
                    },
                    function (err2){
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Update: '+err2.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                },
                function (err){
                    console.log(err)
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Update: '+err.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            },function(errx){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Update Customer: '+errx.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        //return defer.promise;
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


            $scope.profile.form.gf.id= result.data[0].folio_id;
            $scope.remark.form.gf.id= result.data[0].folio_id;
            $scope.additional.form.gf.id= result.data[0].folio_id;
            $scope.message.form.gf.data['id']= result.data[0].folio_id;
            $scope.message.form.gf.data['customer_id']= result.data[0].customer_id;


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
            $scope.message.action.requeryMessage();
            $scope.account.form.listAccount(result.data[0].folio_id);

            queryService.post("select id,code,cust_id,term,date_format(due_date,'%Y-%m-%d')due_date,status,deposit_amount,payment_amount,closing_amount,paid_date,created_date,created_by "+
                " from fd_guest_deposit where cust_id= "+result.data[0].customer_id,undefined)
            .then(function(data){
                if (data.data.length>0)
                $scope.deposit.form.gf = {
                    due_date: data.data[0].due_date,
                    term: data.data[0].term,
                    deposit_amount: data.data[0].deposit_amount
                }
            })
            $scope.direction.action.listAdditional()

        })
    }
    $scope.updateHouse = function(obj){
        //$scope.updateState = true;
        $('#form-input-house').modal('show');
        //$('#coa_code').prop('disabled', true);

        // console.log(obj)
        queryService.post(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)
            $scope.house.id = result.data[0].folio_id;
            $scope.house.name = result.data[0].guest_name;
            $scope.house.check_out = result.data[0].check_out_date;
            $scope.house.selected.company['selected'] = {id:result.data[0].company_id,name:result.data[0].company_name};

            $scope.house.remarks_cashier = result.data[0].remarks_cashier;
            $scope.house.remarks_cashier_id = result.data[0].remarks_cashier_id;
            $scope.house.remarks_reception = result.data[0].remarks_check_in;
            $scope.house.remarks_reception_id = result.data[0].remarks_check_in_id;
            $scope.house.selected.currency['selected'] = {id:result.data[0].currency_id,name:result.data[0].currency_name};
            $scope.house.selected.payment_type['selected'] = {id:result.data[0].payment_type_id,name:result.data[0].payment_type_name};

            $scope.house.customer_id= result.data[0].customer_id ;

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
    $scope.deleteHouse = function(obj){
        $scope.house.id = obj.id;
        queryService.post(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            console.log('deleteHouse',result)
            $scope.house.name = result.data[0].guest_name;
            $('#modalDeleteHouse').modal('show')
        })
    }
    $scope.prePosting = function(ids){
        var insTrans= "insert into fd_folio_transc_account(transc_charge,folio_id,transc_remarks,debit,credit,customer_id,transc_type_id,transc_code) "+
        "select (a.num_of_nights *a.room_rate_amount) amount,a.id folio_id,c.folio_text, "+
            "if(c.transc_type='D',(a.num_of_nights *a.room_rate_amount),0)debit,      "+
            "if(c.transc_type='C',(a.num_of_nights *a.room_rate_amount),0)credit,      "+
            "a.customer_id,c.id_detail transc_type_id, 	c.code transc_code  "+
        "from fd_guest_folio a,mst_room_rate b, 	 "+
        	"(select a.id,a.short_name, a.id id_detail,a.short_name short_name_detail,a.code,a.folio_text,a.transc_type 	 "+
            "from mst_guest_transaction_type a) c  "+
        "where a.room_rate_id = b.id   "+
        "and b.room_transc_type_id = c.id and a.id="+ids;
        queryService.post(insTrans,undefined)
        .then(function(data){
            console.log('success insert Main Rate');
            $scope.prePostingTax(ids);
            $scope.prePostingTaxSum(ids);
            $scope.prePostingExtraBed(ids);
            $scope.prePostingDiscount(ids);
            $scope.prePostingPackage(ids);
            $scope.prePostingPackageTax(ids);
            $scope.prePostingPackageTaxSum(ids);
        }, function(err){
            console.log('error insert Main Rate:'+JSON.stringify(err))
        })
    }
    $scope.prePostingTax = function(ids){
        var insTrans = "insert into fd_folio_transc_account(transc_charge,folio_id,transc_remarks,debit,credit,customer_id,transc_type_id,transc_code) "+
        "select (a.num_of_nights *a.room_rate_amount*((100+c.percentage)/100)) amount, 	"+
        	"a.id folio_id,concat(c.folio_text,'(',c.percentage,'%)') folio_text, 	"+
            "if(c.transc_type='D',(a.num_of_nights *a.room_rate_amount*((100+c.percentage)/100)),0)debit,     "+
            "if(c.transc_type='C',(a.num_of_nights *a.room_rate_amount*((100+c.percentage)/100)),0)credit,     "+
            "a.customer_id,c.id_detail transc_type_id, 	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b, 	"+
        	"(select a.id,a.short_name, d.id id_detail,d.short_name short_name_detail,d.code,d.folio_text,c.percentage,c.sequence_no,d.transc_type 	"+
            "from mst_guest_transaction_type a 	"+
            "left join mst_guest_transaction_tax b on a.tax_id = b.id 	"+
            "left join mst_transaction_tax_detail c on b.id = c.tax_id 	"+
            "left join mst_guest_transaction_type d on c.transc_type_id = d.id) c "+
        "where a.room_rate_id = b.id  "+
        "and b.room_transc_type_id = c.id and a.id= "+ids;
        queryService.post(insTrans,undefined)
        .then(function(data){
            console.log('success insert Main Rate Tax')
        }, function(err){
            console.log('error insert Main Rate Tax:'+JSON.stringify(err))
        })
    }
    $scope.prePostingTaxSum = function(ids){
        var insTrans = "insert into fd_folio_transc_account(transc_charge,folio_id,transc_remarks,debit,credit,customer_id,transc_type_id,transc_code) "+
        "select sum(amount*-1),folio_id,'Deduct Room for Tax ' folio_text,sum(debit*-1),sum(credit*-1),customer_id,fid,fcode "+
        "from (select (a.num_of_nights *a.room_rate_amount*((100+c.percentage)/100)) amount, 	"+
        	"a.id folio_id,c.short_name,c.id fid,c.code fcode, 	"+
            "if(c.transc_type='D',(a.num_of_nights *a.room_rate_amount*((100+c.percentage)/100)),0)debit,     "+
            "if(c.transc_type='C',(a.num_of_nights *a.room_rate_amount*((100+c.percentage)/100)),0)credit,     "+
            "a.customer_id,c.id_detail transc_type_id, 	c.code transc_code "+
        	"from fd_guest_folio a,mst_room_rate b, 	"+
            "(select a.id,a.short_name, d.id id_detail,d.short_name short_name_detail,a.code,d.folio_text,c.percentage,c.sequence_no,d.transc_type 	"+
        		"from mst_guest_transaction_type a 	left join mst_guest_transaction_tax b on a.tax_id = b.id 	"+
                "left join mst_transaction_tax_detail c on b.id = c.tax_id 	"+
                "left join mst_guest_transaction_type d on c.transc_type_id = d.id) c "+
                "where a.room_rate_id = b.id  and a.id= "+ids+" and b.room_transc_type_id = c.id)a "+
        	"group by folio_id,short_name,customer_id,fid,fcode "
        queryService.post(insTrans,undefined)
        .then(function(data){
            console.log('success insert Main Rate Tax Sum')
        }, function(err){
            console.log('error insert Main Rate Tax Sum:'+JSON.stringify(err))
        })
    }
    $scope.prePostingExtraBed = function(ids){
        var insTrans = "insert into fd_folio_transc_account(transc_charge,folio_id,transc_remarks,debit,credit,customer_id,transc_type_id,transc_code) "+
        "select (a.num_of_extra_bed * a.extra_bed_charge_amount) amount,a.id folio_id,c.folio_text , 	"+
        	"if(c.transc_type='D',(a.num_of_extra_bed * a.extra_bed_charge_amount),0)debit,     "+
            "if(c.transc_type='C',(a.num_of_extra_bed * a.extra_bed_charge_amount),0)credit,     "+
            "a.customer_id,c.id transc_type_id, 	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b,mst_guest_transaction_type c "+
        "where a.room_rate_id = b.id  and b.ext_bed_transc_type_id = c.id and a.id="+ids;
        queryService.post(insTrans,undefined)
        .then(function(data){
            console.log('success insert Extra Bed')
        }, function(err){
            console.log('error insert Extra Bed:'+JSON.stringify(err))
        })
    }
    $scope.prePostingDiscount = function(ids){
        var insTrans = "insert into fd_folio_transc_account(transc_charge,folio_id,transc_remarks,debit,credit,customer_id,transc_type_id,transc_code) "+
        "select (a.num_of_nights* if(a.discount_percent>0,(a.discount_percent/100*a.room_rate_amount),(a.room_rate_amount-a.discount_amount))) amount,a.id folio_id,c.folio_text , 	"+
        	"if(c.transc_type='D',-1*(a.num_of_nights* if(a.discount_percent>0,(a.discount_percent/100*a.room_rate_amount),(a.room_rate_amount-a.discount_amount))),0)debit,     "+
            "if(c.transc_type='C',(a.num_of_nights* if(a.discount_percent>0,(a.discount_percent/100*a.room_rate_amount),(a.room_rate_amount-a.discount_amount))),0)credit,     "+
            "a.customer_id,c.id transc_type_id, 	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b,mst_guest_transaction_type c "+
        "where a.room_rate_id = b.id  and b.disc_transc_type_id = c.id and a.id="+ids;
        queryService.post(insTrans,undefined)
        .then(function(data){
            console.log('success insert Discount')
        }, function(err){
            console.log('error insert Discount:'+JSON.stringify(err))
        })
    }
    $scope.prePostingPackage = function(ids){
        var insTrans = "insert into fd_folio_transc_account(transc_charge,folio_id,transc_remarks,debit,credit,customer_id,transc_type_id,transc_code) "+
        "select (a.num_of_nights * e.flat_rate) amount,a.id folio_id,c.folio_text, 	"+
        	"if(c.transc_type='D',(a.num_of_nights * e.flat_rate),0)debit,     "+
            "if(c.transc_type='C',(a.num_of_nights * e.flat_rate),0)credit,     "+
            "a.customer_id,c.id transc_type_id, 	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b,mst_guest_transaction_type c, mst_room_rate_package d,mst_package e "+
        "where a.room_rate_id = b.id  and e.transc_type_id = c.id and d.package_id = e.id and b.id = d.room_rate_id and a.id="+ids;
        queryService.post(insTrans,undefined)
        .then(function(data){
            console.log('success insert Package')
        }, function(err){
            console.log('error insert Package:'+JSON.stringify(err))
        })
    }
    $scope.prePostingPackageTax = function(ids){
        var insTrans = "insert into fd_folio_transc_account(transc_charge,folio_id,transc_remarks,debit,credit,customer_id,transc_type_id,transc_code) "+
        "select (a.num_of_nights * e.flat_rate*((100+c.percentage)/100)) amount, 	"+
        	"a.id folio_id,concat(c.folio_text,'(',c.percentage,'%)') folio_text, 	"+
            "if(c.transc_type='D',(a.num_of_nights *e.flat_rate*((100+c.percentage)/100)),0)debit,     "+
            "if(c.transc_type='C',(a.num_of_nights *e.flat_rate*((100+c.percentage)/100)),0)credit,     "+
            "a.customer_id,c.id_detail transc_type_id, 	"+
            "c.code transc_code from fd_guest_folio a,mst_room_rate b, 	"+
            "(select a.id,a.short_name, d.id id_detail,d.short_name short_name_detail,d.code,d.folio_text,c.percentage,c.sequence_no,d.transc_type 	"+
        		"from mst_guest_transaction_type a 	"+
                "left join mst_guest_transaction_tax b on a.tax_id = b.id 	"+
                "left join mst_transaction_tax_detail c on b.id = c.tax_id 	"+
                "left join mst_guest_transaction_type d on c.transc_type_id = d.id) c, mst_room_rate_package d,mst_package e "+
        	"where a.room_rate_id = b.id  and e.transc_type_id = c.id and d.package_id = e.id and b.id = d.room_rate_id and a.id="+ids;
        queryService.post(insTrans,undefined)
        .then(function(data){
            console.log('success insert Package Tax')
        }, function(err){
            console.log('error insert Package Tax:'+JSON.stringify(err))
        })
    }
    $scope.prePostingPackageTaxSum = function(ids){
        var insTrans = "insert into fd_folio_transc_account(transc_charge,folio_id,transc_remarks,debit,credit,customer_id,transc_type_id,transc_code) "+
        "select sum(a.num_of_nights * e.flat_rate*((100+c.percentage)/100)) amount,a.id folio_id,c.short_name folio_text, 	"+
        	"sum(if(c.transc_type='D',(a.num_of_nights *e.flat_rate*((100+c.percentage)/100)),0))debit,     "+
            "sum(if(c.transc_type='C',(a.num_of_nights *e.flat_rate*((100+c.percentage)/100)),0))credit,     "+
            "a.customer_id,c.id transc_type_id, 	c.code transc_code from fd_guest_folio a,mst_room_rate b, 	"+
            "(select a.id,a.short_name, d.id id_detail,d.short_name short_name_detail,a.code,d.folio_text,c.percentage,c.sequence_no,d.transc_type 	"+
            "from mst_guest_transaction_type a 	left join mst_guest_transaction_tax b on a.tax_id = b.id 	"+
            "left join mst_transaction_tax_detail c on b.id = c.tax_id 	"+
            "left join mst_guest_transaction_type d on c.transc_type_id = d.id) c, mst_room_rate_package d,mst_package e "+
        "where a.room_rate_id = b.id  "+
        "and e.transc_type_id = c.id "+
        "and d.package_id = e.id "+
        "and b.id = d.room_rate_id and a.id="+ids+" "+
        "group by a.id,c.short_name,c.id,a.customer_id";
        queryService.post(insTrans,undefined)
        .then(function(data){
            console.log('success insert Package Tax Sum')
        }, function(err){
            console.log('error insert Package Tax Sum:'+JSON.stringify(err))
        })
    }
    $scope.buildTrans = function(ids){
        var insTrans = "insert into fd_folio_transc_account(transc_charge,folio_id,transc_remarks,debit,credit,customer_id,transc_type_id,transc_code) "+
        "select (a.num_of_stays *a.room_rate_amount*(c.percentage/100)) amount, "+
        "	a.id folio_id,concat(c.folio_text,'(',c.percentage,'%)') folio_text, "+
        "	if(c.transc_type='D',(a.num_of_stays *a.room_rate_amount*(c.percentage/100)),0)debit, "+
        "    if(c.transc_type='C',(a.num_of_stays *a.room_rate_amount*(c.percentage/100)),0)credit, "+
        "    a.customer_id,c.id_detail transc_type_id, "+
        "	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b, "+
        "	(select a.id,a.short_name, d.id id_detail,d.short_name short_name_detail,d.code,d.folio_text,c.percentage,c.sequence_no,d.transc_type "+
        "	from mst_guest_transaction_type a "+
        "	left join mst_guest_transaction_tax b on a.tax_id = b.id "+
        "	left join mst_transaction_tax_detail c on b.id = c.tax_id "+
        "	left join mst_guest_transaction_type d on c.transc_type_id = d.id) c "+
        "where a.room_rate_id = b.id  "+
        "and b.room_transc_type_id = c.id "+
        "and a.id= "+ids+
        " union "+
        "select sum(amount*-1),folio_id,'Deduct Room for Tax ' folio_text,sum(debit*-1),sum(credit*-1),customer_id,fid,fcode "+
        "from (select (a.num_of_stays *a.room_rate_amount*(c.percentage/100)) amount, "+
        "	a.id folio_id,c.short_name,c.id fid,c.code fcode, "+
        "	if(c.transc_type='D',(a.num_of_stays *a.room_rate_amount*(c.percentage/100)),0)debit, "+
        "    if(c.transc_type='C',(a.num_of_stays *a.room_rate_amount*(c.percentage/100)),0)credit, "+
        "    a.customer_id,c.id_detail transc_type_id, "+
        "	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b, "+
        "	(select a.id,a.short_name, d.id id_detail,d.short_name short_name_detail,a.code,d.folio_text,c.percentage,c.sequence_no,d.transc_type "+
        "	from mst_guest_transaction_type a "+
        "	left join mst_guest_transaction_tax b on a.tax_id = b.id "+
        "	left join mst_transaction_tax_detail c on b.id = c.tax_id "+
        "	left join mst_guest_transaction_type d on c.transc_type_id = d.id) c "+
        "where a.room_rate_id = b.id  "+
        "and a.id= "+ids+
        " and b.room_transc_type_id = c.id)a "+
        "group by folio_id,short_name,customer_id,fid,fcode "+
        "union "+
        "select (a.num_of_extra_bed * a.extra_bed_charge_amount) amount,a.id folio_id,c.folio_text , "+
        "	if(c.transc_type='D',(a.num_of_extra_bed * a.extra_bed_charge_amount),0)debit, "+
        "    if(c.transc_type='C',(a.num_of_extra_bed * a.extra_bed_charge_amount),0)credit, "+
        "    a.customer_id,c.id transc_type_id, "+
        "	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b,mst_guest_transaction_type c "+
        "where a.room_rate_id = b.id  "+
        "and b.ext_bed_transc_type_id = c.id "+
        "and a.id="+ids+
        " union "+
        "select (a.num_of_stays* if(a.discount_percent>0,(a.discount_percent/100*a.room_rate_amount),(a.room_rate_amount-a.discount_amount))) amount,a.id folio_id,c.folio_text , "+
        "	if(c.transc_type='D',-1*(a.num_of_stays* if(a.discount_percent>0,(a.discount_percent/100*a.room_rate_amount),(a.room_rate_amount-a.discount_amount))),0)debit, "+
        "    if(c.transc_type='C',(a.num_of_stays* if(a.discount_percent>0,(a.discount_percent/100*a.room_rate_amount),(a.room_rate_amount-a.discount_amount))),0)credit, "+
        "    a.customer_id,c.id transc_type_id, "+
        "	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b,mst_guest_transaction_type c "+
        "where a.room_rate_id = b.id  "+
        "and b.disc_transc_type_id = c.id "+
        "and a.id="+ids+
        " union  "+
        "select (a.num_of_stays * e.flat_rate) amount,a.id folio_id,c.folio_text, "+
        "	if(c.transc_type='D',(a.num_of_stays * e.flat_rate),0)debit, "+
        "    if(c.transc_type='C',(a.num_of_stays * e.flat_rate),0)credit, "+
        "    a.customer_id,c.id transc_type_id, "+
        "	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b,mst_guest_transaction_type c, mst_room_rate_package d,mst_package e "+
        "where a.room_rate_id = b.id  "+
        "and e.transc_type_id = c.id "+
        "and d.package_id = e.id "+
        "and b.id = d.room_rate_id "+
        "and a.id="+ids+
        " union "+
        "select (a.num_of_stays * e.flat_rate*(c.percentage/100)) amount, "+
        "	a.id folio_id,concat(c.folio_text,'(',c.percentage,'%)') folio_text, "+
        "	if(c.transc_type='D',(a.num_of_stays *e.flat_rate*(c.percentage/100)),0)debit, "+
        "    if(c.transc_type='C',(a.num_of_stays *e.flat_rate*(c.percentage/100)),0)credit, "+
        "    a.customer_id,c.id_detail transc_type_id, "+
        "	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b, "+
        "	(select a.id,a.short_name, d.id id_detail,d.short_name short_name_detail,d.code,d.folio_text,c.percentage,c.sequence_no,d.transc_type "+
        "	from mst_guest_transaction_type a "+
        "	left join mst_guest_transaction_tax b on a.tax_id = b.id "+
        "	left join mst_transaction_tax_detail c on b.id = c.tax_id "+
        "	left join mst_guest_transaction_type d on c.transc_type_id = d.id) c, mst_room_rate_package d,mst_package e "+
        "where a.room_rate_id = b.id  "+
        "and e.transc_type_id = c.id "+
        "and d.package_id = e.id "+
        "and b.id = d.room_rate_id "+
        "and a.id="+ids+
        " union "+
        "select sum(a.num_of_stays * e.flat_rate*(c.percentage/100)) amount,a.id folio_id,c.short_name folio_text, "+
        "	sum(if(c.transc_type='D',(a.num_of_stays *e.flat_rate*(c.percentage/100)),0))debit, "+
        "    sum(if(c.transc_type='C',(a.num_of_stays *e.flat_rate*(c.percentage/100)),0))credit, "+
        "    a.customer_id,c.id transc_type_id, "+
        "	c.code transc_code "+
        "from fd_guest_folio a,mst_room_rate b, "+
        "	(select a.id,a.short_name, d.id id_detail,d.short_name short_name_detail,a.code,d.folio_text,c.percentage,c.sequence_no,d.transc_type "+
        "	from mst_guest_transaction_type a "+
        "	left join mst_guest_transaction_tax b on a.tax_id = b.id "+
        "	left join mst_transaction_tax_detail c on b.id = c.tax_id "+
        "	left join mst_guest_transaction_type d on c.transc_type_id = d.id) c, mst_room_rate_package d,mst_package e "+
        "where a.room_rate_id = b.id  "+
        "and e.transc_type_id = c.id "+
        "and d.package_id = e.id "+
        "and b.id = d.room_rate_id "+
        "and a.id="+ids+
        " group by a.id,c.short_name,c.id,a.customer_id" ;

console.log('buildTrans',insTrans)
        queryService.post(insTrans,undefined)
        .then(function(data){
            console.log('success insert')
        }, function(err){
            console.log('error insert:'+JSON.stringify(err))
        })

    }
    $scope.execCheckIn = function(){
        queryService.post('update fd_guest_folio SET reservation_status=\'4\', '+
        ' check_in_by='+$localStorage.currentUser.name.id+', ' +
        ' check_in_date=\''+globalFunction.currentDate()+'\', ' +
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.profile.form.gf.id ,undefined)
        .then(function (result){
            console.log(result)
            if (result.status = "200"){
                //$scope.buildTrans($scope.profile.form.gf.id);
                $scope.prePosting($scope.profile.form.gf.id);
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
        queryService.post('update fd_guest_folio SET reservation_status=\'5\', '+
        ' check_out_by='+$localStorage.currentUser.name.id+', ' +
        ' check_out_date=\''+globalFunction.currentDate()+'\', ' +
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
        queryService.post('update fd_guest_folio SET reservation_status=\'6\', '+
        ' cancel_by='+$localStorage.currentUser.name.id+', ' +
        ' cancel_date=\''+globalFunction.currentDate()+'\', ' +
        ' cancellation_remarks=\''+$scope.profile.form.gf.cancellation_remarks+'\', ' +
        ' cancellation_type_id='+$scope.profile.form.selected.cancellation_type.selected.id+', ' +
        ' cancellation_date=\''+globalFunction.currentDate()+'\', ' +
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
    $scope.execDeleteHouse = function(){
        queryService.post('update fd_guest_folio SET reservation_status=\'99\', '+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.house.id ,undefined)
        .then(function (result){
            if (result.status = "200"){
                console.log('Success Delete')
                $('#form-input-house').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.house.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.house = {
                    id: '',
                    code: '',
                    name: '',
                    check_out: '',
                    selected: {
                        company: {},
                        currency: {},
                        payment_type: {}
                    },
                    remarks_cashier: '',
                    remarks_reception: ''
                }
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
        check_out_type: {},
        cancellation_type: {}
    }
    $scope.profile.form.cancellation_type = []
    queryService.get('select id,name from ref_cancellation_type where status=1 order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.cancellation_type = data.data
        $scope.profile.form.selected.cancellation_type['selected'] = $scope.profile.form.cancellation_type[0]
    })
    $scope.profile.form.reservation_status = []
    queryService.get('select value as id,name from table_ref where table_name = \'fd_guest_folio\' and column_name=\'reservation_status\' and value in(0,1,2,3) order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.reservation_status = data.data
        $scope.profile.form.selected.reservation_status.selected = data.data[0]
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
    queryService.get('select id,name from ref_room_type where status=1 order by name asc',undefined)
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
    queryService.get('select id,name from ref_building_feature where status=1 order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.room_feature = data.data
    })

    $scope.profile.form.customer = []
    queryService.get('select id,concat(first_name,\' \',last_name)as name from mst_customer where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.customer = data.data
    })

    $scope.profile.form.title = [
        {id: 'Mr',name:'Mr'},
        {id: 'Mrs',name:'Mrs'}
    ]

    $scope.profile.form.vip_type = []
    queryService.get('select id,name from ref_vip_type where status=1 order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.vip_type = data.data
    })

    $scope.profile.form.company = []
    queryService.get('select id,name from mst_cust_company where status=1 order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.company = data.data
    })

    $scope.profile.form.room_rate = []
    queryService.get("select id,code as name from mst_room_rate where status=1 and '"+globalFunction.currentDate()+"' between valid_date_from and valid_date_until order by name asc",undefined)
    .then(function(data){
        $scope.profile.form.room_rate = data.data
    })

    $scope.profile.form.yesno = [{id:'Y',name:'Yes'},{id:'N',name:'No'}]
    $scope.profile.form.selected.late_co['selected'] = $scope.profile.form.yesno[1]
    $scope.profile.form.selected.is_room_only['selected'] = $scope.profile.form.yesno[1]
    $scope.profile.form.selected.is_comp_extra_bed['selected'] = $scope.profile.form.yesno[1]
    $scope.profile.form.selected.is_honeymoon['selected'] = $scope.profile.form.yesno[1]

    $scope.profile.form.agent = []
    queryService.get('select id,name from mst_sales_agent where status=1 order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.agent = data.data
    })

    $scope.profile.form.payment_type = []
    queryService.get('select id,name from ref_payment_method where status=1 order by name asc',undefined)
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
    queryService.get('select id,name from ref_segment_type where status=1 order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.segment_type = data.data
    })

    $scope.profile.form.source_type = []
    queryService.get('select id,name from ref_source_type where status=1 order by name asc',undefined)
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
    queryService.get('select id,name from ref_check_in where status=1 order by name asc',undefined)
    .then(function(data){
        $scope.profile.form.check_in_type = data.data
    })

    $scope.profile.form.check_out_type = []
    queryService.get('select id,name from ref_check_out where status=1 order by name asc',undefined)
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
        queryService.post("select a.id, a.name,b.rate_1_person,b.rate_2_person,rate_3_person,rate_4_person "+
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



        })
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
                        defer.resolve('Success Update');
                        //var param_remark = [[result.data.insertId,2,$scope.gf.remarks_cashier,globalFunction.currentDate(),$localStorage.currentUser.name.id],
                        //    [result.data.insertId,1,$scope.gf.remarks_check_in,globalFunction.currentDate(),$localStorage.currentUser.name.id]]
                    },
                    function (err){
                        defer.reject('Error Insert: '+err.code);

                    })
                },
                function (errx){
                    console.log('error customer',errx)
                    defer.reject('Error Insert: '+err.code);
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
.controller('FoReservationDepositCtrl',
function($scope, $state, $sce, queryService, $q,departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.deposit.form.gf = {
        folio_id: '',
        selected: {
            payment_type:{},
            currency: {}
        },
        due_date: '',
        remark: '',
        deposit_amount: ''
    }
    $scope.deposit.action.submit = function(){
        var defer = $q.defer();
        //exec update
        var qcommand = ''
        var param = {}
        queryService.get('select count(1) cnt from fd_guest_deposit where cust_id=  '+$scope.profile.form.gf.customer_id,undefined)
        .then(function(data){
            if (data.data[0].cnt>0){
                //update
                qcommand = 'update fd_guest_deposit set ? where cust_id='+$scope.profile.form.gf.customer_id
                param = {
                    term: $scope.deposit.form.gf.term,
                    due_date: $scope.deposit.form.gf.due_date,
                    deposit_amount: $scope.deposit.form.gf.deposit_amount,
                    modified_date: globalFunction.currentDate(),
                    modified_by: $localStorage.currentUser.name.id

                }
            }
            else {
                //insert
                qcommand = 'insert into fd_guest_deposit set ?'
                param = {
                    cust_id:$scope.profile.form.gf.customer_id,
                    term: $scope.deposit.form.gf.term,
                    due_date: $scope.deposit.form.gf.due_date,
                    deposit_amount: $scope.deposit.form.gf.deposit_amount,
                    created_date: globalFunction.currentDate(),
                    created_by: $localStorage.currentUser.name.id
                }
            }
            console.log('deposit',data)
            queryService.post(qcommand,param)
            .then(function (result2){
                defer.resolve('Success Update Deposit Data');
            },
            function (err2){
                defer.reject('Error Insert: '+err2.code);
            })
        })
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
    $scope.direction.listAdditional = [];
    $scope.direction.listTrans = [];
    $scope.direction.stat = null;
    $scope.direction.action.listAdditional = function(){
        queryService.post("select a.id,a.included_folio_id,concat(c.first_name,' ',c.last_name) customer_name,if(b.folio_type=0,'A','M') stat,if(b.folio_type=0,'Additional','Master') share, "+
        	" '' status,'' balance, "+
        	" date_format(b.check_in_date,'%Y-%m-%d')check_in_date,date_format(b.check_out_date,'%Y-%m-%d')check_out_date "+
        " from fd_included_folio a,fd_guest_folio b,mst_customer c "+
        " where a.included_folio_id = b.id "+
        " and b.customer_id = c.id "+
        " and a.folio_id = "+$scope.profile.form.gf.id,undefined)
        .then(function (result){
            $scope.direction.listAdditional = result.data;
        },
        function (err){
            console.log('errorListing',err)
        })
    }
    $scope.direction.action.listTrans = function(id){
        queryService.post("select a.id,a.transc_type_id,c.code trans_code,c.short_name trans_name,d.name class_name "+
            "from fd_folio_directed_transaction a, fd_guest_folio b, mst_guest_transaction_type c, ref_guest_transaction_class d "+
            "where a.folio_id = b.id "+
            "and a.transc_type_id = c.id "+
            "and c.transc_class_id = d.id and a.folio_id="+id,undefined)
        .then(function (result){
            $scope.direction.listTrans = result.data;
        },
        function (err){
            console.log('errorListing',err)
        })

    }
    $scope.direction.action.showDetail = function(obj){
        console.log(obj)
        $scope.direction.stat = 'update';
        $scope.direction.form.gf.included_folio_id = obj.included_folio_id;
        $scope.direction.action.listTrans($scope.direction.form.gf.included_folio_id);
    }
    $scope.direction.action.addCategory =function(){
        console.log($scope.direction.form.gf.selected.trans_type)
        var param = {
            folio_id:$scope.direction.form.gf.included_folio_id,
            transc_type_id:$scope.direction.form.gf.selected.trans_type.id,
            created_date: globalFunction.currentDate(),
            created_by: $localStorage.currentUser.name.id
        }
        queryService.post("insert into fd_folio_directed_transaction SET ?",param)
        .then(function (result){
            $scope.direction.action.listTrans($scope.direction.form.gf.included_folio_id);
        },
        function (err){
            console.log('errorListing',err)
        })
    }
    $scope.direction.action.deleteCategory =function(id){
        queryService.post("delete from fd_folio_directed_transaction where id="+id,undefined)
        .then(function (result){
            $scope.direction.action.listTrans($scope.direction.form.gf.included_folio_id);
        },
        function (err){
            console.log('errorListing',err)
        })
    }
    $scope.direction.action.addAdditional = function(){
        //insert ke fd_guest_folio type 0
        //insert ke fd_included_folio hasil insert ke fd_guest_folio
        var param = {
            folio_type: 0,
            customer_id: $scope.profile.form.gf.customer_id,
            arrival_date: $scope.profile.form.gf.arrival_date,
            created_date: globalFunction.currentDate(),
            created_by: $localStorage.currentUser.name.id
        }
        queryService.post('insert into fd_guest_folio SET ?',param)
        .then(function (result){
            console.log('success',result.data.insertId)
            var param2 = {
                folio_id:$scope.profile.form.gf.id,
                included_folio_id:result.data.insertId,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }
            queryService.post('insert into fd_included_folio SET ?',param2)
            .then(function (result2){
                console.log('success2',result2.data.insertId)
                $scope.direction.action.listAdditional()
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Success Add Additional Folio',
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();

            },
            function (err2){
                console.log('error2',err2);
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Add Additional Folio:'+err2.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'error'
                }).show();
            })
        },
        function (err){
            console.log('error',err);
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Add Additional Folio:'+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'error'
            }).show();
        })
    }
    $scope.direction.form.gf = {
        folio_id: '',
        included_folio_id: '',
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
        is_door_double_lock: '0',
        selected:{trans_type:{}}

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
.controller('FoReservationAccountCtrl',
function($scope, $window, $state, $sce, queryService, $q,departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    /*NOTE:
    KODE transc_source_id:
        - 1-9 folio
        - 10 charge posting
        - 11 credit posting
        - 12 City Ledger
    */

    $scope.account.form.account = []
    $scope.account.form.listAccount = function(vid){
        queryService.post("select a.id,a.customer_id,a.folio_id,date_format(a.transc_date,'%Y-%m-%d')transc_date,a.transc_type_id,a.transc_remarks,a.transc_charge,a.transc_code,a.package_id, "+
            "a.debit,a.credit,c.first_name,c.last_name,concat(c.first_name,' ',c.last_name) guest_name,d.short_name transc_type_name, "+
            "a.transc_source_id,a.transc_remarks,a.transc_ref,e.name package_name "+
        "from fd_folio_transc_account a "+
        "left join fd_guest_folio b on a.folio_id = b.id "+
        "left join mst_customer c on a.customer_id = c.id "+
        "left join mst_guest_transaction_type d on a.transc_type_id = d.id "+
        "left join mst_package e on a.package_id = e.id where a.folio_id="+vid,undefined)
        .then(function(data){
            $scope.account.form.account = data.data
        })
    }



    $scope.account.form.gf = {
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
    $scope.account.charge = {
        id:'',
        selected: {
            category: {}
        },
        charge: '',
        remark: '',
        reference: ''
    }
    $scope.account.credit = {
        id:'',
        selected: {
            category: {}
        },
        charge: '',
        remark: '',
        reference: ''
    }
    $scope.account.cl = {
        id:'',
        selected: {
            category: {}
        },
        charge: '',
        remark: '',
        reference: ''
    }
    $scope.account.form.selected = {
        newspaper: {},
        pay_tv: {},
        internet_code: {}
    }
    $scope.account.form.internetCode = [
        {id:'1',name: 'Blocked'},
        {id:'2',name: 'Pre Paid'},
        {id:'3',name: 'Post Paid'}
    ]

    $scope.account.form.newspaper = []
    queryService.get('select id,code,name from mst_newspaper where status!=2 order by id  ',undefined)
    .then(function(data){
        $scope.additional.form.newspaper = data.data
    })
    $scope.account.form.payment_method = []
    queryService.get('select id,name from ref_payment_method where status=1 order by id  ',undefined)
    .then(function(data){
        $scope.account.form.payment_method = data.data
    })
    $scope.account.form.trans_type = []
    queryService.get('select a.id,a.short_name name,a.code,b.name class_name from mst_guest_transaction_type a,ref_guest_transaction_class b where a.transc_class_id=b.id and a.status=1 order by id  ',undefined)
    .then(function(data){
        $scope.account.form.trans_type = data.data
    })
    $scope.account.form.trans_type_payment = []
    queryService.get('select a.id,a.short_name name,a.code from mst_guest_transaction_type a,ref_payment_method b where a.id=b.transc_type_id and a.status=1 order by a.id  ',undefined)
    .then(function(data){
        $scope.account.form.trans_type_payment = data.data
    })
    $scope.account.action.showDetail = function(data){
        console.log(data)
        console.log($scope.profile.form.gf)
        //$scope.account.stat = 'detail'
        if (data.transc_source_id=='10'){
            console.log('chargeposting')
            $scope.account.stat='chargeposting';
            $scope.account.statInsert = false;
            $scope.account.charge = {
                id:data.id,
                selected: {
                    category: {id:data.transc_type_id,name:data.transc_type_name,code:data.transc_code}
                },
                charge: data.transc_charge,
                remark: data.transc_remarks,
                reference: data.transc_ref
            }
        }
        else if (data.transc_source_id=='11'){
            console.log('creditposting')
            $scope.account.stat='creditposting';
            $scope.account.statInsert = false;
            $scope.account.credit = {
                id:data.id,
                selected: {
                    category: {id:data.transc_type_id,name:data.transc_type_name,code:data.transc_code}
                },
                charge: data.transc_charge,
                remark: data.transc_remarks,
                reference: data.transc_ref
            }
        }
        else {
            $scope.account.stat = 'detail'
        }
        var element = $window.document.getElementById('test');
        if(element)
          element.focus();
    }

    $scope.account.statInsert = true;

    $scope.account.action.submitCharge = function(){
        var param = {
            customer_id:$scope.profile.form.gf.customer_id,
            folio_id:$scope.profile.form.gf.id,
            transc_date: globalFunction.currentDate(),
            transc_type_id:$scope.account.charge.selected.category?$scope.account.charge.selected.category.id:null,
            transc_remarks:$scope.account.charge.remark,
            transc_charge:$scope.account.charge.charge,
            transc_ref:$scope.account.charge.reference,
            transc_source_id:11,
            debit:$scope.account.charge.charge,
            transc_code:$scope.account.charge.selected.category?$scope.account.charge.selected.category.code:null,
            credit:0
        }
        var sql = '';
        if ($scope.account.statInsert == true){
            param['created_date'] = globalFunction.currentDate();
            param['created_by'] = $localStorage.currentUser.name.id;
            sql = 'insert into fd_folio_transc_account SET ?'
        }
        else {
            param['modified_date'] = globalFunction.currentDate();
            param['modified_by'] = $localStorage.currentUser.name.id;
            sql = 'update fd_folio_transc_account SET ? where id='+$scope.account.charge.id
        }
        queryService.post(sql,param)
        .then(function (result){
            $scope.account.form.listAccount($scope.profile.form.gf.id)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success add Charge ',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.account.action.cancelCharge();
        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Add Charge: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

    }
    $scope.account.action.cancelCharge = function(){
        $scope.account.statInsert = true
        $scope.account.charge = {
            id:'',
            selected: {
                category: {}
            },
            charge: '',
            remark: '',
            reference: ''
        }
    }
    $scope.account.action.removeCharge = function(){
        queryService.post('delete from fd_folio_transc_account where id='+$scope.account.charge.id,undefined)
        .then(function (result){
            $scope.account.form.listAccount($scope.profile.form.gf.id)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success Remove Charge ',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.account.action.cancelCharge();
        },
        function (err){
            console.log(err)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Remove Charge: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }
    $scope.account.action.submitCredit = function(){
        var param = {
            customer_id:$scope.profile.form.gf.customer_id,
            folio_id:$scope.profile.form.gf.id,
            transc_date: globalFunction.currentDate(),
            transc_type_id:$scope.account.credit.selected.category?$scope.account.credit.selected.category.id:null,
            transc_remarks:$scope.account.credit.remark,
            transc_charge:$scope.account.credit.charge,
            transc_ref:$scope.account.credit.reference,
            transc_source_id:10,
            credit:$scope.account.credit.charge,
            transc_code:$scope.account.credit.selected.category?$scope.account.credit.selected.category.code:null,
            debit:0
        }
        var sql = '';
        if ($scope.account.statInsert == true){
            param['created_date'] = globalFunction.currentDate();
            param['created_by'] = $localStorage.currentUser.name.id;
            sql = 'insert into fd_folio_transc_account SET ?'
        }
        else {
            param['modified_date'] = globalFunction.currentDate();
            param['modified_by'] = $localStorage.currentUser.name.id;
            sql = 'update fd_folio_transc_account SET ? where id='+$scope.account.charge.id
        }
        queryService.post(sql,param)
        .then(function (result){
            $scope.account.form.listAccount($scope.profile.form.gf.id)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success add Credit ',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.account.action.cancelCredit();
        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Add Credit: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

    }
    $scope.account.action.cancelCredit = function(){
        $scope.account.statInsert = true
        $scope.account.credit = {
            id:'',
            selected: {
                category: {}
            },
            charge: '',
            remark: '',
            reference: ''
        }
    }
    $scope.account.action.removeCredit = function(){
        queryService.post('delete from fd_folio_transc_account where id='+$scope.account.credit.id,undefined)
        .then(function (result){
            $scope.account.form.listAccount($scope.profile.form.gf.id)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success Remove Charge ',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.account.action.cancelCharge();
        },
        function (err){
            console.log(err)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Remove Charge: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

    }
    $scope.account.action.submitCl = function(){
        var param = {
            customer_id:$scope.profile.form.gf.customer_id,
            folio_id:$scope.profile.form.gf.id,
            transc_date: globalFunction.currentDate(),
            transc_type_id:$scope.account.cl.selected.category?$scope.account.cl.selected.category.id:null,
            transc_remarks:$scope.account.cl.remark,
            transc_charge:$scope.account.cl.charge,
            transc_ref:$scope.account.cl.reference,
            transc_source_id:10,
            credit:$scope.account.cl.charge,
            transc_code:$scope.account.cl.selected.category?$scope.account.cl.selected.category.code:null,
            debit:0
        }
        var sql = '';
        if ($scope.account.statInsert == true){
            param['created_date'] = globalFunction.currentDate();
            param['created_by'] = $localStorage.currentUser.name.id;
            sql = 'insert into fd_folio_transc_account SET ?'
        }
        else {
            param['modified_date'] = globalFunction.currentDate();
            param['modified_by'] = $localStorage.currentUser.name.id;
            sql = 'update fd_folio_transc_account SET ? where id='+$scope.account.charge.id
        }
        queryService.post(sql,param)
        .then(function (result){
            $scope.account.form.listAccount($scope.profile.form.gf.id)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success add City Ledger ',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.account.action.cancelCl();
        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Add Credit: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

    }
    $scope.account.action.cancelCl = function(){
        $scope.account.statInsert = true
        $scope.account.cl = {
            id:'',
            selected: {
                category: {}
            },
            charge: '',
            remark: '',
            reference: ''
        }
    }
    $scope.account.action.removeCl = function(){
        queryService.post('delete from fd_folio_transc_account where id='+$scope.account.credit.id,undefined)
        .then(function (result){
            $scope.account.form.listAccount($scope.profile.form.gf.id)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success Remove City Ledger ',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.account.action.cancelCl();
        },
        function (err){
            console.log(err)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Remove City Ledger: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

    }

    $scope.account.action.submit = function(){
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
.controller('FoReservationMessageCtrl',
function($scope, $window, $state, $sce, queryService, $q,departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.message.form.gf = {
        data: {},
        message: {},
        flag: {},
        complain: {},
        mr: {},
        history: {},
        remark: {}
    }
    $scope.message.ref = {
        section: [],
        flag: []
    }
    $scope.message.selected = {
        section: {},
        flag: {}
    }
    $scope.message.form.table = {
        message: [],
        flag: [],
        complain: [],
        mr: [],
        history: [],
        remark: []
    }
    $scope.message.stat = {
        message: false,
        flag: false,
        complain: false,
        mr: false,
        history: false,
        remark: false
    }
    $scope.message.form.selected = {
        message: {},
        flag: {},
        complain: {},
        mr: {},
        history: {},
        remark: {}
    }
    $scope.message.form.internetCode = [
        {id:'1',name: 'Blocked'},
        {id:'2',name: 'Pre Paid'},
        {id:'3',name: 'Post Paid'}
    ]

    $scope.message.form.newspaper = []
    queryService.get('select id,code,name from mst_newspaper where status!=2 order by id  ',undefined)
    .then(function(data){
        $scope.message.form.newspaper = data.data
    })
    $scope.message.action.showDetail = function(a){
        console.log(a)
        $scope.account.stat = 'detail'
        var element = $window.document.getElementById('test');
        if(element)
          element.focus();
    }
    queryService.post("select id, name from mst_fo_section where status!=2 order by id ",undefined)
    .then(function(data){
        $scope.message.ref.section = data.data;
    })
    queryService.post("select id, name from ref_guest_flag where status!=2 order by id ",undefined)
    .then(function(data){
        $scope.message.ref.flag = data.data;
    })
    $scope.test = function(a){
        console.log(a)
    }

    $scope.message.action.requeryMessage = function(){
        queryService.post("select a.id,customer_id,folio_id, "+
            "msg_from,date_format(msg_date,'%Y-%m-%d') msg_date,msg_status,msg_phone,msg_address,msg_message,  "+
            "cust_flag_id,b.name cust_flag_name,flag_valid_until,date_format(flag_date,'%Y-%m-%d') flag_date,flag_action,flag_section_id,d.name flag_section_name, "+
            "date_format(complain_date,'%Y-%m-%d') complain_date,date_format(complain_created_date,'%Y-%m-%d') complain_created_date,complain_section_id,e.name complain_section_name,complain_status,complain_type_id,c.name complain_type_name, "+
            "date_format(maintenance_req_date,'%Y-%m-%d') maintenance_req_date,maintenance_req_location_id,f.name maintenance_req_location_name,maintenance_req_person_id,h.name maintenance_req_person_name,maintenance_req_status,maintenance_req_type_id,g.name maintenance_req_type_name, "+
            "guest_position,hk_message,date_format(a.created_date,'%Y-%m-%d') created_date "+
            "from fd_guest_mesages a "+
            "left join ref_guest_flag b on a.cust_flag_id = b.id "+
            "left join ref_guest_complain c on a.complain_type_id = c.id "+
            "left join mst_fo_section d on a.flag_section_id = d.id "+
            "left join mst_fo_section e on a.complain_section_id = e.id "+
            "left join ref_maintenance_req_location f on a.maintenance_req_location_id = f.id "+
            "left join ref_maintenance_req_type g on a.maintenance_req_type_id = g.id "+
            "left join ref_maintenance_req_person h on a.maintenance_req_person_id = h.id "+
            " where customer_id="+$scope.message.form.gf.data.customer_id+" and folio_id="+$scope.message.form.gf.data.id+" order by id  ",undefined)
        .then(function(data){
            $scope.message.form.table = {
                message: [],
                flag: [],
                complain: [],
                mr: [],
                history: [],
                remark: []
            }
            for (var i=0;i<data.data.length;i++){
                if(data.data[i].msg_from != null||data.data[i].msg_date != null||data.data[i].msg_phone != null||data.data[i].msg_status != null){
                    $scope.message.form.table.message.push(data.data[i]);
                }
                if(data.data[i].cust_flag_id != null||data.data[i].flag_date != null||data.data[i].flag_section_id != null||data.data[i].flag_action != null){
                    $scope.message.form.table.flag.push(data.data[i]);
                }
                if(data.data[i].complain_date != null||data.data[i].complain_type_id != null||data.data[i].complain_section_id != null||data.data[i].complain_status != null){
                    $scope.message.form.table.complain.push(data.data[i]);
                }
                if(data.data[i].maintenance_req_type_id != null||data.data[i].maintenance_req_person_id != null||data.data[i].maintenance_req_date != null||data.data[i].maintenance_req_location_id != null){
                    $scope.message.form.table.mr.push(data.data[i]);
                }
                if(data.data[i].guest_position != null||data.data[i].hk_message != null){
                    $scope.message.form.table.remark.push(data.data[i]);
                    $scope.message.form.gf.data.remarkHk = data.data[i].hk_message
                    $scope.message.form.gf.data.remarkPos = data.data[i].guest_position
                    $scope.message.stat.remark = data.data[i].id
                }
            }
            if($scope.message.form.gf.data.remarkHk == null||$scope.message.form.gf.data.remarkPos == null){
                $scope.message.stat.remark = 'add'
            }

            //$scope.message.form.table.message = data.data
        })
    }

    $scope.message.action.addnewMessage = function(){
        $scope.message.stat.message = 'add'
    }
    $scope.message.action.updateMessage = function(ids){
        $scope.message.stat.message = ids
        queryService.post("select a.id,customer_id,folio_id, "+
            "msg_from,date_format(msg_date,'%Y-%m-%d') msg_date,msg_status,msg_phone,msg_address,msg_message,  "+
            "cust_flag_id,b.name cust_flag_name,flag_valid_until,date_format(flag_date,'%Y-%m-%d') flag_date,flag_action,flag_section_id,d.name flag_section_name, "+
            "date_format(complain_date,'%Y-%m-%d') complain_date,date_format(complain_created_date,'%Y-%m-%d') complain_created_date,complain_section_id,e.name complain_section_name,complain_status,complain_type_id,c.name complain_type_name, "+
            "date_format(maintenance_req_date,'%Y-%m-%d') maintenance_req_date,maintenance_req_location_id,f.name maintenance_req_location_name,maintenance_req_person_id,h.name maintenance_req_person_name,maintenance_req_status,maintenance_req_type_id,g.name maintenance_req_type_name, "+
            "guest_position,hk_message,date_format(a.created_date,'%Y-%m-%d') created_date "+
            "from fd_guest_mesages a "+
            "left join ref_guest_flag b on a.cust_flag_id = b.id "+
            "left join ref_guest_complain c on a.complain_type_id = c.id "+
            "left join mst_fo_section d on a.flag_section_id = d.id "+
            "left join mst_fo_section e on a.complain_section_id = e.id "+
            "left join ref_maintenance_req_location f on a.maintenance_req_location_id = f.id "+
            "left join ref_maintenance_req_type g on a.maintenance_req_type_id = g.id "+
            "left join ref_maintenance_req_person h on a.maintenance_req_person_id = h.id "+
            "where a.id="+ids,undefined)
        .then(function(data){
            $scope.message.form.gf.data['messageFrom'] = data.data[0].msg_from
            $scope.message.form.gf.data['messageDate'] = data.data[0].msg_date
            $scope.message.form.gf.data['messageStatus'] = data.data[0].msg_status
            $scope.message.form.gf.data['messagePhone'] = data.data[0].msg_phone
            $scope.message.form.gf.data['messageAddress'] = data.data[0].msg_address
            $scope.message.form.gf.data['messageMessage'] = data.data[0].msg_message
        })
    }

    $scope.message.action.submitMessage = function(){
        console.log($scope.message.form.gf.data)
        console.log('stat',$scope.message.stat.message)
        var param = {
            customer_id: $scope.message.form.gf.data.customer_id,
            folio_id: $scope.message.form.gf.data.id,
            msg_from: $scope.message.form.gf.data.messageFrom,
            msg_date: $scope.message.form.gf.data.messageDate,
            msg_status: $scope.message.form.gf.data.messageStatus,
            msg_phone: $scope.message.form.gf.data.messagePhone,
            msg_address: $scope.message.form.gf.data.messageAddress,
            msg_message: $scope.message.form.gf.data.messageMessage
        }
        var s = 'insert into fd_guest_mesages SET ?'
        if ($scope.message.stat.message=='add') s = 'insert into fd_guest_mesages SET ?'
        else s = 'update fd_guest_mesages SET ? where id='+$scope.message.stat.message
        queryService.post(s,param)
        .then(function (result){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success Process Message',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.message.stat.message = false
            $scope.message.action.requeryMessage();

        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Process Message: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }
    $scope.message.action.addnewFlag = function(){
        $scope.message.stat.flag = 'add'
    }
    $scope.message.action.updateFlag = function(ids){
        $scope.message.stat.flag = ids
        queryService.post("select a.id,customer_id,folio_id, "+
            "msg_from,date_format(msg_date,'%Y-%m-%d') msg_date,msg_status,msg_phone,msg_address,msg_message,  "+
            "cust_flag_id,b.name cust_flag_name,flag_valid_until,date_format(flag_date,'%Y-%m-%d') flag_date,flag_action,flag_section_id,d.name flag_section_name, "+
            "date_format(complain_date,'%Y-%m-%d') complain_date,date_format(complain_created_date,'%Y-%m-%d') complain_created_date,complain_section_id,e.name complain_section_name,complain_status,complain_type_id,c.name complain_type_name, "+
            "date_format(maintenance_req_date,'%Y-%m-%d') maintenance_req_date,maintenance_req_location_id,f.name maintenance_req_location_name,maintenance_req_person_id,h.name maintenance_req_person_name,maintenance_req_status,maintenance_req_type_id,g.name maintenance_req_type_name, "+
            "guest_position,hk_message,date_format(a.created_date,'%Y-%m-%d') created_date "+
            "from fd_guest_mesages a "+
            "left join ref_guest_flag b on a.cust_flag_id = b.id "+
            "left join ref_guest_complain c on a.complain_type_id = c.id "+
            "left join mst_fo_section d on a.flag_section_id = d.id "+
            "left join mst_fo_section e on a.complain_section_id = e.id "+
            "left join ref_maintenance_req_location f on a.maintenance_req_location_id = f.id "+
            "left join ref_maintenance_req_type g on a.maintenance_req_type_id = g.id "+
            "left join ref_maintenance_req_person h on a.maintenance_req_person_id = h.id "+
            "where a.id="+ids,undefined)
        .then(function(data){
            $scope.message.form.gf.data['flagSection'] = data.data[0].flag_section_id
            $scope.message.form.gf.data['flagFlag'] = data.data[0].cust_flag_id
            $scope.message.form.gf.data['flagValid'] = data.data[0].flag_valid_until
            $scope.message.form.gf.data['flagMessage'] = data.data[0].flag_action
            $scope.message.selected.section['selected'] = {id:data.data[0].flag_section_id,name:data.data[0].flag_section_name}
            $scope.message.selected.flag['selected'] = {id:data.data[0].cust_flag_id,name:data.data[0].cust_flag_name}
        })
    }

    $scope.message.action.submitFlag = function(){
        console.log($scope.message.form.gf.data)
        console.log('stat',$scope.message.stat.flag)
        var param = {
            customer_id: $scope.message.form.gf.data.customer_id,
            folio_id: $scope.message.form.gf.data.id,
            flag_section_id: $scope.message.form.gf.data.flagSection,
            cust_flag_id: $scope.message.form.gf.data.flagFlag,
            flag_valid_until: $scope.message.form.gf.data.flagValid,
            flag_action: $scope.message.form.gf.data.flagMessage
        }
        var s = 'insert into fd_guest_mesages SET ?'
        if ($scope.message.stat.flag=='add') s = 'insert into fd_guest_mesages SET ?'
        else s = 'update fd_guest_mesages SET ? where id='+$scope.message.stat.flag
        queryService.post(s,param)
        .then(function (result){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success Process Flag',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.message.stat.flag = false
            $scope.message.action.requeryMessage();

        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Process Flag: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.message.action.addnewComplain = function(){
        $scope.message.stat.complain = 'add'
    }
    $scope.message.action.updateComplain = function(ids){
        $scope.message.stat.complain = ids
        queryService.post("select a.id,customer_id,folio_id, "+
            "msg_from,date_format(msg_date,'%Y-%m-%d') msg_date,msg_status,msg_phone,msg_address,msg_message,  "+
            "cust_flag_id,b.name cust_flag_name,flag_valid_until,date_format(flag_date,'%Y-%m-%d') flag_date,flag_action,flag_section_id,d.name flag_section_name, "+
            "date_format(complain_date,'%Y-%m-%d') complain_date,date_format(complain_created_date,'%Y-%m-%d') complain_created_date,complain_section_id,e.name complain_section_name,complain_status,complain_type_id,c.name complain_type_name,complain_msg, "+
            "date_format(maintenance_req_date,'%Y-%m-%d') maintenance_req_date,maintenance_req_location_id,f.name maintenance_req_location_name,maintenance_req_person_id,h.name maintenance_req_person_name,maintenance_req_status,maintenance_req_type_id,g.name maintenance_req_type_name, "+
            "guest_position,hk_message,date_format(a.created_date,'%Y-%m-%d') created_date "+
            "from fd_guest_mesages a "+
            "left join ref_guest_flag b on a.cust_flag_id = b.id "+
            "left join ref_guest_complain c on a.complain_type_id = c.id "+
            "left join mst_fo_section d on a.flag_section_id = d.id "+
            "left join mst_fo_section e on a.complain_section_id = e.id "+
            "left join ref_maintenance_req_location f on a.maintenance_req_location_id = f.id "+
            "left join ref_maintenance_req_type g on a.maintenance_req_type_id = g.id "+
            "left join ref_maintenance_req_person h on a.maintenance_req_person_id = h.id "+
            "where a.id="+ids,undefined)
        .then(function(data){
            $scope.message.form.gf.data['complainSection'] = data.data[0].complain_section_id
            $scope.message.form.gf.data['complainCode'] = data.data[0].complain_type_name
            $scope.message.form.gf.data['complainDate'] = data.data[0].complain_date
            $scope.message.form.gf.data['complainMessage'] = data.data[0].complain_msg
            $scope.message.selected.section2['selected'] = {id:data.data[0].complain_section_id,name:data.data[0].complain_section_name}
            $scope.message.selected.complain_type['selected'] = {id:data.data[0].complain_type_id,name:data.data[0].complain_type_name}
        })
    }

    $scope.message.action.submitComplain = function(){
        console.log($scope.message.form.gf.data)
        console.log('stat',$scope.message.stat.complain)
        var param = {
            customer_id: $scope.message.form.gf.data.customer_id,
            folio_id: $scope.message.form.gf.data.id,
            complain_section_id: $scope.message.form.gf.data.complainSection,
            complain_type_id: $scope.message.form.gf.data.complainCode,
            complain_date: $scope.message.form.gf.data.complainDate,
            complain_status: 1
        }
        var s = 'insert into fd_guest_mesages SET ?'
        if ($scope.message.stat.complain=='add') s = 'insert into fd_guest_mesages SET ?'
        else s = 'update fd_guest_mesages SET ? where id='+$scope.message.stat.complain
        queryService.post(s,param)
        .then(function (result){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success Process Complain',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.message.stat.complain = false
            $scope.message.action.requeryMessage();

        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Process Complain: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.message.action.addnewMr = function(){
        $scope.message.stat.mr = 'add'
    }
    $scope.message.action.updateMr = function(ids){
        $scope.message.stat.mr = ids
        queryService.post("select a.id,customer_id,folio_id, "+
            "msg_from,date_format(msg_date,'%Y-%m-%d') msg_date,msg_status,msg_phone,msg_address,msg_message,  "+
            "cust_flag_id,b.name cust_flag_name,flag_valid_until,date_format(flag_date,'%Y-%m-%d') flag_date,flag_action,flag_section_id,d.name flag_section_name, "+
            "date_format(complain_date,'%Y-%m-%d') complain_date,date_format(complain_created_date,'%Y-%m-%d') complain_created_date,complain_section_id,e.name complain_section_name,complain_status,complain_type_id,c.name complain_type_name,complain_msg, "+
            "date_format(maintenance_req_date,'%Y-%m-%d') maintenance_req_date,maintenance_req_location_id,f.name maintenance_req_location_name,maintenance_req_person_id,h.name maintenance_req_person_name,maintenance_req_status,maintenance_req_type_id,g.name maintenance_req_type_name,maintenance_msg, "+
            "guest_position,hk_message,date_format(a.created_date,'%Y-%m-%d') created_date "+
            "from fd_guest_mesages a "+
            "left join ref_guest_flag b on a.cust_flag_id = b.id "+
            "left join ref_guest_complain c on a.complain_type_id = c.id "+
            "left join mst_fo_section d on a.flag_section_id = d.id "+
            "left join mst_fo_section e on a.complain_section_id = e.id "+
            "left join ref_maintenance_req_location f on a.maintenance_req_location_id = f.id "+
            "left join ref_maintenance_req_type g on a.maintenance_req_type_id = g.id "+
            "left join ref_maintenance_req_person h on a.maintenance_req_person_id = h.id "+
            "where a.id="+ids,undefined)
        .then(function(data){
            $scope.message.form.gf.data['mrLocation'] = data.data[0].maintenance_req_location_id
            $scope.message.form.gf.data['mrCode'] = data.data[0].maintenance_req_type_id
            $scope.message.form.gf.data['mrDate'] = data.data[0].maintenance_req_date
            $scope.message.form.gf.data['mrMessage'] = data.data[0].maintenance_msg
            $scope.message.selected.location['selected'] = {id:data.data[0].maintenance_req_location_id,name:data.data[0].maintenance_req_location_name}
            $scope.message.selected.maintenance_type['selected'] = {id:data.data[0].maintenance_req_type_id,name:data.data[0].maintenance_req_type_name}
        })
    }

    $scope.message.action.submitMr = function(){
        console.log($scope.message.form.gf.data)
        console.log('stat',$scope.message.stat.mr)
        var param = {
            customer_id: $scope.message.form.gf.data.customer_id,
            folio_id: $scope.message.form.gf.data.id,
            maintenance_req_location_id: $scope.message.form.gf.data.mrLocation,
            maintenance_req_type_id: $scope.message.form.gf.data.mrCode,
            maintenance_req_date: $scope.message.form.gf.data.mrDate,
            maintenance_req_status: 1

        }
        var s = 'insert into fd_guest_mesages SET ?'
        if ($scope.message.stat.mr=='add') s = 'insert into fd_guest_mesages SET ?'
        else s = 'update fd_guest_mesages SET ? where id='+$scope.message.stat.mr
        queryService.post(s,param)
        .then(function (result){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success Process Flag',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.message.stat.mr = false
            $scope.message.action.requeryMessage();

        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Process Flag: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }


    $scope.message.action.submitRemark = function(){
        console.log('submit remark')
        var param = {
            customer_id: $scope.message.form.gf.data.customer_id,
            folio_id: $scope.message.form.gf.data.id,
            guest_position: $scope.message.form.gf.data.remarkPos,
            hk_message: $scope.message.form.gf.data.remarkHk

        }
        var s = 'insert into fd_guest_mesages SET ?'
        if ($scope.message.stat.remark=='add') s = 'insert into fd_guest_mesages SET ?'
        else s = 'update fd_guest_mesages SET ? where id='+$scope.message.stat.remark
        queryService.post(s,param)
        .then(function (result){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Success Process Remark',
                position: 'top-right',
                timeout: 2000,
                type: 'success'
            }).show();
            $scope.message.stat.mr = false
            $scope.message.action.requeryMessage();

        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Process Remark: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }
    $scope.message.action.submit = function(){
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
