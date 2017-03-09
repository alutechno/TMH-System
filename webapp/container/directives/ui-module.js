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
                var r = '<div class="row m-t-20 ">'

                if (listModule[(((i+1)*2)-2)]){
                    r += '<div class="col-xs-6 no-padding">'+
                    '<a href="" class="p-l-20 dodol" name="'+listModule[(((i+1)*2)-2)]+'" ><img src="container/img/app/'+listModule[(((i+1)*2)-2)]+'.svg" alt="socail" >'+
                    //listModule[(((i+1)*2)-2)]+
                    '</a>'+
                    '</div>';
                }
                if (listModule[(((i+1)*2)-1)]){
                    r += '<div class="col-xs-6 no-padding">'+
                    '<a href="" class="p-l-20 dodol" name="'+listModule[(((i+1)*2)-1)]+'"><img src="container/img/app/'+listModule[(((i+1)*2)-1)]+'.svg" alt="socail" >'+
                    //listModule[(((i+1)*2)-1)]+
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
                //console.log(el)
                //console.log(el.context.name)
                //console.log(JSON.stringify(el.context.attributes['cattr']))
                //for (var i=0;i<el.context.attributes)
                principal.setModule(el.context.name)
                var parent = $(this).parent().parent();
                var li = $(this).parent();
                var sub = $(this).parent().children('.mega');

            });
        }
    }
})
.directive('timepicker', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            console.log('asd')
            $(elem).timepicker().on('show.timepicker', function(e) {
                console.log('show')
                var widget = $('.bootstrap-timepicker-widget');
                widget.find('.glyphicon-chevron-up').removeClass().addClass('pg-arrow_maximize');
                widget.find('.glyphicon-chevron-down').removeClass().addClass('pg-arrow_minimize');
            });
        }
    }
});
