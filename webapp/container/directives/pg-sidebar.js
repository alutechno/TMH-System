/* ============================================================
* Directive: pgSidebar
* AngularJS directive for Pages Sidebar jQuery plugin
* ============================================================ */

angular.module('app')
.directive('menuItem', function($compile) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var template =
            '<li class="m-t-5 open" ui-sref-active="active">'+
            '<a ui-sref="app.dashboard" class="detailed">'+
            '<span class="title">Dashboardsss</span>'+
            '<span class="details">100 New Updates</span>'+
            '</a>'+
            '<span class="icon-thumbnail"><i class="pg-home"></i></span>'+
            '</li>'+
            '<li ng-class="{\'open active\':includes(\'app.forms\')}">'+
            '<a href="javascript:;">'+
            '<span class="title">Forms</span>'+
            '<span class="arrow" ng-class="{\'active open\':$state.includes(\'app.forms\')}"></span>'+
            '</a>'+
            '<span class="icon-thumbnail"><i class="pg-form"></i></span>'+
            '<ul class="sub-menu">'+
            '<li ui-sref-active="active">'+
            '<a ui-sref="app.forms.elements">Form Elements</a>'+
            '<span class="icon-thumbnail">fe</span>'+
            '</li>'+
            '<li ui-sref-active="active">'+
            '<a ui-sref="app.forms.layouts">Form Layouts</a>'+
            '<span class="icon-thumbnail">fl</span>'+
            '</li>'+
            '<li ui-sref-active="active">'+
            '<a ui-sref="app.forms.wizard">Form Wizard</a>'+
            '<span class="icon-thumbnail">fw</span>'+
            '</li>'+
            '</ul>'+
            '</li>'+
            '<li ng-class="{\'open active\':includes(\'app.forms\')}">'+
            '<a href="javascript:;">'+
            '<span class="title">Forms</span>'+
            '<span class="arrow" ng-class="{\'active open\':$state.includes(\'app.forms\')}"></span>'+
            '</a>'+
            '<span class="icon-thumbnail"><i class="pg-form"></i></span>'+
            '<ul class="sub-menu">'+
            '<li ui-sref-active="active">'+
            '<a ui-sref="app.forms.elements">Form Elements</a>'+
            '<span class="icon-thumbnail">fe</span>'+
            '</li>'+
            '<li ui-sref-active="active">'+
            '<a ui-sref="app.forms.layouts">Form Layouts</a>'+
            '<span class="icon-thumbnail">fl</span>'+
            '</li>'+
            '<li ui-sref-active="active">'+
            '<a ui-sref="app.forms.wizard">Form Wizard</a>'+
            '<span class="icon-thumbnail">fw</span>'+
            '</li>'+
            '</ul>'+
            '</li>';

            var linkFn = $compile(template);
            var content = linkFn(scope);
            element.html(content);


        }
    }
})
.directive('pgSidebar', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var $sidebar = $(element);
            $sidebar.sidebar($sidebar.data());

            // Bind events
            // Toggle sub menus
            $('body').on('click', '.sidebar-menu a', function(e) {

                if ($(this).parent().children('.sub-menu') === false) {
                    return;
                }
                var el = $(this);
                var parent = $(this).parent().parent();
                var li = $(this).parent();
                var sub = $(this).parent().children('.sub-menu');

                if(li.hasClass("active open")){
                    el.children('.arrow').removeClass("active open");
                    sub.slideUp(200, function() {
                        li.removeClass("active open");
                    });

                }else{
                    parent.children('li.open').children('.sub-menu').slideUp(200);
                    parent.children('li.open').children('a').children('.arrow').removeClass('active open');
                    parent.children('li.open').removeClass("open active");
                    el.children('.arrow').addClass("active open");
                    sub.slideDown(200, function() {
                        li.addClass("active open");

                    });
                }
            });

        }
    }
})
;
