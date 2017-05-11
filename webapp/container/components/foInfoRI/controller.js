var trim = function (str) {
    return str.replace(/\t\t+|\n\n+|\s\s+/g, ' ').trim()
};

angular.module('app', []).controller('FoInfoRICtrl', function ($scope, $state, $sce, $q,
    queryService, departmentService, accountTypeService, DTOptionsBuilder, DTColumnBuilder,
    $localStorage, $compile, $rootScope, globalFunction, API_URL, $templateCache
) {

});