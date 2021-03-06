var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var mysql      = require('mysql');

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, State');
    if ('OPTIONS' === req.method) {
        res.status(200).send('200');
    }
    else {
        next();
    }
};

app.use(allowCrossDomain);
var db_config = {
    host     : '103.43.47.115',
    user     : 'media',
    password : 'media',
    database : 'media',
    port: 3306,

}
var connection;
//var connection = mysql.createConnection();

function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.

    /*connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
  });  */                                   // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();


//connection.connect();
app.use(function (req, res, next) {
    console.log('accessing middleware /apifo')
    console.log('Accessing:'+req.path)
    console.log('Headers:'+JSON.stringify(req.headers))
    console.log('Body:'+JSON.stringify(req.body))
    if (req.path == '/authenticate'){
        //Handle menu reload by browser
        console.log('re-authenticate')
        console.log(req.body)
        req.username = req.body.username
        next();
    }
    else {
        //Handle button click
        console.log('authorization checking')
        if (req.headers['authorization']){
            try{
                console.log(req.headers.authorization)
                var user = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
                console.log('authorization:'+JSON.stringify(user))
                var sqlstr = 'select count(1) '+
                    'from user a, role_user b,role_menu c, menu d '+
                    'where a.id = b.user_id and b.role_id = c.role_id '+
                    'and c.menu_id = d.id '+
                    'and a.name = "'+user.username+'" '+
                    'and a.password = "'+user.password+'" '+
                    'and d.state = "'+req.headers.state+'"';
                console.log(sqlstr)

                connection.query(sqlstr, function(err, rows, fields) {
                    console.log('middleware res:'+JSON.stringify(rows))
                    if (err){
                        res.status(500).send({error:'unavailable'})
                    }
                    else if(rows.length==0){
                        res.status(404).send({error:'failed authentication'})
                    }
                    else {
                        console.log('Success authenticate')
                        req.username = user.username
                        next();
                    }
                });
            }
            catch(e){
                console.log(e)
                res.status(500).send({status:500,desc:'Invalid Access'})
            }

        }
        else{
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
app.use('/api', apiRoutes);
app.use('/apifo', apiFoRoutes);
app.use('/apiinv', apiInvRoutes);
app.use('/apifin', apiFinRoutes);
app.use('/apipos', apiPosRoutes);
app.use('/apioth', apiOthers);

app.get('/', function (req, res) {
    res.send('alive')
});


app.post('/authenticate_old', function (req, res) {
    /*
    Using Token Based authentication,
    https://code.tutsplus.com/tutorials/token-based-authentication-with-angularjs-nodejs--cms-22543
    */
    console.log(req.body)
    //var sqlstr = 'SELECT name,password,token,role_id as roles from user where name="'+req.body.username+'" and password="'+req.body.password+'"';
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


    connection.query(sqlstr, function(err, rows, fields) {
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
            console.log(obj)
            res.send(obj)
        }

    });

});

app.post('/authorize', function (req, res) {
    var where = ''
    console.log(req.body)
    var sqlstr = 'select group_concat(object) as object from menu a, menu_detail b '+
        'where a.id = b.menu_id '+
        'and a.state = "'+req.body.state+'"';
    connection.query(sqlstr, function(err, rows, fields) {
        if (err) throw err;
        if (rows.length>0){
            res.send(rows.length==0?[]:rows[0].object.split(','))
        }
        else{
            res.send([])
        }
    });
});

app.post('/authenticate', function (req, res) {
    /*
    Using Token Based authentication,
    https://code.tutsplus.com/tutorials/token-based-authentication-with-angularjs-nodejs--cms-22543
    */
    console.log(req.body)
    //var sqlstr = 'SELECT name,password,token,role_id as roles from user where name="'+req.body.username+'" and password="'+req.body.password+'"';
    var sqlstr = 'select a.name as username, a.full_name,a.password, a.token, g.name as gname, e.l1 as menuname, e.l2 as submenuname, h.name as module, e.l2state, '+
        'group_concat(f.object), f.custom, i.name as default_module, e.l2id,j.name as default_menu, j.state as default_state '+
        'from user a, role_user b, role c, role_menu d, '+
        '(SELECT t1.group_id,t1.name AS l1, t2.name as l2, t1.state as l1state, t2.state as l2state, t2.id as l2id,t2.sequence '+
        'FROM menu AS t1 '+
        'LEFT JOIN menu AS t2 ON t2.parent = t1.id '+
        'where t2.name is not null '+
        'order by t1.group_id, t1.id) e, menu_detail f,group_menu g,module h,module i,menu j '+
        'where a.id = b.user_id  '+
        //'and b.role_id = c.id  '+
        'and b.role_id = d.role_id  '+
        'and d.menu_id = e.l2id  '+
        'and d.menu_detail_id = f.id  '+
        //'and a.default_module = h.id  '+
        'and e.group_id = g.id  '+
        'and g.module_id = h.id  '+
        'and a.default_module = i.id '+
        'and a.default_menu = j.id '+
        'and a.name="'+req.username+'" '+
        'group by submenuname '+
        'order by menuname,e.sequence, submenuname ';

    //'and a.password="'+req.body.password+'" ';
    console.log(sqlstr)


    connection.query(sqlstr, function(err, rows, fields) {
        console.log(err)
        //console.log(rows)
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
            objModule = {}
            obj.data['menu'] = [];
            for (var i=0;i<rows.length;i++){
                obj.data['menu'].push(rows[i].l2state)
                if (objModule[rows[i].module]){
                    if (objModule[rows[i].module][rows[i].gname]){
                        if (objModule[rows[i].module][rows[i].gname][rows[i].menuname]){
                            objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                name: rows[i].submenuname,
                                state: rows[i].l2state
                            }
                        }
                        else {
                            objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                            objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                name: rows[i].submenuname,
                                state: rows[i].l2state
                            }
                        }
                    }
                    else {
                        objModule[rows[i].module][rows[i].gname] = {}
                        objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                        objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                            name: rows[i].submenuname,
                            state: rows[i].l2state
                        }

                    }

                }
                else {
                    objModule[rows[i].module] = {}
                    objModule[rows[i].module][rows[i].gname] = {}
                    objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                    objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                        name: rows[i].submenuname,
                        state: rows[i].l2state
                    }
                }
            }
            console.log(JSON.stringify(objModule,null,2))
            obj.data['token'] = rows[0].token;
            obj.data['default_module'] = rows[0].default_module;
            obj.data['default_menu'] = {
                name:rows[0].default_menu,
                state: rows[0].default_state
            };
            obj.data['currentUser'] = {
                name: rows[0].username,
                full_name: rows[0].full_name
            }
            obj.data['module'] = objModule;

            res.send(obj)
        }

    });

});

app.listen(3001, function () {
    console.log('API Server listening on port 3001!');
});
