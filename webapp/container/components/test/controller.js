
var userController = angular.module('app', []);
userController
.controller('TestCtrl',
function($scope, $state, $sce, customerService, customerContractService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope,API_URL) {

    $scope.filterVal = {
        search: ''
    }
    $scope.datas = {}

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.datas[data.id] = data;
        var html = ''

            html = '<div class="btn-group btn-group-xs">'

                html +=
                '<button class="btn btn-default" ng-click="update(datas[' + data.id + '])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
                html+='<button class="btn btn-default" ng-click="delete(datas[' + data.id + '])" )"="">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';
            html += '</div>'

        return html
    }

    $scope.createdRow = function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }


    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('ajax', {
        url: API_URL+'/apifo/getRooms',
        type: 'GET',
        headers: {
            "authorization":  'Basic ' + $localStorage.mediaToken
        },
        data: function (data) {
            data.customSearch = $scope.filterVal.search;
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
    $scope.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))

    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Room Code'),
        DTColumnBuilder.newColumn('name').withTitle('Room Name'),
        DTColumnBuilder.newColumn('typeName').withTitle('Room Type'),
        DTColumnBuilder.newColumn('active').withTitle('Is Active')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
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

})
