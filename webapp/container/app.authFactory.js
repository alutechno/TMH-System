//TODO ttl
angular.module('app')
.factory('principal', ['$q', '$http', '$timeout', '$localStorage','$rootScope','API_URL',
function($q, $http, $timeout, $localStorage, $rootScope, API_URL) {
    var _identity = undefined, //inMemory variables
    _authenticated = false,
    _currentModule = ''

    return {
        isIdentityResolved: function() {
            var deferred1 = $q.defer();
            if (angular.isDefined(_identity)==true){ //Check In Memory

                if (_currentModule.length == 0 ) $rootScope.currentModule = $localStorage.mediaDefault.module
                else $rootScope.currentModule = _currentModule
                //$rootScope.apply()
                deferred1.resolve(true);
            }
            else if(this.getUserFromToken()){ //Check in Local Storage, rewrite by hit authentication module
                deferred1.resolve(true);
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
            var module = $localStorage.mediaModule;
            var menu = $localStorage.mediaMenu;
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
                user = JSON.parse(this.urlBase64Decode(encoded));
                _identity = user
                _identity['module'] = module
                _identity['menu'] = menu
                _identity['default'] = $localStorage.mediaDefault
                //$rootScope.currentModule = $localStorage.mediaDefault.module
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
        getAllMenu: function(module) {
            //Manipulate base _identity object to getMenu
            var vModule = (module==undefined?_identity.default.module:module);
            var objModule = {}
            for (var key in _identity.module){
                if (key==vModule){
                    objModule = _identity.module[key]
                    break;
                }
            }
            //Added Temporarilly
            objModule = _identity.module
            return objModule;
        },
        getModule: function() {
            var arrModule = []
            for (var key in _identity.module){
                arrModule.push(key)
            }
            return arrModule;
        },
        setModule: function(module) {
            _currentModule = module
            $localStorage.mediaDefault.module = module
            $rootScope['currentModule'] = module
            $rootScope.$apply()
        },
        clear: function() {
            if($rootScope['currentModule']) delete $rootScope['currentModule']
            if($rootScope['currentMenu']) delete $rootScope['currentMenu']
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

            $http.post(API_URL+'/authenticate',data,config)
            .success(function (data, status, headers, config) {
                if (data.isAuthenticated){
                    _identity = data.data;
                    _identity['default'] = {
                        menu: data.data.default_menu,
                        module: data.data.default_module
                    };
                    _authenticated = true;
                    _currentModule = data.data.default_module;
                    $rootScope.currentModule = data.data.default_module;
                    $localStorage.mediaToken = data.data.token;
                    $localStorage.mediaModule = data.data.module;
                    $localStorage.mediaMenu = data.data.menu;
                    $localStorage.mediaDefault = {
                        menu: data.data.default_menu,
                        module: data.data.default_module
                    };
                    deferred.resolve(_identity);
                }
                else {
                    _identity = null;
                    _authenticated = false;
                    deferred.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                _identity = null;
                _authenticated = false;
                deferred.reject(data);
            });

            return deferred.promise;
        },
        identity: function(stateName) {
            var deferred = $q.defer();

            //if (force === true) _identity = undefined;

            // check and see if we have retrieved the
            // identity data from the server. if we have,
            // reuse it by immediately resolving
            //Decided Later, wether check inMemory variable or always access server
            /*if (angular.isDefined(_identity)) {
            deferred.resolve(_identity);
            return deferred.promise;
        }*/

        var data = {
            "state": stateName
        };

        $http.post(API_URL+'/authorize',data)
        .success(function (data, status, headers, config) {
            deferred.resolve(data)
            /*if (data.isAuthenticated){
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
    }*/
})
.error(function (data, status, header, config) {

    //_identity = null;
    //_authenticated = false;
    deferred.reject(data);
});



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
/*var self = this;
$timeout(function() {
self.authenticate(null);
deferred.resolve(_identity);
}, 1000);*/

return deferred.promise;
}
};
}
])
.factory('authorization', ['$rootScope', '$state', 'principal','$q',
function($rootScope, $state, principal,$q) {
    return {
        authorize: function(stateName) {
            var deferred = $q.defer();

            principal.identity(stateName)
            .then(function(data) {
                $rootScope.toState['data'] = data
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
                deferred.resolve(true)

            });
            return deferred.promise;
        }
    };
}
])
