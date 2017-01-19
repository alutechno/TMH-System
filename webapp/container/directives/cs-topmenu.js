/* ============================================================
* Directive: CustomTopMenu
* Omjek gitu looh..
* ============================================================ */

angular.module('app')
.directive('topMenu', function($compile,principal,$rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            //console.log('csTopMenu:'+JSON.stringify(principal.getAllMenu(undefined)))
            var menu = (principal.getAllMenu(undefined));
            var t1 = ''
            for (var x in menu){
                for (var key in menu[x]){
                    t1 +=
                    '<li class="mega" ng-show="showMenu.'+x+'">'+
                    //'<li class="mega" >'+
                    '<a href="javascript:;" class="megastat">'+
                    key+'<span class="arrow"></span>'+
                    '</a>'+
                    '<ul class="mega">'+
                    '<div class="container">'+
                    '<div class="row">';

                    for (var k2 in menu[x][key]){
                        t1 += '<div class="col-md-3">'+
                        '<div class="sub-menu-heading bold"> '+k2+'</div>'+
                        '<ul class="sub-menu">';
                        for (var k3 in menu[x][key][k2]){
                            //console.log('csTopMenu k3:'+JSON.stringify(menu[x][key][k2][k3]))
                            t1 += '<li> <a ui-sref="'+menu[x][key][k2][k3].state+'"> '+k3+' </a> </li>'
                        }

                        t1 += '</ul>'+
                        '</div>';
                    }
                    t1 += '</div>'+
                    '</div>'+
                    '</ul>'+
                    '</li>'
                }

            }
            t1 += '<li class="mega pull-right m-r-100"> {{currentModule}} </li>'
            var template =
            '<li class="mega">'+
            '<a href="javascript:;">'+
            'Marketing<span class="arrow"></span>'+
            '</a>'+
            '<ul class="mega">'+
            '<div class="container">'+
            '<div class="row">'+
            '<div class="col-md-3 ">'+
            '<div class="sub-menu-heading bold">Features UI</div>'+
            '<img src="'+
            'assets/img/demo/pages_icon.png" alt="" data-src="'+
            'assets/img/demo/pages_icon.png" data-src-retina="'+
            'assets/img/demo/pages_icon_2x.png" height="60" width="60">'+
            '</div>'+
            '<div class="col-md-3">'+
            '<div class="sub-menu-heading bold"> UI Elements</div>'+
            '<ul class="sub-menu">'+
            '<li> <a href="#"> Typography </a> </li>'+
            '<li> <a href="#"> Messages & Notifications </a> </li>'+
            '<li> <a href="#"> Notifications </a> </li>'+
            '<li> <a href="#">Icons</a> </li>'+
            '<li> <a href="#">Buttons</a> </li>'+
            '<li> <a href="#"> Tabs & Accordions </a> </li>'+
            '<li> <a href="#">Sliders</a> </li>'+
            '<li class="active"> <a href="#">Group list </a> </li>'+
            '</ul>'+
            '</div>'+
            '<div class="col-md-3">'+
            '<div class="sub-menu-heading bold">Apps</div>'+
            '<ul class="sub-menu">'+
            '<li> <a href="#">Social </a> </li>'+
            '<li> <a href="#">Email </a> </li>'+
            '<li> <a href="#">Calendar </a> </li>'+
            '</ul>'+
            '<div class="sub-menu-heading bold"> Forms</div>'+
            '<ul class="sub-menu">'+
            '<li> <a href="#">Form Elements </a> </li>'+
            '<li> <a href="#">Form Layouts</a> </li>'+
            '</ul>'+
            '</div>'+
            '<div class="col-md-3">'+
            '<div class="sub-menu-heading bold">Extra</div>'+
            '<ul class="sub-menu">'+
            '<li> <a href="#"> Invoice </a> </li>'+
            '<li> <a href="#">Login </a> </li>'+
            '<li> <a href="#">Register </a> </li>'+
            '<li> <a href="#">Gallery</a> </li>'+
            '<li> <a href="#">Timeline</a> </li>'+
            '</ul>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</ul>'+
            '</li>'+
            '<li>'+
            '<a href="#">Report</a>'+
            '</li>';

            var linkFn = $compile(t1);
            var content = linkFn(scope);
            element.html(content);

            $('body').on('click', '.mega a', function(e) {
                var el = $(this);
                var parent = $(this).parent().parent();
                var li = $(this).parent();
                var sub = $(this).parent().children('.mega');

                if(li.hasClass("open") && li.hasClass("mega")){
                    sub.slideUp(200, function() {
                        li.removeClass("open");
                        parent.removeClass("open");
                    });
                }
                else if(li.hasClass("mega")){
                    parent.children('li.open').children('.mega').slideUp(200);
                    parent.children('li.open').removeClass("open");
                    sub.slideDown(200, function() {
                        li.addClass("open");
                        parent.addClass("open")
                    });

                }
                else{
                    $rootScope.currentMenu = {
                        parent : $(this).parent().parent().parent().children('div.sub-menu-heading.bold')[0].innerText,
                        name : $(this).context.innerText
                    }
                    $rootScope.$apply();
                    var li2 = $(this).parent().parent().parent().parent().parent().parent().parent();
                    var sub2 = li2.children('.mega');
                    sub2.slideUp(200, function() {
                        li2.removeClass("open");
                    });
                }
            });



        }
    }
})
