
var userController = angular.module('app', []);
userController
.controller('FoTransactionCategoryCtrl',
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

    var qstring = "select a.id,a.code,a.folio_text,a.short_name,a.description,a.status, "+
    	"a.parent_id,a.outlet_id,a.revenue_group_id,a.transc_class_id,a.transc_type,a.default_amount, "+
        "a.is_hidden,a.is_effect_to_cash,a.is_pos_category,a.forex_method,a.tax_id,a.is_tax_included, "+
        "a.share_supplier_id,a.is_room_revenue,a.is_room_discount,a.is_banquet_revenue,a.is_food_revenue, "+
        "a.is_condotel_revenue,a.is_day_use_revenue,a.is_beverage_revenue, b.name transc_class_name,c.name tax_name, "+
        "d.name share_supplier_name,e.name outlet_name,f.short_name parent_name,g.name status_name,h.name revenue_group_name "+
    "from mst_guest_transaction_type a "+
    "left join ref_guest_transaction_class b on a.transc_class_id = b.id "+
    "left join mst_guest_transaction_tax c on a.tax_id = c.id "+
    "left join mst_supplier_agent d on a.share_supplier_id = d.id "+
    "left join mst_outlet e on a.outlet_id = e.id "+
    "left join mst_guest_transaction_type f on a.parent_id = f.id "+
    "left join (select value as id,name from table_ref where table_name = 'ref_product_category' and column_name='status' and value in (0,1) ) g on a.status = g.id "+
    "left join ref_revenue_group h on a.revenue_group_id = h.id "+
    "where a.status!=2 "
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
        folio_text: '',
        short_name: '',
        description: '',
        default_amount: ''
    }

    $scope.selected = {
        status: {},
        filter_department: {},
        filter_account_type: {},
        parent: {},
        outlet: {},
        revenue_group: {},
        transaction_class: {},
        transaction_type: {},
        share_supplier: {},
        forex_method: {},
        tax: {},
        is_hidden: "N",
        is_effect_to_cash: "N",
        is_pos_category: "N",
        is_room_revenue: "N",
        is_room_discount: "N",
        is_banquet_revenue: "N",
        is_food_revenue: "N",
        is_beverage_revenue: "N",
        is_condotel_revenue: "N",
        is_day_use_revenue: "N"

    }

    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc',undefined)
    .then(function(data){
        $scope.arrActive = data.data
        $scope.selected.status['selected'] = $scope.arrActive[0]
    })
    $scope.parent = [];
    queryService.post('select id,short_name name from mst_guest_transaction_type where status !=2 and isnull(parent_id)=1 order by short_name asc',undefined)
    .then(function(data){
        $scope.parent = data.data
    })
    $scope.outlet = [];
    queryService.post('select id,name name from mst_outlet where status !=2 order by name asc',undefined)
    .then(function(data){
        $scope.outlet = data.data
    })
    $scope.revenue_group = [];
    queryService.post('select id,name name from ref_revenue_group where status !=2 order by name asc',undefined)
    .then(function(data){
        $scope.revenue_group = data.data
    })
    $scope.transaction_class = [];
    queryService.post('select id,name name from ref_guest_transaction_class where status !=2 order by name asc',undefined)
    .then(function(data){
        $scope.transaction_class = data.data
    })
    $scope.transaction_type = [
        {id: 'D',name:'Debit'},
        {id: 'C',name:'Credit'}
    ];
    $scope.share_supplier = [];
    queryService.post('select id,name name from mst_supplier_agent where status !=2 order by name asc',undefined)
    .then(function(data){
        $scope.share_supplier = data.data
    })
    $scope.forex_method = [
        {id: 'S',name:'Sale'},
        {id: 'B',name:'Buy'}
    ];;
    $scope.tax = [];
    queryService.post('select id,name name from mst_guest_transaction_tax where status !=2 order by name asc',undefined)
    .then(function(data){
        $scope.tax = data.data
    })

    $scope.focusinControl = {};
    $scope.fileName = "Transaction Category Reference";
    $scope.exportExcel = function(){

        queryService.post('select code,short_name,folio_text,description,status_name from('+qstring + qwhere+')aa order by code',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code", 'Short Name','Folio Text','Description','Status']);
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
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        //DTColumnBuilder.newColumn('code').withTitle('Code Ori').notVisible(),
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('parent_name').withTitle('Parent'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name'),
        DTColumnBuilder.newColumn('folio_text').withTitle('Folio Text'),
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
		$scope.disableAction = true;
        if ($scope.coa.id.length==0){
            //exec creation

            var param = {
                code: $scope.coa.code ,
                folio_text: $scope.coa.folio_text ,
                short_name: $scope.coa.short_name ,
                description: $scope.coa.description ,
                status: $scope.selected.status.selected.id ,
                parent_id: ($scope.selected.parent.selected?$scope.selected.parent.selected.id:null) ,
                outlet_id: ($scope.selected.outlet.selected?$scope.selected.outlet.selected.id:null) ,
                revenue_group_id: ($scope.selected.revenue_group.selected?$scope.selected.revenue_group.selected.id:null) ,
                transc_class_id: ($scope.selected.transaction_class.selected?$scope.selected.transaction_class.selected.id:null) ,
                transc_type: ($scope.selected.transaction_type.selected?$scope.selected.transaction_type.selected.id:null) ,
                default_amount: $scope.coa.default_amount ,
                is_hidden: $scope.selected.is_hidden ,
                is_effect_to_cash: $scope.selected.is_effect_to_cash ,
                is_pos_category: $scope.selected.is_pos_category ,
                forex_method: ($scope.selected.forex_method.selected?$scope.selected.forex_method.selected.id:null) ,
                tax_id: ($scope.selected.tax.selected?$scope.selected.tax.selected.id:null) ,
                is_tax_included: ($scope.selected.tax.selected?'Y':'N') ,
                share_supplier_id: ($scope.selected.share_supplier.selected?$scope.selected.share_supplier.selected.id:null) ,
                is_room_revenue: $scope.selected.is_room_revenue ,
                is_room_discount: $scope.selected.is_room_discount ,
                is_banquet_revenue: $scope.selected.is_banquet_revenue ,
                is_food_revenue: $scope.selected.is_food_revenue ,
                is_beverage_revenue: $scope.selected.is_beverage_revenue ,
                is_condotel_revenue: $scope.selected.is_condotel_revenue ,
                is_day_use_revenue: $scope.selected.is_day_use_revenue ,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }
            console.log(param)

            queryService.post('insert into mst_guest_transaction_type SET ?',param)
            .then(function (result){
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
                code: $scope.coa.code ,
                folio_text: $scope.coa.folio_text ,
                short_name: $scope.coa.short_name ,
                description: $scope.coa.description ,
                status: $scope.selected.status.selected.id ,
                parent_id: ($scope.selected.parent.selected?$scope.selected.parent.selected.id:null) ,
                outlet_id: ($scope.selected.outlet.selected?$scope.selected.outlet.selected.id:null) ,
                revenue_group_id: ($scope.selected.revenue_group.selected?$scope.selected.revenue_group.selected.id:null) ,
                transc_class_id: ($scope.selected.transaction_class.selected?$scope.selected.transaction_class.selected.id:null) ,
                transc_type: ($scope.selected.transaction_type.selected?$scope.selected.transaction_type.selected.id:null) ,
                default_amount: $scope.coa.default_amount ,
                is_hidden: $scope.selected.is_hidden ,
                is_effect_to_cash: $scope.selected.is_effect_to_cash ,
                is_pos_category: $scope.selected.is_pos_category ,
                forex_method: ($scope.selected.forex_method.selected?$scope.selected.forex_method.selected.id:null) ,
                tax_id: ($scope.selected.tax.selected?$scope.selected.tax.selected.id:null) ,
                is_tax_included: ($scope.selected.tax.selected?'Y':'N') ,
                share_supplier_id: ($scope.selected.share_supplier.selected?$scope.selected.share_supplier.selected.id:null) ,
                is_room_revenue: $scope.selected.is_room_revenue ,
                is_room_discount: $scope.selected.is_room_discount ,
                is_banquet_revenue: $scope.selected.is_banquet_revenue ,
                is_food_revenue: $scope.selected.is_food_revenue ,
                is_beverage_revenue: $scope.selected.is_beverage_revenue ,
                is_condotel_revenue: $scope.selected.is_condotel_revenue ,
                is_day_use_revenue: $scope.selected.is_day_use_revenue ,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            console.log(param)
            queryService.post('update mst_guest_transaction_type SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){
				$scope.disableAction = false;
                if (result.status = "200"){
                    console.log('Success Update')
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
            $scope.coa.folio_text = result.data[0].folio_text
            $scope.coa.description = result.data[0].description
            $scope.coa.default_amount = result.data[0].default_amount
            $scope.selected.status.selected = {id: result.data[0].status,name:result.data[0].status_name}
            $scope.selected.parent.selected = {id: result.data[0].parent_id,name:result.data[0].parent_name}
            $scope.selected.outlet.selected = {id: result.data[0].outlet_id,name:result.data[0].outlet_name}
            $scope.selected.revenue_group.selected = {id: result.data[0].revenue_group_id,name:result.data[0].revenue_group_name}
            $scope.selected.transaction_class.selected = {id: result.data[0].transc_class_id,name:result.data[0].transc_class_name}
            $scope.selected.tax.selected = {id: result.data[0].tax_id,name:result.data[0].tax_name}
            $scope.selected.share_supplier.selected = {id: result.data[0].share_supplier_id,name:result.data[0].share_supplier_name}
            $scope.selected.is_hidden = result.data[0].is_hidden
            $scope.selected.is_effect_to_cash = result.data[0].is_effect_to_cash
            $scope.selected.is_pos_category = result.data[0].is_hidden
            $scope.selected.is_room_revenue = result.data[0].is_room_revenue
            $scope.selected.is_room_discount = result.data[0].is_room_discount
            $scope.selected.is_banquet_revenue = result.data[0].is_banquet_revenue
            $scope.selected.is_food_revenue = result.data[0].is_food_revenue
            $scope.selected.is_beverage_revenue = result.data[0].is_beverage_revenue
            $scope.selected.is_condotel_revenue = result.data[0].is_condotel_revenue
            $scope.selected.is_day_use_revenue = result.data[0].is_day_use_revenue

            for (var i=0;i<$scope.transaction_type.length;i++){
                if ($scope.transaction_type[i].id==result.data[0].transc_type){
                    $scope.selected.transaction_type.selected = $scope.transaction_type[i]
                }
            }
            for (var i=0;i<$scope.forex_method.length;i++){
                if ($scope.forex_method[i].id==result.data[0].forex_method){
                    $scope.selected.forex_method.selected = $scope.forex_method[i]
                }
            }

        })
    }

    $scope.delete = function(obj){
        $scope.coa.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.coa.name = result.data[0].short_name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update mst_guest_transaction_type SET status=\'2\', '+
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
            folio_text: '',
            short_name: '',
            description: '',
            default_amount: ''
        }
    }

})
