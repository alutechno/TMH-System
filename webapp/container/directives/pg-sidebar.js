/* ============================================================
* Directive: pgSidebar
* AngularJS directive for Pages Sidebar jQuery plugin
* ============================================================ */

angular.module('app')
.directive('menuItem', function($compile,principal) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var menu = (principal.getAllMenu(undefined));
            var t1 = ''
            var z= 0;
            for (var x in menu){
                //ng-controller="MenuItemsCtrl"
                z=0
                for (var key in menu[x]){
                    for (var k2 in menu[x][key]){
                        for (var k3 in menu[x][key][k2]){
                            if(menu[x][key][k2][k3].is_sidebar == 'Y'){
                                var icon = ''
                                if (menu[x][key][k2][k3].sidebar_icon.length>0){
                                    icon = '<i class="fa '+menu[x][key][k2][k3].sidebar_icon+'"></i>'
                                }
                                else if (menu[x][key][k2][k3].sidebar_short.length>0){
                                    icon = menu[x][key][k2][k3].sidebar_short
                                }
                                else {
                                    icon = menu[x][key][k2][k3].name.substring(0,2)
                                }
                                t1 += '<li class="'+(z==0?'m-t-10':'')+'" ng-class="{\'open active\':includes(\''+menu[x][key][k2][k3].state+'\')}" ui-sref-active="active" ng-show="showSideMenu.'+x+'">'+
                                '<a ui-sref="'+menu[x][key][k2][k3].state+'" class="detailed">'+
                                '<span class="title">'+menu[x][key][k2][k3].name+'</span>'+

                                '</a>'+
                                '<span class="icon-thumbnail">'+icon+'</span>'+
                                '</li>'
                                z++;
                            }


                        }

                    }

                }
            }
            var template =
            '<li class="m-t-5 open" ui-sref-active="active">'+
            '<a ui-sref="app.dashboard" class="detailed">'+
            '<span class="title">Purchase Request</span>'+
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

            var linkFn = $compile(t1);
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
