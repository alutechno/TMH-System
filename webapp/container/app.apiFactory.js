//TODO ttl
angular.module('app')
.factory('roleService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        getRole: function(vid) {
            console.log('aa:'+API_URL)
            var defer = $q.defer();
            var url= API_URL+"/api/getRole";
            if (vid){
                url +=  "?id="+vid
            }
            //$http.get("http://localhost:3000/getRoles")
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        createRole: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/createRole', role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        updateRole: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/updateRole',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        deleteRole: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/deleteRole',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
    }
}
])
.factory('userService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        getUsers: function(vid) {
            var defer = $q.defer();
            //var url= "http://localhost:3000/getUsers";
            var url= API_URL+"/api/getUsers";
            if (vid){
                url +=  "?id="+vid
            }

            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        getUser: function(vid) {
            var defer = $q.defer();
            //var url= "http://localhost:3000/getUsers";
            var url= API_URL+"/api/getUser";
            if (vid){
                url +=  "?id="+vid
            }

            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        createUser: function(user) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/createUser',user)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        updateUser: function(user) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/updateUser',user)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        deleteUser: function(user) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/deleteUser',user)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
    }
}
])
.factory('menuService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        getMenuModule: function() {
            var defer = $q.defer();
            var url= API_URL+"/api/getMenuModule";

            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        getMenuGroup: function(vModuleId) {
            var defer = $q.defer();
            var url= API_URL+"/api/getMenuGroup";
            if (vModuleId){
                url +=  "?id="+vModuleId
            }

            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        getMenu: function(vid,vGroupId,vParentId) {
            var defer = $q.defer();
            var url= API_URL+"/api/getMenu";
            if (vid){
                url +=  "?id="+vid
            }
            url += (vGroupId?"?groupId="+vGroupId:"")
            url += (vParentId?"?parentId="+vParentId:"")

            //$http.get("http://localhost:3000/getRoles")
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        createMenu: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/createMenu', role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        updateMenu: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/updateMenu',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        deleteMenu: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/deleteMenu',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
    }
}
])
.factory('moduleService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        getModule: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/api/getModule";
            if (vid){
                url +=  "?id="+vid
            }

            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        }
    }
}
])
.factory('roleMenuService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        assignMenu: function(vobj) {
            var defer = $q.defer();

            $http.post(API_URL+'/api/assignMenu',vobj)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        }
    }
}
])
.factory('customerService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apifo/getCustomer";
            if (vid){
                url +=  "?id="+vid
            }

            //$http.get("http://localhost:3000/getRoles")
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/createCustomer', role)
            .success(function (data, status, headers, config) {
                console.log(status)
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                console.log('reject')
                console.log(data)
                defer.reject(data);
            });

            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/updateCustomer',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/deleteCustomer',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
    }
}
])
.factory('customerContractService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apifo/getCustomerContract";
            if (vid){
                url +=  "?id="+vid
            }

            //$http.get("http://localhost:3000/getRoles")
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/createCustomerContract', role)
            .success(function (data, status, headers, config) {
                console.log(status)
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                console.log('reject')
                console.log(data)
                defer.reject(data);
            });

            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/updateCustomerContract',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/deleteCustomerContract',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
    }
}
])
.factory('roomTypeService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apifo/getRoomType";
            if (vid){
                url +=  "?id="+vid
            }

            //$http.get("http://localhost:3000/getRoles")
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/createRoomType', role)
            .success(function (data, status, headers, config) {
                console.log(status)
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                console.log('reject')
                console.log(data)
                defer.reject(data);
            });

            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/updateRoomType',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/deleteRoomType',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
    }
}
])
.factory('roomService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apifo/getRoom";
            if (vid){
                url +=  "?id="+vid
            }

            //$http.get("http://localhost:3000/getRoles")
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/createRoom', role)
            .success(function (data, status, headers, config) {
                console.log(status)
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                console.log('reject')
                console.log(data)
                defer.reject(data);
            });

            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/updateRoom',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apifo/deleteRoom',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
    }
}
])

.factory('accountTypeService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apifin/getAccountType";
            if (vid){
                url +=  "?id="+vid
            }
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apifin/createAccountType', role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apifin/updateAccountType',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apifin/deleteAccountType',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
    }
}
])
.factory('departmentService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apifin/getDepartment";
            if (vid){
                url +=  "?id="+vid
            }
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apifin/createDepartment', role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apifin/updateDepartment',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apifin/deleteDepartment',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
    }
}
])
.factory('coaService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apifin/getCoa";
            if (vid){
                url +=  "?id="+vid
            }
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apifin/createCoa', role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apifin/updateCoa',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apifin/deleteCoa',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
    }
}
])
.factory('productCategoryService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apiinv/getProductCategory";
            if (vid){
                url +=  "?id="+vid
            }
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apiinv/createProductCategory', role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apiinv/updateProductCategory',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apiinv/deleteProductCategory',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
    }
}
])
.factory('productUnitService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage, API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apiinv/getProductUnit";
            if (vid){
                url +=  "?id="+vid
            }
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apiinv/createProductUnit', role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apiinv/updateProductUnit',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();
            $http.post(API_URL+'/apiinv/deleteProductUnit',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });
            return defer.promise;
        },
    }
}
])