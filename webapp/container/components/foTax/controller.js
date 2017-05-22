
var userController = angular.module('app', []);
userController
.controller('FoTaxCtrl',
function($scope, $state, $sce, queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    var qstring = "select a.id,a.code,a.name,a.description,a.status,b.status_name from mst_guest_transaction_tax a, "+
        "(select id as status_id, value as status_value,name as status_name  "+
            "from table_ref  "+
            "where table_name = 'ref_product_category' and column_name='status')b "+
        "where a.status = b.status_value and a.status!=2 "
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
        description: '',
        status: ''
    }

    $scope.items = []
    $scope.itemsOri = []
    $scope.child = {}

    $scope.selected = {
        status: {},
        filter_department: {},
        filter_account_type: {}
    }

    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1) order by name asc',undefined)
    .then(function(data){
        $scope.arrActive = data.data
        $scope.selected.status['selected'] = $scope.arrActive[0]
    })

    $scope.focusinControl = {};
    $scope.fileName = "Guest Transaction Tax Reference";
    $scope.exportExcel = function(){

        queryService.post('select code,name,description,status_name from('+qstring + qwhere+')aa order by code',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code", "Name", 'Description','Status']);
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
        DTColumnBuilder.newColumn('name').withTitle('Name').withOption('width', '20%'),
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
        $scope.items = []
        $scope.itemsOri = []
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
        if ($scope.coa.id.length==0){
            //exec creation

            var param = {
                code: $scope.coa.code,
                name: $scope.coa.name,
                description: $scope.coa.description,
                status: $scope.selected.status.selected.id,
                created_date: globalFunction.currentDate(),
                created_by: $localStorage.currentUser.name.id
            }
            console.log(param)

            queryService.post('insert into mst_guest_transaction_tax SET ?',param)
            .then(function (result){
                var q = $scope.child.saveTable(result.data.insertId)
                if (q.length>0){
                    queryService.post(q.join(';'),undefined)
                    .then(function (result3){
                        console.log(result.data.insertId)
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            // console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert '+$scope.coa.code,
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
                }
                else {
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert  '+$scope.coa.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                }


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
            //exec update

            var param = {
                code: $scope.coa.code,
                name: $scope.coa.name,
                description: $scope.coa.description,
                status: $scope.selected.status.selected.id,
                modified_date: globalFunction.currentDate(),
                modified_by: $localStorage.currentUser.name.id
            }
            console.log(param)
            queryService.post('update mst_guest_transaction_tax SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Update')
                    $('#form-input').modal('hide')
                    var q = $scope.child.saveTable($scope.coa.id)
                    if (q.length>0){
                        queryService.post(q.join(';'),undefined)
                        .then(function (result3){
                            console.log(result.data.insertId)
                            $('#form-input').modal('hide')
                            $scope.dtInstance.reloadData(function(obj){
                                // console.log(obj)
                            }, false)
                            $('body').pgNotification({
                                style: 'flip',
                                message: 'Success Insert '+$scope.coa.code,
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
                    }
                    else {
                        $('#form-input').modal('hide')
                        $scope.dtInstance.reloadData(function(obj){
                            // console.log(obj)
                        }, false)
                        $('body').pgNotification({
                            style: 'flip',
                            message: 'Success Insert '+$scope.coa.code,
                            position: 'top-right',
                            timeout: 2000,
                            type: 'success'
                        }).show();
                    }
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
            $scope.coa.name = result.data[0].name
            $scope.coa.short_name = result.data[0].name
            $scope.coa.description = result.data[0].description
            $scope.coa.status = result.data[0].status
            $scope.coa.status = result.data[0].status
            $scope.selected.status.selected = {id: result.data[0].status,name:result.data[0].status_name}
            queryService.post("select a.id,a.tax_id,a.transc_type_id,b.short_name,b.code,b.folio_text,a.percentage,a.sequence_no "+
                "from mst_transaction_tax_detail a, mst_guest_transaction_type b "+
                "where a.transc_type_id = b.id " + " and a.tax_id="+result.data[0].id +" order by a.sequence_no asc ",undefined)
            .then(function(data2){

                $scope.items = []
                for (var i=0;i<data2.data.length;i++){
					var p=''
                    $scope.items.push({
                        id: i+1,
                        p_id: data2.data[i].id,
                        transc_type_id: data2.data[i].transc_type_id,
                        code:data2.data[i].code,
                        short_name:data2.data[i].short_name,
                        folio_text:data2.data[i].folio_text,
                        percentage: data2.data[i].percentage,
                        sequence_no: data2.data[i].sequence_no
                    })
                }
				$scope.itemsOri = angular.copy($scope.items)
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
        queryService.post('update mst_guest_transaction_tax SET status=\'2\', '+
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
    }

})
.controller('EditableTableTaxCtrl', function($scope, $filter, $http, $q, queryService,$sce,$localStorage,globalFunction) {
    $scope.item = {
        id:0,
        transc_type_id:'',
        short_name:'',
        code:'',
        folio_text: '',
        percentage: 0,
        sequence_no: 0
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
        var filtered = $filter('filter')($scope.items, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

    // add user
    $scope.addUser = function() {
        $scope.item = {
            id:($scope.items.length+1),
            transc_type_id:'',
            short_name:'',
            code:'',
            folio_text: '',
            percentage: 0,
            sequence_no: ($scope.items.length+1),
            isNew: true
        };
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
        var results = [];
        var sqlitem = []
		console.log("items")

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
			    sqlitem.push('insert into mst_transaction_tax_detail (tax_id,transc_type_id,percentage,sequence_no,created_by,created_date) values('+
                pr_id+','+user.transc_type_id+','+user.percentage+','+user.sequence_no+','+$localStorage.currentUser.name.id+','+'\''+globalFunction.currentDate()+'\''+')')

            }
            else if(!user.isNew && user.isDeleted){
                sqlitem.push('delete from mst_transaction_tax_detail where id='+user.p_id)
            }
            else if(!user.isNew){
                for (var j=0;j<$scope.itemsOri.length;j++){
                    if ($scope.itemsOri[j].p_id==user.p_id){
                        var d1 = $scope.itemsOri[j].p_id+$scope.itemsOri[j].tax_id+$scope.itemsOri[j].transc_type_id+$scope.itemsOri[j].percentage+$scope.itemsOri[j].sequence_no
                        var d2 = user.p_id+user.tax_id+user.transc_type_id+user.percentage+user.sequence_no
                        if(d1 != d2){
                            sqlitem.push('update mst_transaction_tax_detail set '+
                            ' transc_type_id = '+user.transc_type_id+',' +
                            ' percentage = '+user.percentage+',' +
                            ' sequence_no = '+user.sequence_no+',' +
                            ' modified_by = '+$localStorage.currentUser.name.id+',' +
                            ' modified_date = \''+globalFunction.currentDate()+'\'' +
                            ' where id='+user.p_id)
                        }
                    }
                }
            }

        }
        console.log(sqlitem)
        return sqlitem
        //return $q.all(results);
    };
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.transcs = []

    queryService.get('select a.id,a.short_name,a.code,a.folio_text '+
        'from mst_guest_transaction_type a order by id ',undefined)
    .then(function(data){
        $scope.transcs = data.data
    })

    $scope.setPercentage = function(e,d,p){
		$scope.items[d-1].percentage = p
	}
    $scope.setIndex = function(e,d,p){
		$scope.items[d-1].sequence_no = p
	}


    $scope.getTransac = function(e,d){
        $scope.items[d-1].transc_type_id = e.id
        $scope.items[d-1].code = e.code
        $scope.items[d-1].short_name = e.short_name
        $scope.items[d-1].folio_text = e.folio_text
    }

});
