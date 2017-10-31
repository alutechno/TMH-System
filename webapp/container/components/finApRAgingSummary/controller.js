
var userController = angular.module('app', []);
userController
.controller('FinApRAgingSummaryCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    $scope.x = {
        detailData: []
    }
    $scope.detailData = []
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    var qstring = 'select supplier_id, b.code supplier_code, b.name as supplier_name, c.name supplier_type, d.name account_name, '+
                    	 '  format(ifnull(current,0),0)current, format(ifnull(over30,0),0)over30, format(ifnull(over60,0),0)over60, format(ifnull(over90,0),0)over90, '+
                          '   format(ifnull(over120,0),0)over120, format(ifnull(total,0),0)total  '+
                      '  from (  '+
                        '      select supplier_id,  '+
                    				'  sum(case when status = \'1\' or (status = \'2\' and age <= 30) then amount end) as current,  '+
                              '        sum(case when status = \'2\' and age between 31 and 60 then amount end) as over30,  '+
                                '      sum(case when status = \'2\' and age between 61 and 90 then amount end) as over60,  '+
                    				'  sum(case when status = \'2\' and age between 91 and 120 then amount end) as over90,  '+
                              '        sum(case when status = \'2\' and age > 120 then amount end) as over120,  '+
                                '      sum(amount) as total  '+
                    		   '  from (  '+
                    				  '  select a.supplier_id, a.status, current_due_amount amount,   '+
                    						 '  datediff(current_date(),a.open_date) as age  '+
                    					'  from acc_ap_voucher a '+
                    				   '  where current_due_amount > 0 '+
                               '  and status in (\'1\', \'2\') '+
                    				'  ) as a  '+
                    		   '  group by supplier_id '+
                    		'  ) as a  '+
                       '  left join mst_supplier b on a.supplier_id = b.id '+
                       '  left join ref_supplier_type c on c.id = b.supplier_type_id '+
                       '  left join mst_ledger_account d on d.id = c.payable_account_id ';
    console.log(qstring);
    var qwhere = ''

    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.deps = {}
    $scope.id = 0;
    $scope.department = {
        id: '',
        code: '',
        name: '',
        short_name: '',
        description: '',
        status: ''
    }

    $scope.selected = {
        dep: {}
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

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };
    queryService.post('select supplier_type,supplier_code,supplier_name,current,over30,over60,over90,over120,total from('+qstring + qwhere+')aa order by supplier_code',undefined)
    .then(function(data){
        $scope.exportData = [];
        for(var i=0;i<data.data.length;i++){
            data.data[i]['no'] = i+1
            $scope.exportData.push(data.data[i])
        }
        $scope.exportData = data.data;
        //Header
        //$scope.exportData.push(["Supplier Type","Supplier#", 'Supplier Name',"Current",'Over 30 Days', 'Over 60 Days','Over 90 Days', 'Over 120 Days','Total']);
        //Data

        console.log('print',$scope.exportData)
        //$scope.focusinControl.downloadExcel()
    })
    $scope.focusinControl = {};
    $scope.fileName = "AP Aging Report";
    $scope.exportExcel = function(){
        queryService.post('select supplier_type,supplier_code,supplier_name,current,over30,over60,over90,over120,total from('+qstring + qwhere+')aa ',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Supplier Type","Supplier#", 'Supplier Name',"Current",'Over 30 Days', 'Over 60 Days','Over 90 Days', 'Over 120 Days','Total']);
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
    $scope.nested = {}
    $scope.nested.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.deps[data] = {id:data};
        //console.log('dt',data,full)
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
                html +=
                '<button class="btn btn-default" title="Detail" ng-click="detail(' + data + ', \''+full.supplier_name+'\')">' +
                '   <i class="fa fa-list"></i>' +
                '</button>&nbsp;' ;
            html += '</div>'
        }
        return html
    }

    $scope.createdRow = function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    $scope.nested.dtOptions = DTOptionsBuilder.newOptions()
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
    .withOption('scrollX',false)
    .withOption('createdRow', $scope.createdRow);

    $scope.nested.dtColumns = [];
    /*if ($scope.el.length>0){
        $scope.nested.dtColumns.push(DTColumnBuilder.newColumn('supplier_id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '5%'))
    }*/
    $scope.nested.dtColumns.push(
        DTColumnBuilder.newColumn('supplier_type').withTitle('Type').withOption('width','10%'),
        DTColumnBuilder.newColumn('supplier_code').withTitle('Code').withOption('width','8%'),
        DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier Name').withOption('width','15%'),
        DTColumnBuilder.newColumn('current').withTitle('Current').withOption('width','10%').withClass('text-right'),
        DTColumnBuilder.newColumn('over30').withTitle('> 30 Days').withOption('width','10%').withClass('text-right'),
        DTColumnBuilder.newColumn('over60').withTitle('> 60 Days').withOption('width','10%').withClass('text-right'),
        DTColumnBuilder.newColumn('over90').withTitle('> 90 Days').withOption('width','10%').withClass('text-right'),
		    DTColumnBuilder.newColumn('over120').withTitle('> 120 Days').withOption('width','10%').withClass('text-right'),
        DTColumnBuilder.newColumn('total').withTitle('Total').withOption('width','15%').withClass('text-right')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhere = ' where lower(b.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '
                else qwhere = ' '
                $scope.nested.dtInstance.reloadData(function(obj){
                    console.log(obj)
                }, false)
            }
        }
        else {
            $scope.nested.dtInstance.reloadData(function(obj){
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
    $scope.supp_name = ''
    $scope.detail = function(ids,name){
        $scope.id = ids
        $scope.supp_name = name
        $scope.nested.runDetail();
        $('#form-input').modal('show')
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
