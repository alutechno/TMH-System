/* ============================================================
 * File: main.js
 * Main Controller to set global scope variables.
 * ============================================================ */
angular.module('app').constant('API_URL','http://103.43.47.115:3001')
//angular.module('app').constant('API_URL','http://localhost:3001')
angular.module('app').constant('APP_URL','http://localhost:3000')
angular.module('app')
    .controller('AppCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {

        // App globals
        $scope.app = {
            name: 'The Media HMS',
            description: 'The Media Hotel System',
            layout: {
                menuPin: false,
                menuBehind: false,
                theme: 'pages/css/pages.css'
            },
            author: 'alutechno.io'
        }
        // Checks if the given state is the current state
        $scope.is = function(name) {
            return $state.is(name);
        }

        // Checks if the given state/child states are present
        $scope.includes = function(name) {
            return $state.includes(name);
        }

        // Broadcasts a message to pgSearch directive to toggle search overlay
        $scope.showSearchOverlay = function() {
            $scope.$broadcast('toggleSearchOverlay', {
                show: true
            })
        }

    }]);


angular.module('app')
    /*
        Use this directive together with ng-include to include a
        template file by replacing the placeholder element
    */

    .directive('includeReplace', function() {
        return {
            require: 'ngInclude',
            restrict: 'A',
            link: function(scope, el, attrs) {
                el.replaceWith(el.children());
            }
        };
    })

angular.module('app')
    .controller('CurrUserCtrl',
    function($scope, $state, $sce, $localStorage, $compile, $rootScope) {
        $scope.name = $localStorage.currentUser.name.full_name
        $scope.sname = $localStorage.currentUser.name.name
        var d = new Date()
        var weekday = new Array(7);
        weekday[0]=  "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        var mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

        var n = weekday[d.getDay()];
        $scope.timest = (d.getDate()<10?'0'+d.getDate():d.getDate()) +
            '-' + mn[d.getMonth()] + '-' + d.getFullYear() + ' ('+weekday[d.getDay()]+') '

    })
