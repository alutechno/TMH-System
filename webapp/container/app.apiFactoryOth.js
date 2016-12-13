//TODO ttl
angular.module('app')
.factory('prService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        get: function(vid) {
            console.log('aa:'+API_URL)
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
