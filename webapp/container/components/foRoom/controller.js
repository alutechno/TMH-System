
var userController = angular.module('app', []);
userController
.controller('FoRoomCtrl',
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

    var qstring = "select a.id, a.code, a.name, a.description, a.status, a.room_type_id, a.building_section_id, a.num_of_bed, "+
    	"a.connected_room_id, a.max_num_of_guest, a.fo_status, a.hk_status, a.hk_point, a.building_floor_id, a.is_condo,  "+
        "a.is_apartment, a.key_lock1, a.key_lock2, a.key_lock3, a.ip_address1, a.ip_address2,  "+
        "a.mac_address1, a.mac_address2, a.notes, "+
        "b.name building_section_name, c.name room_type_name,d.name building_floor_name, e.name connected_room_name, "+
        "f.name fo_status_name,g.name hk_status_name, h.name status_name, "+
        "if(a.is_condo='Y','Yes','No') is_condo_name,"+
        "if(a.is_apartment='Y','Yes','No') is_apartment_name "+
    "from mst_room a "+
    "left join mst_building_section b on a.building_section_id = b.id "+
    "left join ref_room_type c on a.room_type_id = c.id "+
    "left join mst_building_floor d on a.building_floor_id = d.id "+
    "left join mst_room e on a.connected_room_id = e.id "+
    "left join (select * from table_ref where table_name = 'mst_room' and column_name='fo_status') f on a.fo_status = f.value "+
    "left join (select * from table_ref where table_name = 'mst_room' and column_name='hk_status') g on a.hk_status = g.value "+
    "left join (select * from table_ref where table_name = 'mst_room' and column_name='status') h on a.status = h.value "+
    "where a.status!= 'D' "
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
        fo_status: {},
        hk_status: {},
        building_section: {},
        room_type: {},
        building_floor: {},
        connected_room: {},
        is_condo: {},
        is_apartment: {},
        feature: []
    }

    $scope.yesno = [
        {id:'Y',name:'Yes'},
        {id:'N',name:'No'}
    ]
    $scope.selected.is_condo = $scope.yesno[1]
    $scope.selected.is_apartment = $scope.yesno[1]

    queryService.get('select value as id,name from table_ref where table_name = \'mst_room\' and column_name=\'fo_status\' order by name asc',undefined)
    .then(function(data){
        $scope.fo_status = data.data
    })
    queryService.get('select value as id,name from table_ref where table_name = \'mst_room\' and column_name=\'hk_status\' order by name asc',undefined)
    .then(function(data){
        $scope.hk_status = data.data
    })
    queryService.get('select value as id,name from table_ref where table_name = \'mst_room\' and column_name=\'status\' and value != \'D\' order by name asc',undefined)
    .then(function(data){
        $scope.status = data.data
        //$scope.selected.status['selected'] = $scope.status[0]
    })
    queryService.get('select id,name from mst_building_section where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.building_section = data.data
    })
    queryService.get('select id,name from ref_room_type where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.room_type = data.data
    })
    queryService.get('select id,name from mst_building_floor where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.building_floor = data.data
    })
    queryService.get('select id,name from mst_room where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.connected_room = data.data
    })

    $scope.feature = []
    queryService.get('select id,name from ref_building_feature where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.feature = data.data
    })

    $scope.focusinControl = {};
    $scope.fileName = "Master Room Reference";
    $scope.exportExcel = function(){


        queryService.post('select code,name,description,status_name,room_type_name,building_section_name,num_of_bed,fo_status_name,hk_status_name from('+qstring + qwhere+')aa order by code',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code", "Name", 'Description','Status','Type','Section','# Bed','FO Status','HK Status']);
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
        //DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '20%'),
        DTColumnBuilder.newColumn('description').withTitle('Description'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('room_type_name').withTitle('Type'),
        DTColumnBuilder.newColumn('building_section_name').withTitle('section'),
        DTColumnBuilder.newColumn('num_of_bed').withTitle('#Bed'),
        DTColumnBuilder.newColumn('fo_status_name').withTitle('FO Status'),
        DTColumnBuilder.newColumn('hk_status_name').withTitle('HK Status')
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
		$scope.disableAction = true;
        if ($scope.coa.id.length==0){
            //exec creation
            var param = {
                code: $scope.coa.code,
                name: $scope.coa.name,
                description: $scope.coa.description,
                status: ($scope.selected.status.selected?$scope.selected.status.selected.id:null),
                room_type_id: ($scope.selected.room_type.selected?$scope.selected.room_type.selected.id:null),
                building_section_id: ($scope.selected.building_section.selected?$scope.selected.building_section.selected.id:null),
                num_of_bed: $scope.coa.num_of_bed,
                connected_room_id: ($scope.selected.connected_room.selected?$scope.selected.connected_room.selected.id:null),
                max_num_of_guest: $scope.coa.max_num_of_guest,
                fo_status: ($scope.selected.fo_status.selected?$scope.selected.fo_status.selected.id:null),
                hk_status: ($scope.selected.hk_status.selected?$scope.selected.hk_status.selected.id:null),
                hk_point: $scope.coa.hk_point,
                building_floor_id: ($scope.selected.building_floor.selected?$scope.selected.building_floor.selected.id:null),
                is_condo: ($scope.selected.is_condo.selected?$scope.selected.is_condo.selected.id:null),
                is_apartment: ($scope.selected.is_apartment.selected?$scope.selected.is_apartment.selected.id:null),
                key_lock1: $scope.coa.key_lock1,
                key_lock2: $scope.coa.key_lock2,
                key_lock3: $scope.coa.key_lock3,
                ip_address1: $scope.coa.ip_address1,
                ip_address2: $scope.coa.ip_address2,
                mac_address1: $scope.coa.mac_address1,
                mac_address2: $scope.coa.mac_address2,
                notes: $scope.coa.notes,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }
            console.log(param)

            queryService.post('insert into mst_room SET ?',param)
            .then(function (result){
                if ($scope.selected.feature.length>0){
                    var param_f = []
                    for (var i = 0;i<$scope.selected.feature.length;i++){
                        param_f.push([result.data.insertId,$scope.selected.feature[i].id,globalFunction.currentDate(),$localStorage.currentUser.name.id])
                    }
                    console.log(JSON.stringify(param_f,null,2))
                    queryService.post('insert into mst_room_owned_feature(room_id,feature_id,created_date,created_by) VALUES ?',[param_f])
                    .then(function (result2){
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
                    function(err2){
						$scope.disableAction = false;
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Insert: '+err2.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                }
                else {
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
                }

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
                status: ($scope.selected.status.selected?$scope.selected.status.selected.id:null),
                room_type_id: ($scope.selected.room_type.selected?$scope.selected.room_type.selected.id:null),
                building_section_id: ($scope.selected.building_section.selected?$scope.selected.building_section.selected.id:null),
                num_of_bed: $scope.coa.num_of_bed,
                connected_room_id: ($scope.selected.connected_room.selected?$scope.selected.connected_room.selected.id:null),
                max_num_of_guest: $scope.coa.max_num_of_guest,
                fo_status: ($scope.selected.fo_status.selected?$scope.selected.fo_status.selected.id:null),
                hk_status: ($scope.selected.hk_status.selected?$scope.selected.hk_status.selected.id:null),
                hk_point: $scope.coa.hk_point,
                building_floor_id: ($scope.selected.building_floor.selected?$scope.selected.building_floor.selected.id:null),
                is_condo: ($scope.selected.is_condo.selected?$scope.selected.is_condo.selected.id:null),
                is_apartment: ($scope.selected.is_apartment.selected?$scope.selected.is_apartment.selected.id:null),
                key_lock1: $scope.coa.key_lock1,
                key_lock2: $scope.coa.key_lock2,
                key_lock3: $scope.coa.key_lock3,
                ip_address1: $scope.coa.ip_address1,
                ip_address2: $scope.coa.ip_address2,
                mac_address1: $scope.coa.mac_address1,
                mac_address2: $scope.coa.mac_address2,
                notes: $scope.coa.notes,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            console.log(param)
            queryService.post('update mst_room SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){
                if ($scope.selected.feature.length>0){
                    var param_f = []
                    for (var i = 0;i<$scope.selected.feature.length;i++){
                        param_f.push([$scope.coa.id,$scope.selected.feature[i].id,globalFunction.currentDate(),$localStorage.currentUser.name.id])
                    }
                    console.log(JSON.stringify(param_f,null,2))
                    queryService.post('delete from mst_room_owned_feature where room_id='+$scope.coa.id+'; insert into mst_room_owned_feature(room_id,feature_id,created_date,created_by) VALUES ?',[param_f])
                    .then(function (result2){
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
                    function(err2){
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
                }
            },
            function(err){
                console.log(err)
				$scope.disableAction = false;
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
            $scope.coa.code = result.data[0].code
            $scope.coa.name = result.data[0].name
            $scope.coa.description = result.data[0].description
            $scope.selected.status.selected = {id: result.data[0].status,name:result.data[0].status_name}
            $scope.selected.room_type.selected = {id: result.data[0].room_type_id,name:result.data[0].room_type_name}
            $scope.selected.building_section.selected = {id: result.data[0].building_section_id,name:result.data[0].building_section_name}
            $scope.coa.num_of_bed = result.data[0].num_of_bed
            $scope.selected.connected_room.selected = {id: result.data[0].connected_room_id,name:result.data[0].connected_room_name}
            $scope.coa.max_num_of_guest = result.data[0].max_num_of_guest
            $scope.selected.fo_status.selected = {id: result.data[0].fo_status,name:result.data[0].fo_status_name}
            $scope.selected.hk_status.selected = {id: result.data[0].hk_status,name:result.data[0].hk_status_name}
            $scope.coa.hk_point = result.data[0].hk_point
            $scope.selected.building_floor.selected = {id: result.data[0].building_floor_id,name:result.data[0].building_floor_name}
            $scope.selected.is_condo.selected = {id: result.data[0].is_condo,name:result.data[0].is_condo_name}
            $scope.selected.is_apartment.selected = {id: result.data[0].is_apartment,name:result.data[0].is_apartment_name}
            $scope.coa.key_lock1 = result.data[0].key_lock1
            $scope.coa.key_lock2 = result.data[0].key_lock2
            $scope.coa.key_lock3 = result.data[0].key_lock3
            $scope.coa.ip_address1 = result.data[0].ip_address1
            $scope.coa.ip_address2 = result.data[0].ip_address2
            $scope.coa.mac_address1 = result.data[0].mac_address1
            $scope.coa.mac_address2 = result.data[0].mac_address2
            $scope.coa.notes = result.data[0].notes


        })
        queryService.get('select a.feature_id id,b.name from mst_room_owned_feature a,ref_building_feature b where a.feature_id = b.id and a.room_id='+obj.id,undefined)
        .then(function(result){
            var d = result.data;
            console.log(result.data)
            $scope.selected.feature = result.data
            /*for(var i=0;i<d.length;i++){
                $scope.selected.feature.push({id:d[i].id,name:d[i].name})
            }*/
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
        queryService.post('update mst_room SET status=\'D\', '+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.coa.id+';delete from mst_room_owned_feature where room_id='+$scope.coa.id,undefined)
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
            short_name: '',
            description: '',
            status: ''
        }
        $scope.selected = {
            status: {},
            filter_department: {},
            filter_account_type: {},
            fo_status: {},
            hk_status: {},
            building_section: {},
            room_type: {},
            building_floor: {},
            connected_room: {},
            is_condo: {},
            is_apartment: {}
        }
        $scope.selected.is_condo = $scope.yesno[1]
        $scope.selected.is_apartment = $scope.yesno[1]

    }

})
