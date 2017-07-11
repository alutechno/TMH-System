/* ============================================================
* File: config.js
* Configure routing
* ============================================================ */
angular.module('app').config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$httpProvider', 'APP_URL',
    function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider, APP_URL) {
        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', '$templateCache', '$rootScope',
            function ($q, $location, $localStorage, $templateCache, $rootScope) {
                return {
                    'request': function (config) {
                        config.headers = config.headers || {};

                        if (!$templateCache.get(config.url)) {
                            config.headers['state'] = $rootScope.toState.name
                            if ($localStorage.mediaToken) {
                                config.headers.Authorization = 'Basic ' + $localStorage.mediaToken;
                            }
                            //if (config.url.indexOf('api')==-1){
                            if (config.url.indexOf('api') == -1 && config.url.indexOf('authenticate') == -1 && config.url.indexOf('authorize') == -1) {
                                //config.url = APP_URL+'/'+config.url;
                                config.url = '/' + config.url;

                            }
                        }

                        //console.log(config)
                        return config;
                    },
                    'responseError': function (response) {
                        if (response.status === 401 || response.status === 403) {
                            $location.path('/login');
                        }
                        return $q.reject(response);
                    }
                };
            }]);
        $urlRouterProvider.otherwise('/login');
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
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
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
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
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
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
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
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
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
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/rolemenu/roleMenuController.js');
                    });

                }]
            }
        })
        .state('app.test', {
            url: "/test",
            templateUrl: "container/components/test/view.html",
            controller: 'TestCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/test/controller.js');
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
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'container/components/login/loginController.js'
                    ]);
                }]
            }
        })
        .state('logout', {
            url: '/logout',
            templateUrl: '',
            controller: 'LogoutCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'container/controllers/logout.js'
                    ]);
                }]
            }
        })
        .state('app.profile', {
            url: "/profile",
            templateUrl: "container/components/userProfile/view.html",
            controller: 'UserProfileCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'select',
                        'dropzone'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/userProfile/controller.js');
                    });

                }]
            }
        })

        //Front Office Module
        .state('app.fo', {
            url: '/fo',
            template: '<div ui-view></div>'
        })
        .state("app.fo.building", {
            url: "/foBuilding",
            templateUrl: "container/components/foBuilding/view.html",
            controller: "FoBuildingCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foBuilding/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.buildingFeature", {
            url: "/foBuildingFeature",
            templateUrl: "container/components/foBuildingFeature/view.html",
            controller: "FoBuildingFeatureCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foBuildingFeature/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.buildingSection", {
            url: "/foBuildingSection",
            templateUrl: "container/components/foBuildingSection/view.html",
            controller: "FoBuildingSectionCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foBuildingSection/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.roomBoy", {
            url: "/foRoomBoy",
            templateUrl: "container/components/foRoomBoy/view.html",
            controller: "FoRoomBoyCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foRoomBoy/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.workingShift", {
            url: "/foWorkingShift",
            templateUrl: "container/components/foWorkingShift/view.html",
            controller: "FoWorkingShiftCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foWorkingShift/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.items", {
            url: "/foItems",
            templateUrl: "container/components/foItems/view.html",
            controller: "FoItemsCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foItems/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.itemRefPage", {
            url: "/foItemRefPage",
            templateUrl: "container/components/foItemRefPage/view.html",
            controller: "FoItemRefPageCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foItemRefPage/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.itemRefType", {
            url: "/foItemRefType",
            templateUrl: "container/components/foItemRefType/view.html",
            controller: "FoItemRefTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foItemRefType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.roomType", {
            url: "/foRoomType",
            templateUrl: "container/components/foRoomType/view.html",
            controller: "FoRoomTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foRoomType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.roomRate", {
            url: "/foRoomRate",
            templateUrl: "container/components/foRoomRate/view.html",
            controller: "FoRoomRateCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foRoomRate/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.roomFeature", {
            url: "/foRoomFeature",
            templateUrl: "container/components/foRoomFeature/view.html",
            controller: "FoRoomFeatureCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foRoomFeature/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.room", {
            url: "/foRoom",
            templateUrl: "container/components/foRoom/view.html",
            controller: "FoRoomCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foRoom/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fos", {
            url: "/foFrontOfficeSections",
            templateUrl: "container/components/foFrontOfficeSections/view.html",
            controller: "FoFrontOfficeSectionsCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foFrontOfficeSections/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.guestComplain", {
            url: "/foGuestComplain",
            templateUrl: "container/components/foGuestComplain/view.html",
            controller: "FoGuestComplainCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foGuestComplain/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fdFlag", {
            url: "/foFlag",
            templateUrl: "container/components/foFlag/view.html",
            controller: "FoFlagCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foFlag/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fdVip", {
            url: "/foVIP",
            templateUrl: "container/components/foVIP/view.html",
            controller: "FoVIPCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foVIP/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.newspaper", {
            url: "/foNewspaper",
            templateUrl: "container/components/foNewspaper/view.html",
            controller: "FoNewspaperCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foNewspaper/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fdCt", {
            url: "/foCancellationType",
            templateUrl: "container/components/foCancellationType/view.html",
            controller: "FoCancellationTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foCancellationType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fdMrt", {
            url: "/foMaintenanceRequestType",
            templateUrl: "container/components/foMaintenanceRequestType/view.html",
            controller: "FoMaintenanceRequestTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foMaintenanceRequestType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fdMrl", {
            url: "/foMaintenanceRequestLocation",
            templateUrl: "container/components/foMaintenanceRequestLocation/view.html",
            controller: "FoMaintenanceRequestLocationCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foMaintenanceRequestLocation/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fdMrr", {
            url: "/foMaintenanceRequestRequest",
            templateUrl: "container/components/foMaintenanceRequestRequest/view.html",
            controller: "FoMaintenanceRequestRequestCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foMaintenanceRequestRequest/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fdOot", {
            url: "/foOutofOrderType",
            templateUrl: "container/components/foOutofOrderType/view.html",
            controller: "FoOutofOrderTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foOutofOrderType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fdBi", {
            url: "/foBorrowedItem",
            templateUrl: "container/components/foBorrowedItem/view.html",
            controller: "FoBorrowedItemCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foBorrowedItem/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.fdDb", {
            url: "/foDepositBox",
            templateUrl: "container/components/foDepositBox/view.html",
            controller: "FoDepositBoxCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foDepositBox/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.rCustCompany", {
            url: "/foCustomerCompany",
            templateUrl: "container/components/foCustCompany/view.html",
            controller: "FoCustCompanyCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foCustCompany/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.rCg", {
            url: "/foCustomerGrade",
            templateUrl: "container/components/foCustomerGrade/view.html",
            controller: "FoCustomerGradeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foCustomerGrade/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.rGhrg", {
            url: "/foGuestHistoryRevenueGrade",
            templateUrl: "container/components/foGuestHistoryRevenueGrade/view.html",
            controller: "FoGuestHistoryRevenueGradeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foGuestHistoryRevenueGrade/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.rGhsg", {
            url: "/foGuestHistoryStaysGrade",
            templateUrl: "container/components/foGuestHistoryStaysGrade/view.html",
            controller: "FoGuestHistoryStaysGradeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foGuestHistoryStaysGrade/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.rGhrng", {
            url: "/foGuestHistRoomNightsGrade",
            templateUrl: "container/components/foGuestHistRoomNightsGrade/view.html",
            controller: "FoGuestHistRoomNightsGradeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foGuestHistRoomNightsGrade/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.salesAgent", {
            url: "/foSalesAgent",
            templateUrl: "container/components/foSalesAgent/view.html",
            controller: "FoSalesAgentCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foSalesAgent/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.agentComission", {
            url: "/foAgentComission",
            templateUrl: "container/components/foAgentComission/view.html",
            controller: "FoAgentComissionCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foAgentComission/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.rateType", {
            url: "/foRateType",
            templateUrl: "container/components/foRateType/view.html",
            controller: "FoRateTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foRateType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.package", {
            url: "/foPackage",
            templateUrl: "container/components/foPackage/view.html",
            controller: "FoPackageCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foPackage/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.packageType", {
            url: "/foPackageType",
            templateUrl: "container/components/foPackageType/view.html",
            controller: "FoPackageTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foPackageType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.packCat", {
            url: "/foPackageCategory",
            templateUrl: "container/components/foPackageCategory/view.html",
            controller: "FoPackageCategoryCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foPackageCategory/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.pro", {
            url: "/foPackageRateOperator",
            templateUrl: "container/components/foPackageRateOperator/view.html",
            controller: "FoPackageRateOperatorCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foPackageRateOperator/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.segment", {
            url: "/foSegment",
            templateUrl: "container/components/foSegment/view.html",
            controller: "FoSegmentCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foSegment/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.sourceType", {
            url: "/foSourceType",
            templateUrl: "container/components/foSourceType/view.html",
            controller: "FoSourceTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foSourceType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.dayType", {
            url: "/foDayType",
            templateUrl: "container/components/foDayType/view.html",
            controller: "FoDayTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foDayType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.pensionType", {
            url: "/foPensionType",
            templateUrl: "container/components/foPensionType/view.html",
            controller: "FoPensionTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foPensionType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.checkInBy", {
            url: "/foCheckInBy",
            templateUrl: "container/components/foCheckInBy/view.html",
            controller: "FoCheckInByCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foCheckInBy/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.checkOutBy", {
            url: "/foCheckOutBy",
            templateUrl: "container/components/foCheckOutBy/view.html",
            controller: "FoCheckOutByCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foCheckOutBy/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.venues", {
            url: "/foVenues",
            templateUrl: "container/components/foVenues/view.html",
            controller: "FoVenuesCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foVenues/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.venuesRoomLayout", {
            url: "/foVenueRoomLayout",
            templateUrl: "container/components/foVenueRoomLayout/view.html",
            controller: "FoVenueRoomLayoutCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foVenueRoomLayout/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.banquetType", {
            url: "/foBanquetType",
            templateUrl: "container/components/foBanquetType/view.html",
            controller: "FoBanquetTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foBanquetType/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.banquetMealPeriod", {
            url: "/foBanquetMealPeriod",
            templateUrl: "container/components/foBanquetMealPeriod/view.html",
            controller: "FoBanquetMealPeriodCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foBanquetMealPeriod/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.banquetMealLoc", {
            url: "/foBanquetMealLocation",
            templateUrl: "container/components/foBanquetMealLocation/view.html",
            controller: "FoBanquetMealLocationCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foBanquetMealLocation/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.oTc", {
            url: "/foTransactionCategory",
            templateUrl: "container/components/foTransactionCategory/view.html",
            controller: "FoTransactionCategoryCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foTransactionCategory/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.otclass", {
            url: "/foTransactionClass",
            templateUrl: "container/components/foTransactionClass/view.html",
            controller: "FoTransactionClassCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foTransactionClass/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.oChargeSetup", {
            url: "/foChargeSetup",
            templateUrl: "container/components/foChargeSetup/view.html",
            controller: "FoChargeSetupCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foChargeSetup/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.oTax", {
            url: "/foTax",
            templateUrl: "container/components/foTax/view.html",
            controller: "FoTaxCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foTax/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.oPm", {
            url: "/foPaymentMethod",
            templateUrl: "container/components/foPaymentMethod/view.html",
            controller: "FoPaymentMethodCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/foPaymentMethod/controller.js");
                    });
                }]
            }
        })
        .state("app.fo.reservation", {
            url: "/foReservation",
            templateUrl: "container/components/foReservation/view.html",
            controller: "FoReservationCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foReservation/controller.js",
                            //"container/components/foReservation/controllerProfile.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.reservationMice", {
            url: "/foReservationMice",
            templateUrl: "container/components/foReservationMice/view.html",
            controller: "FoReservationMiceCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foReservationMice/controller.js",
                            //"container/components/foReservation/controllerProfile.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.housekeeping", {
            url: "/foHousekeeping",
            templateUrl: "container/components/foHousekeeping/view.html",
            controller: "FoHousekeepingCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foHousekeeping/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.housekeepingguestinhouselist", {
            url: "/foGuestinHouseList",
            templateUrl: "container/components/foHousekeepingGIH/view.html",
            controller: "FoHousekeepingGIHCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foHousekeepingGIH/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.housekeepingroommaintenance", {
            url: "/foRoomMaintenance",
            templateUrl: "container/components/foHousekeepingRM/view.html",
            controller: "FoHousekeepingRMCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foHousekeepingRM/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.housekeepingworksheetandassignment", {
            url: "/foWorksheetAssignment",
            templateUrl: "container/components/foHousekeepingWA/view.html",
            controller: "FoHousekeepingWACtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foHousekeepingWA/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.housekeepingguestlogbrowser", {
            url: "/foGuestinLogBrowse",
            templateUrl: "container/components/foHousekeepingGLB/view.html",
            controller: "FoHousekeepingGLBCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foHousekeepingGLB/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.housekeepingroster", {
            url: "/foHousekeepingRoster",
            templateUrl: "container/components/foHousekeepingR/view.html",
            controller: "FoHousekeepingRCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foHousekeepingR/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.housekeepinglostfoundandborroweditem", {
            url: "/foGuestinHouseList",
            templateUrl: "container/components/foHousekeepingLFBI/view.html",
            controller: "FoHousekeepingLFBICtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foHousekeepingLFBI/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.infoRI", {
            url: "/foInfoRI",
            templateUrl: "container/components/foInfoRI/view.html",
            controller: "FoInfoRICtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foInfoRI/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.shiftAudit", {
            url: "/foShiftAudit",
            templateUrl: "container/components/foShiftAudit/view.html",
            controller: "FoShiftAuditCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "wizard",
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foShiftAudit/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.nightAudit", {
            url: "/foNightAudit",
            templateUrl: "container/components/foNightAudit/view.html",
            controller: "FoNightAuditCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "wizard",
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foNightAudit/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.ccd", {
            url: "/foCashierOpen",
            templateUrl: "container/components/foCashierCashDeposit/view.html",
            controller: "FoCashierCashDepositCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foCashierCashDeposit/controller.js"
                        ]);
                    });
                }]
            }
        })
        .state("app.fo.cct", {
            url: "/foCashierClose",
            templateUrl: "container/components/foCloseCashierTransaction/view.html",
            controller: "FoCloseCashierTransactionCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        'timepicker',
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load([
                            "container/components/foCloseCashierTransaction/controller.js"
                        ]);
                    });
                }]
            }
        })

        //Inventory Module
        .state('app.inv', {
            url: '/inv',
            template: '<div ui-view></div>'
        })
        .state('app.inv.productCategory', {
            url: "/productCategory",
            templateUrl: "container/components/invProductCategory/view.html",
            controller: 'InvProductCategoryCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invProductCategory/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.productSubcategory', {
            url: "/productSubcategory",
            templateUrl: "container/components/invProductSubcategory/view.html",
            controller: 'InvProductSubcategoryCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invProductSubcategory/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.productUnit', {
            url: "/productUnit",
            templateUrl: "container/components/invProductUnit/view.html",
            controller: 'InvProductUnitCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invProductUnit/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.supplier', {
            url: "/supplier",
            templateUrl: "container/components/invSupplier/view.html",
            controller: 'InvSupplierCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invSupplier/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.supplierType', {
            url: "/supplierType",
            templateUrl: "container/components/invSupplierType/view.html",
            controller: 'InvSupplierTypeCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invSupplierType/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.product', {
            url: "/product",
            templateUrl: "container/components/invProduct/view.html",
            controller: 'InvProductCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invProduct/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.contract', {
            url: "/contract",
            templateUrl: "container/components/invContract/view.html",
            controller: 'InvContractCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invContract/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.warehouse', {
            url: "/warehouse",
            templateUrl: "container/components/invWarehouse/view.html",
            controller: 'InvWarehouseCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invWarehouse/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.pr', {
            url: "/pr",
            templateUrl: "container/components/invPurchaseRequest/view.html",
            controller: 'InvPurchaseRequestCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput',
                        'autonumeric'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invPurchaseRequest/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.directPurchase', {
            url: "/directPurchase",
            templateUrl: "container/components/invDirectPurchase/view.html",
            controller: 'InvDirectPurchaseCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput',
                        'autonumeric'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invDirectPurchase/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.ml', {
            url: "/marketlist",
            templateUrl: "container/components/invMarketList/view.html",
            controller: 'InvMarketListCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invMarketList/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.po', {
            url: "/purchaseOrder",
            templateUrl: "container/components/invPurchaseOrder/view.html",
            controller: 'InvPurchaseOrderCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invPurchaseOrder/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.receiving', {
            url: "/receiving",
            templateUrl: "container/components/invReceiving/view.html",
            controller: 'InvReceivingCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invReceiving/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.stockAdmin', {
            url: "/stockAdmin",
            templateUrl: "container/components/invWarehouseStockAdmin/view.html",
            controller: 'InvWarehouseStockAdminCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invWarehouseStockAdmin/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.stockAdminCS', {
            url: "/stockAdminCS",
            templateUrl: "container/components/invCSStockAdmin/view.html",
            controller: 'InvCostCenterStockAdminCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invCSStockAdmin/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.stockOpname', {
            url: "/stockOpname",
            templateUrl: "container/components/invWarehouseStockOpname/view.html",
            controller: 'InvWarehouseStockOpnameCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invWarehouseStockOpname/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.storeRequest', {
            url: "/storeRequest",
            templateUrl: "container/components/invWarehouseStoreRequest/view.html",
            controller: 'InvWarehouseStoreRequestCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invWarehouseStoreRequest/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.storeIssue', {
            url: "/storeIssue",
            templateUrl: "container/components/invWarehouseStoreIssue/view.html",
            controller: 'InvWarehouseStoreIssueCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invWarehouseStoreIssue/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.mealTime', {
            url: "/mealTime",
            templateUrl: "container/components/invMealTime/view.html",
            controller: 'InvMealTimeCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invMealTime/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.cuisineRegion', {
            url: "/cuisineRegion",
            templateUrl: "container/components/invCuisineRegion/view.html",
            controller: 'InvCuisineRegionCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invCuisineRegion/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.cuisineCategory', {
            url: "/cuisineCategory",
            templateUrl: "container/components/invCuisineCategory/view.html",
            controller: 'InvCuisineCategoryCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invCuisineCategory/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.interlocationTransfer', {
            url: "/interlocationTransfer",
            templateUrl: "container/components/invInterlocationTransfer/view.html",
            controller: 'InvInterlocationTransferCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invInterlocationTransfer/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.creditToCost', {
            url: "/creditToCost",
            templateUrl: "container/components/invCreditToCost/view.html",
            controller: 'InvCreditToCostCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invCreditToCost/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.recipe', {
            url: "/recipe",
            templateUrl: "container/components/invRecipe/view.html",
            controller: 'InvRecipeCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invRecipe/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.menuList', {
            url: "/menuList",
            templateUrl: "container/components/invMenuList/view.html",
            controller: 'InvMenuListCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
						'dropzone'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invMenuList/controller.js');
                    });
                }]
            }
        })
        .state('app.inv.eod', {
            url: "/fininveod",
            templateUrl: "container/components/invEndOfDay/view.html",
            controller: 'InvEndOfDayCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/invEndOfDay/controller.js');
                    });

                }]
            }
        })

        //Finance and Accounting Module
        .state('app.fin', {
            url: '/fin',
            template: '<div ui-view></div>'
        })
        .state("app.fin.revenueGroup", {
            url: "/finRevenueGroup",
            templateUrl: "container/components/finRevenueGroup/view.html",
            controller: "FinRevenueGroupCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finRevenueGroup/controller.js");
                    });
                }]
            }
        })
        .state('app.fin.accType', {
            url: "/acctype",
            templateUrl: "container/components/finAccType/view.html",
            controller: 'FinAccTypeCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finAccType/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.dept', {
            url: "/department",
            templateUrl: "container/components/finDepartment/view.html",
            controller: 'FinDepartmentCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finDepartment/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.costcenter', {
            url: "/costcenter",
            templateUrl: "container/components/finCostCenter/view.html",
            controller: 'FinCostCenterCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finCostCenter/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.costcenterType', {
            url: "/costcenterType",
            templateUrl: "container/components/finCostCenterType/view.html",
            controller: 'FinCostCenterTypeCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finCostCenterType/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.coa', {
            url: "/coa",
            templateUrl: "container/components/finCoa/view.html",
            controller: 'FinCoaCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finCoa/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.apvoucher', {
            url: "/apvoucher",
            templateUrl: "container/components/finApVoucher/view.html",
            controller: 'FinApVoucherCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finApVoucher/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.appayment', {
            url: "/appayment",
            templateUrl: "container/components/finApPayment/view.html",
            params: {'currentPeriod': null},
            controller: 'FinApPaymentCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finApPayment/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.apdeposit', {
            url: "/apdeposit",
            templateUrl: "container/components/finApDeposit/view.html",
            params: {'currentPeriod': null},
            controller: 'FinApDepositCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finApDeposit/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.ap_r_aging', {
            url: "/apraging",
            templateUrl: "container/components/finApRAging/view.html",
            controller: 'FinApRAgingCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finApRAging/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.ap_r_glledger', {
            url: "/aprglledger",
            templateUrl: "container/components/finApRGLLedger/view.html",
            controller: 'FinApRGLLedgerCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finApRGLLedger/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.ap_r_mutation', {
            url: "/aprmutation",
            templateUrl: "container/components/finApRMutation/view.html",
            controller: 'FinApRMutationCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finApRMutation/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.ap_r_cashrequired', {
            url: "/aprcashrequired",
            templateUrl: "container/components/finApRCashRequired/view.html",
            controller: 'FinApRCashRequiredCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finApRCashRequired/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.gltransaction', {
            url: "/gltransaction",
            templateUrl: "container/components/finGlTransaction/view.html",
            controller: 'FinGlTransactionCtrl',
            params: {
                'status': null,
                currentYear: null,
                currentMonth: null,
                nextYear: null,
                nextMonth: null
            },
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finGlTransaction/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.glrecurring', {
            url: "/glrecurring",
            templateUrl: "container/components/finGlRecurring/view.html",
            controller: 'FinGlRecurringCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finGlRecurring/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.bank', {
            url: "/bank",
            templateUrl: "container/components/finBank/view.html",
            controller: 'FinBankCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finBank/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.bankAccount', {
            url: "/bankAccount",
            templateUrl: "container/components/finBankAccount/view.html",
            controller: 'FinBankAccountCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finBankAccount/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.cashAccount', {
            url: "/cashAccount",
            templateUrl: "container/components/finCashAccount/view.html",
            controller: 'FinCashAccountCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finCashAccount/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.currency', {
            url: "/currency",
            templateUrl: "container/components/finCurrency/view.html",
            controller: 'FinCurrencyCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finCurrency/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.asset', {
            url: "/asset",
            templateUrl: "container/components/finAsset/view.html",
            controller: 'FinAssetCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finAsset/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.assetType', {
            url: "/assetType",
            templateUrl: "container/components/finAssetType/view.html",
            controller: 'FinAssetTypeCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finAssetType/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.assetDepartment', {
            url: "/assetDepartment",
            templateUrl: "container/components/finAssetDepartment/view.html",
            controller: 'FinAssetDepartmentCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finAssetDepartment/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.assetLocation', {
            url: "/assetLocation",
            templateUrl: "container/components/finAssetLocation/view.html",
            controller: 'FinAssetLocationCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finAssetLocation/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.gljer', {
            url: "/fingljer",
            templateUrl: "container/components/finGlJournalEntryReport/view.html",
            controller: 'FinGlJournalEntryReportCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finGlJournalEntryReport/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.glbr', {
            url: "/finglbr",
            templateUrl: "container/components/finGlBankReconciliation/view.html",
            controller: 'FinGlBankReconciliationCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finGlBankReconciliation/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.glbe', {
            url: "/finglbe",
            templateUrl: "container/components/finGlBudgetEntry/view.html",
            controller: 'FinGlBudgetEntryCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finGlBudgetEntry/controller.js');
                    });

                }]
            }
        })
        .state('app.fin.bcbe', {
            url: "/bcbe",
            templateUrl: "container/components/finGlCashBank/view.html",
            controller: 'FinGlCashBankCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'dataTables',
                        'select',
                        'datepicker',
                        'daterangepicker',
                        'tagsInput'
                    ], {
                        insertBefore: '#lazyload_placeholder'
                    })
                    .then(function () {
                        return $ocLazyLoad.load('container/components/finGlCashBank/controller.js');
                    });

                }]
            }
        })
        .state("app.fin.rptTrialBalance", {
            url: "/finRptTrialBalance",
            templateUrl: "container/components/finRptTrialBalance/view.html",
            controller: "FinRptTrialBalance",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finRptTrialBalance/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.rptBalanceSheet", {
            url: "/finRptBalanceSheet",
            templateUrl: "container/components/finRptBalanceSheet/view.html",
            controller: "FinRptBalanceSheet",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finRptBalanceSheet/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.rptPnl", {
            url: "/finRptPnl",
            templateUrl: "container/components/finRptPnl/view.html",
            controller: "FinRptPnl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finRptPnl/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.eop", {
            url: "/finGlEop",
            templateUrl: "container/components/finGlEop/view.html",
            controller: "FinGlEop",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finGlEop/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.apEop", {
            url: "/finApEop",
            templateUrl: "container/components/finApEop/view.html",
            controller: "FinApEopCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finApEop/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.apDirect", {
            url: "/finApDirect",
            templateUrl: "container/components/finApDirect/view.html",
            params: {'currentPeriod': null},
            controller: "FinApDirectCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finApDirect/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.generalCashier", {
            url: "/finGeneralCashier",
            templateUrl: "container/components/finGeneralCashier/view.html",
            params: {'currentPeriod': null},
            controller: "FinGeneralCashierCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finGeneralCashier/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.cashBook", {
            url: "/finCashBook",
            templateUrl: "container/components/finCashBook/view.html",
            params: {'currentPeriod': null},
            controller: "FinCashBookCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finCashBook/controller.js");
                    });
                }]
            }
        })
		.state("app.fin.ARCC", {
            url: "/finARCC",
            templateUrl: "container/components/finARCreditCard/view.html",
            params: {'currentPeriod': null},
            controller: "FinARCreditCardCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finARCreditCard/controller.js");
                    });
                }]
            }
        })
		.state("app.fin.ARCustomerType", {
            url: "/finARCustType",
            templateUrl: "container/components/finARCustomerType/view.html",
            params: {'currentPeriod': null},
            controller: "FinCustomerTypeCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finARCustomerType/controller.js");
                    });
                }]
            }
        })
		.state("app.fin.ARConfig", {
            url: "/finARConfig",
            templateUrl: "container/components/finARConfig/view.html",
            params: {'currentPeriod': null},
            controller: "FinARConfigCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finARConfig/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.ARIvoinceEntry", {
            url: "/finARIvoinceEntry",
            templateUrl: "container/components/finARIvoinceEntry/view.html",
            params: {'currentPeriod': null},
            controller: "FinARIvoinceEntryCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finARIvoinceEntry/controller.js");
                    });
                }]
            }
        })
		.state("app.fin.ARCashReceipt", {
            url: "/finARCashReceipt",
            templateUrl: "container/components/finARCashReceipt/view.html",
            params: {'currentPeriod': null},
            controller: "FinArCashReceiptCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finARCashReceipt/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.ARCustomerDeposit", {
            url: "/finARCustomerDeposit",
            templateUrl: "container/components/finARCustomerDeposit/view.html",
            params: {'currentPeriod': null},
            controller: "FinARCustomerDepositCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finARCustomerDeposit/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.ARCCJournal", {
            url: "/finARCCJournal",
            templateUrl: "container/components/finARCCJournal/view.html",
            params: {'currentPeriod': null},
            controller: "FinARCCJournalCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finARCCJournal/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.ARCCBatch", {
            url: "/finARCCBatch",
            templateUrl: "container/components/finARCCBatch/view.html",
            params: {'currentPeriod': null},
            controller: "FinARCCBatchCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finARCCBatch/controller.js");
                    });
                }]
            }
        })
        .state("app.fin.ARBrowseActivities", {
            url: "/finARBrowseActivities",
            templateUrl: "container/components/finARBrowseActivities/view.html",
            params: {'currentPeriod': null},
            controller: "FinARBrowseActivitiesCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/finARBrowseActivities/controller.js");
                    });
                }]
            }
        })
		.state("app.inv.stockOnHand", {
            url: "/invStockOnHand",
            templateUrl: "container/components/invRptStockOnHand/view.html",
            controller: "InvRptStockOnHand",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/invRptStockOnHand/controller.js");
                    });
                }]
            }
        })
        .state("app.inv.sumStockOnHand", {
                url: "/invSumStockOnHand",
                templateUrl: "container/components/invSumRptStockOnHand/view.html",
                controller: "InvSumRptStockOnHand",
                resolve: {
                    deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            "dataTables",
                            "select",
                            "datepicker",
                            "daterangepicker",
                            "tagsInput",
                            "autonumeric"
                        ], {
                            insertBefore: "#lazyload_placeholder"
                        })
                        .then(function () {
                            return $ocLazyLoad.load("container/components/invSumRptStockOnHand/controller.js");
                        });
                    }]
                }
            })
		.state('app.pos', {
            url: '/pos',
            template: '<div ui-view></div>'
        })
        .state("app.pos.menuList", {
				url: "/menuList",
				templateUrl: "container/components/posRefMenuList/view.html",
				controller: "PosMenuList",
				resolve: {
					deps: ["$ocLazyLoad", function ($ocLazyLoad) {
						return $ocLazyLoad.load([
							"dataTables",
							"select",
							"datepicker",
							"daterangepicker",
							"tagsInput",
							"autonumeric"
						], {
							insertBefore: "#lazyload_placeholder"
						})
						.then(function () {
							return $ocLazyLoad.load("container/components/posRefMenuList/controller.js");
						});
					}]
				}
		})
        .state("app.pos.paymentMethod", {
			url: "/payment-method",
			templateUrl: "container/components/posPaymentMethod/view.html",
			controller: "PosPaymentMethodCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posPaymentMethod/controller.js");
					});
				}]
			}
		})
        .state("app.pos.customerSegment", {
			url: "/customer-segment",
			templateUrl: "container/components/posCustomerSegment/view.html",
			controller: "PosCustomerSegmentCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posCustomerSegment/controller.js");
					});
				}]
			}
		})
        .state("app.pos.segmentPayment", {
			url: "/segment-payment",
			templateUrl: "container/components/posSegmentPayment/view.html",
			controller: "PosSegmentPaymentCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posSegmentPayment/controller.js");
					});
				}]
			}
		})
        .state("app.pos.categoryClass", {
			url: "/category-class",
			templateUrl: "container/components/posCategoryClass/view.html",
			controller: "PosCategoryClassCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posCategoryClass/controller.js");
					});
				}]
			}
		})
        .state("app.pos.groupMenu", {
			url: "/group-menu",
			templateUrl: "container/components/posGroupMenu/view.html",
			controller: "PosGroupMenuCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posGroupMenu/controller.js");
					});
				}]
			}
		})
        .state("app.pos.cuisineCategory", {
			url: "/cuisine-category",
			templateUrl: "container/components/posCuisineCategory/view.html",
			controller: "PosCuisineCategoryCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posCuisineCategory/controller.js");
					});
				}]
			}
		})
        .state("app.pos.cuisineRegion", {
			url: "/cuisine-region",
			templateUrl: "container/components/posCuisineRegion/view.html",
			controller: "PosCuisineRegionCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posCuisineRegion/controller.js");
					});
				}]
			}
		})
        .state("app.pos.mealTime", {
			url: "/payment-method",
			templateUrl: "container/components/posMealTime/view.html",
			controller: "PosMealTimeCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posMealTime/controller.js");
					});
				}]
			}
		})
        .state("app.pos.promotion", {
			url: "/payment-method",
			templateUrl: "container/components/posPromotion/view.html",
			controller: "PosPromotionCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posPromotion/controller.js");
					});
				}]
			}
		})
        .state("app.pos.outlet", {
			url: "/pos-outlet",
			templateUrl: "container/components/posOutlet/view.html",
			controller: "PosOutletCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posOutlet/controller.js");
					});
				}]
			}
		})
        .state("app.pos.tables", {
			url: "/pos-tables",
			templateUrl: "container/components/posTables/view.html",
			controller: "PosTablesCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posTables/controller.js");
					});
				}]
			}
		})
        .state("app.pos.tax", {
			url: "/pos-tax",
			templateUrl: "container/components/posTax/view.html",
			controller: "PosTaxCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posTax/controller.js");
					});
				}]
			}
		})
        .state("app.pos.houseUse", {
			url: "/house-use",
			templateUrl: "container/components/posHouseUse/view.html",
			controller: "PosHouseUseCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posHouseUse/controller.js");
					});
				}]
			}
		})
        .state("app.pos.discount", {
			url: "/discount",
			templateUrl: "container/components/posDiscount/view.html",
			controller: "PosDiscountCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posDiscount/controller.js");
					});
				}]
			}
		})
        .state("app.pos.costCenter", {
			url: "/cost-center",
			templateUrl: "container/components/posCostCenter/view.html",
			controller: "PosCostCenterCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posCostCenter/controller.js");
					});
				}]
			}
		})
        .state("app.pos.kitchen", {
			url: "/kitchen",
			templateUrl: "container/components/posKitchen/view.html",
			controller: "PosKitchenCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posKitchen/controller.js");
					});
				}]
			}
		})
        .state("app.pos.kitchenSection", {
			url: "/kitchen-section",
			templateUrl: "container/components/posKitchenSection/view.html",
			controller: "PosKitchenSectionCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posKitchenSection/controller.js");
					});
				}]
			}
		})
        .state("app.pos.cuisineRecipe", {
			url: "/cuisine-recipe",
			templateUrl: "container/components/posCuisineRecipe/view.html",
			controller: "PosCuisineRecipeCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posCuisineRecipe/controller.js");
					});
				}]
			}
		})
        .state("app.pos.memberPackage", {
			url: "/member-package",
			templateUrl: "container/components/posMemberPackage/view.html",
			controller: "PosMemberPackageCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posMemberPackage/controller.js");
					});
				}]
			}
		})
        .state("app.pos.outletType", {
			url: "/outlet-type",
			templateUrl: "container/components/posOutletType/view.html",
			controller: "PosOutletTypeCtrl",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posOutletType/controller.js");
					});
				}]
			}
		})
		.state("app.pos.reports", {
			url: "/reports",
			templateUrl: "container/components/posReports/view.html",
			controller: "PosReports",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/posReports/controller.js");
					});
				}]
			}
		})
		.state("app.fin.rpt_gl", {
			url: "/reports_gl",
			templateUrl: "container/components/finReportsGL/view.html",
			controller: "PosReports",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/finReportsGL/controller.js");
					});
				}]
			}
		})
		.state("app.fin.rpt_ap", {
			url: "/reports_ap",
			templateUrl: "container/components/finReportsAP/view.html",
			controller: "PosReports",
			resolve: {
				deps: ["$ocLazyLoad", function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						"dataTables",
						"select",
						"datepicker",
						"daterangepicker",
						"tagsInput",
						"autonumeric"
					], {
						insertBefore: "#lazyload_placeholder"
					})
					.then(function () {
						return $ocLazyLoad.load("container/components/finReportsAP/controller.js");
					});
				}]
			}
		})
        .state("app.inv.rpt_rcv", {
            url: "/rpt_rcv",
            templateUrl: "container/components/invRptReceiving/view.html",
            controller: "ReportsCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/invRptReceiving/controller.js");
                    });
                }]
            }
        })
        .state("app.inv.rpt_prc", {
            url: "/rpt_prc",
            templateUrl: "container/components/invRptPurchasing/view.html",
            controller: "ReportsCtrl",
            resolve: {
                deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        "dataTables",
                        "select",
                        "datepicker",
                        "daterangepicker",
                        "tagsInput",
                        "autonumeric"
                    ], {
                        insertBefore: "#lazyload_placeholder"
                    })
                    .then(function () {
                        return $ocLazyLoad.load("container/components/invRptPurchasing/controller.js");
                    });
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
    function ($rootScope, $state, $stateParams, authorization, principal) {
        $rootScope['currentModule'] = ''
        $rootScope['currentMenu'] = {}
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toStateParams) {
                //Set state that dont need authentication
                var bypass = ['login', 'access.500', 'access.404', 'logout']
                // track the state the user wants to go to;
                // authorization service needs this

                $rootScope.toState = toState;
                $rootScope.toStateParams = toStateParams;
                // if the principal is resolved, do an
                // authorization check immediately. otherwise,
                // it'll be done when the state it resolved.

                //TODO: double function in isResolvedIdentity() and authorize().principal.identity()
                //    principal.identity, should be recheck the authorize menu only
                if (bypass.indexOf($rootScope.toState.name) == -1) {
                    if (!toState.resolve) {
                        toState.resolve = {}
                    }
                    ;
                    toState.resolve.pauseStateChange = [
                        '$q',
                        function ($q) {
                            var defer = $q.defer();
                            principal.isIdentityResolved() //Just check header, validation from memory or localStorage
                            .then(function (status) {
                                    if (status == true) {
                                        //Start Authorizing access to Menu
                                        authorization.authorize($rootScope.toState.name)
                                        .then(function () {
                                            defer.resolve();
                                        });

                                    }
                                    else {
                                        //Invalid User Access / Invalid Token
                                        $state.go('access.500')
                                        defer.resolve();
                                    }
                                },
                                function (err) {
                                    console.log(err)

                                })

                            return defer.promise;
                        }
                    ]
                }
            });
    }
]);
