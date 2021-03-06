
var userController = angular.module('app', []);
userController
.controller('FinGlBudgetEntryCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
	$scope.disableAction = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }
    $scope.users = []

    $scope.role = {
        selected: []
    };

    $scope.table = 'acc_monthly_budget_alloc'

    var qstring = 'select c.id budget_id,a.id, a.code as account, a.name as account_name, b.name as account_type, '+
           'a.short_name, a.description, a.status, a.report_level, FORMAT(c.total_budget_amount,2)total_budget_amount, '+
           'FORMAT(c.month1_budget_amount,2)month1_budget_amount, FORMAT(c.month2_budget_amount,2)month2_budget_amount, FORMAT(c.month3_budget_amount,2)month3_budget_amount,  '+
           'FORMAT(c.month4_budget_amount,2)month4_budget_amount, FORMAT(c.month5_budget_amount,2)month5_budget_amount, FORMAT(c.month6_budget_amount,2)month6_budget_amount,  '+
           'FORMAT(c.month7_budget_amount,2)month7_budget_amount, FORMAT(c.month8_budget_amount,2)month8_budget_amount, FORMAT(c.month9_budget_amount,2)month9_budget_amount,  '+
           'FORMAT(c.month10_budget_amount,2)month10_budget_amount, FORMAT(c.month11_budget_amount,2)month11_budget_amount, FORMAT(c.month12_budget_amount,2)month12_budget_amount '+
      'from mst_ledger_account a '+
      'left join ref_ledger_account_type b on b.id = a.account_type_id '+
      ',acc_monthly_budget_alloc c where c.account_id = a.id '
      //and c.year = \'2016\' '+
     //'where a.status = 1 '
    var qwhere = ''
    var qwhere2 = 'and a.status = 1 '
	$scope.focusinControl = {};
	$scope.fileName = "Budget Allocation";
	$scope.exportExcel = function(){
		queryService.post('select c.year,a.code as account, a.name as account_name,'+
		   'FORMAT(c.total_budget_amount,2)total_budget_amount, '+
		   'FORMAT(c.month1_budget_amount,2)month1_budget_amount, FORMAT(c.month2_budget_amount,2)month2_budget_amount, FORMAT(c.month3_budget_amount,2)month3_budget_amount,  '+
		   'FORMAT(c.month4_budget_amount,2)month4_budget_amount, FORMAT(c.month5_budget_amount,2)month5_budget_amount, FORMAT(c.month6_budget_amount,2)month6_budget_amount,  '+
		   'FORMAT(c.month7_budget_amount,2)month7_budget_amount, FORMAT(c.month8_budget_amount,2)month8_budget_amount, FORMAT(c.month9_budget_amount,2)month9_budget_amount,  '+
		   'FORMAT(c.month10_budget_amount,2)month10_budget_amount, FORMAT(c.month11_budget_amount,2)month11_budget_amount, FORMAT(c.month12_budget_amount,2)month12_budget_amount '+
			'from mst_ledger_account a '+
			'left join ref_ledger_account_type b on b.id = a.account_type_id '+
			',acc_monthly_budget_alloc c where c.account_id = a.id and a.status=1 and c.year='+ $scope.selected.filter_year.selected.name,undefined)
		.then(function(data){
			$scope.exportData = [];
			//Header
			$scope.exportData.push(["Year","account_id","account Name","Total","January","February","March","April","May","June","July","August","September","October","November","December"]);
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
    $scope.rowdata = {}
    $scope.field = {
        id: '',
        code: '',
        name: '',
        short_name: '',
        description: '',
        status: '',
        asset_type_id: '',
        asset_loc_id: '',
        asset_dept_id: '',
        initial_qty: '',
        current_qty: '',
        initial_value: '',
        book_value: '',
        total: '',
        jan: '',
        feb: '',
        mar: '',
        apr: '',
        may: '',
        jun: '',
        jul: '',
        aug: '',
        sep: '',
        oct: '',
        nov: '',
        dec: ''
    }

    $scope.selected = {
        account: {},
        status: {},
        method: {},
        filter_year: {}
    }
    var year = ['2015','2016','2017','2018','2019']
    $scope.listYear = []
    var cd = new Date()
    $scope.selected.filter_year['selected'] = {id: cd.getFullYear(),name:cd.getFullYear()}
    qwhere = ' and c.year='+ cd.getFullYear() + ' '
    for (var i=0;i<year.length;i++){
        $scope.listYear.push({
            id: year[i],
            name: year[i]
        })
    }

    $scope.arr = {
        account: [],
        status: []
    }

    $scope.arr.status = []
    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1)',undefined)
    .then(function(data){
        $scope.arr.status = data.data
    })

    $scope.arr.account = []
    queryService.get('select * from mst_ledger_account where status = 1 order by name',undefined)
    .then(function(data){
        $scope.arr.account = data.data
    })

    $scope.setPeriod = function(){

        qwhere = ' and c.year='+ $scope.selected.filter_year.selected.name + ' '
        $scope.dtInstance.reloadData()
    }
	$scope.setFiles = function(element){
		$scope.$apply(function(scope) {
	      //console.log('files:', element.files);
	        $scope.files = []
	        for (var i = 0; i < element.files.length; i++) {
	          $scope.files.push(element.files[i])
	        }
	      $scope.progressVisible = false
      	});
    };

	$scope.uploadFile = function() {
        var fd = new FormData()
        for (var i=0; i<$scope.files.length;i++) {
            fd.append("file", $scope.files[i])
        }
        var xhr = new XMLHttpRequest()
		xhr.upload.addEventListener("progress", uploadProgress, false)
        xhr.addEventListener("load", uploadComplete, false)
        xhr.addEventListener("error", uploadFailed, false)
        xhr.addEventListener("abort", uploadCanceled, false)
        xhr.open("POST", "/uploadBudget",true);
		xhr.setRequestHeader("authorization", 'Basic ' + $localStorage.mediaToken);
        $scope.progressVisible = true;
        xhr.send(fd);
    }

	function uploadProgress(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            } else {
                $scope.progress = 'unable to compute'
            }
        })
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
		$scope.dtInstance.reloadData(function(obj){
			// console.log(obj)
		}, false)
        alert(evt.target.responseText)

    }

    function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.")
    }

    function uploadCanceled(evt) {
        $scope.$apply(function(){
            $scope.progressVisible = false
        })
        alert("The upload has been canceled by the user or the browser dropped the connection.")
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
        $scope.rowdata[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" title="Update" ng-click="update(rowdata[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" title="Delete" ng-click="delete(' + full.budget_id + ')">' +
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
            data.query = qstring + qwhere + qwhere2;
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
    .withOption('scrollX',true)
    .withOption('createdRow', $scope.createdRow);

    $scope.dtColumns = [];
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('account').withTitle('Account#'),
        DTColumnBuilder.newColumn('account_name').withTitle('Name'),
        //DTColumnBuilder.newColumn('account_type').withTitle('Type'),
        DTColumnBuilder.newColumn('total_budget_amount').withTitle('Total'),
        DTColumnBuilder.newColumn('month1_budget_amount').withTitle('January'),
        DTColumnBuilder.newColumn('month2_budget_amount').withTitle('February'),
        DTColumnBuilder.newColumn('month3_budget_amount').withTitle('March'),
        DTColumnBuilder.newColumn('month4_budget_amount').withTitle('April'),
        DTColumnBuilder.newColumn('month5_budget_amount').withTitle('May'),
        DTColumnBuilder.newColumn('month6_budget_amount').withTitle('June'),
        DTColumnBuilder.newColumn('month7_budget_amount').withTitle('July'),
        DTColumnBuilder.newColumn('month8_budget_amount').withTitle('August'),
        DTColumnBuilder.newColumn('month9_budget_amount').withTitle('September'),
        DTColumnBuilder.newColumn('month10_budget_amount').withTitle('October'),
        DTColumnBuilder.newColumn('month11_budget_amount').withTitle('November'),
        DTColumnBuilder.newColumn('month12_budget_amount').withTitle('December')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) {
                    qwhere += ' and (lower(a.code) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(a.short_name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(a.description) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(a.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(b.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(c.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
                        ' or lower(e.name) like "%'+$scope.filterVal.search.toLowerCase()+'%" '+
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

    $scope.setMonthly = function(){
        if ($scope.selected.method==1){
            $scope.field.total =
            parseFloat($scope.field.jan)+parseFloat($scope.field.feb)+
            parseFloat($scope.field.mar)+parseFloat($scope.field.apr)+
            parseFloat($scope.field.may)+parseFloat($scope.field.jun)+
            parseFloat($scope.field.jul)+parseFloat($scope.field.aug)+
            parseFloat($scope.field.sep)+parseFloat($scope.field.oct)+
            parseFloat($scope.field.nov)+parseFloat($scope.field.dec)
        }
    }
    $scope.setYearly = function(){
        if ($scope.selected.method==2){
            $scope.field.jan = $scope.field.total/12
            $scope.field.feb = $scope.field.total/12
            $scope.field.mar = $scope.field.total/12
            $scope.field.apr = $scope.field.total/12
            $scope.field.may = $scope.field.total/12
            $scope.field.jun = $scope.field.total/12
            $scope.field.jul = $scope.field.total/12
            $scope.field.aug = $scope.field.total/12
            $scope.field.sep = $scope.field.total/12
            $scope.field.oct = $scope.field.total/12
            $scope.field.nov = $scope.field.total/12
            $scope.field.dec = $scope.field.total/12
        }
    }

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
    }

	$scope.upload = function(){

	}

    $scope.submit = function(){
		$scope.disableAction = true;
        if ($scope.field.id.length==0){
            //exec creation
            $scope.field.status = $scope.selected.status.selected.id;
            $scope.field['created_by'] = $localStorage.currentUser.name.id;
            $scope.field['created_date'] = globalFunction.currentDate();
            $scope.field.asset_type_id = $scope.selected.asset_type_id.selected.id;
            $scope.field.asset_loc_id = $scope.selected.asset_loc_id.selected.id;
            $scope.field.asset_dept_id = $scope.selected.asset_dept_id.selected.id;

            queryService.post('insert into '+ $scope.table +' SET ?',$scope.field)
            .then(function (result){
				$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.field.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
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
            	year: $scope.selected.filter_year.selected.name,
            	account_id: $scope.selected.account.selected.id,
            	total_budget_amount: $scope.field.total,
            	month1_budget_amount: $scope.field.jan,
            	month2_budget_amount: $scope.field.feb,
            	month3_budget_amount: $scope.field.mar,
            	month4_budget_amount: $scope.field.apr,
            	month5_budget_amount: $scope.field.may,
            	month6_budget_amount: $scope.field.jun,
            	month7_budget_amount: $scope.field.jul,
            	month8_budget_amount: $scope.field.aug,
            	month9_budget_amount: $scope.field.sep,
            	month10_budget_amount: $scope.field.oct,
            	month11_budget_amount: $scope.field.nov,
            	month12_budget_amount: $scope.field.dec,
                created_by: $localStorage.currentUser.name.id,
                created_date: globalFunction.currentDate()
            }

            queryService.post('insert into acc_monthly_budget_alloc SET ? ' ,param)
            .then(function (result){
				$scope.disableAction = false;
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Add Allocation for '+$scope.selected.account.selected.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear()
            },
            function (err){

                if (err.code == 'ER_DUP_ENTRY'){
                    queryService.post('update acc_monthly_budget_alloc SET ? where year='+$scope.selected.filter_year.selected.name +' and account_id='+$scope.selected.account.selected.id ,param)
                    .then(function (result2){
						$scope.disableAction = false;
                            $('#form-input').modal('hide')
                            $scope.dtInstance.reloadData(function(obj){
                                // console.log(obj)
                            }, false)
                            $('body').pgNotification({
                                style: 'flip',
                                message: 'Success Update Allocation for '+$scope.selected.account.selected.name,
                                position: 'top-right',
                                timeout: 2000,
                                type: 'success'
                            }).show();
                            $scope.clear()
                    },
                    function (err2){
						$scope.disableAction = false;
                            $('#form-input').pgNotification({
                                style: 'flip',
                                message: 'Error Update: '+err.code,
                                position: 'top-right',
                                timeout: 2000,
                                type: 'danger'
                            }).show();
                    })
                }
                else {
					$scope.disableAction = false;
                    $('#form-input').pgNotification({
                        style: 'flip',
                        message: 'Error Update: '+err.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'danger'
                    }).show();
                }

            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        $scope.field.id = obj.id

        queryService.get(qstring+ ' where a.id='+obj.id,undefined)
        .then(function(result){
            console.log($scope.selected)
            $scope.selected.account['selected']={
                id: result.data[0].id,
                code: result.data[0].account,
                name: result.data[0].account_name
            }
            $scope.field.total = result.data[0].total_budget_amount
            $scope.field.jan = result.data[0].month1_budget_amount
            $scope.field.feb = result.data[0].month2_budget_amount
            $scope.field.mar = result.data[0].month3_budget_amount
            $scope.field.apr = result.data[0].month4_budget_amount
            $scope.field.may = result.data[0].month5_budget_amount
            $scope.field.jun = result.data[0].month6_budget_amount
            $scope.field.jul = result.data[0].month7_budget_amount
            $scope.field.aug = result.data[0].month8_budget_amount
            $scope.field.sep = result.data[0].month9_budget_amount
            $scope.field.oct = result.data[0].month10_budget_amount
            $scope.field.nov = result.data[0].month11_budget_amount
            $scope.field.dec = result.data[0].month12_budget_amount

        })
    }

    $scope.delete = function(obj){
        $scope.field.id = obj.id;
        queryService.get(qstring+ ' and c.id='+obj,undefined)
        .then(function(result){
            $scope.field = result.data[0];
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('delete from acc_monthly_budget_alloc'+
        '  where id='+$scope.field.budget_id,undefined)
        .then(function (result){
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
                $('body').pgNotification({
                    style: 'flip',
                    message: 'Success Delete '+$scope.field.name,
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
        $scope.field = {
            id: '',
            code: '',
            name: '',
            short_name: '',
            description: '',
            status: '',
            asset_type_id: '',
            asset_loc_id: '',
            asset_dept_id: '',
            initial_qty: '',
            current_qty: '',
            initial_value: '',
            book_value: ''
        }
        var cd = new Date()


        $scope.selected = {
            method: {},
            account: {},
            status: {},
            filter_year: {
                selected: {id: cd.getFullYear(),name:cd.getFullYear()}
            }
        }
    }

})
