
var userController = angular.module('app', []);
userController
.controller('FinCoaCtrl',
function($scope, $state, $sce, queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    var qstring = "select a.*,b.code account_type_code, b.name account_type_name,c.name status_name, z.name dept_name, "+
        "if(locate('-000',a.code)>0,'H','D') as is_header,if(locate('-000',a.code)>0,a.code,concat('  ',a.code)) as code_header "+
        "from mst_ledger_account a "+
        "left join ref_ledger_account_type b on a.account_type_id = b.id "+
        "left join (select * from table_ref where table_name = 'ref_product_category' and column_name = 'status') c on a.status = c.value "+
        "left join mst_department z on z.id = a.dept_id "+
        "where a.status != '2' "
    var qwhere = ''

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
        status: {},
        filter_department: {},
        filter_account_type: {}
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

    $scope.focusinControl = {};
    $scope.fileName = "Chart of Account";
    $scope.exportExcel = function(){

        queryService.post('select code,short_name,name,report_level,account_type_name,description,status_name from('+qstring + qwhere+')aa order by code',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code", "Short Name", "Name", 'Level','Account Type', 'Description','Status']);
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
    $scope.codeHtml = function(data, type, full, meta) {
        if (full.is_header=='D'){
            return '&nbsp;&nbsp;&nbsp;&nbsp;'+full.code
        }
        else return '<b>'+full.code+'</b>'
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
    .withOption('order', [1, 'asc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '12%')
    .renderWith($scope.codeHtml))
    $scope.dtColumns.push(
        //DTColumnBuilder.newColumn('code').withTitle('Code Ori').notVisible(),
        //DTColumnBuilder.newColumn('code_header').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '20%'),
        DTColumnBuilder.newColumn('account_type_name').withTitle('Account Type'),
        DTColumnBuilder.newColumn('dept_name').withTitle('Dept'),
        DTColumnBuilder.newColumn('report_level').withTitle('Level'),
        DTColumnBuilder.newColumn('is_header').withTitle('H/D').withOption('width', '7%'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name'),
        DTColumnBuilder.newColumn('description').withTitle('Description'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status')
    );

    var qwhereobj = {
        text: '',
        department: '',
        account_type: ''
    }
    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhereobj.text = ' lower(a.name) like \'%'+$scope.filterVal.search+'%\' '
                else qwhereobj.text = ''
                qwhere = setWhere()

                //if ($scope.filterVal.search.length>0) qwhere = ' and lower(a.name) like "%'+$scope.filterVal.search.toLowerCase()+'%"'
                //else qwhere = ''
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

    $scope.applyFilter = function(){
        //console.log($scope.selected.filter_status)

        //console.log($scope.selected.filter_cost_center)
        if ($scope.selected.filter_department.selected){
            qwhereobj.department = ' a.dept_id = '+$scope.selected.filter_department.selected.id+ ' '
        }
        if ($scope.selected.filter_account_type.selected){
            qwhereobj.account_type = ' a.account_type_id = '+$scope.selected.filter_account_type.selected.id+ ' '
        }
        //console.log(setWhere())
        qwhere = setWhere()
        $scope.dtInstance.reloadData(function(obj){
            console.log(obj)
        }, false)

    }
    function setWhere(){
        var arrWhere = []
        var strWhere = ''
        for (var key in qwhereobj){
            if (qwhereobj[key].length>0) arrWhere.push(qwhereobj[key])
        }
        if (arrWhere.length>0){
            strWhere = ' and ' + arrWhere.join(' and ')
        }
        //console.log(strWhere)
        return strWhere
    }

    /*END AD ServerSide*/
    $scope.openAdvancedFilter = function(val){

        $scope.showAdvance = val
        if (val==false){
            $scope.selected.filter_account_type = {}
            $scope.selected.filter_department = {}
        }
    }
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
            /*$scope.coa.status = $scope.selected.status.selected.id;
            $scope.coa.report_level = $scope.selected.report_level.selected.id;
            $scope.coa.account_type_id = $scope.selected.account_type.selected.id;
            $scope.coa.dept_id = $scope.selected.dept.selected.id;
            $scope.coa.cost_center_id = $scope.selected.cost_center.selected.id;
            $scope.cat.status = $scope.selected.status.selected.id;
            $scope.cat['created_by'] = $localStorage.currentUser.name.id;
            $scope.cat['created_date'] = globalFunction.currentDate();*/
            var param = {
                code: $scope.coa.code,
                name: $scope.coa.name,
                short_name: $scope.coa.short_name,
                description: $scope.coa.description,
                status: $scope.selected.status.selected.id,
                account_type_id: $scope.selected.account_type.selected.id,
                report_level: $scope.selected.report_level.selected.id,
                dept_id: $scope.selected.dept.selected.id,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }
            console.log(param)

            queryService.post('insert into mst_ledger_account SET ?',param)
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
                    $scope.clear()

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
            /*$scope.coa.status = $scope.selected.status.selected.id;
            $scope.coa.report_level = $scope.selected.report_level.selected.id;
            $scope.coa.account_type_id = $scope.selected.account_type.selected.id;
            $scope.coa.dept_id = $scope.selected.dept.selected.id;
            $scope.coa.cost_center_id = $scope.selected.cost_center.selected.id;*/
            var param = {
                code: $scope.coa.code,
                name: $scope.coa.name,
                short_name: $scope.coa.short_name,
                description: $scope.coa.description,
                status: $scope.selected.status.selected.id,
                account_type_id: $scope.selected.account_type.selected.id,
                report_level: $scope.selected.report_level.selected.id,
                dept_id: $scope.selected.dept.selected.id,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            console.log(param)
            queryService.post('update mst_ledger_account SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Update')
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
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
        //$('#coa_code').prop('disabled', true);

        // console.log(obj)
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
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
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.coa.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update mst_ledger_account SET status=\'2\', '+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.coa.id ,undefined)
        .then(function (result){
            if (result.status = "200"){
                console.log('Success Delete')
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
        $scope.coa = {
            id: '',
            code: '',
            name: '',
            short_name: '',
            description: '',
            status: '',
            report_level: '',
            account_type_id: '',
            dept_id: ''
        }
    }

})
