
var userController = angular.module('app', []);
userController
.controller('FoRoomRateCtrl',
function($scope, $state, $sce, queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
	$scope.disableAction = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    $scope.child = {}
    $scope.items = []
    $scope.itemsOri = []
    $scope.mr = false;
    $scope.selected_pack = {};
    $scope.avail_pack = [
        /*{ id:1,name:'satu',description:'desc1',incl_tax:true,charge:100000,bg:'white' },
        { id:2,name:'dua',description:'desc2',incl_tax:false,charge:100000,bg:'white' },
        { id:3,name:'tiga',description:'desc3',incl_tax:true,charge:100000,bg:'white' },
        { id:4,name:'empat',description:'desc4',incl_tax:true,charge:100000,bg:'white' },
        { id:5,name:'lima',description:'desc5',incl_tax:true,charge:100000,bg:'white' }*/
    ]
    $scope.highlight = function(a){
        for (var i=0;i<$scope.avail_pack.length;i++){
            if ($scope.avail_pack[i].id == a.id){
                $scope.avail_pack[i].bg = 'antiquewhite'
                $scope.selected_pack = $scope.avail_pack[i];
            }
            else $scope.avail_pack[i].bg = 'white'
        }
        $scope.mr = false
    }

    $scope.attach_pack = [

    ]
    $scope.highlightOth = function(a){
        for (var i=0;i<$scope.attach_pack.length;i++){
            if ($scope.attach_pack[i].id == a.id){
                $scope.attach_pack[i].bg = 'antiquewhite'
                $scope.selected_pack = $scope.attach_pack[i];
            }
            else $scope.attach_pack[i].bg = 'white'
        }
        $scope.mr = true
    }
    $scope.moveRight = function(){
        if (Object.keys($scope.selected_pack).length>0){
            $scope.attach_pack.push($scope.selected_pack)
            for (var i=0;i<$scope.avail_pack.length;i++){
                if ($scope.avail_pack[i].id == $scope.selected_pack.id){
                    $scope.avail_pack.splice(i,1)
                    $scope.selected_pack = {};
                }
            }
            $scope.clearBg();
        }

    }
    $scope.moveLeft = function(){
        if (Object.keys($scope.selected_pack).length>0){
            $scope.avail_pack.push($scope.selected_pack)
            for (var i=0;i<$scope.attach_pack.length;i++){
                if ($scope.attach_pack[i].id == $scope.selected_pack.id){
                    $scope.attach_pack.splice(i,1)
                    $scope.selected_pack = {};
                }
            }
            $scope.clearBg();
        }
    }
    $scope.clearBg = function(){
        for (var i=0;i<$scope.attach_pack.length;i++){
            $scope.attach_pack[i].bg = 'white'
        }
        for (var i=0;i<$scope.avail_pack.length;i++){
            $scope.avail_pack[i].bg = 'white'
        }
    }
    $scope.setAvail = function(id){
        var qstr = 'select id,code,name,is_tax_included,flat_rate from mst_package'
        if (id!=undefined){
            qstr += ' where id not in(select package_id from mst_room_rate_package where room_rate_id='+id+') '
        }
        queryService.get(qstr,undefined)
        .then(function(data){
            $scope.avail_pack = data.data
            $scope.clearBg();
        })
    }
    $scope.setAttach = function(id){
        var qstr = 'select id,code,name,is_tax_included,flat_rate from mst_package'
        if (id!=undefined){
            console.log('sini')
            qstr += ' where id in(select package_id from mst_room_rate_package where room_rate_id='+id+') '
        }
        console.log('setAttach',id,qstr)
        queryService.get(qstr,undefined)
        .then(function(data){
            $scope.attach_pack = data.data
            $scope.clearBg();
        })
    }

    var qstring = "select a.id,a.code,a.name,a.description,a.user_display_description,a.status,a.rate_type_id,a.currency_id,"+
        "date_format(a.valid_date_from,'%Y-%m-%d')valid_date_from,date_format(a.valid_date_until,'%Y-%m-%d')valid_date_until, "+
    	"a.rhythm_type,a.max_discount_prcn,a.extra_bed_cost,a.next_rate_id,a.day_period,a.pension_id,a.is_displayed, "+
        "a.is_room_only_voucher,a.is_require_deposit,a.cashier,a.check_in, "+
        "case when a.rhythm_type='D' then 'Daily' "+
        "when a.rhythm_type = 'W' then 'Weekly' "+
        "when a.rhythm_type = 'M' then 'Monthly' "+
        "else 'No Rhythm' end as rhythm_name, "+
        "if(is_room_only_voucher='Y','Yes','No') is_room_only_voucher_name,"+
        "if(is_require_deposit='Y','Yes','No') is_require_deposit_name,"+
        "b.name rate_type_name,c.name currency_name,e.name pension_name,f.status_name, "+
        "a.room_transc_type_id,g.short_name room_transc_type_name,g.code room_transc_type_code,g.folio_text room_transc_type_folio_text, "+
        "a.ext_bed_transc_type_id,h.short_name ext_bed_transc_type_name,h.code ext_bed_transc_type_code,h.folio_text ext_bed_transc_type_folio_text, "+
        "a.disc_transc_type_id,i.short_name disc_transc_type_name,i.code disc_transc_type_code,i.folio_text disc_transc_type_folio_text "+
    "from mst_room_rate a "+
    "left join ref_room_rate_type b on a.rate_type_id = b.id "+
    "left join ref_currency c on a.currency_id = c.id "+
    //"left join mst_taxes d on a.tax_id = d.id "+
    "left join ref_pension e on a.pension_id = e.id "+
    "left join (select id as status_id, value as status_value,name as status_name  from table_ref  where table_name = 'ref_product_category' and column_name='status')f on a.status=f.status_value "+
    "left join mst_guest_transaction_type g on a.room_transc_type_id=g.id "+
    "left join mst_guest_transaction_type h on a.ext_bed_transc_type_id=h.id "+
    "left join mst_guest_transaction_type i on a.disc_transc_type_id=i.id "+
    " where a.status!=2 "
    var qwhere = ''
    var qstringdetail = 'select a.id room_type_id,a.code,a.name,b.id line_id,b.room_rate_id, '+
    	'b.rate_1_person,b.rate_2_person,b.rate_3_person,b.rate_4_person,b.additional_person,b.additional_child,b.late_checkout_charge '+
    'from ref_room_type a '+
    'left join mst_room_rate_line_item b on a.id =b.room_type_id '

    var qwheredetail = 'where a.status!=2 '

    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.coas = {}
    $scope.id = '';
    $scope.coa = {
        id: '',
        code: '',
        name: '',
        description: '',
        status: ''
    }

    $scope.selected = {
        status: {},
        filter_department: {},
        filter_account_type: {},
        rate_type: {},
        currency: {},
        tax: {},
        rhythm_type: {},
        pension: {},
        is_room_only_voucher: {},
        is_require_deposit: {},
        room_transc_type: {},
        ext_bed_transc_type: {},
        disc_transc_type: {}
    }


    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc',undefined)
    .then(function(data){
        $scope.status = data.data
        $scope.selected.status['selected'] = $scope.status[0]
    })
    $scope.yesno = [
        {id: 'Y', name: 'Yes'},
        {id: 'N', name: 'No'}
    ]
    $scope.rhythm_type = [
        {id: 'D', name: 'Daily'},
        {id: 'W', name: 'Weekly'},
        {id: 'M', name: 'Monthly'}
    ]
    $scope.selected.is_room_only_voucher['selected'] = $scope.yesno[1]
    $scope.selected.is_require_deposit['selected'] = $scope.yesno[1]
    queryService.get('select id,name from ref_room_rate_type where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.rate_type = data.data
    })
    //$scope.selected.is_require_deposit['selected'] = $scope.yesno[1]
    $scope.room_transc_type = []
    $scope.ext_bed_transc_type = []
    $scope.disc_transc_type = []
    queryService.get('select id,short_name as name,code,folio_text from mst_guest_transaction_type where status=1 order by code asc',undefined)
    .then(function(data){
        $scope.room_transc_type = data.data
        $scope.ext_bed_transc_type = data.data
        $scope.disc_transc_type = data.data
    })
    queryService.get('select id,name from ref_currency where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.currency = data.data
        $scope.selected.currency['selected'] = $scope.currency[0]
    })
    queryService.get('select id,name from mst_taxes where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.tax = data.data
    })
    queryService.get('select id,name from ref_pension where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.pension = data.data
    })

    $scope.focusinControl = {};
    $scope.fileName = "Check out By Reference";
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
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '20%'),
        DTColumnBuilder.newColumn('rate_type_name').withTitle('type'),
        DTColumnBuilder.newColumn('valid_date_from').withTitle('start'),
        DTColumnBuilder.newColumn('valid_date_until').withTitle('end'),
        DTColumnBuilder.newColumn('currency_name').withTitle('CUR'),
        //DTColumnBuilder.newColumn('status_name').withTitle('status'),
        //DTColumnBuilder.newColumn('description').withTitle('Description'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status')
    );

    var qwhereobj = {
        text: '',
        department: '',
        account_type: ''
    }
    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhereobj.text = ' (lower(a.name) like \'%'+$scope.filterVal.search.toLowerCase()+'%\' or lower(a.code) like \'%'+$scope.filterVal.search.toLowerCase()+'%\' )'
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
        $scope.setAvail(undefined);
        $scope.setAttach(0);
        $('#form-input').modal('show')
        $scope.items = []
        queryService.post(qstringdetail+' and b.room_rate_id=0 '+qwheredetail,undefined)
        .then(function(data){
            for (var i=0;i<data.data.length;i++){
                $scope.items.push({
                    id: i+1,
                    room_type_id: data.data[i].room_type_id,
                    code:data.data[i].code,
                    name:data.data[i].name,
                    line_id: data.data[i].line_id,
                    room_rate_id: data.data[i].room_rate_id,
                    rate_1_person: data.data[i].rate_1_person,
                    rate_2_person: data.data[i].rate_2_person,
                    rate_3_person: data.data[i].rate_3_person,
                    rate_4_person: data.data[i].rate_4_person,
                    additional_person: data.data[i].additional_person,
                    additional_child: data.data[i].additional_child,
                    late_checkout_charge: data.data[i].late_checkout_charge
                })
            }
            $scope.itemsOri = angular.copy($scope.items)
            console.log($scope.items)
            console.log($scope.itemsOri)
        })

    }

    $scope.submit = function(){
		$scope.disableAction = true;
        if ($scope.coa.id.length==0){
            //exec creation

            var param = {
                code: $scope.coa.code,
                name: $scope.coa.name,
                description: $scope.coa.description,
                user_display_description: $scope.coa.user_display_description,
                status: $scope.selected.status.selected.id,
                rate_type_id: ($scope.selected.rate_type.selected?$scope.selected.rate_type.selected.id:null),
                currency_id: $scope.selected.currency.selected.id,
                valid_date_from: $scope.coa.valid_date_from,
                valid_date_until: $scope.coa.valid_date_until,
                room_transc_type_id: ($scope.selected.room_transc_type.selected?$scope.selected.room_transc_type.selected.id:null),
                ext_bed_transc_type_id: ($scope.selected.ext_bed_transc_type.selected?$scope.selected.ext_bed_transc_type.selected.id:null),
                disc_transc_type_id: ($scope.selected.disc_transc_type.selected?$scope.selected.disc_transc_type.selected.id:null),
                rhythm_type: ($scope.selected.rhythm_type.selected?$scope.selected.rhythm_type.selected.id:null),
                max_discount_prcn: $scope.coa.max_discount_prcn,
                extra_bed_cost: $scope.coa.extra_bed_cost,
                day_period: $scope.coa.day_period,
                pension_id: ($scope.selected.pension.selected?$scope.selected.pension.selected.id:null),
                is_room_only_voucher: $scope.selected.is_room_only_voucher.selected.id,
                is_require_deposit: $scope.selected.is_require_deposit.selected.id,
                cashier: $scope.coa.cashier,
                check_in: $scope.coa.check_in,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }
            console.log(param)

            queryService.post('insert into mst_room_rate SET ?',param)
            .then(function (result){
                var sqlPackage = [];
                for (var i=0;i<$scope.attach_pack.length;i++){
                    sqlPackage.push("insert into mst_room_rate_package(room_rate_id,package_id,valid_date_from,valid_date_until,created_by,created_date)"+
                    "values("+result.data.insertId+","+$scope.attach_pack[i].id+",'"+$scope.coa.valid_date_from+"','"+$scope.coa.valid_date_until+"',"+$localStorage.currentUser.name.id+",'"+globalFunction.currentDate()+"')")
                }
                if (sqlPackage.length>0){
                    queryService.post(sqlPackage.join(';'),undefined)
                    .then(function (result3){

                        console.log('success insert package')
                    },
                    function (err3){
                        console.log('error:'+err3.code)
                    })
                }


                var sqld = $scope.child.saveTable(result.data.insertId)
                queryService.post(sqld.join(';'),undefined)
                .then(function (result3){
					$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.coa.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear()

                },
                function (err3){
					$scope.disableAction = false;
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Insert: '+err3.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })




            },
            function (err){
                $scope.disableAction = false;
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })

        }
        else {
            //exec update

            var param = {
                code: $scope.coa.code,
                name: $scope.coa.name,
                description: $scope.coa.description,
                user_display_description: $scope.coa.user_display_description,
                status: $scope.selected.status.selected.id,
                rate_type_id: ($scope.selected.rate_type.selected?$scope.selected.rate_type.selected.id:null),
                currency_id: $scope.selected.currency.selected.id,
                valid_date_from: $scope.coa.valid_date_from,
                valid_date_until: $scope.coa.valid_date_until,
                room_transc_type_id: ($scope.selected.room_transc_type.selected?$scope.selected.room_transc_type.selected.id:null),
                ext_bed_transc_type_id: ($scope.selected.ext_bed_transc_type.selected?$scope.selected.ext_bed_transc_type.selected.id:null),
                disc_transc_type_id: ($scope.selected.disc_transc_type.selected?$scope.selected.disc_transc_type.selected.id:null),
                rhythm_type: ($scope.selected.rhythm_type.selected?$scope.selected.rhythm_type.selected.id:null),
                max_discount_prcn: $scope.coa.max_discount_prcn,
                extra_bed_cost: $scope.coa.extra_bed_cost,
                day_period: $scope.coa.day_period,
                pension_id: ($scope.selected.pension.selected?$scope.selected.pension.selected.id:null),
                is_room_only_voucher: $scope.selected.is_room_only_voucher.selected.id,
                is_require_deposit: $scope.selected.is_require_deposit.selected.id,
                cashier: $scope.coa.cashier,
                check_in: $scope.coa.check_in,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            console.log(param)
            queryService.post('update mst_room_rate SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){

                queryService.post('delete from mst_room_rate_package where room_rate_id='+$scope.coa.id,undefined)
                .then(function (result2){
                    console.log('success delete package')
                    var sqlPackage = [];
                    for (var i=0;i<$scope.attach_pack.length;i++){
                        sqlPackage.push("insert into mst_room_rate_package(room_rate_id,package_id,valid_date_from,valid_date_until,created_by,created_date)"+
                        "values("+$scope.coa.id+","+$scope.attach_pack[i].id+",'"+$scope.coa.valid_date_from+"','"+$scope.coa.valid_date_until+"',"+$localStorage.currentUser.name.id+",'"+globalFunction.currentDate()+"')")
                    }
                    if (sqlPackage.length>0){
                        queryService.post(sqlPackage.join(';'),undefined)
                        .then(function (result3){
                            console.log('success insert package')
                        },
                        function (err3){
                            console.log('error:'+err3.code)
                        })
                    }
					$scope.disableAction = false;
                },
                function (err2){
					$scope.disableAction = false;
                    console.log('error delete:'+err2.code)
                })

                var sqld = $scope.child.saveTable($scope.coa.id)
                queryService.post(sqld.join(';'),undefined)
                .then(function (result3){
					$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.coa.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear()

                },
                function (err3){
					$scope.disableAction = false;
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Update: '+err3.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        //$('#coa_code').prop('disabled', true);

        // console.log(obj)
        $scope.setAvail(obj.id)
        $scope.setAttach(obj.id)
        queryService.post(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)
            $scope.coa.id = result.data[0].id
            $scope.coa.code = result.data[0].code
            $scope.coa.name = result.data[0].name
            $scope.coa.description = result.data[0].description
            $scope.coa.user_display_description = result.data[0].user_display_description
            $scope.coa.status = result.data[0].status
            $scope.selected.status.selected = {id: result.data[0].status,name:result.data[0].status_name}
            $scope.selected.rate_type.selected = {id: result.data[0].rate_type_id,name:result.data[0].rate_type_name}
            $scope.selected.currency.selected = {id: result.data[0].currency_id,name:result.data[0].currency_name}
            $scope.coa.valid_date_from = result.data[0].valid_date_from
            $scope.coa.valid_date_until = result.data[0].valid_date_until
            $scope.selected.room_transc_type.selected = {
                id:result.data[0].room_transc_type_id,
                name:result.data[0].room_transc_type_name,
                code:result.data[0].room_transc_type_code,
                folio_text:result.data[0].room_transc_type_folio_text
            }
            $scope.selected.ext_bed_transc_type.selected = {
                id:result.data[0].ext_bed_transc_type_id,
                name:result.data[0].ext_bed_transc_type_name,
                code:result.data[0].ext_bed_transc_type_code,
                folio_text:result.data[0].ext_bed_transc_type_folio_text
            }
            $scope.selected.disc_transc_type.selected = {
                id:result.data[0].disc_transc_type_id,
                name:result.data[0].disc_transc_type_name,
                code:result.data[0].disc_transc_type_code,
                folio_text:result.data[0].disc_transc_type_folio_text
            }
            //$scope.selected.tax.selected = {id: result.data[0].tax_id,name:result.data[0].tax_name}
            $scope.coa.max_discount_prcn = result.data[0].max_discount_prcn
            $scope.coa.extra_bed_cost = result.data[0].extra_bed_cost
            $scope.coa.day_period = result.data[0].day_period
            $scope.coa.cashier = result.data[0].cashier
            $scope.coa.check_in = result.data[0].check_in
            $scope.selected.pension.selected = {id: result.data[0].pension_id,name:result.data[0].pension_name}
            $scope.selected.rhythm_type.selected = {id: result.data[0].rhythm_type,name:result.data[0].rhythm_name}
            $scope.selected.is_room_only_voucher.selected = {id: result.data[0].is_room_only_voucher,name:result.data[0].is_room_only_voucher_name}
            $scope.selected.is_require_deposit.selected = {id: result.data[0].is_require_deposit,name:result.data[0].is_require_deposit_name}

            $scope.items = []
            queryService.post(qstringdetail+' and b.room_rate_id='+obj.id+ ' '+qwheredetail,undefined)
            .then(function(data){
                console.log(data)
                for (var i=0;i<data.data.length;i++){
                    $scope.items.push({
                        id: i+1,
                        room_type_id: data.data[i].room_type_id,
                        code:data.data[i].code,
                        name:data.data[i].name,
                        line_id: data.data[i].line_id,
                        room_rate_id: data.data[i].room_rate_id,
                        rate_1_person: data.data[i].rate_1_person,
                        rate_2_person: data.data[i].rate_2_person,
                        rate_3_person: data.data[i].rate_3_person,
                        rate_4_person: data.data[i].rate_4_person,
                        additional_person: data.data[i].additional_person,
                        additional_child: data.data[i].additional_child,
                        late_checkout_charge: data.data[i].late_checkout_charge
                    })
                }
                $scope.itemsOri = angular.copy($scope.items)
                console.log($scope.items)
                console.log($scope.itemsOri)
            })
        })
    }

    $scope.delete = function(obj){
        $scope.coa.id = obj.id;
        queryService.post(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.coa.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update mst_room_rate SET status=\'2\', '+
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
        $scope.coa = {
            id: '',
            code: '',
            name: '',
            description: '',
            status: ''
        }
    }

})
.controller('EditableTableRateCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    $scope.item = {
        product_id:'',
        product_name:'',
        qty: '',
        price: '',
        amount: '',
        supplier_id: '',
        supplier_name: '',
        old_price: '',
        new_price: ''
    };

    $scope.checkName = function(data, id) {
        if (id === 2 && data !== 'awesome') {
            return "Username 2 should be `awesome`";
        }
    };

    // filter users to show
    $scope.filterUser = function(user) {
        return user.isDeleted !== true;
    };

    // mark user as deleted
    $scope.deleteUser = function(id) {
        console.log(id)
        var filtered = $filter('filter')($scope.items, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

    // add user
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.items.length+1),
            product_id:'',
            product_name:'',
            qty: 0,
            price: 0,
            amount: 0,
            supplier_id: '',
            supplier_name: '',
            old_price: 0,
            new_price: 0,
            isNew: true
        };
        $scope.items.push($scope.item)
    };

    // cancel all changes
    $scope.cancel = function() {
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
            // undelete
            if (user.isDeleted) {
                delete user.isDeleted;
            }
            // remove new
            if (user.isNew) {
                $scope.items.splice(i, 1);
            }
        };
    };

    // save edits
    $scope.child.saveTable = function(pr_id) {
        console.log('asd')
        var results = [];
        console.log($scope.itemsOri)

        console.log(JSON.stringify($scope.items,null,2))
        var sqlitem = []
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
            console.log(user)
            if (user.line_id != null){
                sqlitem.push('update mst_room_rate_line_item set rate_1_person='+user.rate_1_person+','+
                    'rate_2_person='+user.rate_2_person+',rate_3_person='+user.rate_3_person+','+
                    'rate_4_person='+user.rate_4_person+',additional_person='+user.additional_person+','+
                    'additional_child='+user.additional_child+','+
                    'additional_child='+user.additional_child+','+
                    'late_checkout_charge='+user.late_checkout_charge+','+
                    ' modified_by = '+$localStorage.currentUser.name.id+',' +
                    ' modified_date = \''+globalFunction.currentDate()+'\'' +
                    ' where id='+user.line_id
                )
            }
            else {
                if ((user.rate_1_person+user.rate_2_person+user.rate_3_person+user.rate_4_person+user.additional_person+user.additional_child+user.late_checkout_charge).length>0 ){
                    sqlitem.push('insert into mst_room_rate_line_item(room_rate_id,room_type_id,rate_1_person,rate_2_person,rate_3_person,rate_4_person,additional_person,additional_child,late_checkout_charge,created_by,created_date) values '+
                    '('+pr_id+','+user.room_type_id+','+user.rate_1_person+','+user.rate_2_person+','+user.rate_3_person+','+user.rate_4_person+','+user.additional_person+','+user.additional_child+','+user.late_checkout_charge+','+$localStorage.currentUser.name.id+',\''+globalFunction.currentDate()+'\')');
                }
            }
        };

        //console.log($scope.items)
        //console.log(sqlitem.join(';'))
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.setVal = function(e,d,p,t){
        if (p){
            if (p.length==0){
                $scope.items[d-1][t] = null
            }
            else {
                $scope.items[d-1][t] = p
            }
        }

        /*$scope.items[d-1].supplier_name = e.name
        $scope.items[d-1].price = e.price
        $scope.items[d-1].amount = e.price * $scope.items[d-1].qty*/
    }



});
