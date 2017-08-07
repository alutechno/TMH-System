
var userController = angular.module('app', []);
userController
.controller('PosMealTimeCtrl',
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
    var qstring = "select a.*,b.name status_name from ref_meal_time a,table_ref b where b.table_name = 'ref_product_category' and b.column_name='status' and a.status=b.value and a.status<>2 "
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
        start_time: '',
		end_time: ''
    }
    $scope.selected = {
        status: {}
    }
	queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc',undefined)
    .then(function(data){
        $scope.arrActive = data.data
        $scope.selected.status['selected'] = $scope.arrActive[0]
    })
	$scope.focusinControl = {};
    $scope.fileName = "Meal Time";
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
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml))
    }
    $scope.dtColumns.push(
        //DTColumnBuilder.newColumn('code').withTitle('Code Ori').notVisible(),
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('start_time').withTitle('Start Time'),
		DTColumnBuilder.newColumn('end_time').withTitle('End Time'),
        DTColumnBuilder.newColumn('created_date').withTitle('Created Date')
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
                start_time: $scope.coa.start_time,
				end_time: $scope.coa.end_time,
				status:$scope.selected.status.selected.id,
                created_by: $localStorage.currentUser.name.id
            }

            queryService.post('insert into ref_meal_time SET ?',param)
            .then(function (result){
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
            function (err){
                $scope.disableAction = false;
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.message,
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
                start_time: $scope.coa.start_time,
				end_time: $scope.coa.end_time,
				status:$scope.selected.status.selected.id,
                modified_by: $localStorage.currentUser.name.id,
				modified_date: new Date()
            }
            queryService.post('update ref_meal_time SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){
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
            function (err){
                $scope.disableAction = false;
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.message,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
			$scope.coa.id = result.data[0].id
            $scope.coa.code = result.data[0].code
            $scope.coa.name = result.data[0].name
            $scope.coa.description = result.data[0].description
            $scope.selected.status.selected = {id: result.data[0].status,name:result.data[0].status_name}
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
        queryService.post('update ref_meal_time SET status=\'2\', '+
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
	        start_time: '',
			end_time: ''
	    }
		$scope.selected = {
	        status: {}
	    }
    }
})
