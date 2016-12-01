var userController = angular.module('app', []);
userController
.controller('FoRoomCtrl',
function($scope, $state, $sce, roomService, roomTypeService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope,API_URL) {

    $scope.el = [];
    $scope.el = $state.current.data;
    $scope.buttonCreate = false;
    $scope.buttonUpdate = false;
    $scope.buttonDelete = false;
    for (var i=0;i<$scope.el.length;i++){
        $scope[$scope.el[i]] = true;
    }

    $scope.role = {
        selected: []
    };

    $scope.id = '';
    $scope.room = {
        id: '',
        code: '',
        name: '',
        typeId: '',
        active: ''
    }
    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };
    $scope.selected = {
        room: {},
        roomType: {}
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

        console.log($scope.arrActive);

    $scope.rooms = []
    roomService.get()
    .then(function(data){
        $scope.rooms = data.data
    })

    $scope.optRoomType = []
    roomTypeService.get()
    .then(function(data){
        // console.log(data);
        var arrayLength = data.data.length;
        for (var i = 0; i < arrayLength; i++) {
            var temp = {
                        id:data.data[i].room_type_id ,
                        name: data.data[i].room_type_name
                        }
            $scope.optRoomType[i] = temp
        }
        // console.log($scope.optRoomType)
    })

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.rooms[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(rooms[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(rooms[\'' + data + '\'])" )"="">' +
                '   <i class="fa fa-trash-o"></i>' +
                '</button>';
            }
            html += '</div>'
        }
        return html
    }

    $scope.activeField = function(data, type, full, meta) {
        // console.log(data)
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(roomtypes[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(roomtypes[\'' + data + '\'])" )"="">' +
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
    if ($scope.el.length>0){
        $scope.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('Action').notSortable()
        .renderWith($scope.actionsHtml).withOption('width', '10%'))
    }
    $scope.dtColumns.push(
        DTColumnBuilder.newColumn('code').withTitle('Code'),
        DTColumnBuilder.newColumn('name').withTitle('Room Name'),
        DTColumnBuilder.newColumn('typeName').withTitle('Type'),
        DTColumnBuilder.newColumn('active').withTitle('Active')
    );

    $scope.filter = function(type,event) {
        if (type == 'search'){
            if (event.keyCode == 13){
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

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
        $('#room_code').prop('disabled', true)
    }

    $scope.submit = function(){
        // console.log($scope.contract)
        if ($scope.room.id.length==0){
            //exec creation

            $scope.room.code = $scope.room.code;
            $scope.room.name = $scope.room.name;
            $scope.room.typeId = $scope.selected.roomType.selected.id;
            $scope.room.active = $scope.selected.room.selected.id;

            roomService.create($scope.room)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.room.code,
                        position: 'top-right',
                        timeout: 2000,
                        type: 'success'
                    }).show();

            },
            function (err){
                $('#form-input').pgNotification({
                    style: 'flip',
                    message: 'Error Insert: '+err.desc.code,
                    position: 'top-right',
                    timeout: 2000,
                    type: 'danger'
                }).show();
            })

        }
        else {
            //exec update
            $scope.room.name = $scope.room.name;
            $scope.room.typeId = $scope.selected.roomType.selected.id;
            $scope.room.active = $scope.selected.room.selected.id;

            roomService.update($scope.room)
            .then(function (result){
                if (result.status = "200"){
                    // console.log('Success Update')
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        // console.log(obj)
                    }, false)
                }
                else {
                    // console.log('Failed Update')
                }
            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        $('#room_code').prop('disabled', true);

        roomService.get(obj.id)
        .then(function(result){
        console.log(result)
            $scope.room.id = result.data[0].id
            $scope.room.code = result.data[0].code
            $scope.room.name = result.data[0].name
            $scope.room.typeId = result.data[0].typeId
            $scope.room.active = result.data[0].active
            $scope.selected.room.selected = {name: result.data[0].active == 1 ? 'Yes' : 'No' , id: result.data[0].active}

            for (var i = $scope.optRoomType.length - 1; i >= 0; i--) {
                if ($scope.optRoomType[i].id == result.data[0].typeId){
                    $scope.selected.roomType.selected = {name: $scope.optRoomType[i].name, code: $scope.optRoomType[i].id}
                }
            };

        })
    }

    $scope.delete = function(obj){
        $scope.room.id = obj.id;
        $('#modalDelete').modal('show')
    }

    $scope.execDelete = function(){
        roomService.delete($scope.room)
        .then(function (result){
            if (result.status = "200"){
                // console.log('Success Update')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
            }
            else {
                // console.log('Failed Update')
            }
        })
    }

    $scope.clear = function(){
        $scope.roomtype = {
            id: '',
            name: '',
            active: ''
        }
    }

})
