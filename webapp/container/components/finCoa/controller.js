
var userController = angular.module('app', []);
userController
.controller('FinCoaCtrl',
function($scope, $state, $sce, coaService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

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

    $scope.coas = {}
    $scope.id = '';
    $scope.coa = {
        id: '',
        code: '',
        name: '',
        short_name: '',
        description: '',
        status: '',
        report_level: '',
        account_type_id: '',
        dept_id: '',
        cost_center_id: ''
    }

    $scope.selected = {
        dept: {},
        account_type: {},
        cost_center: {},
        report_level: {},
        status: {}
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
    $scope.arrReportLevel = [
        {id: 0,name: '0'},
        {id: 1,name: '1'},
        {id: 2,name: '2'},
        {id: 3,name: '3'},
        {id: 4,name: '4'},
        {id: 5,name: '5'}
    ]

    $scope.departments = []
    departmentService.get()
    .then(function(data){
        $scope.departments = data.data
    })
    $scope.account_types = []
    accountTypeService.get()
    .then(function(data){
        $scope.account_types = data.data
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
        $scope.coas[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(coas[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(coas[\'' + data + '\'])" )"="">' +
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
        url: API_URL+'/apifin/getCoas',
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
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('report_level').withTitle('Level'),
        DTColumnBuilder.newColumn('account_type_name').withTitle('A/C'),
        DTColumnBuilder.newColumn('dept_name').withTitle('Department'),
        DTColumnBuilder.newColumn('cost_center_name').withTitle('CostCenter'),
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
        if ($scope.coa.id.length==0){
            //exec creation

            // $scope.coa.code = $scope.coa.code;
            // $scope.coa.short_name = $scope.coa.short_name;
            // $scope.coa.description = $scope.coa.description;
            $scope.coa.status = $scope.selected.status.selected.id;
            $scope.coa.report_level = $scope.selected.report_level.selected.id;
            $scope.coa.account_type_id = $scope.selected.account_type.selected.id;
            $scope.coa.dept_id = $scope.selected.dept.selected.id;
            $scope.coa.cost_center_id = $scope.selected.cost_center.selected.id;
            console.log($scope.coa)

            coaService.create($scope.coa)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.coa.code,
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
            // $scope.coa.code = $scope.coa.code;
            // $scope.coa.short_name = $scope.coa.short_name;
            // $scope.coa.description = $scope.coa.description;
            $scope.coa.status = $scope.selected.status.selected.id;
            $scope.coa.report_level = $scope.selected.report_level.selected.id;
            $scope.coa.account_type_id = $scope.selected.account_type.selected.id;
            $scope.coa.dept_id = $scope.selected.dept.selected.id;
            $scope.coa.cost_center_id = $scope.selected.cost_center.selected.id;

            console.log($scope.coa)
            coaService.update($scope.coa)
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
        $('#coa_code').prop('disabled', true);

        // console.log(obj)
        coaService.get(obj.id)
        .then(function(result){
            console.log(result)

            $scope.coa.id = result.data[0].id
            $scope.coa.code = result.data[0].code
            $scope.coa.short_name = result.data[0].short_name
            $scope.coa.name = result.data[0].name
            $scope.coa.description = result.data[0].description
            $scope.coa.status = result.data[0].status
            $scope.coa.report_level = result.data[0].report_level
            $scope.coa.account_type_id = result.data[0].account_type_id
            $scope.coa.dept_id = result.data[0].dept_id
            $scope.coa.cost_center_id = result.data[0].cost_center_id
            $scope.coa.status = result.data[0].status
            $scope.selected.status.selected = {name: result.data[0].status == 1 ? 'Yes' : 'No' , id: result.data[0].status}

            for (var i = $scope.departments.length - 1; i >= 0; i--) {
                if ($scope.departments[i].id == result.data[0].dept_id){
                    $scope.selected.dept.selected = {name: $scope.departments[i].name, id: $scope.departments[i].id}
                }
            };
            for (var i = $scope.departments.length - 1; i >= 0; i--) {
                if ($scope.departments[i].id == result.data[0].dept_id){
                    $scope.selected.cost_center.selected = {name: $scope.departments[i].name, id: $scope.departments[i].id}
                }
            };
            for (var i = $scope.account_types.length - 1; i >= 0; i--) {
                if ($scope.account_types[i].id == result.data[0].account_type_id){
                    $scope.selected.account_type.selected = {name: $scope.account_types[i].name, id: $scope.account_types[i].id}
                }
            };
            for (var i = $scope.arrReportLevel.length - 1; i >= 0; i--) {
                if ($scope.arrReportLevel[i].id == result.data[0].report_level){
                    $scope.selected.report_level.selected = {name: $scope.arrReportLevel[i].name, id: $scope.arrReportLevel[i].id}
                }
            };

            console.log($scope.coa)
            console.log($scope.selected)
        })
    }

    $scope.delete = function(obj){
        $scope.coa.id = obj.id;
        coaService.get(obj.id)
        .then(function(result){
            $scope.coa.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        coaService.delete($scope.coa)
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
        $scope.coa = {
            id: '',
            code: '',
            name: '',
            short_name: '',
            description: '',
            status: '',
            report_level: '',
            account_type_id: '',
            dept_id: '',
            cost_center_id: ''
        }
    }

})