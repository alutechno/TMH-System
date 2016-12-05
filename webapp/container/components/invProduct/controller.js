
var userController = angular.module('app', []);
userController
.controller('InvProductCtrl',
function($scope, $state, $sce, productService, productCategoryService, productUnitService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

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
        id: '',
        code: '',
        barcode: '',
        name: '',
        description: '',
        status: '',
        is_pr: '',
        is_ml: '',
        category_id: '',
        unit_type_id: '',
        available_stock: ''
    }

    $scope.selected = {
        status: {},
        pr: {},
        ml: {},
        cat: {},
        unit: {}
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

    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apiinv/getProducts',
        type: 'GET',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.customSearch = $scope.filterVal.search;
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
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('barcode').withTitle('Barcode'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('description').withTitle('Description'),
        DTColumnBuilder.newColumn('status').withTitle('Status'),
        DTColumnBuilder.newColumn('is_pr').withTitle('Is PR'),
        DTColumnBuilder.newColumn('is_ml').withTitle('Is ML'),
        DTColumnBuilder.newColumn('category_name').withTitle('Category'),
        DTColumnBuilder.newColumn('unit_name').withTitle('Unit')
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

    $scope.submit = function(){
        console.log('submit')
        if ($scope.product.id.length==0){
            //exec creation

            $scope.product.status = $scope.selected.status.selected.id;
            $scope.product.is_pr = $scope.selected.pr.selected.id;
            $scope.product.is_ml = $scope.selected.ml.selected.id;
            $scope.product.category_id = $scope.selected.cat.selected.id;
            $scope.product.unit_type_id = $scope.selected.unit.selected.id;

            productService.create($scope.product)
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
                    message: 'Error Insert: '+err.desc.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })

        }
        else {
            //exec update
            $scope.product.status = $scope.selected.status.selected.id;
            $scope.product.is_pr = $scope.selected.pr.selected.id;
            $scope.product.is_ml = $scope.selected.ml.selected.id;
            $scope.product.category_id = $scope.selected.cat.selected.id;
            $scope.product.unit_type_id = $scope.selected.unit.selected.id;

            productService.update($scope.product)
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
        productService.get(obj.id)
        .then(function(result){
            $scope.product.id = result.data[0].id
            $scope.product.code = result.data[0].code
            $scope.product.barcode = result.data[0].barcode
            $scope.product.name = result.data[0].name
            $scope.product.description = result.data[0].description
            $scope.product.status = result.data[0].status
            $scope.product.is_pr = result.data[0].is_pr
            $scope.product.is_ml = result.data[0].is_ml
            $scope.product.category_id = result.data[0].category_id
            $scope.product.unit_type_id = result.data[0].unit_type_id
            $scope.product.available_stock = result.data[0].available_stock

            $scope.selected.status.selected = {name: result.data[0].status == 1 ? 'Yes' : 'No' , id: result.data[0].status}
            $scope.selected.pr.selected = {name: result.data[0].is_pr == 1 ? 'Yes' : 'No' , id: result.data[0].is_pr}
            $scope.selected.ml.selected = {name: result.data[0].is_ml == 1 ? 'Yes' : 'No' , id: result.data[0].is_ml}

            for (var i = $scope.categories.length - 1; i >= 0; i--) {
                if ($scope.categories[i].id == result.data[0].category_id){
                    $scope.selected.cat.selected = {name: $scope.categories[i].name, id: $scope.categories[i].id}
                }
            };
            for (var i = $scope.units.length - 1; i >= 0; i--) {
                if ($scope.units[i].id == result.data[0].unit_type_id){
                    $scope.selected.unit.selected = {name: $scope.units[i].name, id: $scope.units[i].id}
                }
            };

        })



    }

    $scope.delete = function(obj){
        $scope.product.id = obj.id;
        productService.get(obj.id)
        .then(function(result){
            $scope.product.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        productService.delete($scope.product)
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
            id: '',
            code: '',
            barcode: '',
            name: '',
            description: '',
            status: '',
            is_pr: '',
            is_ml: '',
            category_id: '',
            unit_type_id: '',
            available_stock: ''
        }
    }

})
