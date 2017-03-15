
var userController = angular.module('app', []);
userController
.controller('FinBankAccountCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    var qstring = 'select a.id, a.code, a.name, a.status, a.short_name, a.description,a.address1, a.address2, a.account_type, '+
    	'a.bank_id, a.bank_account, a.currency_id, a.gl_account_id, a.ap_clearance_account_id, a.ar_clearance_account_id, '+
        'b.name bank_name, c.name currency_name, d.code gl_account_code, d.name gl_account_name,g.name account_type_name, '+
        'e.code ap_account_code, e.name ap_account_name, f.code ar_account_code, f.name ar_account_name '+
     'from mst_cash_bank_account a '+
     'left join mst_cash_bank b on a.bank_id = b.id '+
     'left join ref_currency c on a.currency_id= c.id '+
     'left join mst_ledger_account d on a.gl_account_id = d.id '+
     'left join mst_ledger_account e on a.ap_clearance_account_id = e.id '+
     'left join mst_ledger_account f on a.ar_clearance_account_id = f.id '+
     'left join (select * from table_ref where table_name = \'mst_cash_bank_account\' and column_name = \'account_type\') g on a.account_type = g.value '+
     ' where a.status!=2 '
    var qwhere = ''
    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.deps = {}
    $scope.id = '';
    $scope.department = {
        id: '',
        code: '',
        name: '',
        short_name: '',
        description: '',
        status: ''
    }

    $scope.selected = {
        dep: {},
        account_type: {},
        bank: {},
        currency: {},
        gl_account: {},
        ap_clearance: {},
        ar_clearance: {}
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

    $scope.account_type = []
    queryService.get('select * from table_ref where table_name = \'mst_cash_bank_account\' and column_name = \'account_type\' order by id',undefined)
    .then(function(data){
        $scope.account_type = data.data
    })

    $scope.currency = []
    queryService.get('select * from ref_currency order by id ',undefined)
    .then(function(data){
        $scope.currency = data.data
    })

    $scope.gl_account = []
    queryService.get('select * from mst_ledger_account order by id limit 50 ',undefined)
    .then(function(data){
        $scope.gl_account = data.data

    })
    $scope.accountKeyUp = function(text){
        queryService.post("select * from mst_ledger_account where lower(name) like '%"+text.toLowerCase()+"%' or lower(code) like '%"+text.toLowerCase()+"%'  order by id limit 50 ",undefined)
        .then(function(data){
            $scope.gl_account = data.data

        })

    }

    $scope.bank = []
    queryService.get('select * from mst_cash_bank order by id ',undefined)
    .then(function(data){
        $scope.bank = data.data

    })



    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.focusinControl = {};
    $scope.fileName = "Master Bank Account";
    $scope.exportExcel = function(){
        DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '5%'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '15%'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name'),
        //DTColumnBuilder.newColumn('account_type_name').withTitle('Type'),
        DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account#'),
        DTColumnBuilder.newColumn('bank_name').withTitle('Bank Name'),
        DTColumnBuilder.newColumn('currency_name').withTitle('Currency'),
        DTColumnBuilder.newColumn('gl_account_code').withTitle('G/L Account'),
        DTColumnBuilder.newColumn('ap_account_code').withTitle('A/P Clearance'),
        DTColumnBuilder.newColumn('ar_account_code').withTitle('A/R Clearance'),
        queryService.post('select code,name,short_name,bank_account,bank_name,currency_name,gl_account_code,ap_account_code,ar_account_code from('+qstring + qwhere+')aa order by id desc',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(['Code','Name','Short Name','Bank Account#','Bank Name','Currency','G/L Account','A/P Clearance','A/R Clearance']);
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

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.deps[data] = {id:data};
        //console.log(data)
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(deps[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(deps[\'' + data + '\'])" )"="">' +
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
    .withOption('order', [0, 'desc'])
    .withDisplayLength(10)
    .withOption('scrollX', true)

    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code').withOption('width', '5%'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '15%'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name'),
        //DTColumnBuilder.newColumn('account_type_name').withTitle('Type'),
        DTColumnBuilder.newColumn('bank_account').withTitle('Bank Account#'),
        DTColumnBuilder.newColumn('bank_name').withTitle('Bank Name'),
        DTColumnBuilder.newColumn('currency_name').withTitle('Currency'),
        DTColumnBuilder.newColumn('gl_account_code').withTitle('G/L Account'),
        DTColumnBuilder.newColumn('ap_account_code').withTitle('A/P Clearance'),
        DTColumnBuilder.newColumn('ar_account_code').withTitle('A/R Clearance'),
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
        //$('#dept_code').prop('disabled', false);
    }

    $scope.submit = function(){
        // console.log($scope.contract)
        if ($scope.department.id.length==0){
            //exec creation
            var param = {
                code: $scope.department.code,
                name: $scope.department.name,
                status: '1',
                short_name: $scope.department.short_name,
                description: $scope.department.description,
                address1: $scope.department.address1,
                address2: $scope.department.address2,
                //account_type: $scope.selected.account_type.selected.id,
                bank_id: $scope.selected.bank.selected.id,
                bank_account: $scope.department.bank_account,
                currency_id: $scope.selected.currency.selected.id,
                gl_account_id: $scope.selected.gl_account.selected.id,
                ap_clearance_account_id: $scope.selected.ap_clearance.selected.id,
                ar_clearance_account_id: $scope.selected.ar_clearance.selected.id,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }

            queryService.post('insert into mst_cash_bank_account SET ?',param)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.department.name,
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
            var param = {
                code: $scope.department.code,
                name: $scope.department.name,
                status: '1',
                short_name: $scope.department.short_name,
                description: $scope.department.description,
                address1: $scope.department.address1,
                address2: $scope.department.address2,
                //account_type: $scope.selected.account_type.selected.id,
                bank_id: $scope.selected.bank.selected.id,
                bank_account: $scope.department.bank_account,
                currency_id: $scope.selected.currency.selected.id,
                gl_account_id: $scope.selected.gl_account.selected.id,
                ap_clearance_account_id: $scope.selected.ap_clearance.selected.id,
                ar_clearance_account_id: $scope.selected.ar_clearance.selected.id,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            console.log(param)
            queryService.post('update mst_cash_bank_account SET ? WHERE id='+$scope.department.id ,param)
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
        //$('#dept_code').prop('disabled', true);

        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
         console.log(result)
            $scope.department.id = result.data[0].id
            $scope.department.code = result.data[0].code
            $scope.department.name = result.data[0].name
            $scope.department.address1 = result.data[0].address1
            $scope.department.address2 = result.data[0].address2
            $scope.department.bank_account = result.data[0].bank_account
            $scope.department.short_name = result.data[0].short_name
            $scope.department.description = result.data[0].description
            $scope.department.status = result.data[0].status
            //$scope.selected.account_type.selected = {name: result.data[0].account_type_name , id: result.data[0].account_type}
            $scope.selected.bank.selected = {name: result.data[0].bank_name , id: result.data[0].bank_id}
            $scope.selected.currency.selected = {name: result.data[0].currency_name , id: result.data[0].currency_id}
            for (var i=0;i<$scope.gl_account.length;i++){
                if ($scope.gl_account[i].id == result.data[0].gl_account_id){
                    $scope.selected.gl_account.selected = $scope.gl_account[i]
                }
                if ($scope.gl_account[i].id == result.data[0].ap_clearance_account_id){
                    $scope.selected.ap_clearance.selected = $scope.gl_account[i]
                }
                if ($scope.gl_account[i].id == result.data[0].ar_clearance_account_id){
                    $scope.selected.ar_clearance.selected = $scope.gl_account[i]
                }
            }

        })

    }

    $scope.delete = function(obj){
        $scope.department.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.department.code = result.data[0].code;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update mst_cash_bank_account SET status=\'2\' ,'+
        ' modified_by='+$localStorage.currentUser.name.id+', ' +
        ' modified_date=\''+globalFunction.currentDate()+'\' ' +
        ' WHERE id='+$scope.department.id ,undefined)
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
        $scope.department = {
            id: '',
            code: '',
            name: '',
            short_name: '',
            description: '',
            status: ''
        }
    }

})
