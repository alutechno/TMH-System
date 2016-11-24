/* ============================================================
* File: config.js
* Configure routing
* ============================================================ */

angular.module('app')
.config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider','$httpProvider', 'APP_URL',
function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider, APP_URL) {
    $httpProvider.interceptors.push(['$q', '$location', '$localStorage','$templateCache',function($q, $location, $localStorage,$templateCache) {
        return {
            'request': function (config) {
                config.headers = config.headers || {};
                
                if (!$templateCache.get(config.url)){
                    //config.headers['state'] = $rootScope.toState.name
                    if ($localStorage.mediaToken) {
                        config.headers.Authorization = 'Basic ' + $localStorage.mediaToken;
                    }
                    if (config.url.indexOf('api')==-1){
                        //config.url = APP_URL+'/'+config.url;
                        config.url = '/'+config.url;

                    }
                }


                console.log(config)
                return config;
            },
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('/login');
                }
                return $q.reject(response);
            }
        };
    }])

    $urlRouterProvider
    .otherwise('/login')

    $stateProvider
    .state('app', {
        abstract: true,
        url: "/app",
        templateUrl: "template/app.html"
    })
    .state('app.dashboard', {
        url: "/dashboard",
        templateUrl: "container/components/dashboard/dashboardView.html",
        controller: 'DashboardCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'container/components/dashboard/dashboardController.js'
                ]);
            }]
        }
    })
    .state('app.user', {
        url: "/user",
        templateUrl: "container/components/user/userView.html",
        controller: 'UserCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/user/userController.js');
                });
            }]
        }
    })
    .state('app.role', {
        url: "/role",
        templateUrl: "container/components/role/roleView.html",
        controller: 'RoleCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/role/roleController.js');
                });

            }]
        }
    })
    .state('app.menu', {
        url: "/menu",
        templateUrl: "container/components/menu/menuView.html",
        controller: 'MenuCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/menu/menuController.js');
                });

            }]
        }
    })
    .state('app.rolemenu', {
        url: "/rolemenu",
        templateUrl: "container/components/rolemenu/roleMenuView.html",
        controller: 'RoleMenuCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/rolemenu/roleMenuController.js');
                });

            }]
        }
    })
    .state('app.fo', {
        url: '/fo',
        template: '<div ui-view></div>'
    })
    .state('app.fo.customer', {
        url: "/customer",
        templateUrl: "container/components/foCustomer/view.html",
        controller: 'FoCustomerCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/foCustomer/controller.js');
                });

            }]
        }
    })
    .state('app.fo.customerContract', {
        url: "/customerContract",
        templateUrl: "container/components/foCustomerContract/view.html",
        controller: 'FoCustomerContractCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/foCustomerContract/controller.js');
                });

            }]
        }
    })
    .state('app.foRoom', {
        url: "/foRoom",
        templateUrl: "container/components/foRoom/view.html",
        controller: 'FoRoomCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/foRoom/controller.js');
                });

            }]
        }
    })
    .state('app.foRoomType', {
        url: "/foRoomType",
        templateUrl: "container/components/foRoomType/view.html",
        controller: 'FoRoomTypeCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/foRoomType/controller.js');
                });

            }]
        }
    })
    .state('app.foRoomRate', {
        url: "/foRoomRate",
        templateUrl: "container/components/foRoomRate/view.html",
        controller: 'FoRoomRateCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/foRoomRate/controller.js');
                });

            }]
        }
    })
    .state('app.foRoomTypeRate', {
        url: "/foRoomTypeRate",
        templateUrl: "container/components/foRoomTypeRate/view.html",
        controller: 'FoRoomTypeRateCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'dataTables',
                    'select'
                ], {
                    insertBefore: '#lazyload_placeholder'
                })
                .then(function() {
                    return $ocLazyLoad.load('container/components/foRoomTypeRate/controller.js');
                });

            }]
        }
    })
    .state('login', {
        url: '/login',
        templateUrl: 'container/components/login/loginView.html',
        data: {
            roles: []
        },
        controller: 'LoginCtrl',
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'container/components/login/loginController.js'
                ]);
            }]
        }
    })

    // Extra - Others
    .state('access', {
        url: '/access',
        template: '<div class="full-height" ui-view></div>'
    })
    .state('access.404', {
        url: '/404',
        templateUrl: 'template/others/extra_404.html'
    })
    .state('access.500', {
        url: '/500',
        templateUrl: 'template/others/extra_500.html'
    })
    .state('access.login', {
        url: '/login',
        templateUrl: 'template/others/extra_login.html',
        data: {
            roles: []
        },
        controller: 'SigninCtrl'
    })
    .state('access.register', {
        url: '/register',
        templateUrl: 'template/others/extra_register.html'
    })
    .state('access.lock_screen', {
        url: '/lock_screen',
        templateUrl: 'template/others/extra_lock_screen.html'
    })

}
]);


angular.module('app').run(['$rootScope', '$state', '$stateParams', 'authorization', 'principal',
function($rootScope, $state, $stateParams, authorization, principal){
    $rootScope['currentModule'] = ''
    $rootScope['currentMenu'] = {}
    $rootScope.$on('$stateChangeStart',
    function(event, toState, toStateParams){
        //Set state that dont need authentication
        var bypass = ['login','access.500','access.404']
        console.log($rootScope.toState)
        // track the state the user wants to go to;
        // authorization service needs this

        $rootScope.toState = toState;
        $rootScope.toStateParams = toStateParams;
        // if the principal is resolved, do an
        // authorization check immediately. otherwise,
        // it'll be done when the state it resolved.

        //TODO: double function in isResolvedIdentity() and authorize().principal.identity()
        //    principal.identity, should be recheck the authorize menu only
        if(bypass.indexOf($rootScope.toState.name)==-1){
            if (!toState.resolve) { toState.resolve = {} };
            toState.resolve.pauseStateChange = [
                '$q',
                function($q) {
                    var defer = $q.defer();
                    principal.isIdentityResolved() //Just check header, validation from memory or localStorage
                    .then(function(status){
                        if (status == true){
                            //Start Authorizing access to Menu
                            var a = authorization.authorize($rootScope.toState.name);
                            defer.resolve();
                        }
                        else {
                            //Invalid User Access / Invalid Token
                            $state.go('access.500')
                            defer.resolve();
                        }
                    });
                    return defer.promise;
                }
            ]
        }
    });
}
]);
