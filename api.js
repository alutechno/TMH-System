var cluster = require('cluster');
var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 50,
    host            : '103.43.47.115',
    //host            : 'localhost',
    user            : 'media',
    password        : 'media',
    database		: 'media',
    port			: 3306,
    multipleStatements : true
});
/*var pool  = mysql.createPool({
    connectionLimit : 50,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
	database		: 'media',
	port			: 8889,
	multipleStatements : true
});*/
if (cluster.isMaster) {
    for (var i = 0; i < 4; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    var jwt = require('jsonwebtoken');

    app.use(bodyParser.urlencoded({ extended: true })); //support encoded bodies
    app.use(bodyParser.json()); //support json encoded bodies
    allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With,State');
        if ('OPTIONS' === req.method) {
            //res.send(200);
            res.status(200).send();
        }
        else {
            next();
        }
    };

    app.use(allowCrossDomain);

    var connection=function(sql,data,callback){
        pool.getConnection(function(err, connection) {
            if(err) {
                //console.log('Error getting sql connection');
                //console.dir(err);
                if(typeof connection !== "undefined")
                    connection.release();
                callback(err);
            }
            if(typeof data === "undefined") {
                connection.query( sql, function(err, rows,fields) {
                    connection.release();
                    //console.dir(sql);
                    if(err) {
                        console.log('err:' + err);
                        callback(err, rows,fields);
                    }else{
                        console.log( rows );
                        callback(err, rows,fields);
                    }
                });
            } else {
                connection.query( sql, data, function(err, rows,fields){
                    connection.release();
                    //console.log(sql);
                    //console.dir(data);

                    if(err) {
                        //console.log('err:' + err);
                        callback(err, rows,fields);
                    }else{
                        //console.log( rows );
                        callback(err, rows,fields);
                    }

                });
            }
        });
    }
    var connection2=function(callback){
        pool.getConnection(function(err, connection) {
            if(err) {
                //console.log('Error getting sql connection');
                //console.dir(err);
                if(typeof connection !== "undefined")
                    connection.release();
                callback(err);
            }
            callback(undefined,connection);
        });
    }
    var log = function(headers,path,action,query,body,others){
        var arr = []
        var d = new Date()
        dStr = d.getFullYear() + "-" +
            ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
            ("00" + d.getDate()).slice(-2) + " " +
            ("00" + d.getHours()).slice(-2) + ":" +
            ("00" + d.getMinutes()).slice(-2) + ":" +
            ("00" + d.getSeconds()).slice(-2)
        //console.log('===========')
        var user = {}
        if (headers['authorization']) user = jwt.verify(headers['authorization'].split(' ')[1], 'smrai.inc');


        arr.push(dStr,user.username?user.username:'',path?path:'',headers.state?headers.state:'',action?action:'',query?query:'',body?body:'',others?others:'',headers['user-agent']?headers['user-agent']:'')
        console.log(arr.join('|'))
    }

    app.use(function (req, res, next) {
        log(req.headers,req.path,'middleware',JSON.stringify(req.query),JSON.stringify(req.body),'middleware API')
        //console.log('accessing middleware /apifo')
        ///console.log('Accessing:'+req.path)
        //console.log('Headers:'+JSON.stringify(req.headers))
        //console.log('Body:'+JSON.stringify(req.body))
        if (req.path == '/authenticate'){
            //console.log('re-authenticate')
            //console.log(req.body)
            log(req.headers,req.path,'re-authenticate',JSON.stringify(req.query),JSON.stringify(req.body),'Re-authenticate')
            req.username = req.body.username
            next();
        }
        else {
            console.log('authorization checking')
            log(req.headers,req.path,'authorization',JSON.stringify(req.query),JSON.stringify(req.body),'Authorization')
            if (req.headers['authorization']){
                try{
                    //console.log(req.headers.authorization)
                    var user = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
                    //console.log('authorization:'+JSON.stringify(user))
                    var sqlstr = 'select count(1) '+
                        'from user a, role_user b,role_menu c, menu d '+
                        'where a.id = b.user_id and b.role_id = c.role_id '+
                        'and c.menu_id = d.id '+
                        'and a.name = "'+user.username+'" '+
                        'and a.password = "'+user.password+'" '+
                        'and d.state = "'+req.headers.state+'"';
                    //console.log(sqlstr)

                    connection(sqlstr,undefined, function(err, rows, fields) {
                        console.log('middleware res:'+JSON.stringify(rows))
                        if (err){
                            log(req.headers,req.path,'authorization-500',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify(err))
                            res.status(500).send({error:'unavailable'})
                        }
                        else if(rows.length==0){
                            log(req.headers,req.path,'authorization-404',JSON.stringify(req.query),JSON.stringify(req.body),'User not found')
                            res.status(404).send({error:'failed authentication'})
                        }
                        else {
                            log(req.headers,req.path,'authorization-200',JSON.stringify(req.query),JSON.stringify(req.body),'success')
                            req.username = user.username
                            next();
                        }
                    });
                }
                catch(e){
                    log(req.headers,req.path,req.headers.state,'authorization-500',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify(e))
                    res.status(500).send({status:500,desc:'Invalid Access'})
                }

            }
            else{
                log(req.headers,req.path,'authorization-500',JSON.stringify(req.query),JSON.stringify(req.body),'Forbidden')
                res.status(500).send({status:500,desc:'Forbidden'})
            }

        }
    });

    var apiRoutes = require('./routes/api')(connection,jwt);
    var apiFoRoutes = require('./routes/apifo')(connection,jwt);
    var apiInvRoutes = require('./routes/apiinv')(connection,jwt);
    var apiFinRoutes = require('./routes/apifin')(connection,jwt);
    var apiPosRoutes = require('./routes/apipos')(connection,jwt);
    var apiOthers = require('./routes/apiothers')(connection,jwt);
    var apiSql = require('./routes/apiSql')(connection,jwt,log);
    app.use('/api', apiRoutes);
    app.use('/apifo', apiFoRoutes);
    app.use('/apiinv', apiInvRoutes);
    app.use('/apifin', apiFinRoutes);
    app.use('/apipos', apiPosRoutes);
    app.use('/apioth', apiOthers);
    app.use('/apisql', apiSql);

    app.get('/', function (req, res) {
        res.send('alive')
    });


    app.post('/authenticate_old', function (req, res) {
        console.log(req.body)
        var sqlstr = 'select a.name as username, a.password, a.token, c.name as rolename, e.name as menuname, e.module, e.state, f.object, f.custom, a.default_module '+
            'from user a, role_user b, role c, role_menu d, menu e, menu_detail f,group_menu g,module h '+
            'where a.id = b.user_id '+
            'and b.role_id = c.id '+
            'and c.id = d.role_id '+
            'and d.menu_id = e.id '+
            'and d.menu_detail_id = f.id '+
            'and a.default_module = h.id '+
            'and e.group_id = g.id '+
            'and g.module_id = h.id ' +
            'and a.name="'+req.body.username+'" '+
            'and a.password="'+req.body.password+'" ';


        connection(sqlstr,undefined, function(err, rows, fields) {
            console.log(err)
            var obj = {
                isAuthenticated: false,
                data: {}
            };
            if (err) throw err;
            if (rows.length==0){
                res.send(obj)
            }
            else {
                obj.isAuthenticated = true;
                var arrMenu = [];
                var arrRoles = [];
                var arrObject = {};
                for (var i=0;i<rows.length;i++){
                    arrMenu.push(rows[i].state);
                    arrRoles.push(rows[i].rolename);
                    if (arrObject[rows[i].state]){
                        arrObject[rows[i].state].push(rows[i].object)
                    }
                    else {
                        arrObject[rows[i].state] = [rows[i].object]
                    }

                }

                obj.data = rows[0]
                obj.data['roles'] = arrRoles.filter(onlyUnique);
                obj.data['menu'] = arrMenu.filter(onlyUnique);
                obj.data['object'] = arrObject;
                //console.log(obj)
                res.send(obj)
            }

        });

    });

    app.post('/authorize', function (req, res) {
        var where = ''

        /*var sqlstr = 'select group_concat(object) as object from menu a, menu_detail b '+
        'where a.id = b.menu_id '+
        'and a.state = "'+req.body.state+'"';
        */
        var sqlstr = 'select group_concat(object) as object from menu a, menu_detail b ,role_menu c, role_user d, user e '+
            'where a.id = b.menu_id '+
            'and b.id = c.menu_detail_id '+
            'and c.role_id = d.role_id '+
            'and d.user_id = e.id '+
            'and e.name = \''+req.username+'\''+
            ' and a.state = \''+req.body.state+'\' ' ;
        connection(sqlstr,undefined, function(err, rows, fields) {
            if (err) {
                log(req.headers,req.path,'authorize-500',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify(err))
                res.status(500).send();
            }
            else if (rows.length>0){
                try{
                    log(req.headers,req.path,'authorize-200',JSON.stringify(req.query),JSON.stringify(req.body),(rows.length==0?[]:rows[0].object.split(',')))
                }
                catch(e){
                    log(req.headers,req.path,'authorize-404',JSON.stringify(req.query),JSON.stringify(req.body),'no authorization')
                    res.send([])
                }

                res.send(rows.length==0?[]:rows[0].object.split(','))
            }
            else{
                log(req.headers,req.path,'authorize-404',JSON.stringify(req.query),JSON.stringify(req.body),'no authorization')
                res.send([])
            }
        });
    });

    app.post('/authenticate', function (req, res) {
        //console.log(req.body)
        var sqlstr = 'select a.id,a.name as username, a.full_name,a.password, a.token, g.name as gname, e.l1 as menuname, e.l2 as submenuname, h.name as module, e.l2state, '+
            'group_concat(f.object), f.custom, i.name as default_module, e.l2id,j.name as default_menu, j.state as default_state,e.is_sidebar,e.sidebar_short,e.sidebar_icon '+
            'from user a, role_user b, role c, role_menu d, '+
            '(SELECT t1.group_id,t1.name AS l1, t2.name as l2, t1.state as l1state, t2.state as l2state, t2.id as l2id,t2.sequence, t2.is_sidebar,t2.sidebar_short,t2.sidebar_icon '+
            'FROM menu AS t1 '+
            'LEFT JOIN menu AS t2 ON t2.parent = t1.id '+
            'where t2.name is not null '+
            'order by t1.group_id, t1.id) e, menu_detail f,group_menu g,module h,module i,menu j '+
            'where a.id = b.user_id  '+
            'and b.role_id = d.role_id  '+
            'and d.menu_id = e.l2id  '+
            'and d.menu_detail_id = f.id  '+
            'and e.group_id = g.id  '+
            'and g.module_id = h.id  '+
            'and a.default_module = i.id '+
            'and a.default_menu = j.id '+
            'and a.name="'+req.username+'" '+
            'group by submenuname '+
            'order by menuname,e.sequence, submenuname ';
        //console.log(sqlstr)


        connection(sqlstr,undefined, function(err, rows, fields) {
            //console.log(err)
            var obj = {
                isAuthenticated: false,
                data: {}
            };
            if (err) {
                log(req.headers,req.path,'authenticate-500',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify(err))
                res.status('500').send();
            }
            else if (rows.length==0){
                log(req.headers,req.path,'authenticate-404',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify(obj))
                res.send(obj)
            }
            else {
                obj.isAuthenticated = true;
                objModule = {}
                obj.data['menu'] = [];
                for (var i=0;i<rows.length;i++){
                    obj.data['menu'].push(rows[i].l2state)
                    if (objModule[rows[i].module]){
                        if (objModule[rows[i].module][rows[i].gname]){
                            if (objModule[rows[i].module][rows[i].gname][rows[i].menuname]){
                                objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                    name: rows[i].submenuname,
                                    state: rows[i].l2state,
                                    is_sidebar: rows[i].is_sidebar,
                                    sidebar_short: rows[i].sidebar_short,
                                    sidebar_icon: rows[i].sidebar_icon
                                }
                            }
                            else {
                                objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                                objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                    name: rows[i].submenuname,
                                    state: rows[i].l2state,
                                    is_sidebar: rows[i].is_sidebar,
                                    sidebar_short: rows[i].sidebar_short,
                                    sidebar_icon: rows[i].sidebar_icon
                                }
                            }
                        }
                        else {
                            objModule[rows[i].module][rows[i].gname] = {}
                            objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                            objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                name: rows[i].submenuname,
                                state: rows[i].l2state,
                                is_sidebar: rows[i].is_sidebar,
                                sidebar_short: rows[i].sidebar_short,
                                sidebar_icon: rows[i].sidebar_icon
                            }

                        }

                    }
                    else {
                        objModule[rows[i].module] = {}
                        objModule[rows[i].module][rows[i].gname] = {}
                        objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                        objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                            name: rows[i].submenuname,
                            state: rows[i].l2state,
                            is_sidebar: rows[i].is_sidebar,
                            sidebar_short: rows[i].sidebar_short,
                            sidebar_icon: rows[i].sidebar_icon
                        }
                    }
                }
                //console.log(JSON.stringify(objModule,null,2))
                obj.data['token'] = rows[0].token;
                obj.data['default_module'] = rows[0].default_module;
                obj.data['default_menu'] = {
                    name:rows[0].default_menu,
                    state: rows[0].default_state
                };
                obj.data['currentUser'] = {
                    id: rows[0].id,
                    name: rows[0].username,
                    full_name: rows[0].full_name
                }
                obj.data['module'] = objModule;
                log(req.headers,req.path,'authenticate-200',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify(obj))
                res.send(obj)
            }

        });

    });

    app.listen(3001, function () {
        log({},undefined,'Start API Service',undefined,undefined,undefined)
        //console.log('API Server listening on port 3001!');
    });
}
