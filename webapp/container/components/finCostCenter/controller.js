
var userController = angular.module('app', []);
userController
.controller('FinCostCenterCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

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

    $scope.ccs = {}
    $scope.id = '';
    $scope.cc = {
        id: '',
        code: '',
        name: '',
        category_id: '',
        description: '',
        account_id: '',
        status: ''
    }

    $scope.selected = {
        status: {},
        category: {},
        account_id: {}
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

    $scope.opt_account_id = []
    queryService.post('select id,name from mst_ledger_account order by name',undefined)
    .then(function(data){
        $scope.opt_account_id = data.data
    })

    $scope.ccTypes = []
    queryService.post('select id,name from ref_cost_center_type where status != 2 order by name',undefined)
    .then(function(data){
        $scope.ccTypes = data.data
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
        $scope.ccs[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(ccs[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(ccs[\'' + data + '\'])" )"="">' +
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

    var qstring = "select a.id,a.code,a.name,a.description,a.status, "+
                    "a.category_id, b.name as category_name, a.account_id, c.name as account_name "+
                    "from mst_cost_center a, ref_cost_center_type b, mst_ledger_account c "+
                    "where a.status!=2 and a.category_id = b.id "+
                    "and a.account_id = c.id "
    var qwhere = ''

    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apisql/datatable',
        type: 'GET',
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

    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('category_name').withTitle('Category'),
        DTColumnBuilder.newColumn('account_name').withTitle('Account'),
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
        // console.log($scope.contract)
        if ($scope.cc.id.length==0){
            //exec creation

            $scope.cc.category_id = $scope.selected.category.selected.id;
            $scope.cc.status = $scope.selected.status.selected.id;
            $scope.cc.account_id = $scope.selected.account_id.selected.id;

            var query = "insert into mst_cost_center set ?";

            queryService.post(query,$scope.cc)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.cc.name,
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
            $scope.cc.category_id = $scope.selected.category.selected.id;
            $scope.cc.status = $scope.selected.status.selected.id;
            $scope.cc.account_id = $scope.selected.account_id.selected.id;

            var query = "update mst_cost_center set ? where id = "+$scope.cc.id;

            queryService.post(query,$scope.cc)
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

        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){

            $scope.cc.id = result.data[0].id
            $scope.cc.code = result.data[0].code
            $scope.cc.name = result.data[0].name
            $scope.cc.description = result.data[0].description
            $scope.cc.status = result.data[0].status
            $scope.cc.category_id = result.data[0].category_id
            $scope.cc.account_id = result.data[0].account_id
            $scope.selected.status.selected = {name: result.data[0].status == 1 ? 'Yes' : 'No' , id: result.data[0].status}

            for (var i = $scope.ccTypes.length - 1; i >= 0; i--) {
                if ($scope.ccTypes[i].id == result.data[0].category_id){
                    $scope.selected.category.selected = {name: $scope.ccTypes[i].name, id: $scope.ccTypes[i].id}
                }
            };

            for (var i = $scope.opt_account_id.length - 1; i >= 0; i--) {
                if ($scope.opt_account_id[i].id == result.data[0].account_id){
                    $scope.selected.account_id.selected = {name: $scope.opt_account_id[i].name, id: $scope.opt_account_id[i].id}
                }
            };

        })

    }

    $scope.delete = function(obj){
        $scope.cc.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.cc.code = result.data[0].code;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        var query = "update mst_cost_center set status=2 where id = "+$scope.cc.id;

        queryService.post(query,$scope.cc)
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
        $scope.cc = {
            id: '',
            code: '',
            name: '',
            account_id: '',
            category_id: '',
            description: '',
            status: ''
        }
    }

})
