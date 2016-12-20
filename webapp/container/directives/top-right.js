/* ============================================================
* Directive: CustomTopMenu
* Omjek gitu looh..
* ============================================================ */

angular.module('app')
.directive('uiTopRight', function($compile,principal,$rootScope) {
    return {

        restrict: 'A',
        link: function(scope, element, attrs) {
            var template = '<li><a ui-sref="app.profile"><i class="pg-settings_small"></i> Setting</a>'+
                '</li>'+
                '<li><a href="#"><i class="pg-outdent"></i> Feedback</a>'+
                '</li>'+
                '<li><a href="#"><i class="pg-signals"></i> Help</a>'+
                '</li>'+
                '<li class="bg-master-lighter">'+
                    '<a ui-sref="logout" class="clearfix">'+
                        '<span class="pull-left">Logout</span>'+
                        '<span class="pull-right"><i class="pg-power"></i></span>'+
                    '</a>'+
                '</li>'

            //console.log(t)
            var linkFn = $compile(template);
            var content = linkFn(scope);
            element.html(content);


        }
    }
})
