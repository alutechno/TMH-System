
var userController = angular.module('app', ["xeditable"]);

userController.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});
userController
.controller('InvRecipeCtrl',
function($scope, $state, $sce, globalFunction,queryService, $q,prService, DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder,
    $localStorage, $compile, $rootScope, API_URL,
    warehouseService) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    $scope.addItem = false;
    $scope.approveState = false;
    //$scope.role = false;
    $scope.rejectState = false;
    $scope.viewMode = false;
    console.log($scope.el)
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    var qstring = 'select a.id,a.name,a.category_id,b.name category_name,a.producing_qty,a.unit_type_id,c.name unit_name,a.product_cost,a.product_price '+
        ',a.reg_style_id,d.name region_name,a.meal_time_id,e.name meal_name,a.warehouse_id,f.name warehouse_name, '+
        ' a.cooking_direction,a.makeup_cost_percent,a.expected_cost_percent,a.selling_price,a.last_unit_cost,a.last_suggestion_price,'+
        ' a.last_cost_percent,a.onhand_cost_percent,a.onhand_unit_cost,a.onhand_suggestion_price,a.status,g.name status_name, a.description '+
        'from mst_cuisine_recipe a,ref_cuisine_category b,ref_product_unit c,ref_cuisine_region d,ref_meal_time e,mst_warehouse f, '+
        ' (select id as status_id, value ,name '+
            'from table_ref  '+
            'where table_name = \'ref_product_category\' and column_name=\'status\' )g '+
        'where a.category_id=b.id '+
        'and a.unit_type_id=c.id '+
        'and a.reg_style_id=d.id '+
        'and a.meal_time_id=e.id '+
        'and a.warehouse_id=f.id '+
        'and a.status = g.value '
    var qwhere = '';
    var qstringdetail = 'select * from ( '+
        'select \'product\' as source ,a.recipe_id,a.id as t_id,a.product_id p_id,c.name p_name,a.unit_type_id unit_id,b.name unit_name,qty,last_price,last_amount,onhand_price,onhand_amount '+
        'from mst_recipe_ingredients a,ref_product_unit b,mst_product c '+
        'where a.unit_type_id=b.id '+
        'and a.product_id=c.id '+
        'union '+
        'select \'recipe\' as source,a.recipe_id,a.id as t_id,a.included_recipe_id p_id,b.name p_name,b.unit_type_id unit_id,c.name unit_name,a.qty,b.last_unit_cost last_price,qty*b.last_unit_cost last_amount,b.onhand_unit_cost onhand_price,qty*b.onhand_unit_cost onhand_amount '+
        'from inv_included_recipe a,mst_cuisine_recipe b,ref_product_unit c '+
        'where a.included_recipe_id=b.id '+
        'and b.unit_type_id=c.id )a '
    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.items = []
    $scope.itemsOri = []
    $scope.child = {}
    $scope.addSource = {}
    $scope.products = {}
    $scope.recipes = {}


    $scope.id = '';
    $scope.pr = {
        id: '',
        name: '',
        category_id: '',
        category_name: '',
        producing_qty: '',
        unit_type_id: '',
        unit_name: '',
        product_cost: '',
        product_price: '',
        reg_style_id: '',
        region_name: '',
        meal_time_id: '',
        meal_name: '',
        warehouse_id: '',
        warehouse_name: ''
    }




    $scope.selected = {
        unit: {},
        status: {},
        warehouse: {},
        meal_time: {},
        region: {},
        category: {},
        product: {}
    }
    $scope.data = {
        unit: [],
        status: [],
        warehouse: [],
        meal_time: [],
        region: [],
        category: []
    }
    queryService.get('select id,name from ref_product_unit order by name',undefined)
    .then(function(data){
        $scope.data.unit = data.data
    })
    queryService.get('select id,name from mst_warehouse order by name',undefined)
    .then(function(data){
        $scope.data.warehouse = data.data
    })
    queryService.get('select value id,value,name from table_ref where table_name=\'ref_product_category\' order by name',undefined)
    .then(function(data){
        $scope.data.status = data.data
    })
    queryService.get('select id,name from ref_meal_time order by name',undefined)
    .then(function(data){
        $scope.data.meal_time = data.data
    })
    queryService.get('select id,name from ref_cuisine_region order by name',undefined)
    .then(function(data){
        $scope.data.region = data.data
    })
    queryService.get('select id,name from ref_cuisine_category order by name',undefined)
    .then(function(data){
        $scope.data.category = data.data
    })

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/

    //define default option

    $scope.dtOptionsItem = DTOptionsBuilder.newOptions();
    //define colum
    $scope.dtColumnsItem = [

    ];
    $scope.dtInstance = {} //Use for reloadData
    $scope.nested = {};
    $scope.nested.dtInstance = {}
    $scope.actionsHtml = function(data, type, full, meta) {
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'

            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(\'' + data + '\')">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(\'' + data + '\')" )"="">' +
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
            data.query = qstring + qwhere ;
        }
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('bLengthChange', false)
    .withOption('bFilter', false)
    .withPaginationType('full_numbers')
    .withOption('order', [1, 'desc'])
    .withDisplayLength(10)
    .withOption('order', [0, 'desc'])
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '12%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('id').withTitle('ID'),
        DTColumnBuilder.newColumn('name').withTitle('Recipe'),
        DTColumnBuilder.newColumn('category_name').withTitle('category'),
        DTColumnBuilder.newColumn('producing_qty').withTitle('make'),
        DTColumnBuilder.newColumn('unit_name').withTitle('unit'),
        DTColumnBuilder.newColumn('product_cost').withTitle('Cost'),
        DTColumnBuilder.newColumn('product_price').withTitle('Price')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' and lower(a.name) like \'%'+$scope.filterVal.search.toLowerCase()+'%\''
                else qwhere = ''

                $scope.nested.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }

    }

    /*END AD ServerSide*/

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
        //$scope.show.itemTable=true
        $scope.addDetail(0)
        $scope.selected.status['selected'] = $scope.data.status[0]
    }

    $scope.submit = function(){
        console.log(JSON.stringify($scope.pr))
        console.log(JSON.stringify($scope.items))
        if ($scope.pr.id.length==0 ){
            //exec creation
            console.log($scope.pr)
            if ($scope.items.length>0){

                var param = {}
                param = {
                    name: $scope.pr.name,
                    description: $scope.pr.description,
                    cooking_direction:$scope.pr.cooking_direction,
                    status: $scope.selected.status.selected.id,
                    warehouse_id: $scope.selected.warehouse.selected.id,
                    meal_time_id: $scope.selected.meal_time.selected.id,
                    reg_style_id: $scope.selected.region.selected.id,
                    category_id: $scope.selected.category.selected.id,
                    producing_qty: $scope.pr.producing_qty,
                    unit_type_id: $scope.selected.unit.selected.id,
                    product_cost: 0,
                	makeup_cost_percent: $scope.pr.makeup_cost_percent,
                	expected_cost_percent: $scope.pr.expected_cost_percent,
                	selling_price: $scope.pr.selling_price,
                	last_unit_cost: $scope.pr.last_unit_cost,
                	last_suggestion_price: $scope.pr.last_suggestion_price,
                    last_cost_percent: $scope.pr.last_cost_percent,
                	onhand_unit_cost: $scope.pr.onhand_unit_cost,
                	onhand_suggestion_price: $scope.pr.onhand_suggestion_price,
                    onhand_cost_percent: $scope.pr.onhand_cost_percent,
                    created_by: $localStorage.currentUser.name.id,
                    created_date: globalFunction.currentDate()
                }
                console.log(param)
                queryService.post('insert into mst_cuisine_recipe set ?',param)
                .then(function (result){
                    console.log(result.data.insertId)
                    $scope.addItemDetail(result.data.insertId)
                    .then(function (result3){
                        console.log(result.data.insertId)
                        $('#form-input').modal('hide')
                        $scope.nested.dtInstance.reloadData(function(obj){
                            // console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert PR '+$scope.pr.name,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                    },
                    function (err3){
                        console.log(err3)
                        $('#form-input').pgNotification({
                            style: 'flip',
                            message: 'Error Insert Line Item: '+err3.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'danger'
                        }).show();
                    })
                },
                function (err){
                    console.log(err)
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
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Cannot Add PR, Item list is Empty !!',
                    position: 'top-right',
                    timeout: 10000,
                    type: 'danger'
                }).show();

            }


        }
        else {
            console.log($scope.pr)
            console.log($scope.items)
            console.log($scope.selected.doc_status)
            console.log($scope.selected.approval)


            //exec update
            var param = {}
            param = {
                name: $scope.pr.name,
                description: $scope.pr.description,
                cooking_direction:$scope.pr.cooking_direction,
                status: $scope.selected.status.selected.id,
                warehouse_id: $scope.selected.warehouse.selected.id,
                meal_time_id: $scope.selected.meal_time.selected.id,
                reg_style_id: $scope.selected.region.selected.id,
                category_id: $scope.selected.category.selected.id,
                producing_qty: $scope.pr.producing_qty,
                unit_type_id: $scope.selected.unit.selected.id,
                product_cost: 0,
                makeup_cost_percent: $scope.pr.makeup_cost_percent,
                expected_cost_percent: $scope.pr.expected_cost_percent,
                selling_price: $scope.pr.selling_price,
                last_unit_cost: $scope.pr.last_unit_cost,
                last_suggestion_price: $scope.pr.last_suggestion_price,
                last_cost_percent: $scope.pr.last_cost_percent,
                onhand_unit_cost: $scope.pr.onhand_unit_cost,
                onhand_suggestion_price: $scope.pr.onhand_suggestion_price,
                onhand_cost_percent: $scope.pr.onhand_cost_percent,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
            }


            queryService.post('update mst_cuisine_recipe set ? where id='+$scope.pr.id,param)
            .then(function (result){
                console.log(result)
                $scope.addItemDetail($scope.pr.id)
                .then(function (result3){
                    $scope.nested.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.pr.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear();

                },
                function (err3){
                    console.log(err3)

                })

            },
            function (err){
                console.log(err)
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
    $scope.addItemDetail = function(pr_id){
        console.log('addItemDetail')
        console.log($scope.items)
        console.log(pr_id)
        var sqli = $scope.child.saveTable(pr_id);
        console.log(sqli)

        var defer = $q.defer();
        var paramItem = []
        var sqlCtr = []
        queryService.post(sqli.join(';'),undefined)
        .then(function (result2){
            defer.resolve(result2)
        },
        function (err2){
            defer.reject(err2)
        })
        /*for (var x=0;x<$scope.items.length;x++){
            paramItem.push([
                result.data.insertId,$scope.items[x].product_id,$scope.items[x].supplier_id,
                parseInt($scope.items[x].qty),parseInt($scope.items[x].price),parseInt($scope.items[x].amount),
                $localStorage.currentUser.name.id,globalFunction.currentDate()
            ])
            if ($scope.items[x].old_price == null && $scope.items[x].new_price!=undefined){
                sqlCtr.push('insert into inv_prod_price_contract(product_id,supplier_id,contract_status,contract_start_date,contract_end_date,price,created_date,created_by)' +
                    ' values('+$scope.items[x].product_id+', '+$scope.items[x].supplier_id+', \'1\', \''+globalFunction.currentDate()+'\', \''+globalFunction.endOfYear()+'\', '+
                    ' '+$scope.items[x].new_price+', \''+globalFunction.currentDate()+'\', '+$localStorage.currentUser.name.id+')'
                )
            }
            else if($scope.items[x].old_price != $scope.items[x].new_price){
                sqlCtr.push('update inv_prod_price_contract set price='+$scope.items[x].new_price+', modified_date=\''+globalFunction.currentDate()+'\','+
                    ' modified_by = '+$localStorage.currentUser.name.id+' where product_id='+$scope.items[x].product_id+' and supplier_id='+$scope.items[x].supplier_id
                )
            }
        }
        console.log(sqlCtr)
        console.log(paramItem)
        if (sqlCtr.length>0){
            console.log('Execute update Contract')
            queryService.post(sqlCtr.join(';'),undefined)
            .then(function (result2){
                console.log('Contract:'+JSON.stringify(result2))
            },
            function (err2){
                console.log('Contract:'+JSON.stringify(err2))
            })
        }

        queryService.post('delete from inv_pr_line_item where pr_id='+result.data.insertId,undefined)
        .then(function (result2){
            console.log(result2)
            queryService.post('insert into inv_pr_line_item(pr_id,product_id,supplier_id,order_qty,net_price,order_amount,created_by,created_date) values ?',[paramItem])
            .then(function (result3){
                console.log(result.data.insertId)
                defer.resolve(result3)
            },
            function (err3){
                console.log(err3)
                defer.reject(err3)
            })
        },
        function (err2){
            console.log(err2)
            queryService.post('insert into inv_pr_line_item(pr_id,product_id,supplier_id,order_qty,net_price,order_amount,created_by,created_date) values ?',[paramItem])
            .then(function (result3){
                console.log(result.data.insertId)
                defer.resolve(result3)
            },
            function (err3){
                console.log(err3)
                defer.reject(err3)
            })
        })*/


        return defer.promise;
    }

    $scope.addDetail = function(ids){
        //$scope.show.prTable = false;
        //$scope.show.itemTable = true;
        console.log(ids)
        queryService.post(qstring+' and a.id='+ids,undefined)
        .then(function (result){
            console.log(result)

            /*queryService.get('select id,name,last_order_price from mst_product order by id limit 50 ',undefined)
            .then(function(data){
                $scope.products = data.data
            })
            $scope.productUp = function(text) {
                console.log(text.toLowerCase())
                queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
                .then(function(data){
                    console.log(data)
                    $scope.products = data.data
                })


            }
            $scope.supplierUp = function(text) {
                console.log(text.toLowerCase())
                var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
                    'from mst_supplier a '+
                    'left join inv_prod_price_contract b '+
                    'on a.id = b.supplier_id  '+
                    'and a.status=1  '+
                    'and b.product_id ='+e.id+ + ' '
                    'and lower(a.name) like \''+text.toLowerCase()+'%\'' +
                    ' order by price desc limit 50'
                //queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
                queryService.post(sqlCtr,undefined)
                .then(function(data){
                    console.log(data)
                    $scope.products = data.data
                })


            }

            //$scope.pr = result.data[0]
            //console.log($scope.pr)
            $scope.getProductPrice = function(e){
                $scope.item2Add.price = e.last_order_price
                $scope.item2Add.amount = e.last_order_price * $scope.item2Add.qty
                var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
                    'from mst_supplier a '+
                    'left join inv_prod_price_contract b '+
                    'on a.id = b.supplier_id  '+
                    'and a.status=1  '+
                    'and b.product_id ='+e.id+' order by price desc limit 50'
                //queryService.get('select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',b.price) as char)as price_name from mst_supplier a, inv_prod_price_contract b where a.id = b.supplier_id and a.status=1 and b.product_id ='+e.id+' order by id',undefined)
                queryService.get(sqlCtr,undefined)
                .then(function(data){
                    console.log(data)
                    $scope.suppliers = data.data
                })
            }
            $scope.getProductPriceSupplier = function(e){
                $scope.item2Add.price = e.price
                $scope.item2Add.amount = e.price * $scope.item2Add.qty
            }
            $scope.updatePrice = function(e){
                $scope.item2Add.amount = $scope.item2Add.price * $scope.item2Add.qty
            }*/

            queryService.post(qstringdetail + ' where a.recipe_id='+ids,undefined)
            .then(function(data){
                console.log(data)
                console.log($scope.items)
                $scope.items = []
                for (var i=0;i<data.data.length;i++){
                    $scope.items.push({
                        id: i+1,
                        t_id: data.data[i].t_id,
                        p_id: data.data[i].p_id,
                        p_name:data.data[i].p_name,
                        source:data.data[i].source,
                        qty: data.data[i].qty,
                        last_price: data.data[i].last_price,
                        last_amount: data.data[i].last_amount,
                        onhand_price: data.data[i].last_price,
                        onhand_amount: data.data[i].last_amount,
                        unit_id: data.data[i].unit_id,
                        unit_name: data.data[i].unit_name

                    })
                    $scope.addSource[i+1] = data.data[i].source
                    if (data.data[i].source=='product'){
                        $scope.child.getProduct(i+1)
                        $scope.child.getProductPrice({id:data.data[i].p_id,name:data.data[i].p_name},i+1)
                    }

                    //$scope.units[$scope.item.id] = []
                }
                $scope.itemsOri = angular.copy($scope.items)
                //$scope.items = data.data
            })
            $scope.nested.dtInstanceItem = {}

            $scope.dtOptionsItem = DTOptionsBuilder.newOptions()
                .withOption('bLengthChange', false)
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withPaginationType('full_numbers')
                .withDisplayLength(100)
                .withOption('width','800px')
                .withLanguage({
                    sZeroRecords: ' ',
                    "sInfo":           "",
                    "sInfoEmpty":      "",
                });
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).withOption('width', '5%').notSortable(),
                DTColumnDefBuilder.newColumnDef(1).withOption('width', '35%'),
                DTColumnDefBuilder.newColumnDef(2).withOption('width', '5%'),
                DTColumnDefBuilder.newColumnDef(3).withOption('width', '10%'),
                DTColumnDefBuilder.newColumnDef(4).withOption('width', '10%'),
                DTColumnDefBuilder.newColumnDef(5).withOption('width', '35%')
            ];
            /*$scope.item2Add = {
                product_id:'',
                qty: '',
                price: '',
                amount: '',
                supplier_id: ''
            }
            $scope.items = _buildPerson2Add({
                product_id:'',
                qty: '',
                price: '',
                amount: '',
                supplier_id: ''
            });
            /*$scope.addPerson = addPerson;
            $scope.modifyPerson = modifyPerson;
            $scope.removePerson = removePerson;*/

            /*function _buildPerson2Add(d) {
                return d;
            }
            $scope.addItem = function() {
                console.log($scope.item2Add)
                console.log($scope.selected.product)
                console.log($scope.selected.supplier)
                $scope.item2Add.product_id = $scope.selected.product.selected?$scope.selected.product.selected.id:null
                $scope.item2Add.product_name = $scope.selected.product.selected?$scope.selected.product.selected.name:null
                if ($scope.selected.supplier){
                    $scope.item2Add.supplier_id = $scope.selected.supplier.selected?$scope.selected.supplier.selected.id:null
                    $scope.item2Add.supplier_name = $scope.selected.supplier.selected?$scope.selected.supplier.selected.name:null
                    $scope.item2Add.old_price = $scope.selected.supplier.selected?$scope.selected.supplier.selected.price:null
                }
                else {
                    $scope.item2Add.supplier_id = null
                    $scope.item2Add.supplier_name = null
                    $scope.item2Add.old_price = null
                }
                $scope.item2Add.new_price = $scope.item2Add.price

                if ($scope.item2Add.product_id!=null){
                    $scope.items.push(angular.copy($scope.item2Add));
                }

                console.log($scope.items)
                //$scope.nested.dtInstanceItem.reloadData();
                $scope.item2Add = {
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
            }
            $scope.modifyItem = function(index) {
                console.log(index)
                console.log($scope.items[index])
                $scope.selected.product.selected = {
                    id: $scope.items[index].product_id,
                    name: $scope.items[index].product_name
                }
                if ($scope.selected.supplier.selected){
                    $scope.selected.supplier.selected = {
                        id: $scope.items[index].supplier_id,
                        name: $scope.items[index].supplier_name
                    }
                }

                var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
                    'from mst_supplier a '+
                    'left join inv_prod_price_contract b '+
                    'on a.id = b.supplier_id  '+
                    'and a.status=1  '+
                    'and b.product_id ='+$scope.items[index].product_id+' order by price desc limit 50'
                queryService.get(sqlCtr,undefined)
                //queryService.get('select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',b.price) as char)as price_name from mst_supplier a, inv_prod_price_contract b where a.id = b.supplier_id and a.status=1 and b.product_id ='+$scope.items[index].product_id+' order by id',undefined)
                .then(function(data){
                    console.log(data)
                    $scope.suppliers = data.data
                })
                $scope.item2Add = $scope.items[index];
                $scope.items.splice(index, 1);

            }
            $scope.removeItem = function(index) {
                console.log(index)
                $scope.items.splice(index, 1);
            }*/
        })
    }



    $scope.update = function(ids){
        $('#form-input').modal('show');
        $scope.pr.id = ids
        console.log(qstring)
        console.log($scope.updateState)
        //$scope.updateState = true
        console.log($scope.updateState)

        queryService.post(qstring+' and a.id='+ids,undefined)
        .then(function (result){
            console.log(result)

            $scope.pr = result.data[0]
            $scope.selected.warehouse = {
                selected: {
                    id:result.data[0].warehouse_id,
                    name:result.data[0].warehouse_name
                }
            }
            $scope.selected.meal_time = {
                selected: {
                    id:result.data[0].meal_time_id,
                    name:result.data[0].meal_name
                }
            }
            $scope.selected.region = {
                selected: {
                    id:result.data[0].reg_style_id,
                    name:result.data[0].region_name
                }
            }
            $scope.selected.category = {
                selected: {
                    id:result.data[0].category_id,
                    name:result.data[0].category_name
                }
            }
            $scope.selected.unit = {
                selected: {
                    id:result.data[0].unit_type_id,
                    name:result.data[0].unit_name
                }
            }
            $scope.selected.status = {
                selected: {
                    id:result.data[0].status,
                    name:result.data[0].status_name
                }
            }

            $scope.addDetail(ids)
        },
        function (err){
            console.log(err)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Insert: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

    }

    $scope.delete = function(ids){
        $scope.pr.id = ids;
        //$scope.customer.name = obj.name;
        var qstring = 'select id, code from inv_purchase_request where id='+ids
        queryService.post(qstring,undefined)
        .then(function (result){
            console.log(result)
            $scope.pr = result.data[0]
            $('#modalDelete').modal('show')
        },
        function (err){
            console.log(err)
            $('#form-input').pgNotification({
                style: 'flip',
                message: 'Error Display: '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
        })

    }

    $scope.execDelete = function(){
        console.log('Under Construction')
        var param = [{
            doc_status_id: 8,
            approval_status: 0
        },$scope.pr.id]
        queryService.post('update inv_purchase_request set ? where id=?',param)
        .then(function (result){
            var paramState = {
                pr_id:$scope.pr.id,
                doc_status_id:8,
                created_by:$localStorage.currentUser.name.id,
                created_date:globalFunction.currentDate(),
                approval_status:0,
                approval_notes: '',
                denial_notes: ''
            }
            queryService.post('insert into inv_pr_doc_state set ?',paramState)
            .then(function (result){
                    $('#modalDelete').modal('hide')
                    $scope.nested.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Cancel PR '+$scope.pr.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear();
            },
            function (err){
                $('#modalDelete').modal('hide')
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Error Cancel PR: '+err.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
                $scope.clear();
            })
        },
        function (err){
            $('#modalDelete').modal('hide')
            $('body').pgNotification({
                style: 'flip',
                message: 'Error Cancel : '+err.code,
                position: 'top-right',
                timeout: 2000,
                type: 'danger'
            }).show();
            $scope.clear();
        })
    }

    $scope.clear = function(){
        console.log('clear')
        $scope.pr = {
            id: '',
            code: '',
            purchase_notes: '',
            delivery_date: '',
            approval_notes: '',
            doc_status_name: ''
        }
        $scope.selected = {
            status: {},
            product: {},
            warehouse: {},
            delivery_type: {},
            cost_center: {},
            doc_status: {},
            approval: 0
        }

        $scope.updateState = false
    }



})
.controller('EditableTableRcCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
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

    $scope.units = {}
    $scope.addProduct = function() {
        $scope.item = {
            id:($scope.items.length+1),
            source: 'product',
            p_id:'',
            p_name:'',
            unit: '',
            qty: 0,
            last_price: 0,
            last_amount: 0,
            onhand_price: 0,
            onhand_amount: 0,
            isNew: true
        };
        $scope.items.push($scope.item)
        $scope.addSource[$scope.item.id] = 'product'
        $scope.child.getProduct($scope.item.id)
        $scope.units[$scope.item.id] = []
    };
    $scope.addRecipe = function() {
        $scope.item = {
            id:($scope.items.length+1),
            source: 'recipe',
            p_id:'',
            p_name:'',
            unit_id: '',
            unit_name: '',
            qty: 0,
            last_price: 0,
            last_amount: 0,
            onhand_price: 0,
            onhand_amount: 0,
            isNew: true
        };
        $scope.items.push($scope.item)
        $scope.addSource[$scope.item.id] = 'recipe'
        $scope.child.getRecipe($scope.item.id)
        $scope.units[$scope.item.id] = []
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
        for (var i = $scope.items.length; i--;) {
            var user = $scope.items[i];
            console.log(user)
            // actually delete user
            /*if (user.isDeleted) {
                $scope.items.splice(i, 1);
            }*/
            // mark as not new
            /*if (user.isNew) {
                user.isNew = false;
            }*/

            // send on server
            //results.push($http.post('/saveUser', user));
            if (user.isNew && !user.isDeleted){
                if (user.source=='product'){
                    sqlitem.push('insert into mst_recipe_ingredients (recipe_id,product_id,unit_type_id,qty,last_price,last_amount,onhand_price,onhand_amount,created_by,created_date) values('+
                    pr_id+','+user.p_id+','+user.unit_id+','+user.qty+','+user.last_price+','+user.last_amount+','+user.onhand_price+','+user.onhand_amount+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }
                else if(user.source == 'recipe'){
                    sqlitem.push('insert into inv_included_recipe (recipe_id,included_recipe_id,qty,created_by,created_date) values('+
                    pr_id+','+user.p_id+','+user.qty+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')
                }

            }
            else if(!user.isNew && user.isDeleted){
                if (user.source=='product'){
                    sqlitem.push('delete from mst_recipe_ingredients where id='+user.t_id)
                }
                else if(user.source=='recipe'){
                    sqlitem.push('delete from inv_included_recipe where id='+user.t_id)
                }

            }
            else if(!user.isNew){
                console.log(user)
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        if (user.source=='product'){
                            var d1 = $scope.itemsOri[j].t_id+$scope.itemsOri[j].p_id+$scope.itemsOri[j].unit_id+$scope.itemsOri[j].qty+$scope.itemsOri[j].last_price+$scope.itemsOri[j].onhand_price
                            var d2 = user.t_id+user.p_id+user.unit_id+user.qty+user.last_price+user.onhand_price
                            if(d1 != d2){
                                sqlitem.push('update mst_recipe_ingredients set '+
                                ' product_id = '+user.p_id+',' +
                                ' unit_id = '+user.unit_id+',' +
                                ' qty = '+user.qty+',' +
                                ' last_price = '+user.last_price+',' +
                                ' last_amount = '+user.last_amount+',' +
                                ' onhand_price = '+user.onhand_price+',' +
                                ' onhand_amount = '+user.onhand_amount+',' +
                                ' modified_by = '+$localStorage.currentUser.name.id+',' +
                                ' modified_date = \''+globalFunction.currentDate()+'\'' +
                                ' where id='+user.t_id)
                            }
                        }
                        else if(user.source=='recipe'){
                            var d1 = $scope.itemsOri[j].t_id+$scope.itemsOri[j].p_id+$scope.itemsOri[j].qty
                            var d2 = user.t_id+user.p_id+user.qty
                            if(d1 != d2){
                                sqlitem.push('update inv_included_recipe set '+
                                ' included_recipe_id = '+user.p_id+',' +
                                ' qty = '+user.qty+',' +
                                ' modified_by = '+$localStorage.currentUser.name.id+',' +
                                ' modified_date = \''+globalFunction.currentDate()+'\'' +
                                ' where id='+user.t_id)
                            }
                        }

                    }
                }
            }

        }
        console.log($scope.items)
        console.log(sqlitem.join(';'))
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.products = {}
    $scope.child.getProduct = function(id){
        var qp = 'select a.id,a.name,a.price_per_unit,unit_type_id,b.name unit_name,a.price_per_lowest_unit,a.lowest_unit_type_id,c.name lowest_name,a.lowest_unit_conversion,a.price_per_recipe_unit,a.recipe_unit_type_id,d.name recipe_name,a.recipe_unit_conversion '+
            'from mst_product a '+
            'left join ref_product_unit b on a.unit_type_id=b.id '+
            'left join ref_product_unit c on a.lowest_unit_type_id=c.id '+
            'left join ref_product_unit d on a.recipe_unit_type_id=d.id '+
            'limit 10 '
        queryService.get(qp,undefined)
        .then(function(data){
            //$scope.products = data.data
            $scope.products[id] = data.data
            console.log($scope.products)
        })
    }

    $scope.child.productUp = function(id,text) {
        var qp = 'select a.id,a.name,a.price_per_unit,unit_type_id,b.name unit_name,a.price_per_lowest_unit,a.lowest_unit_type_id,c.name lowest_name,a.lowest_unit_conversion,a.price_per_recipe_unit,a.recipe_unit_type_id,d.name recipe_name,a.recipe_unit_conversion '+
            'from mst_product a '+
            'left join ref_product_unit b on a.unit_type_id=b.id '+
            'left join ref_product_unit c on a.lowest_unit_type_id=c.id '+
            'left join ref_product_unit d on a.recipe_unit_type_id=d.id '+
            'where lower(a.name) like \''+text.toLowerCase()+'%\' ' +
            'limit 10 '
        queryService.post(qp,undefined)
        .then(function(data){
            $scope.products[id] = data.data
        })
    }
    $scope.child.getRecipe = function(id){
        var qr = 'select a.id,a.name,a.last_unit_cost last_price,a.onhand_unit_cost onhand_price,a.unit_type_id,b.name unit_name '+
            'from mst_cuisine_recipe a '+
            'left join ref_product_unit b on a.unit_type_id=b.id '+
            'limit 10 '
        queryService.get(qr,undefined)
        .then(function(data){
            $scope.recipes[id] = data.data
        })
    }

    $scope.child.recipeUp = function(id,text) {
        var qr = 'select a.id,a.name,a.last_unit_cost last_price,a.onhand_unit_cost onhand_price,a.unit_type_id,b.name unit_name '+
            'from mst_cuisine_recipe a '+
            'left join ref_product_unit b on a.unit_type_id=b.id '+
            'where lower(a.name) like \''+text.toLowerCase()+'%\' '+
            'limit 10 '
        queryService.post(qr,undefined)
        .then(function(data){
            $scope.recipes[id] = data.data
        })
    }

    $scope.child.getProductPrice = function(e,d){
        console.log(e)
        $scope.items[d-1].p_id = e.id
        $scope.items[d-1].p_name = e.name
        $scope.units[d] = []
        //$scope.items[d-1].price = e.last_order_price
        //$scope.items[d-1].amount = e.last_order_price * $scope.items[d-1].qty
        if (e.unit_type_id!=null){
            $scope.units[d].push({
                id: e.unit_type_id,
                name: 'Unit: '+e.unit_name,
                price: e.price_per_unit
            })
        }
        if (e.lowest_unit_type_id!=null){
            $scope.units[d].push({
                id: e.lowest_unit_type_id,
                name: 'Lowest: '+e.lowest_name,
                price: e.price_per_lowest_unit
            })
        }
        if (e.recipe_unit_type_id!=null){
            $scope.units[d].push({
                id: e.recipe_unit_type_id,
                name: 'Recipe: '+e.recipe_name,
                price: e.price_per_recipe_unit
            })
        }
        if (e.last_price){
            $scope.items[d-1].last_price = e.last_price
            $scope.items[d-1].unit_id = e.unit_type_id
            $scope.items[d-1].unit_name = e.unit_name
        }
        if (e.onhand_price){
            $scope.items[d-1].onhand_price = e.onhand_price
        }
    }
    $scope.getItemPrice = function(e,d){
        console.log(e)
        $scope.items[d-1].last_price = e.price
        $scope.items[d-1].last_amount = e.price*$scope.items[d-1].qty

        $scope.items[d-1].unit_id = e.id
        $scope.items[d-1].unit_name = e.name

        console.log($scope.items)

    }
    $scope.funcAsync = function(e,d){
        console.log('funcAsync')
        console.log($scope.items[d-1].product_id)
        var sqlCtr = 'select a.id,a.name,a.address,b.price,cast(concat(\'Price: \',ifnull(b.price,\' - \')) as char)as price_name  '+
            'from mst_supplier a '+
            'left join inv_prod_price_contract b '+
            'on a.id = b.supplier_id  '+
            'and a.status=1  '+
            'and b.product_id ='+$scope.items[d-1].product_id + ' '
            'and lower(a.name) like \''+e.toLowerCase()+'%\'' +
            ' order by price desc limit 50'
        //queryService.post('select id,name,last_order_price from mst_product where lower(name) like \''+text.toLowerCase()+'%\' order by id limit 50 ',undefined)
        queryService.post(sqlCtr,undefined)
        .then(function(data){
            $scope.suppliers = data.data
        })
    }
    $scope.getProductPriceSupplier = function(e,d){
        console.log(e)
        $scope.items[d-1].supplier_id = e.id
        $scope.items[d-1].supplier_name = e.name
        $scope.items[d-1].price = e.price
        $scope.items[d-1].amount = e.price * $scope.items[d-1].qty
    }
    $scope.updatePrice = function(e,d,p){
        $scope.items[d-1].last_price = p
        $scope.items[d-1].last_amount = p * $scope.items[d-1].qty
    }
    $scope.updatePriceOnhand = function(e,d,p){
        $scope.items[d-1].onhand_price = p
        $scope.items[d-1].onhand_amount = p * $scope.items[d-1].qty
    }
    $scope.updatePriceQty = function(e,d,q){
        console.log(e)
        console.log(d)
        console.log(q)
        $scope.items[d-1].qty = q
        $scope.items[d-1].last_amount = q * $scope.items[d-1].last_price
        $scope.items[d-1].onhand_amount = $scope.items[d-1].onhand_price*$scope.items[d-1].qty
    }

}
);
