
var userController = angular.module('app', []);
userController
.controller('FinAccTypeCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    var qstring = 'select a.*,b.name status_name from ref_ledger_account_type a, '+
        '(select * from table_ref where table_name = \'ref_product_category\' and column_name = \'status\') b '+
        'where a.status = b.value and a.status!=2 '
    var qwhere = ''
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
                '<button class="btn btn-default" title="Update" ng-click="update(accountTypes[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(accountTypes[\'' + data + '\'])" )"="">' +
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
        DTColumnBuilder.newColumn('description').withTitle('Description'),
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
        $('#acc_code').prop('disabled', false)

    }

    $scope.submit = function(){
        if ($scope.accountType.id.length==0){
            //exec creation

            $scope.accountType.code = $scope.accountType.code;
            $scope.accountType.name = $scope.accountType.name;
            $scope.accountType.description = $scope.accountType.description;
            $scope.accountType.status = $scope.selected.accountType.selected.id;
            var param = {
                code: $scope.accountType.code,
                name: $scope.accountType.name,
                description: $scope.accountType.description,
                status: $scope.selected.accountType.selected.id,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }

            queryService.post('insert into ref_ledger_account_type SET ?',param)
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

            var param = {
                code: $scope.accountType.code,
                name: $scope.accountType.name,
                description: $scope.accountType.description,
                status: $scope.selected.accountType.selected.id,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }

            queryService.post('update ref_ledger_account_type SET ? WHERE id='+$scope.accountType.id ,param)
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

        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
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
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.accountType.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update ref_ledger_account_type SET status=\'2\' ,'+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.accountType.id ,undefined)
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
