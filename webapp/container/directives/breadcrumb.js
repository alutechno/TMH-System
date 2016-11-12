/* ============================================================
 * Directive: Custom Breadcrumb
 * Handle Page breadcrumb
 * ============================================================ */

angular.module('app')
.directive('customBreadcrumb', function($compile,$rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var template = '<div class="container-fluid container-fixed-lg ">'+
                '<ul class="breadcrumb">'+
                    '<li>'+
                        '<a href="">{{'+$rootScope.currentMenu.parent+'}}</a>'+
                    '</li>'+

                    '<li><a href="" class="active">'+$rootScope.currentMenu.name+'</a>'+
                    '</li>'+
                '</ul>'+
            '</div>';

            var linkFn = $compile(template);
            var content = linkFn(scope);
            element.html(content);
        }
    }
})
