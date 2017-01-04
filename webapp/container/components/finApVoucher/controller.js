
var userController = angular.module('app', []);
userController
.controller('FinApVoucherCtrl',
function($scope, $state, $sce, productCategoryService, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []
    var qstring = 'select a.id, a.code, a.open_date, a.due_date, a.status, a.supplier_id, '+
        'c.name supplier_name, a.source, b.code as receive_no, '+
        'a.receive_id, a.currency_id, a.total_amount, a.home_total_amount '+
        'from acc_ap_voucher a  '+
        'left join inv_po_receive b on a.receive_id = b.id  '+
        'left join mst_supplier c on a.supplier_id = c.id  '
        //'where a.status in (:status1,:status2,:status3)  '+
        //'and a.open_date beetween :date1 and :date2  '+
        //'and a.due_date between :date1and :date2'
    var qwhere = ''

    var year = ['2015','2016','2017','2018','2019']
    var month = ['01','02','03','04','05','06','07','08','09','10','11','12']
    $scope.period = [
        { id: 0, name: 'Current Month'},
        { id: 1, name: 'Last Month'}
    ]

    /*for (var i=0;i<year.length;i++){
        for (var j=0;j<month.length;j++){
            $scope.period.push({id:year[i]+month[j],name:year[i]+'-'+month[j]})
        }
    }*/
    console.log($scope.period)

    $scope.role = {
        selected: []
    };

    $scope.cats = {}
    $scope.id = '';
    $scope.ap = {
        id: '',
        code: ''
    }

    $scope.selected = {
        status: {},
        startperiod: {},
        endperiod : {},
        period: {},
        supplier: {},
        currency: {}
    }
    $scope.selected.period = $scope.period[0]
    $scope.status = [
        {id: 0, name: 'Open'},
        {id: 1, name: 'Prepare'},
        {id: 2, name: 'Close'}
    ]

    $scope.status = []
    $scope.status = [
        {id:0,name:'Open'},
        {id:1,name:'Prepare'},
        {id:2,name:'Close'}
    ]
    /*queryService.get('select value id,name from table_ref where table_name = \'acc_ap_voucher\' and column_name = \'status\' order by name asc',undefined)
    .then(function(data){
        $scope.status = data.data
    })*/

    $scope.source = []
    $scope.source = [
        {id:0,code:'R',name:'Receiving'},
        {id:1,code:'O',name:'Other Source'}
    ]
    /*queryService.get('select value id,name from table_ref where table_name = \'acc_ap_voucher\' and column_name = \'source\' order by name asc',undefined)
    .then(function(data){
        $scope.source = data.data
    })*/
    $scope.currency = []
    queryService.get('select  id currency_id,code currency_code,name currency_name from ref_currency order by id asc',undefined)
    .then(function(data){
        $scope.currency = data.data
    })

    $scope.source_no = []
    queryService.get('select id,code,name from ref_currency order by id asc',undefined)
    .then(function(data){
        $scope.currency = data.data
    })


    $scope.filterVal = {
        search: ''
    }

    $scope.isReceiving = true
    $scope.supplier = []
    queryService.post('select id supplier_id,name supplier_name from mst_supplier order by name limit 50',undefined)
    .then(function(data){
        $scope.supplier = data.data
    })
    $scope.findSupplier = function(text){
        queryService.post('select id supplier_id, name supplier_name from mst_supplier where lower(name) like \'%'+text.toLowerCase()+'%\' order by name asc limit 50',undefined)
        .then(function(data){
            $scope.supplier = data.data
        })
    }
    $scope.source_no = []
    $scope.setSource = function(e){
        $scope.ap.source=$scope.selected.source.selected.id
        console.log(e)
        if (e.code == 'R') {
            $scope.isReceiving = false
            queryService.post('select id,code,cast(concat(\'Amount: \',ifnull(total_amount,\' - \')) as char) total_amount from inv_po_receive order by id desc limit 50',undefined)
            .then(function(data){
                console.log(data.data)
                $scope.source_no = data.data
            })
        }
        else $scope.isReceiving = true
    }

    $scope.setReceiving = function(e){
        console.log(e)
        $scope.ap.source_no=$scope.selected.source_no.selected.id
        queryService.post('select a.id,a.po_id,c.name,a.created_date,a.currency_id,d.supplier_id,e.name supplier_name,f.code currency_name,a.total_amount,a.home_currency_exchange exchange '+
            'from inv_po_receive a,table_ref c,inv_purchase_order d,mst_supplier e,ref_currency f '+
            'where c.table_name=\'inv_po_receive\' '+
            'and a.received_status=c.value '+
            'and a.po_id=d.id '+
            'and d.supplier_id=e.id '+
            'and a.currency_id=f.id '+
            'and a.id=' + e.id +
            ' order by a.id desc',undefined)
        .then(function(data){
            console.log(data.data)
            $scope.supplier = data.data
            $scope.selected.supplier['selected'] = $scope.supplier[0]
            $scope.selected.currency['selected'] = $scope.supplier[0]
            $scope.ap.exchange = data.data[0].exchange
        })

    }

    $scope.findReceiving = function(text){
        console.log(text)
        queryService.get('select id,code,cast(concat(\'Amount: \',ifnull(total_amount,\' - \')) as char) total_amount from inv_po_receive where lower(code) like \'%'+text.toLowerCase()+'%\' order by id desc limit 50',undefined)
        .then(function(data){
            $scope.currency = data.data
        })

    }
    $scope.setSupplier = function(e){
        console.log(e)
        $scope.ap.supplier_id=$scope.selected.supplier.selected.supplier_id
    }


    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.cats[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(cats[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(cats[\'' + data + '\'])" )"="">' +
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
        DTColumnBuilder.newColumn('id').withTitle('Vcr No'),
        DTColumnBuilder.newColumn('code').withTitle('Doc No'),
        DTColumnBuilder.newColumn('open_date').withTitle('Open Date'),
        DTColumnBuilder.newColumn('due_date').withTitle('Due Date'),
        DTColumnBuilder.newColumn('status').withTitle('Status'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier'),
        DTColumnBuilder.newColumn('source').withTitle('Source'),
        DTColumnBuilder.newColumn('currency_id').withTitle('Currency'),
        DTColumnBuilder.newColumn('total_amount').withTitle('Total Amount'),
        DTColumnBuilder.newColumn('home_total_amount').withTitle('Home Total Amount')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere += ' where name="'+$scope.filterVal.search+'"'
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
    }

    $scope.submit = function(){
        if ($scope.cat.id.length==0){
            //exec creation
            $scope.cat.status = $scope.selected.status.selected.id;
            delete $scope.cat.id

            queryService.post('insert into ref_product_category SET ?',$scope.cat)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.cat.name,
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
            $scope.cat.status = $scope.selected.status.selected.id;
            console.log($scope.cat)
            queryService.post('update ref_product_category SET ? WHERE id='+$scope.cat.id ,$scope.cat)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.cat.name,
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
        queryService.get(qstring+ ' and id='+obj.id,undefined)
        .then(function(result){
            $('#form-input').modal('show');
            $scope.cat.id = obj.id
            $scope.cat.name = result.data[0].name
            $scope.cat.description = result.data[0].description
            $scope.cat.status = result.data[0].status

            for (var i=0;i<$scope.arrStatus.length;i++){
                if (result.data[0].status == $scope.arrStatus[i].id){
                    $scope.selected.status.selected = $scope.arrStatus[i]
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
        $scope.cat.id = obj.id;
        //$scope.customer.name = obj.name;
        productCategoryService.get(obj.id)
        .then(function(result){
            $scope.cat.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update ref_product_category set status=2 where id='+$scope.cat.id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.cat.name,
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
        $scope.cat = {
            id: '',
            name: '',
            description: '',
            status: ''
        }
    }

})
