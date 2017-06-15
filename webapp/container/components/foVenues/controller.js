
var userController = angular.module('app', []);
userController
.controller('FoVenuesCtrl',
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

    var qstring = "select a.id,a.code,a.short_name,a.name,a.description,a.status,b.status_name,a.is_outdoor,a.room_length,a.room_width,a.room_height from mst_venue a, "+
        "(select id as status_id, value as status_value,name as status_name  "+
            "from table_ref  "+
            "where table_name = 'ref_product_category' and column_name='status')b "+
        "where a.status = b.status_value and a.status!=2 "
    var qwhere = ''
	var qstringt = 'select a.*,b.name from mst_venue_layout_capacity a,ref_venue_layout b where a.venue_layout_id=b.id'
	var qstringOver = 'select a.*,b.name from mst_overlapped_venue a,mst_venue b where a.overlapped_venue_id=b.id'

    $scope.users = []
	$scope.items = []
    $scope.trans = []
    $scope.transOri = []
	$scope.transover=[]
	$scope.transoverOri=[]
	$scope.child = {}
    $scope.role = {
        selected: []
    };

    $scope.coas = {}
    $scope.id = '';
    $scope.coa = {
        id: '',
        code: '',
		short_name: '',
		name: '',
		length: '',
		width: '',
		height: '',
		is_outdoor: '',
        description: '',
        status: ''
    }

    $scope.selected = {
        status: {},
        filter_department: {},
        filter_account_type: {}
    }

    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc',undefined)
    .then(function(data){
        $scope.arrActive = data.data
        $scope.selected.status['selected'] = $scope.arrActive[0]
    })

    $scope.focusinControl = {};
    $scope.fileName = "Venue Reference";
    $scope.exportExcel = function(){

        queryService.post('select id,code,short_name,name,description,status_name from('+qstring + qwhere+')aa order by code',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(['ID', 'code','short_name','name','Description','Status']);
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
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        //DTColumnBuilder.newColumn('code').withTitle('Code Ori').notVisible(),
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short_name'),
		DTColumnBuilder.newColumn('name').withTitle('name'),
        DTColumnBuilder.newColumn('description').withTitle('Description'),
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
		$scope.disableAction = false;
        if ($scope.coa.id.length==0){
            //exec creation
            var param = {
                code: $scope.coa.code,
				short_name: $scope.coa.short_name,
				name: $scope.coa.name,
                description: $scope.coa.description,
				room_length:$scope.coa.length,
				room_width: $scope.coa.width,
				room_height: $scope.coa.height,
				is_outdoor: $scope.selected.is_outdoor.selected,
                status: $scope.selected.status.selected.id,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }
            queryService.post('insert into mst_venue SET ?',param)
            .then(function (result){
				var qstr = $scope.child.saveTableT(result.data.insertId);
				var qstr2 = $scope.child.saveTableOver(result.data.insertId);
				var qstr_all=qstr.concat(qstr2);
				if(qstr_all.length>0){
	                queryService.post(qstr_all.join(';'),undefined)
					.then(function (result2){
						$scope.disableAction = false;
	                        $('#form-input').modal('hide')
	                        $scope.dtInstance.reloadData(function(obj){}, false)
	                        $('body').pgNotification({
	                            style: 'flip',
	                            message: 'Success Insert '+$scope.coa.name,
	                            position: 'top-right',
	                            timeout: 2000,
	                            type: 'success'
	                        }).show();
	                        $scope.clear();
	                },
	                function (err2){
						$scope.disableAction = false;
	                    $('#form-input').pgNotification({
	                        style: 'flip',
	                        message: 'Error Insert: '+err2.code,
	                        position: 'top-right',
	                        timeout: 2000,
	                        type: 'danger'
	                    }).show();
	                })
				}else{
					$scope.disableAction = false;
					$('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.coa.name,
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
				short_name: $scope.coa.short_name,
				name: $scope.coa.name,
                description: $scope.coa.description,
				room_length:$scope.coa.length,
				room_width: $scope.coa.width,
				room_height: $scope.coa.height,
				is_outdoor: $scope.selected.is_outdoor.selected,
                status: $scope.selected.status.selected.id,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            queryService.post('update mst_venue SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){
				var qstr = $scope.child.saveTableT($scope.coa.id);
				var qstr2 = $scope.child.saveTableOver($scope.coa.id);
				var qstr_all=qstr.concat(qstr2);
				if(qstr_all.length>0){
	                queryService.post(qstr_all.join(';'),undefined)
					.then(function (result2){
						$scope.disableAction = false;
	                        $('#form-input').modal('hide')
	                        $scope.dtInstance.reloadData(function(obj){}, false)
	                        $('body').pgNotification({
	                            style: 'flip',
	                            message: 'Success Insert '+$scope.coa.name,
	                            position: 'top-right',
	                            timeout: 2000,
	                            type: 'success'
	                        }).show();
	                        $scope.clear();
	                },
	                function (err2){
						$scope.disableAction = false;
	                    $('#form-input').pgNotification({
	                        style: 'flip',
	                        message: 'Error Insert: '+err2.code,
	                        position: 'top-right',
	                        timeout: 2000,
	                        type: 'danger'
	                    }).show();
	                })
				}else{
					$scope.disableAction = false;
					if (result.status = "200"){
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
				}
            },function(err){
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
            $scope.coa.id = result.data[0].id
            $scope.coa.code = result.data[0].code
			$scope.coa.short_name = result.data[0].short_name
			$scope.coa.name = result.data[0].name
			$scope.coa.length = result.data[0].room_length
			$scope.coa.width = result.data[0].room_width
			$scope.coa.height = result.data[0].room_height
			$scope.selected.is_outdoor.selected = result.data[0].is_outdoor
            $scope.coa.description = result.data[0].description
            $scope.coa.status = result.data[0].status
            $scope.selected.status.selected = {id: result.data[0].status,name:result.data[0].status_name}
			$scope.getLayout(obj.id)
			$scope.getOver(obj.id)
        })
    }
	$scope.getLayout=function(id){
		queryService.get(qstringt+ ' and a.venue_id='+id,undefined)
		.then(function(result2){
			var d = result2.data
			$scope.trans = []
			for (var i=0;i<d.length;i++){
				$scope.trans.push(
					{
						id:(i+1),
						p_id: d[i].id,
						name:d[i].name,
						venue_id: d[i].venue_id,
						venue_layout_id:d[i].venue_layout_id,
						capacity:d[i].room_capacity,
					}
				)
			}
			$scope.transOri = angular.copy($scope.trans);
		},function(err2){
			$('body').pgNotification({
				style: 'flip',
				message: 'Failed Fetch Data: '+err2.code,
				position: 'top-right',
				timeout: 2000,
				type: 'danger'
			}).show();
		})
	}
	$scope.getOver=function(id){
		queryService.get(qstringOver+ ' and venue_id='+id,undefined)
		.then(function(result2){
			var d = result2.data
			$scope.transover = []
			for (var i=0;i<d.length;i++){
				$scope.transover.push(
					{
						id:(i+1),
						p_id: d[i].id,
						name:d[i].name,
						overlapped_venue_id:d[i].overlapped_venue_id
					}
				)
			}
			console.log($scope.transover)
			$scope.transoverOri = angular.copy($scope.transover);
		},function(err2){
			$('body').pgNotification({
				style: 'flip',
				message: 'Failed Fetch Data: '+err2.code,
				position: 'top-right',
				timeout: 2000,
				type: 'danger'
			}).show();
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
        queryService.post('update mst_venue SET status=\'2\', '+
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
                    message: 'Success Delete '+$scope.coa.box_no,
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
            box_no: '',
            description: '',
            status: ''
        }
    }

})
.controller('EditableTableOverCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
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
        var filtered = $filter('filter')($scope.transover, {id: id});
		if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

    // add user
    $scope.over = []
	queryService.get('select * from mst_venue where status=1',undefined)
	.then(function(data){
		$scope.over = data.data
	})
    $scope.addUser = function() {
        $scope.itemOver = {
            id:($scope.transover.length+1),
			p_id: '',
            venue_id: '',
            overlapped_venue_id:'',
            isNew: true
        };
        $scope.transover.push($scope.itemOver)
    };

    // cancel all changes
    $scope.cancel = function() {
        for (var i = $scope.transover.length; i--;) {
            var user = $scope.transover[i];
            // undelete
            if (user.isDeleted) {
                delete user.isDeleted;
            }
            // remove new
            if (user.isNew) {
                $scope.transover.splice(i, 1);
            }
        };
    };

    // save edits
    $scope.child.saveTableOver = function(pr_id) {
        var results = [];
        var sqlitem = []
        for (var i = $scope.transover.length; i--;) {
            var user = $scope.transover[i];
            // send on server
            //results.push($http.post('/saveUser', user));
            if (user.isNew && !user.isDeleted){
                sqlitem.push('insert into mst_overlapped_venue (venue_id,overlapped_venue_id,created_by,created_date,status) values('+
                pr_id+','+user.overlapped_venue_id+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',1)')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from mst_overlapped_venue where id='+user.p_id)
            }
            else if(!user.isNew){
                for (var j=0;j<$scope.transoverOri.length;j++){
                    if ($scope.transoverOri[j].p_id==user.p_id){
                        var d1 = $scope.transoverOri[j].p_id+$scope.transoverOri[j].overlapped_venue_id
                        var d2 = user.p_id+user.overlapped_venue_id
                        if(d1 != d2){
                            sqlitem.push('update mst_overlapped_venue set '+
                            ' overlapped_venue_id = '+user.overlapped_venue_id+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
                        }
                    }
                }
            }
        }
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.products = []

    $scope.overUp = function(text) {
        //queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        queryService.post('select * from mst_venue where status=1'+
            'and lower(name) like \''+text.toLowerCase()+'%\' '+
            'order by id limit 20 ',undefined)
        .then(function(data){
            $scope.over = data.data
        })
    }
    $scope.getOver = function(e,d){
		$scope.transover[d-1].name = e.name
        $scope.transover[d-1].overlapped_venue_id = e.id
    }
})
.controller('EditableTableApdtCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
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
        var filtered = $filter('filter')($scope.trans, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

    // add user
    $scope.voucher = []
	queryService.get('select * from ref_venue_layout where status=1',undefined)
	.then(function(data){
		$scope.voucher = data.data
	})
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.trans.length+1),
			p_id: '',
            venue_id: '',
            venue_layout_id:'',
            capacity:'',
            isNew: true
        };
        $scope.trans.push($scope.item)
    };

    // cancel all changes
    $scope.cancel = function() {
        for (var i = $scope.trans.length; i--;) {
            var user = $scope.trans[i];
            // undelete
            if (user.isDeleted) {
                delete user.isDeleted;
            }
            // remove new
            if (user.isNew) {
                $scope.trans.splice(i, 1);
            }
        };
    };


    // save edits
    $scope.child.saveTableT = function(pr_id) {
        var results = [];
        var sqlitem = []
        for (var i = $scope.trans.length; i--;) {
            var user = $scope.trans[i];

            // send on server
            //results.push($http.post('/saveUser', user));
            if (user.isNew && !user.isDeleted){
                sqlitem.push('insert into mst_venue_layout_capacity (venue_id,venue_layout_id,room_capacity,created_by,created_date,status) values('+
                pr_id+','+user.venue_layout_id+','+user.capacity+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+',1)')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from mst_venue_layout_capacity where id='+user.p_id)
            }
            else if(!user.isNew){
                for (var j=0;j<$scope.transOri.length;j++){
                    if ($scope.transOri[j].p_id==user.p_id){
                        var d1 = $scope.transOri[j].p_id+$scope.transOri[j].venue_layout_id+$scope.transOri[j].capacity
                        var d2 = user.p_id+user.venue_layout_id+user.capacity
                        if(d1 != d2){
                            sqlitem.push('update mst_venue_layout_capacity set '+
                            ' venue_layout_id = '+user.venue_layout_id+',' +
                            ' room_capacity = '+user.capacity+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
                        }
                    }
                }
            }

        }
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.products = []

    $scope.voucherUp = function(text) {
        //queryService.get('select id,code,name from mst_ledger_account order by id limit 20 ',undefined)
        queryService.post('select * from ref_venue_layout where status=1'+
            'and lower(name) like \''+text.toLowerCase()+'%\' '+
            'order by id limit 20 ',undefined)
        .then(function(data){
            $scope.voucher = data.data
        })
    }

    $scope.getVoucher = function(e,d){
		$scope.trans[d-1].name = e.name
        $scope.trans[d-1].venue_layout_id = e.id
    }

    $scope.setValue = function(e,d,p){
        $scope.trans[d-1].capacity = p
    }

})
