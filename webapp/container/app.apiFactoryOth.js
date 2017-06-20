//TODO ttl
angular.module('app')
.factory('prService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apiinv/getPr";
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

            $http.post(API_URL+'/apiinv/createPr', role)
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

            $http.post(API_URL+'/apiinv/updatePr',role)
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

            $http.post(API_URL+'/apiinv/deletePr',role)
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
.factory('profileService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        save: function(body) {
            var defer = $q.defer();
            $http.post(API_URL+'/apioth/saveProfile', body)
            .then(function(response){
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;
        }
    }
}
])
.factory('uploadBudget', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
	return {
        save: function(body) {
            var defer = $q.defer();
            $http.post('uploadBudget/apioth/uploadBudget', body)
            .then(function(response){
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;
        }
    }
}
])
.factory('queryService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        get: function(sqlstr,sqlparam) {
            var defer = $q.defer();
            var url= API_URL+"/apisql/query?query="+sqlstr;

            //$http.get("http://localhost:3000/getRoles")
            $http.get(url)
            .then(function(response){
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;
        },
        post: function(sqlstr,sqlparam) {
            var defer = $q.defer();
            var body = {
                query: sqlstr,
                values: sqlparam
            }

            $http.post(API_URL+'/apisql/query', body)
            .then(function(response){
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;


        },
        generatePo: function(pr,items) {
            var defer = $q.defer();
            //console.log(sqlstr)
            //console.log(sqlparam)
            var body = {
                pr: pr,
                items: items
            }

            $http.post(API_URL+'/apisql/generatepo', body)
            .then(function(response){
                console.log(response)
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;


        }
    }
}
])
.factory('globalFunction', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        currentDate: function() {
            var d = new Date();

            return d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + " " +
                ("00" + d.getHours()).slice(-2) + ":" +
                ("00" + d.getMinutes()).slice(-2) + ":" +
                ("00" + d.getSeconds()).slice(-2)
        },
        next30Day: function() {
            var d = new Date();
            d.setDate(d.getDate() + 30)
            return d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + " " +
                ("00" + d.getHours()).slice(-2) + ":" +
                ("00" + d.getMinutes()).slice(-2) + ":" +
                ("00" + d.getSeconds()).slice(-2)
        },
        endOfYear: function() {
            return (new Date().getFullYear()) + '-12-31 23:59:59'
        }
    }
}
])
