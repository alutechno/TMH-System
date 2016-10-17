//TODO ttl
angular.module('app')
.factory('principal', ['$q', '$http', '$timeout', '$localStorage',
    function($q, $http, $timeout, $localStorage) {
        var _identity = undefined,
        _authenticated = false

        return {
            isIdentityResolved: function() {
                var deferred1 = $q.defer();
                console.log(angular.isDefined(_identity))
                if (angular.isDefined(_identity)==true){
                    deferred1.resolve(true);
                }
                else if(this.getUserFromToken()){
                    if (!_identity.roles || _identity.roles.length == 0){
                        this.authenticate(_identity)
                        .then(function(data){
                            console.log('iden resolved')
                            deferred1.resolve(true);
                        },
                        function(error){
                            deferred1.resolve(false);
                        });
                    }
                }
                else {
                    deferred1.resolve(false);
                }
                return deferred1.promise;
            },
            urlBase64Decode: function(str) {
                var output = str.replace('-', '+').replace('_', '/');
                switch (output.length % 4) {
                    case 0:
                        break;
                    case 2:
                        output += '==';
                        break;
                    case 3:
                        output += '=';
                        break;
                    default:
                        throw 'Illegal base64url string!';
                }
                return window.atob(output);
            },
            getUserFromToken: function(){
                var token = $localStorage.mediaToken;
                var user = {};
                if (typeof token !== 'undefined') {
                    var encoded = token.split('.')[1];
                    user = JSON.parse(this.urlBase64Decode(encoded));
                    _identity = user
                    return user;
                }
                else {
                    return null;
                }
            },
            isAuthenticated: function() {
                return _authenticated;
            },
            isAuthorized: function(item) {
                //find element to be visible in selected item/menu
                if (_identity.menu.indexOf(item)>-1){
                    return true
                }
                else return false
            },
            isInRole: function(role) {
                if (!_authenticated || !_identity.roles) return false;
                return _identity.roles.indexOf(role) != -1;
            },
            isInAnyRole: function(roles) {
                if (!_authenticated || !_identity.roles) return false;
                for (var i = 0; i < roles.length; i++) {
                  if (this.isInRole(roles[i])) return true;
                }
                return false;
            },
            getMenuObject: function(item) {
                var arrObj = []
                for (var key in _identity.object){
                    if (key==item){
                        arrObj = _identity.object[key]
                    }
                }
                return arrObj;
            },
            authenticate: function(identity) {
                /*
                Call authentication service,
                check in $localStorage if token is exists,
                if not exists, generate token and pass it in header*/
                var deferred = $q.defer();
                var data = {
                    "username": identity.username,
                    "password": identity.password,
                    "keepSignedIn": identity.keepSignIn
                };

                var config = {
                    headers : {
                        'Content-Type': 'application/json'
                    }
                }

                console.log('authenticate:'+JSON.stringify(data))

                $http.post('/api/authenticate',data,config)
                .success(function (data, status, headers, config) {
                    console.log('Success Authenticate')
                    console.log(status)
                    console.log(data)
                    if (data.isAuthenticated){
                        _identity = data.data;
                        _authenticated = true;
                        console.log('adding to localStorage:'+data.data.token)
                        console.log('_identity:'+JSON.stringify(_identity))
                        $localStorage.mediaToken = data.data.token;
                        deferred.resolve(_identity);
                    }
                    else {
                        _identity = null;
                        _authenticated = false;
                        deferred.reject(data);
                    }
                })
                .error(function (data, status, header, config) {
                    console.log('Failed Authenticate')
                    console.log(status)
                    console.log(data)
                    _identity = null;
                    _authenticated = false;
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            identity: function(force) {
                var deferred = $q.defer();

                if (force === true) _identity = undefined;

                // check and see if we have retrieved the
                // identity data from the server. if we have,
                // reuse it by immediately resolving
                if (angular.isDefined(_identity)) {
                    deferred.resolve(_identity);
                    return deferred.promise;
                }



                // otherwise, retrieve the identity data from the
                // server, update the identity object, and then
                // resolve.
                //           $http.get('/svc/account/identity',
                //                     { ignoreErrors: true })
                //                .success(function(data) {
                //                    _identity = data;
                //                    _authenticated = true;
                //                    deferred.resolve(_identity);
                //                })
                //                .error(function () {
                //                    _identity = null;
                //                    _authenticated = false;
                //                    deferred.resolve(_identity);
                //                });

                // for the sake of the demo, fake the lookup
                // by using a timeout to create a valid
                // fake identity. in reality,  you'll want
                // something more like the $http request
                // commented out above. in this example, we fake
                // looking up to find the user is
                // not logged in
                var self = this;
                $timeout(function() {
                  self.authenticate(null);
                  deferred.resolve(_identity);
                }, 1000);

                return deferred.promise;
            }
          };
    }
])
.factory('authorization', ['$rootScope', '$state', 'principal',
    function($rootScope, $state, principal) {
        return {
            authorize: function() {
                return principal.identity()
                .then(function() {
                    var isAuthenticated = principal.isAuthenticated();
                    if ($rootScope.toState.roles && $rootScope.toState.roles.length > 0 ) {
                        if (isAuthenticated) {
                            // user is signed in but not
                            // authorized for desired state
                            $state.go('access.404');
                        }
                        else {
                            // user is not authenticated. Stow
                            // the state they wanted before you
                            // send them to the sign-in state, so
                            // you can return them when you're done
                            $rootScope.returnToState
                                = $rootScope.toState;
                            $rootScope.returnToStateParams
                                = $rootScope.toStateParams;

                            // now, send them to the signin state
                            // so they can log in
                            $state.go('login');
                        }
                    }
                    else if(!principal.isAuthorized($rootScope.toState.name)){
                        $rootScope.returnToState
                                = $rootScope.toState;
                            $rootScope.returnToStateParams
                                = $rootScope.toStateParams;
                        $state.go('access.500');
                    }

                });
            }
        };
    }
])
.factory('roleService', ['$q', '$http', '$timeout', '$localStorage',
    function($q, $http, $timeout, $localStorage) {
        return {
            getRole: function(vid) {
                var defer = $q.defer();
                var url= "/api/getRole";
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

                $http.post('/api/createRole', role)
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

                $http.post('/api/updateRole',role)
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

                $http.post('/api/deleteRole',role)
                .success(function (data, status, headers, config) {
                    if (data.success){
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
.factory('userService', ['$q', '$http', '$timeout', '$localStorage',
    function($q, $http, $timeout, $localStorage) {
        return {
            getUsers: function(vid) {
                var defer = $q.defer();
                //var url= "http://localhost:3000/getUsers";
                var url= "/api/getUsers";
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

                $http.post('/api/createUser',user)
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

                $http.post('/api/updateUser',user)
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

                $http.post('/api/deleteUser',user)
                .success(function (data, status, headers, config) {
                    if (data.success){
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
