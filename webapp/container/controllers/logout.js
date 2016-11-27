angular.module('app')
.controller('LogoutCtrl', ['$scope', '$rootScope', 'principal', '$localStorage','$state','$window','$location','$templateCache',
function($scope, $rootScope, principal, $localStorage,$state,$window,$location,$templateCache) {
    console.log($localStorage)
    $localStorage.$reset();

    principal.clear();
    console.log('logout')
    $window.location.replace('/')
    


}
])
