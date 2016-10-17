/* ============================================================
 * File: config.js
 * Configure routing
 * ============================================================ */

angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider','$httpProvider',
        function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider) {
            $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
                   return {
                       'request': function (config) {
                           config.headers = config.headers || {};
                           if ($localStorage.mediaToken) {
                               config.headers.Authorization = 'Basic ' + $localStorage.mediaToken;
                           }
                           if (config.url.indexOf('api')>-1){
                               config.url = 'http://localhost:3000'+config.url;
                           }
                           console.log('httpProvider:'+JSON.stringify(config))

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
                    templateUrl: "template/app.html",
                    /*
                    //Double call from $rootScope.stateChanged
                    resolve: {
                        authorize: ['authorization',
                          function(authorization) {
                                //console.log('authorization')
                                //console.log(authorization.authorize())
                            return authorization.authorize();
                          }
                        ]
                    }*/
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
      $rootScope.$on('$stateChangeStart',
          function(event, toState, toStateParams){
            console.log('stateChangeStart')
            //Set state that dont need authentication
            var bypass = ['login','access.500','access.404']
            // track the state the user wants to go to;
            // authorization service needs this
            console.log('app:'+JSON.stringify(toState))
            console.log('app:'+JSON.stringify(toStateParams))
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;
            // if the principal is resolved, do an
            // authorization check immediately. otherwise,
            // it'll be done when the state it resolved.

            /*if ($rootScope.toState.name=='access.500'){
                  $state.go('login')
            }
            else*/
            //TODO: double function in isResolvedIdentity() and authorize().principal.identity()
            //    principal.identity, should be recheck the authorize menu only
            if(bypass.indexOf($rootScope.toState.name)==-1){
                  if (!toState.resolve) { toState.resolve = {} };
                  toState.resolve.pauseStateChange = [
                        '$q',
                        function($q) {
                              var defer = $q.defer();
                              principal.isIdentityResolved()
                              .then(function(status){
                                    console.log('status is:'+status)
                                    if (status == true){
                                          $rootScope.toState['data'] = principal.getMenuObject($rootScope.toState.name)
                                          authorization.authorize();
                                          defer.resolve();
                                    }
                                    else {
                                          $state.go('access.500')
                                          defer.resolve();
                                    }
                              });

                              return defer.promise;
                        }
                  ]
            }
            /*if (principal.isIdentityResolved() && $rootScope.toState.name!=='access.500')
                authorization.authorize();
            else {
                  $state.go('/login')
            }*/

            console.log('end of stateChangeStart')
          });

    }
  ]);
