
var userController = angular.module('app', []);
userController
.controller('FoCustCompanyCtrl',
function($scope, $state, $sce, queryService, supplierService, otherService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
	$scope.disableAction = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []
    var qstring = `select a.*,b.name company_type_name
		from mst_cust_company a,ref_company_type b
		where a.company_type_id=b.id`
    var qwhereobj = {
        text: ''
    }
    var qwhere = ''

    $scope.role = {
        selected: []
    };

    $scope.arr = {
        country_id: [],
        prov_id: [],
        kab_id: [],
        kec_id: [],
        kel_id: [],
        supplier_type: [],
        status: [],
        used_currency: []
    }

    $scope.suppliers = {}
    $scope.id = '';
    $scope.supplier = {
        id: '',
        code: '',
        name: '',
        short_name: '',
        description: '',
        //status: '',
        address: '',
        country_id: '',
		contact_person_phone:'',
		contact_person_name:'',
    }

    $scope.selected = {
        status: {selected:{}},
        country_id: {selected:{}},
        prov_id: {selected:{}},
        kab_id: {selected:{}},
        kec_id: {selected:{}},
        kel_id: {selected:{}},
        supplier_type: {selected:{}},
        status: {selected:$scope.arr.status[1]},
        used_currency: {selected:{}},
		bank_used_currency:{selected:{}},
		bank_used_currency2:{selected:{}}
    }

    $scope.arr.status = []
    queryService.get('select value as id,name from table_ref where table_name = \'mst_supplier\' and column_name=\'status\' and value != 2',undefined)
    .then(function(data){
        $scope.arr.status = data.data
    })

    queryService.get('select id,code,name from ref_country order by name',undefined)
    .then(function(data){
        $scope.arr.country_id = data.data
    })

    queryService.get('select id,name,code from ref_company_type order by name',undefined)
    .then(function(data){
        $scope.arr.supplier_type = data.data
    })

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.suppliers[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(suppliers[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(suppliers[\'' + data + '\'])" )"="">' +
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
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '5%'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '15%'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name').withOption('width', '7%'),
		DTColumnBuilder.newColumn('company_type_name').withTitle('Type').withOption('width', '7%'),
        DTColumnBuilder.newColumn('contact_person_name').withTitle('Contact Person').withOption('width', '7%'),
		DTColumnBuilder.newColumn('contact_person_phone').withTitle('Telephone').withOption('width', '7%'),
        DTColumnBuilder.newColumn('address').withTitle('Address').withOption('width', '20%')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhereobj.text = ' lower(a.name) like "%'+$scope.filterVal.search+'%"'
                else qwhereobj.text = ''
                qwhere = setWhere()
                $scope.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }
        else {
            qwhere = setWhere()
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
        return strWhere
    }

    /*END AD ServerSide*/
    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
		$('#form-input').modal('show')
    }

    $scope.submit = function(){
		$scope.disableAction = true;
        if ($scope.supplier.id.length==0){
            $scope.supplier.status = $scope.selected.status.selected.id;
            $scope.supplier.country_id = $scope.selected.country_id.selected?$scope.selected.country_id.selected.id:null;
            $scope.supplier.company_type_id = $scope.selected.supplier_type.selected?$scope.selected.supplier_type.selected.id:null;
			$scope.supplier['created_by'] = $localStorage.currentUser.name.id;
            queryService.post('select next_item_code(\'company\',\''+$scope.selected.supplier_type.selected.code+'\') as code',undefined)
			.then(function(data){
	            $scope.supplier.code = data.data[0].code
				console.log($scope.supplier)
		        queryService.post('insert into mst_cust_company SET ?',$scope.supplier)
	            .then(function (result){
					$scope.disableAction = false;
	                    $('#form-input').modal('hide')
	                    $scope.dtInstance.reloadData(function(obj){
	                        // console.log(obj)
	                    }, false)
	                    $scope.clear()
	                    $('body').pgNotification({
	                        style: 'flip',
	                        message: 'Success Insert '+$scope.supplier.short_name,
	                        position: 'top-right',
	                        timeout: 2000,
	                        type: 'success'
	                    }).show();
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
			})
        }
        else {
            $scope.supplier.status = $scope.selected.status.selected.id;
            $scope.supplier.country_id = $scope.selected.country_id.selected?$scope.selected.country_id.selected.id:null;
			$scope.supplier.company_type_id = $scope.selected.supplier_type.selected?$scope.selected.supplier_type.selected.id:null;
			$scope.supplier['modified_by'] = $localStorage.currentUser.name.id;
            $scope.supplier['modified_date'] = globalFunction.currentDate();
            var param = $scope.supplier
            //delete param.id
			if($scope.change==true){
				queryService.post('select next_item_code(\'company\',\''+$scope.selected.supplier_type.selected.code+'\') as code',undefined)
				.then(function (data){
					$scope.supplier.code = data.data[0].code
					queryService.post('update mst_cust_company SET ? WHERE id='+$scope.supplier.id ,param)
		            .then(function (result){
						$scope.disableAction = false;
		                    $('#form-input').modal('hide')
		                    $scope.dtInstance.reloadData(function(obj){
		                        // console.log(obj)
		                    }, false)
		                    $scope.clear()
		                    $('body').pgNotification({
		                        style: 'flip',
		                        message: 'Success Update '+$scope.supplier.code,
		                        position: 'top-right',
		                        timeout: 2000,
		                        type: 'success'
		                    }).show();
		            },
		            function (err){
						$scope.disableAction = false;
		                $('#form-input').pgNotification({
		                    style: 'flip',
		                    message: 'Error Update: '+err.code,
		                    position: 'top-right',
		                    timeout: 2000,
		                    type: 'danger'
		                }).show();
		            })
				})
			}else{
	            queryService.post('update mst_cust_company SET ? WHERE id='+$scope.supplier.id ,param)
	            .then(function (result){
					$scope.disableAction = false;
	                    $('#form-input').modal('hide')
	                    $scope.dtInstance.reloadData(function(obj){
	                        // console.log(obj)
	                    }, false)
	                    $scope.clear()
	                    $('body').pgNotification({
	                        style: 'flip',
	                        message: 'Success Update '+$scope.supplier.code,
	                        position: 'top-right',
	                        timeout: 2000,
	                        type: 'success'
	                    }).show();
	            },
	            function (err){
					$scope.disableAction = false;
	                $('#form-input').pgNotification({
	                    style: 'flip',
	                    message: 'Error Update: '+err.code,
	                    position: 'top-right',
	                    timeout: 2000,
	                    type: 'danger'
	                }).show();
	            })
			}
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        $scope.supplier.id = obj.id
        // console.log(obj)
        queryService.post(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
			console.log(result)
            $('#form-input').modal('show');
            $scope.supplier.code = result.data[0].code
            $scope.supplier.name = result.data[0].name
            $scope.supplier.contact_person_name = result.data[0].contact_person_name
            $scope.supplier.contact_person_phone = result.data[0].contact_person_phone
            $scope.supplier.short_name = result.data[0].short_name
            $scope.supplier.description = result.data[0].description
            $scope.supplier.status = result.data[0].status
            $scope.supplier.address = result.data[0].address
            $scope.supplier.country_id = result.data[0].country_id
            for (var i=0;i<$scope.arr.status.length;i++){
                if (result.data[0].status == $scope.arr.status[i].id){
                    $scope.selected.status.selected = $scope.arr.status[i]
                }
            }

            for (var i=0;i<$scope.arr.supplier_type.length;i++){
                if (result.data[0].company_type_id == $scope.arr.supplier_type[i].id){
                    $scope.selected.supplier_type.selected = $scope.arr.supplier_type[i]
                }
            }
			for (var i = $scope.arr.country_id.length - 1; i >= 0; i--) {
                if ($scope.arr.country_id[i].id == result.data[0].country_id){
                    $scope.selected.country_id.selected = {name: $scope.arr.country_id[i].name, id: $scope.arr.country_id[i].id}
                }
            };
        },function(err){
            $('body').pgNotification({
                style: 'flip',
                message: 'Failed Fetch Data: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.delete = function(obj){
        $scope.supplier.id = obj.id;
        queryService.get('select name from mst_supplier where id='+obj.id,undefined)
        .then(function(result){
            $scope.supplier.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.get('update mst_supplier set status=2, '+
        ' modified_by='+$localStorage.currentUser.name.id+
        ' ,modified_date=\''+globalFunction.currentDate()+'\''+
        ' where id='+$scope.supplier.id,undefined)
        .then(function (result){
            if (result.status = "200"){
                $('#form-input').modal('hide')
                $scope.clear()
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $scope.clear()
            }
            else {
                console.log('Delete Failed')
            }
        })
    }

    $scope.clear = function(){
        $scope.supplier = {
            id: '',
            code: '',
            name: '',
            short_name: '',
            description: '',
            //status: '',
            address: '',
            country_id: '',
			contact_person_phone:'',
			contact_person_name:'',
        }
        $scope.selected = {
            status: {},
            country_id: {},
            supplier_type: {},
            status: {selected:$scope.arr.status[1]}
        }
    }

	$scope.changeCode=function (){
		$scope.change=true
		queryService.post('select curr_item_code(\'company\',\''+$scope.selected.supplier_type.selected.code+'\') as code',undefined)
		.then(function(data){
			$scope.supplier.code = data.data[0].code
		})
	}
})
