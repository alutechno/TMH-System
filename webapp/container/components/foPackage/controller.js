
var userController = angular.module('app', []);
userController
.controller('FoPackageCtrl',
function($scope, $state, $sce, queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
	$scope.disableAction = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    $scope.child = {}
    $scope.items = []
    $scope.itemsOri = []

    var qstring = "select a.id, a.code, a.name, a.text_on_folio, a.status, a.is_meal_coupon, a.rate_operator_id, a.package_type_id, a.package_category_id, "+
    	"a.currency_id, a.is_hidden_for_user_selection, a.is_commission, a.is_tax_included, a.flat_rate, a.adult_rate, a.child_rate,  "+
        "date_format(a.valid_date_from,'%Y-%m-%d') valid_date_from, date_format(a.valid_date_until,'%Y-%m-%d') valid_date_until, a.is_monday_active, a.is_tuesday_active, a.is_wednesday_active, a.is_thursday_active,  "+
        "a.is_friday_active, a.is_saturday_active, a.is_sunday_active, g.short_name transc_type_name, "+
        "b.name package_category_name,c.name package_type_name,d.name rate_operator_name,e.name currency_name,f.status_name, "+
        "if(a.is_meal_coupon='Y','Yes','No') is_meal_coupon_name,"+
        "if(a.is_hidden_for_user_selection='Y','Yes','No') is_hidden_for_user_selection_name,"+
        "if(a.is_commission='Y','Yes','No') is_commission_name,"+
        "if(a.is_tax_included='Y','Yes','No') is_tax_included_name "+
    "from mst_package a "+
    "left join ref_package_category b on a.package_category_id=b.id "+
    "left join ref_package_type c on a.package_type_id=c.id "+
    "left join ref_package_rate_operator d on a.rate_operator_id=d.id "+
    "left join ref_currency e on a.currency_id=e.id "+
    "left join (select id as status_id, value as status_value,name as status_name   "+
                "from table_ref   "+
            "where table_name = 'ref_product_category' and column_name='status') f on a.status =f.status_value "+
    "left join mst_guest_transaction_type g on a.transc_type_id=g.id "+
    " where a.status!=2 "
    var qwhere = ''
    var qstringdetail = 'select a.id p_id,a.room_rate_id,c.name room_rate,a.package_id,date_format(a.valid_date_from,\'%Y-%m-%d\') valid_date_from,date_format(a.valid_date_until,\'%Y-%m-%d\') valid_date_until '+
        'from mst_room_rate_package a, mst_package b, mst_room_rate c '+
        'where a.package_id = b.id '+
        'and a.room_rate_id = c.id '

    var qwheredetail = ' '

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
        description: '',
        status: ''
    }

    $scope.selected = {
        status: {},
        filter_department: {},
        filter_account_type: {},
        package_type: {},
        is_meal_coupon: {},
        rate_operator: {},
        package_category: {},
        currency: {},
        tax: {},
        is_hidden_for_user_selection: {},
        is_commission: {},
        is_tax_included: {},
        day: {},
        type: {},
        is_monday_active: '0',
        is_tuesday_active: '0',
        is_wednesday_active: '0',
        is_thursday_active: '0',
        is_friday_active: '0',
        is_saturday_active: '0',
        is_sunday_active: '0'
    }

    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc',undefined)
    .then(function(data){
        $scope.status = data.data
        $scope.selected.status['selected'] = $scope.status[0]
    })
    queryService.get('select id, short_name name from mst_guest_transaction_type where status!=2 order by short_name asc',undefined)
    .then(function(data){
        $scope.type = data.data
    })
    $scope.yesno = [
        {id: 'Y', name: 'Yes'},
        {id: 'N', name: 'No'}
    ]
    $scope.selected.is_hidden_for_user_selection['selected'] = $scope.yesno[1]
    $scope.selected.is_commission['selected'] = $scope.yesno[1]
    $scope.selected.is_tax_included['selected'] = $scope.yesno[1]
    $scope.selected.is_meal_coupon['selected'] = $scope.yesno[1]
    queryService.get('select id,name from ref_package_category where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.package_category = data.data
    })
    queryService.get('select id,name from ref_currency where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.currency = data.data
        $scope.selected.currency['selected'] = $scope.currency[0]
    })
    queryService.get('select id,name from mst_taxes where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.tax = data.data
    })
    queryService.get('select id,name from ref_package_type where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.package_type = data.data
    })
    queryService.get('select id,name from ref_package_rate_operator where status!=2 order by name asc',undefined)
    .then(function(data){
        $scope.rate_operator = data.data
    })

    $scope.focusinControl = {};
    $scope.fileName = "Package Reference";
    $scope.exportExcel = function(){
        queryService.post('select code,name,status_name,package_category_name,package_type_name,rate_operator_name,currency_name,flat_rate,adult_rate,child_rate from('+qstring + qwhere+')aa order by code',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code", "Name", 'Status','Category','Type','Operator','Currency','Flat Rate','Adult Rate','Child Rate']);
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
                '<button class="btn btn-default" title="Update" ng-click="update(coas[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(coas[\'' + data + '\'])" )"="">' +
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
    .withOption('order', [0, 'asc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }

    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        //DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '20%'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('package_category_name').withTitle('Category'),
        DTColumnBuilder.newColumn('package_type_name').withTitle('Package Type'),
        DTColumnBuilder.newColumn('transc_type_name').withTitle('Trans Type'),
        DTColumnBuilder.newColumn('rate_operator_name').withTitle('Operator'),
        DTColumnBuilder.newColumn('currency_name').withTitle('currency'),
        DTColumnBuilder.newColumn('flat_rate').withTitle('Flat Rate'),
        DTColumnBuilder.newColumn('adult_rate').withTitle('Adult rate'),
        DTColumnBuilder.newColumn('child_rate').withTitle('child rate')
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
        $scope.items = []
        $scope.itemsOri = []
        /*queryService.post(qstringdetail+' and b.room_rate_id=0 '+qwheredetail,undefined)
        .then(function(data){
            for (var i=0;i<data.data.length;i++){
                $scope.items.push({
                    id: i+1,
                    room_type_id: data.data[i].room_type_id,
                    code:data.data[i].code,
                    name:data.data[i].name,
                    line_id: data.data[i].line_id,
                    room_rate_id: data.data[i].room_rate_id,
                    rate_1_person: data.data[i].rate_1_person,
                    rate_2_person: data.data[i].rate_2_person,
                    rate_3_person: data.data[i].rate_3_person,
                    rate_4_person: data.data[i].rate_4_person,
                    additional_person: data.data[i].additional_person,
                    additional_child: data.data[i].additional_child,
                    late_checkout_charge: data.data[i].late_checkout_charge
                })
            }
            $scope.itemsOri = angular.copy($scope.items)
            console.log($scope.items)
            console.log($scope.itemsOri)
        })*/

    }

    $scope.submit = function(){
		$scope.disableAction = true;
        if ($scope.coa.id.length==0){
            //exec creation

            var param = {
                code: $scope.coa.code,
                name: $scope.coa.name,
                text_on_folio: $scope.coa.text_on_folio,
                status: $scope.selected.status.selected.id,
                transc_type_id: ($scope.selected.type.selected?$scope.selected.type.selected.id:null),
                is_meal_coupon: ($scope.selected.is_meal_coupon.selected?$scope.selected.is_meal_coupon.selected.id:null),
                currency_id: $scope.selected.currency.selected.id,
                package_type_id: ($scope.selected.package_type.selected?$scope.selected.package_type.selected.id:null),
                package_category_id: ($scope.selected.package_category.selected?$scope.selected.package_category.selected.id:null),
                rate_operator_id: ($scope.selected.rate_operator.selected?$scope.selected.rate_operator.selected.id:null),
                is_hidden_for_user_selection: $scope.selected.is_hidden_for_user_selection.selected.id,
                is_commission: $scope.selected.is_commission.selected.id,
                is_tax_included: $scope.selected.is_tax_included.selected.id,
                flat_rate: $scope.coa.flat_rate,
                adult_rate: $scope.coa.adult_rate,
                child_rate: $scope.coa.child_rate,
                valid_date_from: $scope.coa.valid_date_from,
                valid_date_until: $scope.coa.valid_date_until,
                is_monday_active:$scope.selected.is_monday_active,
                is_tuesday_active:$scope.selected.is_tuesday_active,
                is_wednesday_active:$scope.selected.is_wednesday_active,
                is_thursday_active:$scope.selected.is_thursday_active,
                is_friday_active:$scope.selected.is_friday_active,
                is_saturday_active:$scope.selected.is_saturday_active,
                is_sunday_active:$scope.selected.is_sunday_active,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }
            console.log(param)
            console.log($scope.selected.is_monday_active)
            console.log($scope.selected.is_tuesday_active)
            console.log($scope.selected.is_wednesday_active)
            console.log($scope.selected.is_thursday_active)
            console.log($scope.selected.is_friday_active)
            console.log($scope.selected.is_saturday_active)
            console.log($scope.selected.is_sunday_active)

            queryService.post('insert into mst_package SET ?',param)
            .then(function (result){
                var sqld = $scope.child.saveTable(result.data.insertId)
                queryService.post(sqld.join(';'),undefined)
                .then(function (result3){
					$scope.disableAction = false;
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
                function (err3){
					$scope.disableAction = false;
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Insert: '+err3.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            },
            function (err){
                $scope.disableAction = false;
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
                code: $scope.coa.code,
                name: $scope.coa.name,
                text_on_folio: $scope.coa.text_on_folio,
                transc_type_id: ($scope.selected.type.selected?$scope.selected.type.selected.id:null),
                status: $scope.selected.status.selected.id,
                is_meal_coupon: ($scope.selected.is_meal_coupon.selected?$scope.selected.is_meal_coupon.selected.id:null),
                currency_id: $scope.selected.currency.selected.id,
                package_type_id: ($scope.selected.package_type.selected?$scope.selected.package_type.selected.id:null),
                package_category_id: ($scope.selected.package_category.selected?$scope.selected.package_category.selected.id:null),
                rate_operator_id: ($scope.selected.rate_operator.selected?$scope.selected.rate_operator.selected.id:null),
                is_hidden_for_user_selection: $scope.selected.is_hidden_for_user_selection.selected.id,
                is_commission: $scope.selected.is_commission.selected.id,
                is_tax_included: $scope.selected.is_tax_included.selected.id,
                flat_rate: $scope.coa.flat_rate,
                adult_rate: $scope.coa.adult_rate,
                child_rate: $scope.coa.child_rate,
                valid_date_from: $scope.coa.valid_date_from,
                valid_date_until: $scope.coa.valid_date_until,
                is_monday_active:$scope.selected.is_monday_active,
                is_tuesday_active:$scope.selected.is_tuesday_active,
                is_wednesday_active:$scope.selected.is_wednesday_active,
                is_thursday_active:$scope.selected.is_thursday_active,
                is_friday_active:$scope.selected.is_friday_active,
                is_saturday_active:$scope.selected.is_saturday_active,
                is_sunday_active:$scope.selected.is_sunday_active,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            console.log(param)
            queryService.post('update mst_package SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){
                var sqld = $scope.child.saveTable($scope.coa.id)
                queryService.post(sqld.join(';'),undefined)
                .then(function (result3){
					$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.coa.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear()

                },
                function (err3){
					$scope.disableAction = false;
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Update: '+err3.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                })
            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        //$('#coa_code').prop('disabled', true);

        // console.log(obj)
        queryService.post(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            console.log(result)

            $scope.coa.id = result.data[0].id
            $scope.coa.code = result.data[0].code
            $scope.coa.name = result.data[0].name
            $scope.coa.text_on_folio = result.data[0].text_on_folio
            $scope.coa.flat_rate = result.data[0].flat_rate
            $scope.coa.adult_rate = result.data[0].adult_rate
            $scope.coa.child_rate = result.data[0].child_rate
            $scope.coa.valid_date_from = result.data[0].valid_date_from
            $scope.coa.valid_date_until = result.data[0].valid_date_until
            $scope.selected.status.selected = {id: result.data[0].status,name:result.data[0].status_name}
            $scope.selected.is_meal_coupon.selected = {id: result.data[0].is_meal_coupon,name:result.data[0].is_meal_coupon_name}
            $scope.selected.currency.selected = {id: result.data[0].currency_id,name:result.data[0].currency_name}
            $scope.selected.package_type.selected = {id: result.data[0].package_type_id,name:result.data[0].package_type_name}
            $scope.selected.package_category.selected = {id: result.data[0].package_category_id,name:result.data[0].package_category_name}
            $scope.selected.rate_operator.selected = {id: result.data[0].rate_operator_id,name:result.data[0].rate_operator_name}
            $scope.selected.is_hidden_for_user_selection.selected = {id: result.data[0].is_hidden_for_user_selection,name:result.data[0].is_hidden_for_user_selection_name}
            $scope.selected.is_commission.selected = {id: result.data[0].is_commission,name:result.data[0].is_commission_name}
            $scope.selected.is_tax_included.selected = {id: result.data[0].is_tax_included,name:result.data[0].is_tax_included_name}
            $scope.selected.type.selected = {id: result.data[0].transc_type_id,name:result.data[0].transc_type_name}
            $scope.selected.is_monday_active = result.data[0].is_monday_active
            $scope.selected.is_tuesday_active = result.data[0].is_tuesday_active
            $scope.selected.is_wednesday_active = result.data[0].is_wednesday_active
            $scope.selected.is_thursday_active = result.data[0].is_thursday_active
            $scope.selected.is_friday_active = result.data[0].is_friday_active
            $scope.selected.is_saturday_active = result.data[0].is_saturday_active
            $scope.selected.is_sunday_active = result.data[0].is_sunday_active


            $scope.items = []
            queryService.post(qstringdetail+' and a.package_id='+obj.id+ ' '+qwheredetail,undefined)
            .then(function(data){
                console.log(data)
                for (var i=0;i<data.data.length;i++){
                    $scope.items.push({
                        id: i+1,
                        p_id: data.data[i].p_id,
                        room_rate_id: data.data[i].room_rate_id,
                        room_rate: data.data[i].room_rate,
                        valid_date_from: data.data[i].valid_date_from,
                        valid_date_until: data.data[i].valid_date_until
                    })
                }
                $scope.itemsOri = angular.copy($scope.items)
                console.log($scope.items)
                console.log($scope.itemsOri)
            })
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
        queryService.post('update mst_room_rate SET status=\'2\', '+
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
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.coa.name,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'success'
                }).show();
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
            description: '',
            status: ''
        }
        $scope.selected = {
            status: {},
            filter_department: {},
            filter_account_type: {},
            package_type: {},
            is_meal_coupon: {},
            rate_operator: {},
            package_category: {},
            currency: {},
            tax: {},
            is_hidden_for_user_selection: {},
            is_commission: {},
            is_tax_included: {},
            day: {},
            is_monday_active: '0',
            is_tuesday_active: '0',
            is_wednesday_active: '0',
            is_thursday_active: '0',
            is_friday_active: '0',
            is_saturday_active: '0',
            is_sunday_active: '0'
        }
        $scope.selected.is_hidden_for_user_selection['selected'] = $scope.yesno[1]
        $scope.selected.is_commission['selected'] = $scope.yesno[1]
        $scope.selected.is_tax_included['selected'] = $scope.yesno[1]
        $scope.selected.is_meal_coupon['selected'] = $scope.yesno[1]
        $scope.selected.status['selected'] = $scope.status[0]
        $scope.selected.currency['selected'] = $scope.currency[0]
    }

})
.controller('EditableTablePkgCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    $scope.item = {
        product_id:'',
        product_name:'',
        qty: '',
        price: '',
        amount: '',
        supplier_id: '',
        supplier_name: '',
        old_price: '',
        new_price: ''
    };

    $scope.checkName = function(data, id) {
        if (id === 2 && data !== 'awesome') {
            return "Username 2 should be `awesome`";
        }
    };

    // filter users to show
    $scope.filterUser = function(user) {
        return user.isDeleted !== true;
    };

    // mark user as deleted
    $scope.deleteUser = function(id) {
        console.log(id)
        var filtered = $filter('filter')($scope.items, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

    // add user
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.items.length+1),
            room_rate:'',
            room_rate_id:'',
            valid_date_from: '',
            valid_date_until: '',
            isNew: true
        };
        $scope.setRoomRate($scope.item.id);
        $scope.items.push($scope.item)
    };

    // cancel all changes
    $scope.cancel = function() {
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
            // undelete
            if (user.isDeleted) {
                delete user.isDeleted;
            }
            // remove new
            if (user.isNew) {
                $scope.items.splice(i, 1);
            }
        };
    };

    // save edits
    $scope.child.saveTable = function(pr_id) {
        console.log('asd')
        var results = [];
        console.log($scope.itemsOri)

        console.log(JSON.stringify($scope.items,null,2))
        var sqlitem = []
		for (var i =0;i< $scope.items.length; i++) {
            var user = $scope.items[i];
            console.log(user)
            if (user.isNew && !user.isDeleted){
                sqlitem.push('insert into mst_room_rate_package (package_id,room_rate_id,valid_date_from,valid_date_until,created_by,created_date) values('+
                pr_id+','+user.room_rate_id+',\''+user.valid_date_from+'\',\''+user.valid_date_until+'\','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from mst_room_rate_package where id='+user.p_id)
            }
            else if(!user.isNew){
                console.log(user)
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri[j].p_id+$scope.itemsOri[j].room_rate_id+$scope.itemsOri[j].valid_date_from+$scope.itemsOri[j].valid_date_until
                        var d2 = user.p_id+user.room_rate_id+user.valid_date_from+user.valid_date_until
                        if(d1 != d2){
                            sqlitem.push('update mst_room_rate_package set '+
                            ' room_rate_id = '+user.room_rate_id+',' +
                            ' valid_date_from = \''+user.valid_date_from+'\',' +
                            ' valid_date_until = \''+user.valid_date_until+'\',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
                        }
                    }
                }
            }
        }
        console.log($scope.items)
        console.log(sqlitem.join(';\n'))
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.setVal = function(e,d,p,t){
        if (p.length==0){
            $scope.items[d-1][t] = null
        }
        else {
            $scope.items[d-1][t] = p
        }
        /*$scope.items[d-1].supplier_name = e.name
        $scope.items[d-1].price = e.price
        $scope.items[d-1].amount = e.price * $scope.items[d-1].qty*/
    }

    $scope.room_rate = []
    $scope.setRoomRate = function(id){
        queryService.post('select id,code,name from mst_room_rate where status!=2 order by name asc limit 20',undefined)
        .then(function(data){
            $scope.room_rate[id] = data.data
        })
    }
    $scope.getRoomRate = function(a,b){
        console.log(a,b)
        $scope.items[b-1].room_rate = a.name
        $scope.items[b-1].room_rate_id = a.id
    }
    $scope.roomRateUp = function(id,name){
        queryService.post('select id,code,name from mst_room_rate where status!=2 and name like \'%'+name+'%\' order by name asc limit 20',undefined)
        .then(function(data){
            $scope.room_rate[id] = data.data
        })
    }




});
