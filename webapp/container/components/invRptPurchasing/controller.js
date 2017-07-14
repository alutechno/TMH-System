var userController = angular.module('app', []);
userController
.controller('ReportsCtrl',
function($scope, $state, $sce, queryService, $localStorage, $compile, $rootScope, globalFunction,API_URL,BIRT_URL) {
	$scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
	$scope.popup=true;
	$scope.user=$localStorage.currentUser.name.id;
    var qstring = `select * from mst_report_params where group_id=7 order by seq_no`
	$scope.sub={}
	$scope.show={}
    queryService.get(qstring,undefined)
    .then(function(data){
        $scope.report = data.data

		for(var i=0;i<data.data.length;i++){
			var qparam = `select report_file,a.name report,param1_name name,b.name type,param1_source source,param1_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param1_type_id=b.id
				where a.id=`+data.data[i].id+` and param1_name is not null
				union
				select report_file,a.name report,param2_name name,b.name type,param2_source source,param2_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param2_type_id=b.id
				where a.id=`+data.data[i].id+` and param2_name is not null
				union
				select report_file,a.name report,param3_name name,b.name type,param3_source source,param3_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param3_type_id=b.id
				where a.id=`+data.data[i].id+` and param3_name is not null
				union
				select report_file,a.name report,param4_name name,b.name type,param4_source source,param4_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param4_type_id=b.id
				where a.id=`+data.data[i].id+` and param4_name is not null
				union
				select report_file,a.name report,param5_name name,b.name type,param5_source source,param4_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param5_type_id=b.id
				where a.id=`+data.data[i].id+` and param5_name is not null
				union
				select report_file,a.name report,param6_name name,b.name type,param6_source source,param4_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param6_type_id=b.id
				where a.id=`+data.data[i].id+` and param6_name is not null
				union
				select report_file,a.name report,param7_name name,b.name type,param7_source source,param4_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param7_type_id=b.id
				where a.id=`+data.data[i].id+` and param7_name is not null
				union
				select report_file,a.name report,param8_name name,b.name type,param8_source source,param4_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param8_type_id=b.id
				where a.id=`+data.data[i].id+` and param8_name is not null
				union
				select report_file,a.name report,param9_name name,b.name type,param9_source source,param4_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param9_type_id=b.id
				where a.id=`+data.data[i].id+` and param9_name is not null
				union
				select report_file,a.name report,param10_name name,b.name type,param10_source source,param4_mandatory mandatory from mst_report_params a left join ref_param_type b
				on a.param10_type_id=b.id
				where a.id=`+data.data[i].id+` and param10_name is not null`;
			queryService.post(qparam,undefined)
		    .then(function(res){
				$scope.sub[res.data[0].report]={param:{},report_file:res.data[0].report_file}
				$scope.sub[res.data[0].report].data=res.data;
				$scope.sub[res.data[0].report].selected={}
				for(var j=0;j<res.data.length;j++){
					if(res.data[j].type=="list"){

						$scope.sub[res.data[0].report].selected[res.data[j].name]={}
						queryService.post(res.data[j].source,undefined)
					    .then(function(list){
							for(var k=0;k<res.data.length;k++){
								if(res.data[k].type=="list" && list.data[0][res.data[k].name]!==undefined){
									$scope.sub[res.data[k].report][res.data[k].name]=list.data;
								}
							}
							console.log($scope.sub)
						})
					}
				}
			});
			$scope.show[data.data[i].name]=false
		}
    })

	$scope.submit = function(name){
		console.log($scope.sub)
		var url=''
		for(var key in $scope.sub[name].param){
			url+='&'+encodeURIComponent(key)+'='+encodeURIComponent($scope.sub[name].param[key])
		}
		//url=encodeURIComponent(url)
		console.log(BIRT_URL+'/frameset?__report='+$scope.sub[name].report_file+url+'&user_id='+$scope.user)
		$scope.urlReport = $sce.trustAsResourceUrl(BIRT_URL+'/frameset?__report='+$scope.sub[name].report_file+url+'&user_id='+$scope.user+"&dummyVar="+ (new Date()).getTime())
	}
	$scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

	$scope.setActive = function(name){
		for(var key in $scope.show)
			$scope.show[key]=false;
		$scope.show[name]=!$scope.show[name]
	}
})
