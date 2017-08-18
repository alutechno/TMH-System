
var userController = angular.module('app', []);
userController
.controller('PosMenuList',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
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
    $scope.role = {
        selected: []
    };

    $scope.table = 'inv_outlet_menus'

    var qstring = "select a.*,b.status_name "+
                    ",c.name as outlet_name,d.name as menu_class_name,e.name as menu_group_name,f.name as meal_time_name "+
                    ",g.name as product_name,h.name as recipe_name,i.name as print_kitchen_name,j.name as print_kitchen_section_name "+
                    "from "+ $scope.table +" a "+
                    "left join mst_outlet c on a.outlet_id=c.id "+
                    "left join ref_outlet_menu_class d on a.menu_class_id=d.id "+
                    "left join ref_outlet_menu_group e on a.menu_group_id=e.id "+
                    "left join ref_meal_time f on a.meal_time_id=f.id "+
                    "left join mst_product g on a.product_id=g.id "+
                    "left join mst_cuisine_recipe h on a.recipe_id=h.id "+
                    "left join mst_kitchen i on a.print_kitchen_id=i.id "+
                    "left join mst_kitchen_section j on a.print_kitchen_section_id=j.id "+
                    "left join (select id as status_id, value as status_value,name as status_name from table_ref "+
                    "where table_name = 'ref_product_category' and column_name='status' and value in (0,1)) b on a.status = b.status_value "+
                    "where a.status!=2 "
    var qwhere = ""

    $scope.rowdata = {}
    $scope.field = {
        id: '',
        code: '',
        name: '',
        short_name: '',
        description: '',
        outlet_id: '', //mst_outlet
        status: '',
        menu_class_id: '', //ref_outlet_menu_class
        menu_group_id: '', //ref_outlet_menu_group
        meal_time_id: '', //ref_meal_time
        menu_price: '',
        unit_cost: '',
        menu_type: '',
        product_id: '', //mst_product
        recipe_id: '', //mst_cuisine_recipe
        recipe_qty: '',
        is_promo_enabled: '',
        is_export_cost: '',
        is_print_after_total: '',
        is_disable_change_price: '',
        is_tax_included: '',
        print_kitchen_id: '', //mst_kitchen
        print_kitchen_section_id: '' //mst_kitchen_section
    }

    $scope.selected = {
        status: {},
        outlet_id: {},
        menu_class_id: {},
        menu_group_id: {},
        meal_time_id: {},
        product_id: {},
        recipe_id: {},
        print_kitchen_id: {},
        print_kitchen_section_id: {},
        is_promo_enabled: {},
        is_export_cost: {},
        is_print_after_total: {},
        is_disable_change_price: {},
        is_tax_included: {}
    }

    $scope.arr = {
        status: [],
        outlet_id: [],
        menu_class_id: [],
        menu_group_id: [],
        meal_time_id: [],
        product_id: [],
        recipe_id: [],
        print_kitchen_id: [],
        print_kitchen_section_id: [],
        is_promo_enabled: [],
        is_export_cost: [],
        is_print_after_total: [],
        is_disable_change_price: [],
        is_tax_included: []
    }

    $scope.arr.is_promo_enabled = $scope.arr.is_export_cost = $scope.arr.is_print_after_total = $scope.arr.is_disable_change_price = $scope.arr.is_tax_included = [
        {id: 'Y', name: 'Yes'},
        {id: 'N', name: 'No'}
    ]

    $scope.arr.status = []
    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name',undefined)
    .then(function(data){
        $scope.arr.status = data.data
    })
    $scope.arr.outlet_id = []
    queryService.get('select id,name from mst_outlet where status!=2 order by name',undefined)
    .then(function(data){
        $scope.arr.outlet_id = data.data
    })
    $scope.arr.menu_class_id = []
    queryService.get('select id,name from ref_outlet_menu_class where status!=2 order by name',undefined)
    .then(function(data){
        $scope.arr.menu_class_id = data.data
    })
    $scope.arr.menu_group_id = []
    queryService.get('select id,name from ref_outlet_menu_group where status!=2 order by name',undefined)
    .then(function(data){
        $scope.arr.menu_group_id = data.data
    })
    $scope.arr.meal_time_id = []
    queryService.get('select id,name from ref_meal_time where status!=2 order by name',undefined)
    .then(function(data){
        $scope.arr.meal_time_id = data.data
    })
    $scope.arr.product_id = []
    queryService.get('select id,name from mst_product where status!=2 order by name',undefined)
    .then(function(data){
        $scope.arr.product_id = data.data
    })
    $scope.arr.recipe_id = []
    queryService.get('select id,name from mst_cuisine_recipe where status!=2 order by name',undefined)
    .then(function(data){
        $scope.arr.recipe_id = data.data
    })
    $scope.arr.print_kitchen_id = []
    queryService.get('select id,name from mst_kitchen where status!=2 order by name',undefined)
    .then(function(data){
        $scope.arr.print_kitchen_id = data.data
    })
    $scope.arr.print_kitchen_section_id = []
    queryService.get('select id,name from mst_kitchen_section where status!=2 order by name',undefined)
    .then(function(data){
        $scope.arr.print_kitchen_section_id = data.data
    })

    $scope.focusinControl = {};
    $scope.fileName = "Menu_List";
    $scope.exportExcel = function(){

        var qexport = "select code,name,short_name,description,outlet_name,menu_class_name,menu_group_name,meal_time_name,menu_price"+
                    ",unit_cost,menu_type,product_name,recipe_name,recipe_qty,is_promo_enabled,is_export_cost,is_print_after_total"+
                    ",is_disable_change_price,is_tax_included,print_kitchen_name,print_kitchen_section_name,status_name "+
                    "from("+qstring + qwhere+")aa order by code"

        queryService.post(qexport,undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code","Name","Short Name","Description","Outlet","Menu Class","Menu Group","Meal Time","Price",
                "Unit Cost","Type","Product","Recipe","Recipe Qty","Is Promo Enable","Is Export Cost","Is Print After Total","Is Disable Change Price","Is Tax Included",
                "Print Kitchen","Print Kitchen Section","Status"]);
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
	$scope.dropzoneConfigImage = {
		parallelUploads: 1,
		maxFileSize: 10,
		url: '/uploadMenu',
		paramName: 'image',
		autoProcessQueue : true
	};

	$scope.dzCallbacks = {
		'addedfile' : function(file){
			console.log(file);
		},
		'success' : function(file, xhr){
			$scope.field.image = xhr.pth
			$scope.$apply();
		}
	};
	$scope.dz;
    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.rowdata[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(rowdata[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
				html +=
                '<button class="btn btn-default" title="Duplicate" ng-click="update(rowdata[\'' + data + '\'],1)">' +
                '   <i class="fa fa-files-o"></i>' +
                '</button>&nbsp;' ;
            }

            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(rowdata[\'' + data + '\'])" )"="">' +
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
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('outlet_name').withTitle('Outlet'),
        DTColumnBuilder.newColumn('menu_class_name').withTitle('Class'),
        DTColumnBuilder.newColumn('menu_group_name').withTitle('Group'),
        DTColumnBuilder.newColumn('menu_price').withTitle('Price'),
        DTColumnBuilder.newColumn('product_name').withTitle('Product'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) {
                    qwhere = ' and (lower(a.code) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                             ' or lower(a.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                             ' or lower(a.menu_class_name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                             ' or lower(a.menu_group_name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                             ' or lower(b.status_name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                             ' or lower(a.description) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ')'
                }else{
                    qwhere = ''
                }
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
            }
        }
        else {
            $scope.dtInstance.reloadData(function(obj){
                // console.log(obj)
            }, false)
        }
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
        if ($scope.field.id.length==0){
            //exec creation
            $scope.field.status = $scope.selected.status.selected ? $scope.selected.status.selected.id : null;
            $scope.field.outlet_id = $scope.selected.outlet_id.selected ? $scope.selected.outlet_id.selected.id : null;
            $scope.field.menu_class_id = $scope.selected.menu_class_id.selected ? $scope.selected.menu_class_id.selected.id : null;
            $scope.field.menu_group_id = $scope.selected.menu_group_id.selected ? $scope.selected.menu_group_id.selected.id : null;
            $scope.field.meal_time_id = $scope.selected.meal_time_id.selected ? $scope.selected.meal_time_id.selected.id : null;
            $scope.field.product_id = $scope.selected.product_id.selected ? $scope.selected.product_id.selected.id : null;
            $scope.field.recipe_id = $scope.selected.recipe_id.selected ? $scope.selected.recipe_id.selected.id : null;
            $scope.field.print_kitchen_id = $scope.selected.print_kitchen_id.selected ? $scope.selected.print_kitchen_id.selected.id : null;
            $scope.field.print_kitchen_section_id = $scope.selected.print_kitchen_section_id.selected ? $scope.selected.print_kitchen_section_id.selected.id : null;
            $scope.field.is_promo_enabled = $scope.selected.is_promo_enabled.selected ? $scope.selected.is_promo_enabled.selected.id : null;
            $scope.field.is_export_cost = $scope.selected.is_export_cost.selected ? $scope.selected.is_export_cost.selected.id : null;
            $scope.field.is_print_after_total = $scope.selected.is_print_after_total.selected ? $scope.selected.is_print_after_total.selected.id : null;
            $scope.field.is_disable_change_price = $scope.selected.is_disable_change_price.selected ? $scope.selected.is_disable_change_price.selected.id : null;
            $scope.field.is_tax_included = $scope.selected.is_tax_included.selected ? $scope.selected.is_tax_included.selected.id : null;
            $scope.field['created_by'] = $localStorage.currentUser.name.id;
            $scope.field['created_date'] = globalFunction.currentDate();

            queryService.post('insert into '+ $scope.table +' SET ?',$scope.field)
            .then(function (result){
				$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.field.name,
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

        }
        else {
            //exec update
            $scope.field.status = $scope.selected.status.selected ? $scope.selected.status.selected.id : null;
			$scope.field.outlet_id = $scope.selected.outlet_id.selected ? $scope.selected.outlet_id.selected.id : null;
            $scope.field.menu_class_id = $scope.selected.menu_class_id.selected ? $scope.selected.menu_class_id.selected.id : null;
            $scope.field.menu_group_id = $scope.selected.menu_group_id.selected ? $scope.selected.menu_group_id.selected.id : null;
            $scope.field.meal_time_id = $scope.selected.meal_time_id.selected ? $scope.selected.meal_time_id.selected.id : null;
            $scope.field.product_id = $scope.selected.product_id.selected ? $scope.selected.product_id.selected.id : null;
            $scope.field.recipe_id = $scope.selected.recipe_id.selected ? $scope.selected.recipe_id.selected.id : null;
            $scope.field.print_kitchen_id = $scope.selected.print_kitchen_id.selected ? $scope.selected.print_kitchen_id.selected.id : null;
            $scope.field.print_kitchen_section_id = $scope.selected.print_kitchen_section_id.selected ? $scope.selected.print_kitchen_section_id.selected.id : null;
            $scope.field.is_promo_enabled = $scope.selected.is_promo_enabled.selected ? $scope.selected.is_promo_enabled.selected.id : null;
            $scope.field.is_export_cost = $scope.selected.is_export_cost.selected ? $scope.selected.is_export_cost.selected.id : null;
            $scope.field.is_print_after_total = $scope.selected.is_print_after_total.selected ? $scope.selected.is_print_after_total.selected.id : null;
            $scope.field.is_disable_change_price = $scope.selected.is_disable_change_price.selected ? $scope.selected.is_disable_change_price.selected.id : null;
            $scope.field.is_tax_included = $scope.selected.is_tax_included.selected ? $scope.selected.is_tax_included.selected.id : null;
            $scope.field['modified_by'] = $localStorage.currentUser.name.id;
            $scope.field['modified_date'] = globalFunction.currentDate();

            queryService.post('update '+ $scope.table +' SET ? WHERE id='+$scope.field.id ,$scope.field)
            .then(function (result){
				$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.field.name,
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
                    message: 'Error Update: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })
        }
    }

    $scope.update = function(obj,flag){
        $('#form-input').modal('show');
        $scope.clear()
        if(flag==undefined)
			$scope.field.id = obj.id

        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){

            $scope.field.code = result.data[0].code
            $scope.field.name = result.data[0].name
            $scope.field.short_name = result.data[0].short_name
            $scope.field.description = result.data[0].description
            $scope.field.outlet_id = result.data[0].outlet_id
            $scope.field.status = result.data[0].status
			$scope.field.image = result.data[0].image
			$scope.field.menu_class_id = result.data[0].menu_class_id
            $scope.field.menu_group_id = result.data[0].menu_group_id
            $scope.field.meal_time_id = result.data[0].meal_time_id
            $scope.field.menu_price = result.data[0].menu_price
            $scope.field.unit_cost = result.data[0].unit_cost
            $scope.field.menu_type = result.data[0].menu_type
            $scope.field.product_id = result.data[0].product_id
            $scope.field.recipe_id = result.data[0].recipe_id
            $scope.field.recipe_qty = result.data[0].recipe_qty
            $scope.field.is_promo_enabled = result.data[0].is_promo_enabled
            $scope.field.is_export_cost = result.data[0].is_export_cost
            $scope.field.is_print_after_total = result.data[0].is_print_after_total
            $scope.field.is_disable_change_price = result.data[0].is_disable_change_price
            $scope.field.is_tax_included = result.data[0].is_tax_included
            $scope.field.print_kitchen_id = result.data[0].print_kitchen_id
            $scope.field.print_kitchen_section_id = result.data[0].print_kitchen_section_id
            for (var i = $scope.arr.status.length - 1; i >= 0; i--) {
                if ($scope.arr.status[i].id == result.data[0].status){
                    $scope.selected.status.selected = {name: $scope.arr.status[i].name, id: $scope.arr.status[i].id}
                }
            }
            for (var i = $scope.arr.outlet_id.length - 1; i >= 0; i--) {
                if ($scope.arr.outlet_id[i].id == result.data[0].outlet_id){
                    $scope.selected.outlet_id.selected = {name: $scope.arr.outlet_id[i].name, id: $scope.arr.outlet_id[i].id}
                }
            }
            for (var i = $scope.arr.menu_class_id.length - 1; i >= 0; i--) {
                if ($scope.arr.menu_class_id[i].id == result.data[0].menu_class_id){
                    $scope.selected.menu_class_id.selected = {name: $scope.arr.menu_class_id[i].name, id: $scope.arr.menu_class_id[i].id}
                }
            }
            for (var i = $scope.arr.menu_group_id.length - 1; i >= 0; i--) {
                if ($scope.arr.menu_group_id[i].id == result.data[0].menu_group_id){
                    $scope.selected.menu_group_id.selected = {name: $scope.arr.menu_group_id[i].name, id: $scope.arr.menu_group_id[i].id}
                }
            }
            for (var i = $scope.arr.meal_time_id.length - 1; i >= 0; i--) {
                if ($scope.arr.meal_time_id[i].id == result.data[0].meal_time_id){
                    $scope.selected.meal_time_id.selected = {name: $scope.arr.meal_time_id[i].name, id: $scope.arr.meal_time_id[i].id}
                }
            }
            for (var i = $scope.arr.product_id.length - 1; i >= 0; i--) {
                if ($scope.arr.product_id[i].id == result.data[0].product_id){
                    $scope.selected.product_id.selected = {name: $scope.arr.product_id[i].name, id: $scope.arr.product_id[i].id}
                }
            }
            for (var i = $scope.arr.recipe_id.length - 1; i >= 0; i--) {
                if ($scope.arr.recipe_id[i].id == result.data[0].recipe_id){
                    $scope.selected.recipe_id.selected = {name: $scope.arr.recipe_id[i].name, id: $scope.arr.recipe_id[i].id}
                }
            }
            for (var i = $scope.arr.print_kitchen_id.length - 1; i >= 0; i--) {
                if ($scope.arr.print_kitchen_id[i].id == result.data[0].print_kitchen_id){
                    $scope.selected.print_kitchen_id.selected = {name: $scope.arr.print_kitchen_id[i].name, id: $scope.arr.print_kitchen_id[i].id}
                }
            }
            for (var i = $scope.arr.print_kitchen_section_id.length - 1; i >= 0; i--) {
                if ($scope.arr.print_kitchen_section_id[i].id == result.data[0].print_kitchen_section_id){
                    $scope.selected.print_kitchen_section_id.selected = {name: $scope.arr.print_kitchen_section_id[i].name, id: $scope.arr.print_kitchen_section_id[i].id}
                }
            }
            for (var i = $scope.arr.is_promo_enabled.length - 1; i >= 0; i--) {
                if ($scope.arr.is_promo_enabled[i].id == result.data[0].is_promo_enabled){
                    $scope.selected.is_promo_enabled.selected = {name: $scope.arr.is_promo_enabled[i].name, id: $scope.arr.is_promo_enabled[i].id}
                }
            }
            for (var i = $scope.arr.is_export_cost.length - 1; i >= 0; i--) {
                if ($scope.arr.is_export_cost[i].id == result.data[0].is_export_cost){
                    $scope.selected.is_export_cost.selected = {name: $scope.arr.is_export_cost[i].name, id: $scope.arr.is_export_cost[i].id}
                }
            }
            for (var i = $scope.arr.is_print_after_total.length - 1; i >= 0; i--) {
                if ($scope.arr.is_print_after_total[i].id == result.data[0].is_print_after_total){
                    $scope.selected.is_print_after_total.selected = {name: $scope.arr.is_print_after_total[i].name, id: $scope.arr.is_print_after_total[i].id}
                }
            }
            for (var i = $scope.arr.is_disable_change_price.length - 1; i >= 0; i--) {
                if ($scope.arr.is_disable_change_price[i].id == result.data[0].is_disable_change_price){
                    $scope.selected.is_disable_change_price.selected = {name: $scope.arr.is_disable_change_price[i].name, id: $scope.arr.is_disable_change_price[i].id}
                }
            }
            for (var i = $scope.arr.is_tax_included.length - 1; i >= 0; i--) {
                if ($scope.arr.is_tax_included[i].id == result.data[0].is_tax_included){
                    $scope.selected.is_tax_included.selected = {name: $scope.arr.is_tax_included[i].name, id: $scope.arr.is_tax_included[i].id}
                }
            }

        })
    }

    $scope.delete = function(obj){
        $scope.field.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.field.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update '+ $scope.table +' set status=2, '+
        ' modified_by='+$localStorage.currentUser.name.id+
        ' ,modified_date=\''+globalFunction.currentDate()+'\''+
        '  where id='+$scope.field.id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.field.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
                $scope.clear()
        },
        function (err){
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Delete: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })
    }

    $scope.clear = function(){
        $scope.field = {
            id: '',
            code: '',
            name: '',
            short_name: '',
            description: '',
            outlet_id: '', //mst_outlet
            status: '',
            menu_class_id: '', //ref_outlet_menu_class
            menu_group_id: '', //ref_outlet_menu_group
            meal_time_id: '', //ref_meal_time
            menu_price: '',
            unit_cost: '',
            menu_type: '',
            product_id: '', //mst_product
            recipe_id: '', //mst_cuisine_recipe
            recipe_qty: '',
            is_promo_enabled: '',
            is_export_cost: '',
            is_print_after_total: '',
            is_disable_change_price: '',
            is_tax_included: '',
            print_kitchen_id: '', //mst_kitchen
            print_kitchen_section_id: '', //mst_kitchen_section
            image: ''
        }

        $scope.selected = {
            status: {},
            outlet_id: {},
            menu_class_id: {},
            menu_group_id: {},
            meal_time_id: {},
            product_id: {},
            recipe_id: {},
            print_kitchen_id: {},
            print_kitchen_section_id: {},
            is_promo_enabled: {},
            is_export_cost: {},
            is_print_after_total: {},
            is_disable_change_price: {},
            is_tax_included: {}
        }
    }

})
