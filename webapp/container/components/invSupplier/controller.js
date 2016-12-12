
var userController = angular.module('app', []);
userController
.controller('InvSupplierCtrl',
function($scope, $state, $sce, supplierService, otherService, DTOptionsBuilder, DTColumnBuilder, $localStorage, $compile, $rootScope, API_URL) {

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

    $scope.suppliers = {}
    $scope.id = '';
    $scope.supplier = {
        id: '',
        code: '',
        name: '',
        short_name: '',
        description: '',
        status: '',
        address: '',
        country_id: '',
        prov_id: '',
        kab_id: '',
        kec_id: '',
        kel_id: ''
    }

    $scope.selected = {
        status: {},
        country: {},
        prov: {},
        kab: {},
        kec: {},
        kel: {}
    }

    $scope.arrActive = [
        {id: 1, name: 'Yes'},
        {id: 0, name: 'No'}
    ]

    $scope.countries = []
    otherService.getCountry()
    .then(function(data){
        $scope.countries = data.data
    })

    $scope.province = []
    otherService.getProvince()
    .then(function(data){
        $scope.province = data.data
    })

    $scope.kabupaten = []
    // otherService.getKabupaten()
    // .then(function(data){
    //     $scope.kabupaten = data.data
    // })

    $scope.kecamatan = []
    // otherService.getKecamatan()
    // .then(function(data){
    //     $scope.kecamatan = data.data
    // })

    $scope.kelurahan = []
    // otherService.getKelurahan()
    // .then(function(data){
    //     $scope.kelurahan = data.data
    // })

    $scope.filterVal = {
        search: ''
    }
    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };

    /*START AD ServerSide*/
    $scope.dtInstance = {} //Use for reloadData
    $scope.actionsHtml = function(data, type, full, meta) {
        $scope.suppliers[data] = {id:data};
        var html = ''
        if ($scope.el.length>0){
            html = '<div class="btn-group btn-group-xs">'
            if ($scope.el.indexOf('buttonUpdate')>-1){
                html +=
                '<button class="btn btn-default" ng-click="update(suppliers[\'' + data + '\'])">' +
                '   <i class="fa fa-edit"></i>' +
                '</button>&nbsp;' ;
            }
            if ($scope.el.indexOf('buttonDelete')>-1){
                html+='<button class="btn btn-default" ng-click="delete(suppliers[\'' + data + '\'])" )"="">' +
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
        url: API_URL+'/apiinv/getSuppliers',
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
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('short_name').withTitle('Short Name'),
        DTColumnBuilder.newColumn('status').withTitle('Status'),
        DTColumnBuilder.newColumn('kab_name').withTitle('Kabupaten'),
        DTColumnBuilder.newColumn('kel_name').withTitle('Kelurahan'),
        DTColumnBuilder.newColumn('kec_name').withTitle('Kecamatan'),
        DTColumnBuilder.newColumn('address').withTitle('Address')
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

    $scope.openQuickView = function(state){
        if (state == 'add'){
            $scope.clear()
        }
        $('#form-input').modal('show')
    }

    $scope.submit = function(){
        if ($scope.supplier.id.length==0){
            //exec creation
            $scope.supplier.status = $scope.selected.status.selected.id;
            $scope.supplier.country_id = $scope.selected.country.selected.id;
            $scope.supplier.prov_id = $scope.selected.prov.selected.id;
            $scope.supplier.kab_id = $scope.selected.kab.selected.id;
            $scope.supplier.kec_id = $scope.selected.kec.selected.id;
            $scope.supplier.kel_id = $scope.selected.kel.selected.id;

            supplierService.create($scope.supplier)
            .then(function (result){
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                    $('body').pgNotification({
                        style: 'flip',
                        message: 'Success Insert '+$scope.supplier.name,
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
            $scope.supplier.status = $scope.selected.status.selected.id;
            $scope.supplier.country_id = $scope.selected.country.selected.id;
            $scope.supplier.prov_id = $scope.selected.prov.selected.id;
            $scope.supplier.kab_id = $scope.selected.kab.selected.id;
            $scope.supplier.kec_id = $scope.selected.kec.selected.id;
            $scope.supplier.kel_id = $scope.selected.kel.selected.id;

            supplierService.update($scope.supplier)
            .then(function (result){
                if (result.status = "200"){
                    console.log('Success Update')
                    $('#form-input').modal('hide')
                    $scope.dtInstance.reloadData(function(obj){
                        console.log(obj)
                    }, false)
                }
                else {
                    console.log('Failed Update')
                }
            })
        }
    }

    $scope.update = function(obj){
        $('#form-input').modal('show');
        $scope.supplier.id = obj.id
        // console.log(obj)
        supplierService.get(obj.id)
        .then(function(result){
            $scope.supplier.code = result.data[0].code
            $scope.supplier.name = result.data[0].name
            $scope.supplier.short_name = result.data[0].short_name
            $scope.supplier.description = result.data[0].description
            $scope.supplier.status = result.data[0].status
            $scope.supplier.address = result.data[0].address
            $scope.supplier.country_id = result.data[0].country_id
            $scope.supplier.prov_id = result.data[0].prov_id
            $scope.supplier.kab_id = result.data[0].kab_id
            $scope.supplier.kec_id = result.data[0].kec_id
            $scope.supplier.kel_id = result.data[0].kel_id
            $scope.selected.status.selected = {name: result.data[0].status == 1 ? 'Yes' : 'No' , id: result.data[0].status}
            for (var i = $scope.countries.length - 1; i >= 0; i--) {
                if ($scope.countries[i].id == result.data[0].country_id){
                    $scope.selected.country.selected = {name: $scope.countries[i].name, id: $scope.countries[i].id}
                }
            };
            for (var i = $scope.province.length - 1; i >= 0; i--) {
                if ($scope.province[i].id == result.data[0].prov_id){
                    $scope.selected.prov.selected = {name: $scope.province[i].name, id: $scope.province[i].id}
                }
            };
            for (var i = $scope.kabupaten.length - 1; i >= 0; i--) {
                if ($scope.kabupaten[i].id == result.data[0].kab_id){
                    $scope.selected.kab.selected = {name: $scope.kabupaten[i].name, id: $scope.kabupaten[i].id}
                }
            };
            for (var i = $scope.kecamatan.length - 1; i >= 0; i--) {
                if ($scope.kecamatan[i].id == result.data[0].kec_id){
                    $scope.selected.kec.selected = {name: $scope.kecamatan[i].name, id: $scope.kecamatan[i].id}
                }
            };
            for (var i = $scope.kelurahan.length - 1; i >= 0; i--) {
                if ($scope.kelurahan[i].id == result.data[0].kel_id){
                    $scope.selected.kel.selected = {name: $scope.kelurahan[i].name, id: $scope.kelurahan[i].id}
                }
            };

        })

    }

    $scope.delete = function(obj){
        $scope.supplier.id = obj.id;
        supplierService.get(obj.id)
        .then(function(result){
            $scope.supplier.name = result.data[0].name;
            $('#modalDelete').modal('show')
        })
    }

    $scope.execDelete = function(){
        supplierService.delete($scope.supplier)
        .then(function (result){
            if (result.status = "200"){
                console.log('Success Delete')
                $('#form-input').modal('hide')
                $scope.dtInstance.reloadData(function(obj){
                    // console.log(obj)
                }, false)
            }
            else {
                console.log('Delete Failed')
            }
        })
    }

    $scope.clear = function(){
        $scope.supplier = {
            id: '',
            code: '',
            name: '',
            short_name: '',
            description: '',
            status: '',
            address: '',
            country_id: '',
            prov_id: '',
            kab_id: '',
            kec_id: '',
            kel_id: ''
        }
    }

    $scope.getKabupaten = function(selectItem){
        // console.log(selectItem)
        otherService.getKabupaten('',selectItem.id)
        .then(function(data){
            $scope.kabupaten = data.data
        })
    }

    $scope.getKecamatan = function(selectItem){
        // console.log(selectItem)
        otherService.getKecamatan('',selectItem.id)
        .then(function(data){
            $scope.kecamatan = data.data
        })
    }

    $scope.getKelurahan = function(selectItem){
        // console.log(selectItem)
        otherService.getKelurahan('',selectItem.id)
        .then(function(data){
            $scope.kelurahan = data.data
        })
    }

})
