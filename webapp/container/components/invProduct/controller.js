
var userController = angular.module('app', []);
userController
.controller('InvProductCtrl',
function($scope, $state, $sce, queryService, globalFunction, productService, productCategoryService, productSubCategoryService, productUnitService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.products = {}
    $scope.id = '';
    $scope.product = {
        id:'',
        category_id: '',
        subcategory_id: '',
        code: '',
        barcode: '',
        status: '',
        name: '',
        description: '',
        is_stockable: '',
        unit_type_id: '',
        price_per_unit: '',
        recipe_unit_type_id: '',
        recipe_unit_conversion: '',
        price_per_recipe_unit: '',
        lowest_unit_type_id: '',
        lowest_unit_conversion: '',
        price_per_lowest_unit: '',
        minimum_stock: '',
        maximum_stock: '',
        is_ml: '',
        is_pr: '',
        is_production: {},
        is_material: {},
        created_by: '',
        created_date: ''
    }

    $scope.selected = {
        category_id: {},
        subcategory_id: {},
        is_stockable: {},
        is_pr: {},
        is_ml: {},
        is_production: {},
        is_material: {},
        unit_type_id: {},
        recipe_unit_type_id: {},
        lowest_unit_type_id: {},
        status: {}
    }

    $scope.arr = {
        active: [],
        status: [],
        category_id: [],
        subcategory_id: [],
        unit_type_id: [],
        recipe_unit_type_id: [],
        lowest_unit_type_id: []
    }

    $scope.arr.active = [
        {id: 'Y', name: 'Yes'},
        {id: 'N', name: 'No'}
    ]

    $scope.arr.status = []
    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc',undefined)
    .then(function(data){
        $scope.arr.status = data.data
    })

    $scope.arr.category_id = []
    queryService.get('select id,name from ref_product_category where status != 2 order by name asc',undefined)
    .then(function(data){
        $scope.arr.category_id = data.data
    })

    $scope.arr.subcategory_id = []

    $scope.arr.unit_type_id = []
    //queryService.get('select id,name from ref_product_unit where status != 2 and is_recipe_unit = \'N\' order by name asc',undefined)
    queryService.get('select id,name from ref_product_unit where status != 2 order by name asc',undefined)
    .then(function(data){
        $scope.arr.unit_type_id = data.data
    })

    $scope.arr.recipe_unit_type_id = []
    //queryService.get('select id,name from ref_product_unit where status != 2 and is_recipe_unit = \'Y\' order by name asc',undefined)
    queryService.get('select id,name from ref_product_unit where status != 2 order by name asc',undefined)
    .then(function(data){
        $scope.arr.recipe_unit_type_id = data.data
    })

    $scope.arr.lowest_unit_type_id = []
    //queryService.get('select id,name from ref_product_unit where status != 2 and is_recipe_unit = \'Y\' order by name asc',undefined)
    queryService.get('select id,name from ref_product_unit where status != 2 order by name asc',undefined)
    .then(function(data){
        $scope.arr.lowest_unit_type_id = data.data
    })

    $scope.setUnit =function(e) {
        console.log(e)

        if (!$scope.selected.recipe_unit_type_id.selected){
            $scope.selected.recipe_unit_type_id['selected'] = {
                id: e.id,
                name: e.name
            }
            $scope.product.recipe_unit_conversion = 1
        }
        if (!$scope.selected.lowest_unit_type_id.selected){
            $scope.selected.lowest_unit_type_id['selected'] = {
                id: e.id,
                name: e.name
            }
            $scope.product.lowest_unit_conversion = 1
        }
    }
    $scope.setPriceUnit = function(){

        $scope.product.price_per_lowest_unit = $scope.product.price_per_unit*($scope.product.lowest_unit_conversion==''?1:$scope.product.lowest_unit_conversion)
        $scope.product.price_per_recipe_unit = $scope.product.price_per_unit*($scope.product.recipe_unit_conversion==''?1:$scope.product.recipe_unit_conversion)


        /*if ($scope.product.price_per_lowest_unit==''){
            $scope.product.price_per_lowest_unit = $scope.product.price_per_unit
        }
        else if ($scope.product.price_per_lowest_unit!=''){
            $scope.product.price_per_lowest_unit = $scope.product.price_per_unit*$scope.product.lowest_unit_conversion
        }
        if ($scope.product.price_per_recipe_unit==''){
            $scope.product.price_per_recipe_unit = $scope.product.price_per_unit
        }*/

    }
    $scope.setConversion = function(e){
        console.log(e)


        if (e=='lowest'){
            $scope.product.price_per_lowest_unit = $scope.product.price_per_unit*$scope.product.lowest_unit_conversion
        }
        if (e=='recipe'){
            $scope.product.price_per_recipe_unit = $scope.product.price_per_unit*$scope.product.recipe_unit_conversion
        }

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
        $scope.products[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(products[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(products[\'' + data + '\'])" )"="">' +
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

    var qstring = "select a.*,b.name as category,c.name as subcategory,d.name as unit_name,a.price_per_unit as unit_price,g.status_name, "
                +"if(a.is_stockable = 'Y','Yes','No') as stockable, "
                +"if(a.is_pr = 'Y','Yes','No') as pr, "
                +"if(a.is_ml = 'Y','Yes','No') as ml, "
                +"if(a.is_production = 'Y','Yes','No') as production, "
                +"if(a.is_material = 'Y','Yes','No') as material "
                +"from mst_product a "
                +"left join ref_product_category b on a.category_id=b.id "
                +"left join ref_product_subcategory c on a.subcategory_id = c.id "
                +"left join ref_product_unit d on a.unit_type_id = d.id "
                +"left join ref_product_unit e on a.recipe_unit_type_id = e.id "
                +"left join ref_product_unit f on a.lowest_unit_type_id = f.id "
                +"left join (select id as status_id, value as status_value,name as status_name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\') g on a.status = g.status_value "
                +"where a.status!=2 "
    var qwhere = ""


    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'POST',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.query = qstring + qwhere
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
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('category').withTitle('Category'),
        DTColumnBuilder.newColumn('subcategory').withTitle('Sub Category'),
        DTColumnBuilder.newColumn('stockable').withTitle('Stockable'),
        DTColumnBuilder.newColumn('unit_name').withTitle('Unit'),
        DTColumnBuilder.newColumn('unit_price').withTitle('Price'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' and lower(a.name) like "%'+$scope.filterVal.search.toLowerCase()+'%"'
                else qwhere = ''
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

    /*END AD ServerSide*/

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
    }

// console.log($localStorage.currentUser)

    $scope.submit = function(){
        if ($scope.product.id.length==0){
            //exec creation

            $scope.product.category_id = $scope.selected.category_id.selected.id;
            $scope.product.subcategory_id = $scope.selected.subcategory_id.selected.id;
            $scope.product.is_stockable = $scope.selected.is_stockable.selected.id;
            $scope.product.is_pr = $scope.selected.is_pr.selected.id;
            $scope.product.is_ml = $scope.selected.is_ml.selected.id;
            //$scope.product.is_production = $scope.selected.is_production.selected.id;
            //$scope.product.is_material = $scope.selected.is_material.selected.id;
            $scope.product.unit_type_id = $scope.selected.unit_type_id.selected.id;
            $scope.product.recipe_unit_type_id = $scope.selected.recipe_unit_type_id.selected.id;
            $scope.product.lowest_unit_type_id = $scope.selected.lowest_unit_type_id.selected.id;
            $scope.product.status = $scope.selected.status.selected.id;
            $scope.product.created_by = $localStorage.currentUser.name.id;
            $scope.product.created_date = globalFunction.currentDate();
            //$scope.product.lowest_unit_conversion = $scope.selected.lowest_unit_type_id.selected.id;
            //$scope.product.recipe_unit_conversion = $scope.selected.recipe_unit_type_id.selected.id;
            //delete $scope.product.id
            console.log($scope.product)

            var query = "insert into mst_product set ?";

            queryService.post(query,$scope.product)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.product.name,
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

        }
        else {
            //exec update

            $scope.product.category_id = $scope.selected.category_id.selected.id;
            $scope.product.subcategory_id = $scope.selected.subcategory_id.selected.id;
            $scope.product.is_stockable = $scope.selected.is_stockable.selected.id;
            $scope.product.is_pr = $scope.selected.is_pr.selected.id;
            $scope.product.is_ml = $scope.selected.is_ml.selected.id;
            //$scope.product.is_production = $scope.selected.is_production.selected.id;
            //$scope.product.is_material = $scope.selected.is_material.selected.id;
            $scope.product.unit_type_id = $scope.selected.unit_type_id.selected.id;
            $scope.product.recipe_unit_type_id = $scope.selected.recipe_unit_type_id.selected.id;
            $scope.product.lowest_unit_type_id = $scope.selected.lowest_unit_type_id.selected.id;
            $scope.product.status = $scope.selected.status.selected.id;
            $scope.product['modified_by'] = $localStorage.currentUser.name.id;
            $scope.product['modified_date'] = globalFunction.currentDate();

            console.log($scope.product)
            var query = "update mst_product set ? where id = " + $scope.product.id;

            queryService.post(query,$scope.product)
            .then(function (result){
                if (result.status = "200"){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){}, false)
                    $scope.clear()
                }
                else {
                    console.log('Failed Update')
                }
            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        $scope.clear()

        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.product.id = result.data[0].id
            $scope.product.category_id = result.data[0].category_id
            $scope.product.subcategory_id = result.data[0].subcategory_id
            $scope.product.name = result.data[0].name
            $scope.product.description = result.data[0].description
            $scope.product.code = result.data[0].code
            $scope.product.barcode = result.data[0].barcode
            $scope.product.status = result.data[0].status
            $scope.product.is_pr = result.data[0].is_pr
            $scope.product.is_ml = result.data[0].is_ml
            $scope.product.is_production = result.data[0].is_production
            $scope.product.is_material = result.data[0].is_material
            $scope.product.unit_type_id = result.data[0].unit_type_id
            $scope.product.price_per_unit = result.data[0].price_per_unit
            $scope.product.is_stockable = result.data[0].is_stockable
            $scope.product.recipe_unit_type_id = result.data[0].recipe_unit_type_id
            $scope.product.recipe_unit_conversion = result.data[0].recipe_unit_conversion
            $scope.product.price_per_recipe_unit = result.data[0].price_per_recipe_unit
            $scope.product.lowest_unit_type_id = result.data[0].lowest_unit_type_id
            $scope.product.lowest_unit_conversion = result.data[0].lowest_unit_conversion
            $scope.product.price_per_lowest_unit = result.data[0].price_per_lowest_unit
            $scope.product.minimum_stock = result.data[0].minimum_stock
            $scope.product.maximum_stock = result.data[0].maximum_stock
            $scope.product.created_by = result.data[0].created_by
            $scope.product.created_date = result.data[0].created_date

            $scope.selected.is_stockable.selected = {name: result.data[0].is_stockable == 'Y' ? 'Yes' : 'No' , id: result.data[0].is_stockable}
            $scope.selected.is_pr.selected = {name: result.data[0].is_pr == 'Y' ? 'Yes' : 'No' , id: result.data[0].is_pr}
            $scope.selected.is_ml.selected = {name: result.data[0].is_ml == 'Y' ? 'Yes' : 'No' , id: result.data[0].is_ml}
            $scope.selected.is_production.selected = {name: result.data[0].is_production == 'Y' ? 'Yes' : 'No' , id: result.data[0].is_production}
            $scope.selected.is_material.selected = {name: result.data[0].is_material == 'Y' ? 'Yes' : 'No' , id: result.data[0].is_material}

            for (var i = $scope.arr.status.length - 1; i >= 0; i--) {
                if ($scope.arr.status[i].id == result.data[0].status){
                    $scope.selected.status.selected = {name: $scope.arr.status[i].name, id: $scope.arr.status[i].id}
                }
            }
            for (var i = $scope.arr.category_id.length - 1; i >= 0; i--) {
                if ($scope.arr.category_id[i].id == result.data[0].category_id){
                    $scope.selected.category_id.selected = {name: $scope.arr.category_id[i].name, id: $scope.arr.category_id[i].id}
                }
            }
            $scope.getSubCategory({id:$scope.product.category_id})

            /*for (var i = $scope.arr.subcategory_id.length - 1; i >= 0; i--) {
                if ($scope.arr.subcategory_id[i].id == result.data[0].subcategory_id){
                    $scope.selected.subcategory_id.selected = {name: $scope.arr.subcategory_id[i].name, id: $scope.arr.subcategory_id[i].id}
                }
            }*/
            $scope.selected.subcategory_id.selected = {name: result.data[0].subcategory, id: result.data[0].subcategory_id}

            for (var i = $scope.arr.unit_type_id.length - 1; i >= 0; i--) {
                if ($scope.arr.unit_type_id[i].id == result.data[0].unit_type_id){
                    $scope.selected.unit_type_id.selected = {name: $scope.arr.unit_type_id[i].name, id: $scope.arr.unit_type_id[i].id}
                }
            }
            for (var i = $scope.arr.recipe_unit_type_id.length - 1; i >= 0; i--) {
                if ($scope.arr.recipe_unit_type_id[i].id == result.data[0].recipe_unit_type_id){
                    $scope.selected.recipe_unit_type_id.selected = {name: $scope.arr.recipe_unit_type_id[i].name, id: $scope.arr.recipe_unit_type_id[i].id}
                }
                if ($scope.arr.recipe_unit_type_id[i].id == result.data[0].lowest_unit_type_id){
                    $scope.selected.lowest_unit_type_id.selected = {name: $scope.arr.recipe_unit_type_id[i].name, id: $scope.arr.recipe_unit_type_id[i].id}
                }
            }

        })

    }

    $scope.delete = function(obj){
        $scope.product.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.product.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update mst_product set status=2, '+
        ' modified_by='+$localStorage.currentUser.name.id+
        ' ,modified_date=\''+globalFunction.currentDate()+'\''+
        '  where id='+$scope.product.id,undefined)
        .then(function (result){
            if (result.status = "200"){
                $('#form-input').modal('hide')
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
        $scope.product = {
            id:'',
            category_id: '',
            subcategory_id: '',
            code: '',
            barcode: '',
            status: '',
            name: '',
            description: '',
            is_stockable: '',
            unit_type_id: '',
            price_per_unit: '',
            recipe_unit_type_id: '',
            recipe_unit_conversion: '',
            price_per_recipe_unit: '',
            lowest_unit_type_id: '',
            lowest_unit_conversion: '',
            price_per_lowest_unit: '',
            minimum_stock: '',
            maximum_stock: '',
            is_ml: '',
            is_pr: '',
            is_production: {},
            is_material: {},
            created_by: '',
            created_date: ''
        }
        $scope.selected = {
            category_id: {},
            subcategory_id: {},
            is_stockable: {},
            is_pr: {},
            is_ml: {},
            is_production: {},
            is_material: {},
            unit_type_id: {},
            recipe_unit_type_id: {},
            lowest_unit_type_id: {},
            status: {}
        }
    }

    $scope.getSubCategory = function(selectItem){
        // console.log(selectItem)
        queryService.get('select id,name from ref_product_subcategory where category_id='+selectItem.id+' order by name',undefined)
        .then(function(data){
            $scope.arr.subcategory_id = data.data
        })
    }

})
