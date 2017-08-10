
var userController = angular.module('app', ['mgo-angular-wizard']);
userController
.controller('FoShiftAuditCtrl',
function($scope, $state, $sce, queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, globalFunction,API_URL,WizardHandler) {
    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }



    $scope.finished = function() {
       console.log("Wizard finished :)");
   }

   $scope.logStep = function() {
       console.log("Step continued");
   }

   $scope.goBack = function() {
       WizardHandler.wizard().goTo(0);
   }

   $scope.getCurrentStep = function(){
       return WizardHandler.wizard().currentStepNumber();
   }
   $scope.goToStep = function(step){
       console.log(step)
       WizardHandler.wizard().goTo(step);
   }
   $scope.currentShift = {
       id:'',code:'',name:'',description:'',start_time:'',end_time:''
   };
   var dateIn = new Date();
   $scope.currentPeriod = dateIn.toISOString().split('T')[0];
   console.log('period',$scope.currentPeriod)
   queryService.post('select id,code,name,description,start_time,end_time from ref_hk_working_shift where is_current_shift = \'Y\' ',undefined)
   .then(function(data){
       $scope.currentShift = data.data[0]
       //Check Step
       queryService.post('select max(step_id)as step,max(id) as currentId,max(parent_id) groupId from fo_audit_status where shift_id='+$scope.currentShift.id+' and period>=\''+$scope.currentPeriod+'\' and created_by=\''+$localStorage.currentUser.name.id+'\' ',undefined)
       .then(function(data){
           console.log('currentStep',data.data)
           $scope.currentStep=data.data[0].step;
           $scope.currentAuditId=data.data[0].currentId;
           if (data.data[0].groupId==0) $scope.currentGroupId=data.data[0].currentId;
           else $scope.currentGroupId=data.data[0].groupId;
           WizardHandler.wizard().goTo($scope.currentStep);
           if ($scope.currentStep==1){
               $scope.showClosedTransaction();
           }
           else if($scope.currentStep == 2){
               $scope.showGuestDeposit();
           }
           //WizardHandler.wizard().goTo(1);
       });
   });

   $scope.closedTransaction = [];
   $scope.currentAuditId = 0;
   $scope.currentStep=0;
   $scope.execClosedTransaction = function(){
       queryService.post('SET @out_id_audit = 0;CALL `begin_audit`(\''+$scope.currentPeriod+'\',\'SA\','+$scope.currentShift.id+',1,'+$localStorage.currentUser.name.id+',@out_id_audit);SELECT @out_id_audit;', undefined)
       .then(function (result2){
           $scope.currentAuditId = result2.data[2]['0']['@out_id_audit'];
           $scope.currentGroupId=result2.data[2]['0']['@out_id_audit'];
       },
       function(err2){
           console.log(err2)
       })
   }
   $scope.showClosedTransaction = function(){
       // call begin_audit(p_period, 'NA', 0, 3, p_auditor, @out_id_audit);
       queryService.post("select a.id, a.payment_type_id, a.home_payment_amount, c.category payment_cat, "+
        	"c.account_id cash_account_id, d.ar_account_id, d.fee_account_id,  "+
            "a.card_no, date_format(a.created_date,'%Y-%m-%d %H:%i:%s')created_date, a.folio_id,c.name payment_type_name, "+
            "concat(f.first_name,' ',f.last_name) cust_name,g.name room_name "+
        "from fd_guest_payment a "+
        "left join fo_cashier_transaction b on b.id = a.cashier_transc_id "+
        "left join ref_payment_method c on c.id = a.payment_type_id "+
        "left join mst_credit_card d on d.id = c.credit_card_id "+
        "left join fd_guest_folio e on e.id = a.folio_id "+
        "left join mst_customer f on e.customer_id = f.id "+
        "left join mst_room g on e.room_id = g.id "+
        "where a.created_date >= b.start_transc_time  "+
        "and a.created_date <= b.end_transc_time "+
        "and '2017-06-08' between b.start_transc_time and b.end_transc_time "+
        "and b.working_shift_id = 1 "+
        "and a.payment_status = '1' "+
        "order by id",undefined)
       .then(function(data){
           //$scope.closedTransaction = data.data;
           var obj = {}
           for (var i=0;i<data.data.length;i++){
               if (!obj[data.data[i].payment_type_name]){
                   obj[data.data[i].payment_type_name] = [data.data[i]]
               }
               else obj[data.data[i].payment_type_name].push(data.data[i])
           }

           for (var key in obj){
               var tot = 0
               for (var i=0;i<obj[key].length;i++){
                   tot += obj[key][i].home_payment_amount
               }
               $scope.closedTransaction.push({
                   payment_type_name: key,
                   total:tot,
                   data:obj[key]
               })
           }
           console.log('closedTransaction',$scope.closedTransaction)

       });
   }
   $scope.addStatus = function(step_id){
       //queryService.post('SET @out_id_audit = 0;CALL `begin_audit`(\''+$scope.currentPeriod+'\',\'NA\','+$scope.currentShift.id+',1,'+$localStorage.currentUser.name.id+',@out_id_audit);SELECT @out_id_audit;', undefined)
       var sql = "insert into fo_audit_status(period, audit_type, shift_id, step_id, parent_id,audit_started_at, created_by) "+
    		"values ('"+$scope.currentPeriod+"', 'SA', "+$scope.currentShift.id+", "+step_id+","+$scope.currentGroupId+", current_timestamp(), "+$localStorage.currentUser.name.id+")"
        console.log(sql,$scope.currentPeriod,$scope.currentShift,$scope.currentGroupId)
        queryService.post(sql, undefined)
        .then(function (result2){
            console.log('addStatus',result2)
        },
        function(err2){
            console.log(err2)
        })
   }
   $scope.guestDeposit = [];
   $scope.execGuestDeposit = function(){
       console.log('execGuestDeposit')
       queryService.post('call sa_guest_payments(\''+$scope.currentPeriod+'\', '+$scope.currentShift.id+',  '+$localStorage.currentUser.name.id+');', undefined)
       .then(function (result2){
           console.log('sa_guest_payments',result2)
           $scope.addStatus(2)
       },
       function(err2){
           console.log(err2)
       })
   }
   $scope.showGuestDeposit = function(){
       console.log('showGuestDeposit')
       queryService.post("select b.id folio_id, b.code folio_code,d.name room_name, a.deposit_amount,b.check_in_date, "+
            	"concat(c.first_name , ' ',c.last_name) cust_name,date_format(a.created_date,'%Y-%m-%d %H:%i:%s') created_date "+
            "from fd_guest_deposit a "+
            "left join fd_guest_folio b on b.id = a.folio_id "+
            "left join mst_customer c on b.customer_id = c.id "+
            "left join mst_room d on b.room_id = d.id "+
            "where b.check_in_date between '2017-06-04 00:00:00' and '2017-06-04 23:59:59' ",undefined)
       .then(function(data){
           $scope.guestDeposit = data.data
       });
   }
   $scope.execEnd = function(){
       console.log('execEnd')
       queryService.post('call sa_guest_deposit(\''+$scope.currentPeriod+'\', '+$scope.currentShift.id+',  '+$localStorage.currentUser.name.id+');', undefined)
       .then(function (result2){
           console.log('sa_guest_deposit',result2)
           $scope.addStatus(3)
       },
       function(err2){
           console.log(err2)
       })
   }
   $scope.showEnd = function(){
       console.log('showEnd');
       var sqlPayment = "select a.id, a.payment_type_id, a.payment_amount, c.category payment_cat,c.name payment_name, "+
				"c.account_id cash_account_id, d.ar_account_id, d.fee_account_id,  "+
                "a.card_no, a.created_date, a.folio_id "+
		  "from fd_guest_payment a "+
          "inner join fo_audited_payments bb on a.id = bb.fo_payment_id "+
		  "left join fo_cashier_transaction b on b.id = a.cashier_transc_id "+
		  "left join ref_payment_method c on c.id = a.payment_type_id "+
		  "left join mst_credit_card d on d.id = c.credit_card_id)a "+
          "group by payment_name ";
        var sqlDeposit = "";
        //console.log(sql,$scope.currentPeriod,$scope.currentShift,$scope.currentGroupId)
        /*queryService.post(sql, undefined)
        .then(function (result2){
            console.log('addStatus',result2)
        },
        function(err2){
            console.log(err2)
        })*/
   }

   $scope.finish = function(){
       queryService.post('call end_audit('+$scope.currentAuditId+');', undefined)
       .then(function (result2){
           console.log('end_audit',result2)
       },
       function(err2){
           console.log(err2)
       })
   }
    var qstring = "select a.id,a.code,a.name,a.description,a.status,b.status_name from ref_day_type a, "+
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
    $scope.fileName = "Day Type Reference";
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

            queryService.post('insert into ref_day_type SET ?',param)
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
            queryService.post('update ref_day_type SET ? WHERE id='+$scope.coa.id ,param)
            .then(function (result){
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
            $scope.coa.name = result.data[0].name
            $scope.coa.description = result.data[0].description
            $scope.coa.status = result.data[0].status
            $scope.coa.status = result.data[0].status
            $scope.selected.status.selected = {id: result.data[0].status,name:result.data[0].status_name}

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
        queryService.post('update ref_day_type SET status=\'2\', '+
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
