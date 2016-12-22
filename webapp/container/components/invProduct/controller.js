
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
        status: '',
        name: '',
        description: '',
        is_stockable: '',
        unit_type_id: '',
        recipe_unit_type_id: '',
        recipe_unit_conversion: '',
        minimum_stock: '',
        maximum_stock: '',
        is_ml: '',
        is_pr: '',
        created_by: '',
        created_date: ''
    }

    $scope.selected = {
        category_id: {},
        subcategory_id: {},
        is_pr: {},
        is_ml: {},
        is_stockable: {},
        unit_type_id: {},
        recipe_unit_type_id: {}
    }

    $scope.arrActive = [
        {id: 1, name: 'Yes'},
        {id: 0, name: 'No'}
    ]

    $scope.categories = []
    productCategoryService.get()
    .then(function(data){
        $scope.categories = data.data
    })

    $scope.subcategories = []
    productSubCategoryService.get()
    .then(function(data){
        $scope.subcategories = data.data
    })

    $scope.units = []
    productUnitService.get()
    .then(function(data){
        $scope.units = data.data
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

    var qstring = "select a.*,b.name as category,c.name as subcategory,d.name as unit_name, e.name as recipe_unit_name, if(a.is_stockable = 1,'Yes','No') as stockable,if(a.is_pr = 1,'Yes','No') as pr,if(a.is_ml = 1,'Yes','No') as ml "+
                  "from mst_product a,ref_product_category b,ref_product_subcategory c,ref_product_unit d,ref_product_unit e "+
                  "where a.category_id=b.id and a.subcategory_id=c.id and a.unit_type_id = d.id and a.recipe_unit_type_id = e.id and a.status!=2"
    var qwhere = ''


    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'GET',
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
        DTColumnBuilder.newColumn('description').withTitle('Description'),
        DTColumnBuilder.newColumn('stockable').withTitle('Stockable'),
        DTColumnBuilder.newColumn('pr').withTitle('In PR'),
        DTColumnBuilder.newColumn('ml').withTitle('In ML'),
        DTColumnBuilder.newColumn('unit_name').withTitle('Unit'),
        DTColumnBuilder.newColumn('recipe_unit_name').withTitle('Recipe Unit'),
        DTColumnBuilder.newColumn('recipe_unit_conversion').withTitle('Conversion'),
        DTColumnBuilder.newColumn('minimum_stock').withTitle('Min Stock'),
        DTColumnBuilder.newColumn('maximum_stock').withTitle('Max Stock')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
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
        console.log('submit')
        if ($scope.product.id.length==0){
            //exec creation
            $scope.product.is_pr = $scope.selected.is_pr.selected.id;
            $scope.product.is_ml = $scope.selected.is_ml.selected.id;
            $scope.product.is_stockable = $scope.selected.is_stockable.selected.id;
            $scope.product.category_id = $scope.selected.category_id.selected.id;
            $scope.product.subcategory_id = $scope.selected.subcategory_id.selected.id;
            $scope.product.unit_type_id = $scope.selected.unit_type_id.selected.id;
            $scope.product.recipe_unit_type_id = $scope.selected.recipe_unit_type_id.selected.id;
            $scope.product.status = 1;
            $scope.product.created_by = $localStorage.currentUser.name.id;
            $scope.product.created_date = globalFunction.currentDate();

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

            $scope.product.is_pr = $scope.selected.is_pr.selected.id;
            $scope.product.is_ml = $scope.selected.is_ml.selected.id;
            $scope.product.is_stockable = $scope.selected.is_stockable.selected.id;
            $scope.product.category_id = $scope.selected.category_id.selected.id;
            $scope.product.subcategory_id = $scope.selected.subcategory_id.selected.id;
            $scope.product.unit_type_id = $scope.selected.unit_type_id.selected.id;
            $scope.product.recipe_unit_type_id = $scope.selected.recipe_unit_type_id.selected.id;

            var query = "update mst_product set ? where id = " + $scope.product.id;

            queryService.post(query,$scope.product)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Update')
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                }
                else {
                    console.log('Failed Update')
                }
            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');

        // console.log(obj)
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){

            console.log(result)

            $scope.product.id = result.data[0].id
            $scope.product.category_id = result.data[0].category_id
            $scope.product.subcategory_id = result.data[0].subcategory_id
            $scope.product.name = result.data[0].name
            $scope.product.description = result.data[0].description
            $scope.product.status = result.data[0].status

            $scope.product.is_pr = result.data[0].is_pr
            $scope.product.is_ml = result.data[0].is_ml
            $scope.product.category_id = result.data[0].category_id
            $scope.product.unit_type_id = result.data[0].unit_type_id
            $scope.product.is_stockable = result.data[0].is_stockable
            $scope.product.recipe_unit_type_id = result.data[0].recipe_unit_type_id
            $scope.product.recipe_unit_conversion = result.data[0].recipe_unit_conversion
            $scope.product.minimum_stock = result.data[0].minimum_stock
            $scope.product.maximum_stock = result.data[0].maximum_stock
            $scope.product.created_by = result.data[0].created_by
            $scope.product.created_date = result.data[0].created_date

            $scope.selected.is_stockable.selected = {name: result.data[0].is_stockable == 1 ? 'Yes' : 'No' , id: result.data[0].is_stockable}
            $scope.selected.is_pr.selected = {name: result.data[0].is_pr == 1 ? 'Yes' : 'No' , id: result.data[0].is_pr}
            $scope.selected.is_ml.selected = {name: result.data[0].is_ml == 1 ? 'Yes' : 'No' , id: result.data[0].is_ml}

            for (var i = $scope.categories.length - 1; i >= 0; i--) {
                if ($scope.categories[i].id == result.data[0].category_id){
                    $scope.selected.category_id.selected = {name: $scope.categories[i].name, id: $scope.categories[i].id}
                }
            }
            for (var i = $scope.subcategories.length - 1; i >= 0; i--) {
                if ($scope.subcategories[i].id == result.data[0].subcategory_id){
                    $scope.selected.subcategory_id.selected = {name: $scope.subcategories[i].name, id: $scope.subcategories[i].id}
                }
            }
            for (var i = $scope.units.length - 1; i >= 0; i--) {
                if ($scope.units[i].id == result.data[0].unit_type_id){
                    $scope.selected.unit_type_id.selected = {name: $scope.units[i].name, id: $scope.units[i].id}
                }
                if ($scope.units[i].id == result.data[0].recipe_unit_type_id){
                    $scope.selected.recipe_unit_type_id.selected = {name: $scope.units[i].name, id: $scope.units[i].id}
                }
            };

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
        queryService.post('update mst_product set status=2 where id='+$scope.product.id,undefined)
        .then(function (result){
            if (result.status = "200"){
                console.log('Success Delete')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
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
            status: '',
            name: '',
            description: '',
            is_stockable: '',
            unit_type_id: '',
            recipe_unit_type_id: '',
            recipe_unit_conversion: '',
            minimum_stock: '',
            maximum_stock: '',
            is_ml: '',
            is_pr: '',
            created_by: '',
            created_date: ''
        }
    }

})
