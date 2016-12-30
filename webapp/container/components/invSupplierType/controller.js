
var userController = angular.module('app', []);
userController
.controller('InvSupplierTypeCtrl',
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
    var qstring = "select a.*,b.name as payable,c.name as deposit,d.status_name "+
                    "from ref_supplier_type a "+
                    "left join mst_ledger_account b on a.payable_account_id = b.id "+
                    "left join mst_ledger_account c on a.deposit_account_id=c.id "+
                    "left join (select id as status_id, value as status_value,name as status_name from table_ref "+
                    "where table_name = 'ref_product_category' and column_name='status' and value in (0,1)) d on a.status = d.status_value "+
                    "where a.status!=2 "
    var qwhere = ""

    $scope.role = {
        selected: []
    };

    $scope.suptypes = {}
    $scope.suptype = {
        id: '',
        name: '',
        description: '',
        payable_account_id: '',
        deposit_account_id: '',
        status: ''
    }

    $scope.selected = {
        status: {},
        payable_account_id: {},
        deposit_account_id: {}
    }

    $scope.arr = {
        status: [],
        accounts: []
    }

    $scope.arr.status = []
    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1)',undefined)
    .then(function(data){
        $scope.arr.status = data.data
    })

    $scope.arr.accounts = []
    queryService.get('select id,name from mst_ledger_account',undefined)
    .then(function(data){
        $scope.arr.accounts = data.data
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
        $scope.suptypes[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(suptypes[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(suptypes[\'' + data + '\'])" )"="">' +
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
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('payable').withTitle('Payable'),
        DTColumnBuilder.newColumn('deposit').withTitle('Deposit')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) {
                    qwhere += ' and (a.code like "%'+$scope.filterVal.search+'%" '+
                        ' or a.code like "%'+$scope.filterVal.search+'%" '+
                        ' or d.status_name like "%'+$scope.filterVal.search+'%" '+
                        ' or b.name like "%'+$scope.filterVal.search+'%" '+
                        ' or c.name like "%'+$scope.filterVal.search+'%" '+
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
        if ($scope.suptype.id.length==0){
            //exec creation
            $scope.suptype.status = $scope.selected.status.selected.id;
            $scope.suptype.payable_account_id = $scope.selected.payable_account_id.selected.id;
            $scope.suptype.deposit_account_id = $scope.selected.deposit_account_id.selected.id;

            queryService.post('insert into ref_supplier_type SET ?',$scope.suptype)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.suptype.name,
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
            $scope.suptype.status = $scope.selected.status.selected.id;
            $scope.suptype.payable_account_id = $scope.selected.payable_account_id.selected.id;
            $scope.suptype.deposit_account_id = $scope.selected.deposit_account_id.selected?$scope.selected.deposit_account_id.selected.id:null;

            queryService.post('update ref_supplier_type SET ? WHERE id='+$scope.suptype.id ,$scope.suptype)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.suptype.name,
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

    $scope.update = function(obj){
        $scope.suptype.id = obj.id
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.suptype.id = obj.id
            $scope.suptype.name = result.data[0].name
            $scope.suptype.code = result.data[0].code
            $scope.suptype.description = result.data[0].description
            $scope.suptype.status = result.data[0].status
            $scope.suptype.payable_account_id = result.data[0].payable_account_id
            $scope.suptype.deposit_account_id = result.data[0].deposit_account_id

            for (var i = $scope.arr.status.length - 1; i >= 0; i--) {
                if ($scope.arr.status[i].id == result.data[0].status){
                    $scope.selected.status.selected = {name: $scope.arr.status[i].name, id: $scope.arr.status[i].id}
                }
            }

            for (var i = $scope.arr.accounts.length - 1; i >= 0; i--) {
                if ($scope.arr.accounts[i].id == result.data[0].payable_account_id){
                    $scope.selected.payable_account_id.selected = {name: $scope.arr.accounts[i].name, id: $scope.arr.accounts[i].id}
                }
                if ($scope.arr.accounts[i].id == result.data[0].deposit_account_id){
                    $scope.selected.deposit_account_id.selected = {name: $scope.arr.accounts[i].name, id: $scope.arr.accounts[i].id}
                }
            }


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
        $scope.suptype.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.suptype.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update ref_supplier_type set status=2 where id='+$scope.suptype.id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.suptype.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
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
        $scope.suptype = {
            id: '',
            name: '',
            description: '',
            payable_account_id: '',
            deposit_account_id: '',
            status: ''
        }
    }

})
