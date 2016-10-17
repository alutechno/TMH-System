/* ============================================================
 * Directive: validation
 * AngularJS directive for element validation
 * ============================================================ */
angular.module('app')
    .directive('validateAttachedFormElement', function() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, elm, attr, ctrl) {
                if (!ctrl) {
                    return;
                }

                elm.on('blur', function() {
                    if (ctrl.$invalid && !ctrl.$pristine) {
                        $(elm).popover('show');
                    } else {
                        $(elm).popover('hide');
                    }
                });

                elm.closest('form').on('submit', function() {
                    if (ctrl.$invalid && !ctrl.$pristine) {
                        $(elm).popover('show');
                    } else {
                        $(elm).popover('hide');
                    }
                });

            }
        };
    });
angular.module('app').directive('requireMultiple', function () {
    return {
        require: 'ngModel',
        link: function postLink(scope, element, attrs, ngModel) {
            ngModel.$validators.required = function (value) {
                return angular.isArray(value) && value.length > 0;
            };
        }
    };
});