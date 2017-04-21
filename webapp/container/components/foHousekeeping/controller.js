
var userController = angular.module('app', []);
userController
.controller('FoHousekeepingCtrl',
function($scope, $state, $sce, queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    var qstring = "select a.id,a.code,a.name,a.status,d.status_name,a.fo_status,b.fo_status_name,a.hk_status,c.hk_status_name, "+
            "cast(concat(b.fo_status_value,c.hk_status_value) as char) fo_hk_status, "+
            "a.room_type_id,e.name room_type_name,a.building_section_id,f.name building_section_name, "+
        "g.id folio_id,g.code folio_code,g.num_of_nights,g.num_of_stays,g.customer_id,g.customer_name,g.num_of_extra_bed, "+
        "g.check_in_remarks,g.newspaper_name,g.num_of_pax,g.num_of_child "+
    "from mst_room a "+
    "left join (select id fo_status_id,name fo_status_name,value fo_status_value  "+
    "        from table_ref where table_name='mst_room' and column_name='fo_status')b on a.fo_status = b.fo_status_value "+
    "left join (select id hk_status_id,name hk_status_name,value hk_status_value  "+
    "        from table_ref where table_name='mst_room' and column_name='hk_status')c on a.hk_status = c.hk_status_value "+
    "left join (select id status_id,name status_name,value status_value  "+
    "        from table_ref where table_name='mst_room' and column_name='status')d on a.fo_status = d.status_value "+
    "left join ref_room_type e on a.room_type_id=e.id "+
    "left join mst_building_section f on a.building_section_id=f.id "+
    "left join (select a.id,a.code,a.num_of_nights,a.num_of_stays,room_id,customer_id,d.newspaper_name,a.num_of_pax,a.num_of_child, "+
    "        cast(concat(b.first_name,' ',b.last_name) as char) customer_name,num_of_extra_bed,c.remarks check_in_remarks "+
    "from fd_guest_folio a "+
    "left join mst_customer b on a.customer_id = b.id "+
    "left join fd_folio_remarks c on a.id = c.folio_id and c.remark_type_id=1 "+
    "left join (select a.folio_id,a.newspaper_id,b.name newspaper_name from fd_folio_adds a "+
    "        left join mst_newspaper b on a.newspaper_id = b.id) d on a.id = d.folio_id "+
    "        where reservation_status in(0,1,2,3,4)) g on a.id=g.room_id where a.status!=2 "
    var qwhere = ''

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
        hk_status: {},
        fo_status: {}
    }
    $scope.hk_status = [];
    queryService.get("select value id,name from table_ref where table_name = 'mst_room' and column_name='hk_status' ",undefined)
    .then(function(data){
        $scope.hk_status = data.data
        $scope.selected.hk_status['selected'] = $scope.hk_status[0]
    })
    $scope.fo_status = [];
    queryService.get("select value id,name from table_ref where table_name = 'mst_room' and column_name='fo_status' ",undefined)
    .then(function(data){
        $scope.fo_status = data.data
        $scope.selected.fo_status['selected'] = $scope.fo_status[0]
    })

    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc',undefined)
    .then(function(data){
        $scope.arrActive = data.data
        $scope.selected.status['selected'] = $scope.arrActive[0]
    })

    $scope.focusinControl = {};
    $scope.fileName = "Day Type Reference";
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
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }
    $scope.dtColumns.push(
        //DTColumnBuilder.newColumn('code').withTitle('Code Ori').notVisible(),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '5%'),
        DTColumnBuilder.newColumn('fo_hk_status').withTitle('Status'),
        DTColumnBuilder.newColumn('hk_status_name').withTitle('HK Status'),
        DTColumnBuilder.newColumn('room_type_name').withTitle('Type'),
        DTColumnBuilder.newColumn('num_of_extra_bed').withTitle('ExtraBed'),
        DTColumnBuilder.newColumn('customer_name').withTitle('Customer'),
        DTColumnBuilder.newColumn('num_of_pax').withTitle('Pax'),
        DTColumnBuilder.newColumn('num_of_child').withTitle('Child'),
        DTColumnBuilder.newColumn('check_in_remarks').withTitle('Remarks'),
        DTColumnBuilder.newColumn('building_section_name').withTitle('Section'),
        DTColumnBuilder.newColumn('num_of_nights').withTitle('Nights'),
        DTColumnBuilder.newColumn('newspaper_name').withTitle('Newspaper')
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
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
        if ($scope.coa.id.length==0){
            //exec creation



        }
        else {
            //exec update

            var param = {
                hk_status: $scope.selected.hk_status.selected.id,
                fo_status: $scope.selected.fo_status.selected.id,
                notes: $scope.coa.notes,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            console.log(param)
            queryService.post('update mst_room SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){
                if (result.status = "200"){
                    var param2 = {
                          room_id: $scope.coa.id,
                          status_change_date: globalFunction.currentDate(),
                          folio_id: $scope.coa.folio_id,
                          remarks: $scope.coa.notes,
                          hk_status: $scope.selected.hk_status.selected.id,
                          fo_status: $scope.selected.fo_status.selected.id,
                          room_status:$scope.coa.status
                    }
                    console.log(param2)
                    queryService.post('insert into hk_room_status_change_log SET ?' ,param2)
                    .then(function (result2){
                        if (result2.status = "200"){
                            console.log('Success Update')
                            $('#form-input').modal('hide')
                            $scope.dtInstance.reloadData(function(obj){
                                console.log(obj)
                            }, false)
                            $('body').pgNotification({
                                style: 'flip',
                                message: 'Success Update '+$scope.coa.name,
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
                else {
                    console.log('Failed Update')
                }
            })

        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        //$('#coa_code').prop('disabled', true);

        // console.log(obj)
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)

            $scope.coa.id = result.data[0].id
            $scope.coa.name = result.data[0].name
            $scope.coa.room_type_name = result.data[0].room_type_name
            $scope.coa.customer_name = result.data[0].customer_name
            $scope.coa.num_of_pax = result.data[0].num_of_pax
            $scope.coa.num_of_child = result.data[0].num_of_child
            $scope.coa.num_of_child = result.data[0].num_of_child
            $scope.coa.num_of_nights = result.data[0].num_of_nights
            $scope.coa.notes = result.data[0].notes
            $scope.coa.folio_id = result.data[0].folio_id
            $scope.coa.status = result.data[0].status
            $scope.coa.building_section_name = result.data[0].building_section_name
            $scope.selected.hk_status['selected'] = {id:result.data[0].hk_status,name:result.data[0].hk_status_name}
            $scope.selected.fo_status['selected'] = {id:result.data[0].fo_status,name:result.data[0].fo_status_name}


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

    $scope.execDelete = function(){
        queryService.post('update ref_day_type SET status=\'2\', '+
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
