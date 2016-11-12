/* ============================================================
* Directive: CustomTopMenu
* Omjek gitu looh..
* ============================================================ */

angular.module('app')
.directive('uiModuleCustom', function($compile,principal,$rootScope) {
    return {

        restrict: 'A',
        link: function(scope, element, attrs) {
            var t = ''
            var listModule = principal.getModule();

            for (var i=0;i<Math.ceil(listModule.length/2);i++){
                console.log('trace:'+i+';'+Math.ceil(listModule.length/2))
                var r = '<div class="row">'

                if (listModule[(((i+1)*2)-2)]){
                    r += '<div class="col-xs-6 no-padding">'+
                    '<a href="" class="p-l-40 dodol" ><img src="assets/img/demo/social_app.svg" alt="socail" >'+listModule[(((i+1)*2)-2)]+
                    '</a>'+
                    '</div>';
                }
                if (listModule[(((i+1)*2)-1)]){
                    r += '<div class="col-xs-6 no-padding">'+
                    '<a href="" class="p-l-40 dodol" ><img src="assets/img/demo/social_app.svg" alt="socail" >'+listModule[(((i+1)*2)-1)]+
                    '</a>'+
                    '</div>';
                }


                r += '</div>'
                t+=r
            }
            //console.log(t)
            var linkFn = $compile(t);
            var content = linkFn(scope);
            element.html(content);

            $('body').on('click', '.dodol', function(e) {
                var el = $(this);
                principal.setModule(el.context.innerText)
                var parent = $(this).parent().parent();
                var li = $(this).parent();
                var sub = $(this).parent().children('.mega');

            });
        }
    }
})
