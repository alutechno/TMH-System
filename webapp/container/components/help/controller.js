
var userController = angular.module('app', []);
userController
.controller('HelpCtrl',
function($scope, $state, $sce, $templateCache,globalFunction,queryService, $localStorage, $compile, $rootScope, API_URL, $http) {

    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value);
    };
    $scope.arrModule = []
    $scope.module = {}
    queryService.get('select id,name,pdf_location from module',undefined)
    .then(function(data){
        $scope.arrModule = data.data
    })

    $scope.showPdf = function(){
        console.log($scope.module);
        $('#pdfFile').html('')
        if ($scope.module.selected){
            if ($scope.module.selected.pdf_location){
                $http.get($scope.module.selected.pdf_location,
                {responseType:'arraybuffer'})
                  .success(function (response) {
                     var file = new Blob([(response)], {type: 'application/pdf'});
                     var fileURL = URL.createObjectURL(file);
                     $scope.content = $sce.trustAsResourceUrl(fileURL);
                });
            }
            else {
                $scope.content = ''
                $('#pdfFile').html('<b>File Not Found</b>')
            }

        }

    }

    /*$http.post('assets/pdf/17.bin.pdf',undefined, {responseType:'arraybuffer'})
      .success(function (response) {
           var file = new Blob([response], {type: 'application/pdf'});
           var fileURL = URL.createObjectURL(file);
           $scope.content = $sce.trustAsResourceUrl(fileURL);
    });*/

})
