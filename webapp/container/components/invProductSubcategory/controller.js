
var userController = angular.module('app', []);
userController
.controller('InvProductSubcategoryCtrl',
function($scope, $state, $sce, productSubCategoryService, productCategoryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

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

    $scope.cats = {}
    $scope.id = '';
    $scope.cat = {
        id: '',
        category_id: '',
        name: '',
        description: '',
        status: ''
    }

    $scope.selected = {
        status: {},
        category_id: {}
    }

    $scope.arrActive = [
        {
            id: 1,
            name: 'Yes'
        },
        {
            id: 0,
            name: 'No'
        }
    ]

    $scope.categories = []
    productCategoryService.get()
    .then(function(data){
        $scope.categories = data.data
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
        $scope.cats[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(cats[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(cats[\'' + data + '\'])" )"="">' +
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
        url: API_URL+'/apiinv/getProductSubcategories',
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
        DTColumnBuilder.newColumn('category_name').withTitle('Category'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('description').withTitle('Description'),
        DTColumnBuilder.newColumn('status').withTitle('Status')
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
        if ($scope.cat.id.length==0){
            //exec creation
            $scope.cat.status = $scope.selected.status.selected.id;
            $scope.cat.category_id = $scope.selected.category_id.selected.id;

            productSubCategoryService.create($scope.cat)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.cat.name,
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
            $scope.cat.status = $scope.selected.status.selected.id;
            $scope.cat.category_id = $scope.selected.category_id.selected.id;

            productSubCategoryService.update($scope.cat)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Update')
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
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
        $scope.cat.id = obj.id

        productSubCategoryService.get(obj.id)
        .then(function(result){

            $scope.cat.category_id = result.data[0].category_id
            $scope.cat.name = result.data[0].name
            $scope.cat.description = result.data[0].description
            $scope.cat.status = result.data[0].status
            $scope.selected.status.selected = {name: result.data[0].status == 1 ? 'Yes' : 'No' , id: result.data[0].status}
            for (var i = $scope.categories.length - 1; i >= 0; i--) {
                if ($scope.categories[i].id == result.data[0].category_id){
                    $scope.selected.category_id.selected = {name: $scope.categories[i].name, id: $scope.categories[i].id}
                }
            }

        })
    }

    $scope.delete = function(obj){
        $scope.cat.id = obj.id;
        //$scope.customer.name = obj.name;
        productSubCategoryService.get(obj.id)
        .then(function(result){
            $scope.cat.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        productSubCategoryService.delete($scope.cat)
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
        $scope.cat = {
            id: '',
            category_id: '',
            name: '',
            description: '',
            status: ''
        }
    }

})
