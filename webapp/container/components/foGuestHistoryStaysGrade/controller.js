
var userController = angular.module('app', []);
userController
.controller('FoGuestHistoryStaysGradeCtrl',
function($scope, $state, $sce, queryService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL) {

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

    $scope.table = 'ref_hist_stay_grade'

    var qstring = "select a.*,d.status_name "+
                    "from "+ $scope.table +" a "+
                    "left join (select id as status_id, value as status_value,name as status_name from table_ref "+
                    "where table_name = 'ref_product_category' and column_name='status' and value in (0,1)) d on a.status = d.status_value "+
                    "where a.status!=2 "
    var qwhere = ""

    $scope.rowdata = {}
    $scope.field = {
        id: '',
        name: '',
        code: '',
        description: '',
        status: '',
        grade: '',
        num_of_stay_begin: '',
        num_of_stay_end: ''
    }

    $scope.selected = {
        status: {}
    }

    $scope.arr = {
        status: []
    }

    $scope.arr.status = []
    queryService.get('select value as id,name from table_ref where table_name = \'ref_product_category\' and column_name=\'status\' and value in (0,1)',undefined)
    .then(function(data){
        $scope.arr.status = data.data
    })

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.focusinControl = {};
    $scope.fileName = "Guest History Stays Grade";
    $scope.exportExcel = function(){

        queryService.post('select code,name,description,status_name,grade,num_of_stay_begin,num_of_stay_end from('+qstring + qwhere+')aa order by code',undefined)
        .then(function(data){
            $scope.exportData = [];
            //Header
            $scope.exportData.push(["Code", "Name", 'Description','Status','Grade','Stay Begin','Stay End']);
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
        $scope.rowdata[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(rowdata[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(rowdata[\'' + data + '\'])" )"="">' +
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
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('description').withTitle('Description'),
        DTColumnBuilder.newColumn('status_name').withTitle('Status'),
        DTColumnBuilder.newColumn('grade').withTitle('Grade'),
        DTColumnBuilder.newColumn('num_of_stay_begin').withTitle('Stay Begin'),
        DTColumnBuilder.newColumn('num_of_stay_end').withTitle('Stay End')
    );

    var qwhereobj = {
        text: ''
    }
    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
                if ($scope.filterVal.search.length>0) qwhereobj.text = ' lower(a.name) like \'%'+$scope.filterVal.search+'%\' '
                else qwhereobj.text = ''
                qwhere = setWhere()

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
        return strWhere
    }

    /*END AD ServerSide*/

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
        if ($scope.field.id.length==0){
            //exec creation
            $scope.field.status = $scope.selected.status.selected.id;
            $scope.field['created_by'] = $localStorage.currentUser.name.id;
            $scope.field['created_date'] = globalFunction.currentDate();

            queryService.post('insert into '+ $scope.table +' SET ?',$scope.field)
            .then(function (result){
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
            $scope.field.status = $scope.selected.status.selected.id;
            $scope.field['modified_by'] = $localStorage.currentUser.name.id;
            $scope.field['modified_date'] = globalFunction.currentDate();

            queryService.post('update '+ $scope.table +' SET ? WHERE id='+$scope.field.id ,$scope.field)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Update '+$scope.field.name,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();
                    $scope.clear()
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
        $('#form-input').modal('show');
        $scope.field.id = obj.id

        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){

            $scope.field.name = result.data[0].name
            $scope.field.description = result.data[0].description
            $scope.field.status = result.data[0].status
            $scope.field.code = result.data[0].code
            $scope.field.grade = result.data[0].grade
            $scope.field.num_of_stay_begin = result.data[0].num_of_stay_begin
            $scope.field.num_of_stay_end = result.data[0].num_of_stay_end
            for (var i = $scope.arr.status.length - 1; i >= 0; i--) {
                if ($scope.arr.status[i].id == result.data[0].status){
                    $scope.selected.status.selected = {name: $scope.arr.status[i].name, id: $scope.arr.status[i].id}
                }
            }

        })
    }

    $scope.delete = function(obj){
        $scope.field.id = obj.id;
        queryService.get(qstring+ ' and a.id='+obj.id,undefined)
        .then(function(result){
            $scope.field.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        queryService.post('update '+ $scope.table +' set status=2, '+
        ' modified_by='+$localStorage.currentUser.name.id+
        ' ,modified_date=\''+globalFunction.currentDate()+'\''+
        '  where id='+$scope.field.id,undefined)
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
            name: '',
            code: '',
            description: '',
            status: '',
            grade: '',
            num_of_stay_begin: '',
            num_of_stay_end: ''
        }

        $scope.selected = {
            status: {}
        }
    }

})
