(function (angular) {
    'use strict';

    function printDirective() {
        var printSection = document.getElementById('printSection');
        var psParent;

        // if there is no printing section, create one
        if (!printSection) {
            printSection = document.createElement('div');
            printSection.id = 'printSection';
            document.body.appendChild(printSection);
        }
        else {
            psParent = document.createElement('div');
            psParent.id = 'printSectionParent';
            document.body.appendChild(psParent);
            psParent.appendChild(printSection)
        }

        function link(scope, element, attrs) {
            element.on('click', function () {
                //var elemToPrint = document.getElementById('printSection');
                //if (elemToPrint) {
                    printElement();
                    window.print();
                //}
            });

            window.onafterprint = function () {
                // clean the print section before adding new content
                printSection.innerHTML = '';
            }
            var beforePrint = function() {
                //console.log('Functionality to run before printing.');
            };
            var afterPrint = function() {
                //console.log('Functionality to run after printing');
            };

            if (window.matchMedia) {
                var mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener(function(mql) {
                    if (mql.matches) {
                        beforePrint();
                    } else {
                        afterPrint();
                    }
                });
            }

            window.onbeforeprint = beforePrint;
            window.onafterprint = afterPrint;
        }

        function printElement() {
            //psParent.removeChild(printSection);
            //psParent.appendChild(printSection);
            var printSection = window.document.getElementById('printSection');
            //var domClone = printSection.cloneNode(true);


            if (!printSection) {
                printSection = $window.document.createElement('div');
                $printSection.id = 'printSection';
                $window.document.body.appendChild($printSection);
            }

            //printSection.className = 'visible-print';
            psParent.innerHTML = '';
            psParent.appendChild(printSection);
        }

        return {
            link: link,
            restrict: 'A'
        };
    }

    angular.module('app').directive('ngPrint', [printDirective]);
    angular.module('app').directive('onBeforePrint', ['$window', '$rootScope', '$timeout', function onBeforePrint($window, $rootScope, $timeout) {
    	var beforePrintDirty = false;
    	var listeners = [];

    	var beforePrint = function() {
    		if (beforePrintDirty) return;

    		beforePrintDirty = true;

    		if (listeners) {
    			for (var i = 0, len = listeners.length; i < len; i++) {
    				listeners[i].triggerHandler('beforePrint');
    			}

    			var scopePhase = $rootScope.$$phase;

    			// This must be synchronious so we call digest here.
    			if (scopePhase != '$apply' && scopePhase != '$digest') {
    				$rootScope.$digest();
    			}
    		}

    		$timeout(function() {
    			// This is used for Webkit. For some reason this gets called twice there.
    			beforePrintDirty = false;
    		}, 100, false);
    	};

    	if ($window.matchMedia) {
    		var mediaQueryList = $window.matchMedia('print');
    		mediaQueryList.addListener(function(mql) {
    			if (mql.matches) {
    				beforePrint();
    			}
    		});
    	}

    	$window.onbeforeprint = beforePrint;

    	return function(scope, iElement, iAttrs) {
    		function onBeforePrint() {
    			scope.$eval(iAttrs.onBeforePrint);
    		}

    		listeners.push(iElement);
    		iElement.on('beforePrint', onBeforePrint);

    		scope.$on('$destroy', function() {
    			iElement.off('beforePrint', onBeforePrint);

    			var pos = -1;

    			for (var i = 0, len = listeners.length; i < len; i++) {
    				var currentElement = listeners[i];

    				if (currentElement === iElement) {
    					pos = i;
    					break;
    				}
    			}

    			if (pos >= 0) {
    				listeners.splice(pos, 1);
    			}
    		});
    	};
    }])
}(window.angular));
