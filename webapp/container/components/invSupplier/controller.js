
var userController = angular.module('app', []);
userController
.controller('InvSupplierCtrl',
function($scope, $state, $sce, queryService, supplierService, otherService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []
    var qstring = 'select a.id,a.code,a.name,a.short_name,a.description,a.address,a.contact_person,a.phone_number,a.fax_number,a.def_payment_type,a.def_due_days,a.status, '+
    	'a.country_id,b.name as country_name,a.prov_id,c.name as prov_name,a.kab_id,d.name as kab_name, '+
        'a.kec_id,e.name as kec_name, a.kel_id,f.name as kel_name, a.used_currency, g.code as used_currency_code, '+
        'a.supplier_type_id,h.name as supplier_type_name,i.name as status_name,a.bank1_name,a.bank1_currency_id,a.bank1_account_no,a.bank1_account_owner,a.bank1_address,a.bank2_name,a.bank2_currency_id,a.bank2_account_no,a.bank2_account_owner,a.bank2_address '+
    'from mst_supplier a '+
    'left join ref_country b on a.country_id=b.id '+
    'left join ref_province c on a.prov_id=c.id '+
    'left join ref_kabupaten d on a.kab_id=d.id '+
    'left join ref_kecamatan e on a.kec_id=e.id '+
    'left join ref_desa f on a.kel_id=f.id '+
    'left join ref_currency g on a.used_currency=g.code '+
    'left join ref_supplier_type h on a.supplier_type_id=h.id '+
    'left join (select value as id,name from table_ref where table_name = \'mst_supplier\' and column_name=\'status\' and value != 2) i on a.status = i.id '+
    'where a.status!=2 '
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
        status: '',
        address: '',
        country_id: '',
        prov_id: '',
        kab_id: '',
        kec_id: '',
        kel_id: ''
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

    queryService.get('select id,code,name from ref_currency order by code',undefined)
    .then(function(data){
        $scope.arr.used_currency = data.data
        $scope.selected.used_currency['selected'] = data.data[0]
    })

    queryService.get('select id,name,code from ref_supplier_type order by name',undefined)
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
                '<button class="btn btn-default" ng-click="update(suppliers[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(suppliers[\'' + data + '\'])" )"="">' +
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
		DTColumnBuilder.newColumn('supplier_type_name').withTitle('Type').withOption('width', '7%'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status').withOption('width', '5%'),
        DTColumnBuilder.newColumn('contact_person').withTitle('Contact Person').withOption('width', '7%'),
        DTColumnBuilder.newColumn('phone_number').withTitle('Phone').withOption('width', '7%'),
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
        console.log(strWhere)
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
        if ($scope.supplier.id.length==0){
            $scope.supplier.status = $scope.selected.status.selected.id;
            $scope.supplier.country_id = $scope.selected.country_id.selected?$scope.selected.country_id.selected.id:null;
            //$scope.supplier.prov_id = $scope.selected.prov_id.selected?$scope.selected.prov_id.selected.id:null;
            //$scope.supplier.kab_id = $scope.selected.kab_id.selected?$scope.selected.kab_id.selected.id:null;
            //$scope.supplier.kec_id = $scope.selected.kec_id.selected?$scope.selected.kec_id.selected.id:null;
            //$scope.supplier.kel_id = $scope.selected.kel_id.selected?$scope.selected.kel_id.selected.id:null;
			$scope.supplier.prov_id = $scope.selected.prov_id.selected?$scope.selected.prov_id.selected.id:null;
            $scope.supplier.used_currency = $scope.selected.used_currency.selected?$scope.selected.used_currency.selected.code:null;
            $scope.supplier.supplier_type_id = $scope.selected.supplier_type.selected?$scope.selected.supplier_type.selected.id:null;
			$scope.supplier.bank1_currency_id = $scope.selected.bank_used_currency.selected?$scope.selected.bank_used_currency.selected.id:null;
			$scope.supplier.bank2_currency_id = $scope.selected.bank_used_currency2.selected?$scope.selected.bank_used_currency2.selected.id:null;
			$scope.supplier['created_by'] = $localStorage.currentUser.name.id;
            $scope.supplier['created_date'] = globalFunction.currentDate();
			queryService.post('select next_item_code(\'supplier\',\''+$scope.selected.supplier_type.selected.code+'\') as code',undefined)
			.then(function(data){
	            $scope.supplier.code = data.data[0].code
		        queryService.post('insert into mst_supplier SET ?',$scope.supplier)
	            .then(function (result){
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
            //exec update
			$scope.supplier.status = $scope.selected.status.selected.id;
            $scope.supplier.country_id = $scope.selected.country_id.selected?$scope.selected.country_id.selected.id:null;
            $scope.supplier.prov_id = $scope.selected.prov_id.selected?$scope.selected.prov_id.selected.id:null;
            //$scope.supplier.kab_id = $scope.selected.kab_id.selected?$scope.selected.kab_id.selected.id:null;
            //$scope.supplier.kec_id = $scope.selected.kec_id.selected?$scope.selected.kec_id.selected.id:null;
            //$scope.supplier.kel_id = $scope.selected.kel_id.selected?$scope.selected.kel_id.selected.id:null;
            $scope.supplier.used_currency = $scope.selected.used_currency.selected?$scope.selected.used_currency.selected.code:null;
            $scope.supplier.supplier_type_id = $scope.selected.supplier_type.selected?$scope.selected.supplier_type.selected.id:null;
			$scope.supplier.bank1_currency_id = $scope.selected.bank_used_currency.selected?$scope.selected.bank_used_currency.selected.id:null;
			$scope.supplier.bank2_currency_id = $scope.selected.bank_used_currency2.selected?$scope.selected.bank_used_currency2.selected.id:null;
            $scope.supplier['modified_by'] = $localStorage.currentUser.name.id;
            $scope.supplier['modified_date'] = globalFunction.currentDate();
            var param = $scope.supplier
            //delete param.id
			if($scope.change==true){
				queryService.post('select next_item_code(\'supplier\',\''+$scope.selected.supplier_type.selected.code+'\') as code',undefined)
				.then(function (result){
					$scope.supplier.code = data.data[0].code
					queryService.post('update mst_supplier SET ? WHERE id='+$scope.supplier.id ,param)
		            .then(function (result){
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
	            queryService.post('update mst_supplier SET ? WHERE id='+$scope.supplier.id ,param)
	            .then(function (result){
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
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.supplier.code = result.data[0].code
            $scope.supplier.name = result.data[0].name
            $scope.supplier.contact_person = result.data[0].contact_person
            $scope.supplier.phone_number = result.data[0].phone_number
            $scope.supplier.fax_number = result.data[0].fax_number
            $scope.supplier.short_name = result.data[0].short_name
            $scope.supplier.description = result.data[0].description
            $scope.supplier.status = result.data[0].status
            $scope.supplier.address = result.data[0].address
            $scope.supplier.country_id = result.data[0].country_id
            $scope.supplier.prov_id = result.data[0].prov_id
            $scope.supplier.kab_id = result.data[0].kab_id
            $scope.supplier.kec_id = result.data[0].kec_id
            $scope.supplier.kel_id = result.data[0].kel_id
			$scope.supplier.bank1_name=result.data[0].bank1_name
			$scope.supplier.bank1_account_no=result.data[0].bank1_account_no
			$scope.supplier.bank1_account_owner=result.data[0].bank1_account_owner
			$scope.supplier.bank1_address=result.data[0].bank2_address
			$scope.supplier.bank2_name=result.data[0].bank2_name
			$scope.supplier.bank2_account_no=result.data[0].bank2_account_no
			$scope.supplier.bank2_account_owner=result.data[0].bank2_account_owner
			$scope.supplier.bank2_address=result.data[0].bank2_address
            for (var i=0;i<$scope.arr.status.length;i++){
                if (result.data[0].status == $scope.arr.status[i].id){
                    $scope.selected.status.selected = $scope.arr.status[i]
                }
            }
			for (var i=0;i<$scope.arr.used_currency.length;i++){
                if (result.data[0].bank1_currency_id == $scope.arr.used_currency[i].id){
                    $scope.selected.bank_used_currency.selected = $scope.arr.used_currency[i]
                }
				if (result.data[0].bank2_currency_id == $scope.arr.used_currency[i].id){
                    $scope.selected.bank_used_currency2.selected = $scope.arr.used_currency[i]
                }
				if (result.data[0].used_currency == $scope.arr.used_currency[i].id){
                    $scope.selected.used_currency.selected = $scope.arr.used_currency[i]
                }
            }
            for (var i=0;i<$scope.arr.supplier_type.length;i++){
                if (result.data[0].supplier_type_id == $scope.arr.supplier_type[i].id){
                    $scope.selected.supplier_type.selected = $scope.arr.supplier_type[i]
                }
            }
			for (var i = $scope.arr.country_id.length - 1; i >= 0; i--) {
                if ($scope.arr.country_id[i].id == result.data[0].country_id){
                    $scope.selected.country_id.selected = {name: $scope.arr.country_id[i].name, id: $scope.arr.country_id[i].id}
                }
            };
            /*for (var i = $scope.arr.prov_id.length - 1; i >= 0; i--) {
                if ($scope.arr.prov_id[i].id == result.data[0].prov_id){
                    $scope.selected.prov_id.selected = {name: $scope.arr.prov_id[i].name, id: $scope.arr.prov_id[i].id}
                }
            };
            for (var i = $scope.arr.kab_id.length - 1; i >= 0; i--) {
                if ($scope.arr.kab_id[i].id == result.data[0].kab_id){
                    $scope.selected.kab_id.selected = {name: $scope.arr.kab_id[i].name, id: $scope.arr.kab_id[i].id}
                }
            };
            for (var i = $scope.arr.kec_id.length - 1; i >= 0; i--) {
                if ($scope.arr.kec_id[i].id == result.data[0].kec_id){
                    $scope.selected.kec_id.selected = {name: $scope.arr.kec_id[i].name, id: $scope.arr.kec_id[i].id}
                }
            };
            for (var i = $scope.arr.kel_id.length - 1; i >= 0; i--) {
                if ($scope.arr.kel_id[i].id == result.data[0].kel_id){
                    $scope.selected.kel_id.selected = {name: $scope.arr.kel_id[i].name, id: $scope.arr.kel_id[i].id}
                }
            };*/
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
            status: '',
            address: '',
            country_id: '',
            prov_id: '',
            kab_id: '',
            kec_id: '',
            kel_id: ''
        }
        $scope.selected = {
            status: {},
            country_id: {},
            prov_id: {},
            kab_id: {},
            kec_id: {},
            kel_id: {},
            supplier_type: {},
            status: {selected:$scope.arr.status[1]},
            used_currency: {selected:$scope.arr.used_currency[0]},
			bank_used_currency:{selected:{}},
			bank_used_currency2:{selected:{}}
        }
    }

    $scope.getProvince = function(selectItem){
        queryService.get('select id,name from ref_province where country_id='+selectItem.id+' order by name',undefined)
        .then(function(data){
            $scope.arr.prov_id = data.data
        })
    }
    $scope.getKabupaten = function(selectItem){
        queryService.get('select id,name from ref_kabupaten where prov_id='+selectItem.id+' order by name',undefined)
        .then(function(data){
            $scope.arr.kab_id = data.data
        })
    }

    $scope.getKecamatan = function(selectItem){
        queryService.get('select id,name from ref_kecamatan where kab_id='+selectItem.id+' order by name',undefined)
        .then(function(data){
            $scope.arr.kec_id = data.data
        })
    }

    $scope.getKelurahan = function(selectItem){
        queryService.get('select id,name from ref_desa where kec_id='+selectItem.id+' order by name',undefined)
        .then(function(data){
            $scope.arr.kel_id = data.data
        })
    }

	$scope.changeCode=function (){
		$scope.change=true
		queryService.post('select curr_item_code(\'supplier\',\''+$scope.selected.supplier_type.selected.code+'\') as code',undefined)
		.then(function(data){
			$scope.supplier.code = data.data[0].code
		})
	}
})
