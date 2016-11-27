angular.module('app')
.controller('LogoutCtrl', ['$scope', '$rootScope', 'principal', '$localStorage','$state','$window',
function($scope, $rootScope, principal, $localStorage,$state,$window) {
    $localStorage.$reset();
    principal.clear();
    $window.location.replace('/')
}
])
