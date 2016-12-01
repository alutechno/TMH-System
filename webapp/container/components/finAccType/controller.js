
var userController = angular.module('app', []);
userController
.controller('FinAccTypeCtrl',
function($scope, $state, $sce, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

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

    $scope.id = '';
    $scope.accountType = {
        id: '',
        code: '',
        name: '',
        description: '',
        status: ''
    }

    $scope.accountTypes = {}

    $scope.selected = {
        accountType: {}
    }

    $scope.filterVal = {
        search: ''
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

    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.accountTypes[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(accountTypes[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(accountTypes[\'' + data + '\'])" )"="">' +
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
        url: API_URL+'/apifin/getAccountTypes',
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
        $('#acc_code').prop('disabled', false)

    }

    $scope.submit = function(){
        if ($scope.accountType.id.length==0){
            //exec creation

            $scope.accountType.code = $scope.accountType.code;
            $scope.accountType.name = $scope.accountType.name;
            $scope.accountType.description = $scope.accountType.description;
            $scope.accountType.status = $scope.selected.accountType.selected.id;

            accountTypeService.create($scope.accountType)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.accountType.code,
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
            $scope.accountType.name = $scope.accountType.name;
            $scope.accountType.description = $scope.accountType.description;
            $scope.accountType.status = $scope.selected.accountType.selected.id;

            accountTypeService.update($scope.accountType)
            .then(function (result){
                if (result.status = "200"){
                    // console.log('Success Update')
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                }
                else {
                    // console.log('Failed Update')
                }
            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        $('#acc_code').prop('disabled', true);

        accountTypeService.get(obj.id)
        .then(function(result){
        console.log(result)
            $scope.accountType.id = result.data[0].id
            $scope.accountType.code = result.data[0].code
            $scope.accountType.name = result.data[0].name
            $scope.accountType.description = result.data[0].description
            $scope.accountType.status = result.data[0].status
            $scope.selected.accountType.selected = {name: result.data[0].status == 1 ? 'Yes' : 'No' , id: result.data[0].status}
        })

    }

    $scope.delete = function(obj){
        $scope.accountType.id = obj.id;
        //$scope.customer.name = obj.name;
        accountTypeService.get(obj.id)
        .then(function(result){
            $scope.accountType.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        accountTypeService.delete($scope.accountType)
        .then(function (result){
            if (result.status = "200"){
                // console.log('Success Update')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
            }
            else {
                // console.log('Failed Update')
            }
        })
    }

    $scope.clear = function(){
        $scope.accountType = {
            id: '',
            code: '',
            name: '',
            description: '',
            status: ''
        }
    }

})
